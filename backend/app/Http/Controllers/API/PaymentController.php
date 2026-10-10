<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private string $baseUrl;
    private string $secretKey;
    private string $publicKey;

    public function __construct()
    {
        $this->baseUrl   = config('services.paymongo.base_url', 'https://api.paymongo.com/v1');
        $this->secretKey = config('services.paymongo.secret_key', '');
        $this->publicKey = config('services.paymongo.public_key', '');
    }

    // ── 1. Create Checkout Session ────────────────────────────────────────────

    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            // Accept a single appointment_id (legacy) OR an array of ids (multi-service group)
            'appointment_id'        => 'nullable|integer|exists:appointments,id',
            'appointment_ids'        => 'nullable|array|min:1',
            'appointment_ids.*'      => 'integer|exists:appointments,id',
            'payment_method_types'  => 'required|array|min:1',
            'payment_method_types.*' => 'in:gcash,paymaya,qrph,dob,dob_ubp',
            'frontend_url'          => 'nullable|string',
        ]);

        // Resolve the appointment(s) to pay for
        $ids = $request->input('appointment_ids')
            ?? ($request->filled('appointment_id') ? [$request->appointment_id] : []);

        if (empty($ids)) {
            return response()->json(['message' => 'No appointment selected for payment.'], 422);
        }

        $appointments = Appointment::with('service', 'client')->whereIn('id', $ids)->get();

        if ($appointments->isEmpty()) {
            return response()->json(['message' => 'Appointment(s) not found.'], 404);
        }

        // Authorization: all appointments must belong to the authenticated client
        foreach ($appointments as $appt) {
            if ((int) $appt->client_id !== (int) auth()->id()) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        // If any is already paid, reject
        if ($appointments->contains('payment_status', 'paid')) {
            return response()->json(['message' => 'One or more appointments are already fully paid.'], 422);
        }

        // If they share a booking_group_id, load ALL siblings automatically
        $groupId = $appointments->first()->booking_group_id;
        if ($groupId) {
            $appointments = Appointment::with('service', 'client')
                ->where('booking_group_id', $groupId)
                ->where('client_id', auth()->id())
                ->get();
        }

        $primaryAppt = $appointments->first();
        $client      = $primaryAppt->client;

        // Total amount = sum of all service prices in the group
        $totalCents = $appointments->sum(fn($a) => (int) round((float) ($a->service->price ?? 0) * 100));
        if ($totalCents < 10000) {
            $totalCents = 10000; // PayMongo minimum ₱100.00
        }

        $frontendUrl = $request->input('frontend_url') ?: config('services.paymongo.frontend_url') ?: env('FRONTEND_URL', 'http://localhost:5174');
        $frontendUrl = rtrim($frontendUrl, '/');
        $successUrl  = $frontendUrl . '/payment/success?appointment_id=' . $primaryAppt->id;
        $cancelUrl   = $frontendUrl . '/payment/cancel?appointment_id=' . $primaryAppt->id;

        $refNum = 'CB-' . str_pad($primaryAppt->id, 5, '0', STR_PAD_LEFT) . '-' . time();

        // Normalize phone to E.164
        $rawPhone = $client->phone ?? '';
        $phone    = preg_replace('/[^0-9+]/', '', $rawPhone);
        if ($phone && !str_starts_with($phone, '+')) {
            if (str_starts_with($phone, '09') && strlen($phone) === 11) {
                $phone = '+63' . substr($phone, 1);
            } elseif (str_starts_with($phone, '9') && strlen($phone) === 10) {
                $phone = '+63' . $phone;
            } elseif (str_starts_with($phone, '63') && strlen($phone) === 12) {
                $phone = '+' . $phone;
            }
        }

        // Build line items — one row per service for a clear PayMongo receipt
        $lineItems = $appointments->map(fn($a) => [
            'currency'    => 'PHP',
            'amount'      => (int) round((float) ($a->service->price ?? 0) * 100),
            'name'        => $a->service->name ?? 'Spa Treatment',
            'quantity'    => 1,
            'description' => sprintf('%s — %s', $a->service->name ?? 'Spa Treatment', $a->datetime->format('D, M j Y g:i A')),
        ])->values()->toArray();

        $description = $appointments->count() === 1
            ? 'Cozy Blissful Spa — Appointment #' . str_pad($primaryAppt->id, 5, '0', STR_PAD_LEFT)
            : 'Cozy Blissful Spa — ' . $appointments->count() . '-Service Package (Group ' . substr($groupId ?? $primaryAppt->id, 0, 8) . ')';

        $payload = [
            'data' => [
                'attributes' => [
                    'billing' => [
                        'name'  => $client->name  ?? 'Client',
                        'email' => $client->email ?? '',
                        'phone' => $phone ?: null,
                    ],
                    'send_email_receipt' => true,
                    'show_description'   => true,
                    'show_line_items'    => true,
                    'line_items'         => $lineItems,
                    'payment_method_types' => $request->payment_method_types,
                    'success_url'          => $successUrl,
                    'cancel_url'           => $cancelUrl,
                    'description'          => $description,
                    'reference_number'     => $refNum,
                ],
            ],
        ];

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(30)
                ->post($this->baseUrl . '/checkout_sessions', $payload);

            if ($response->failed()) {
                Log::error('PayMongo createCheckoutSession failed', [
                    'status'  => $response->status(),
                    'body'    => $response->body(),
                    'ids'     => $appointments->pluck('id')->toArray(),
                ]);
                $pmErrors = $response->json('errors') ?? [];
                $firstMsg = !empty($pmErrors) ? ($pmErrors[0]['detail'] ?? 'Payment gateway error.') : $response->body();
                return response()->json(['message' => $firstMsg, 'errors' => $pmErrors], 422);
            }

            $session = $response->json('data');

            // Stamp paymongo_session_id on ALL appointments in the group so
            // the webhook / verify can resolve any of them back to the group.
            DB::transaction(function () use ($appointments, $session) {
                $appointments->each(fn($a) => $a->update([
                    'payment_status'      => 'awaiting_payment',
                    'payment_method'      => 'online',
                    'paymongo_session_id' => $session['id'],
                ]));
            });

            return response()->json([
                'checkout_url'    => $session['attributes']['checkout_url'],
                'session_id'      => $session['id'],
                'appointment_id'  => $primaryAppt->id,
                'appointment_ids' => $appointments->pluck('id')->values(),
                'reference'       => $refNum,
                'total_amount'    => $totalCents / 100,
            ]);

        } catch (\Exception $e) {
            Log::error('PayMongo createCheckoutSession exception', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'An unexpected error occurred. Please try again.'], 500);
        }
    }

    // ── 2. Retrieve Checkout Session Status ────────────────────────────────────

    public function getSessionStatus(Request $request, string $sessionId)
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(15)
                ->get($this->baseUrl . '/checkout_sessions/' . $sessionId);

            if ($response->failed()) {
                return response()->json(['message' => 'Could not retrieve session.'], 422);
            }

            $data   = $response->json('data');
            $status = $data['attributes']['payment_intent']['attributes']['status'] ?? 'unknown';

            return response()->json([
                'session_id' => $sessionId,
                'status'     => $status,
                'payments'   => $data['attributes']['payments'] ?? [],
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gateway error.'], 500);
        }
    }

    // ── 3. Verify Payment (with automatic PayMongo session check fallback) ─────

    public function verifyPayment(Request $request)
    {
        $request->validate(['appointment_id' => 'required|integer|exists:appointments,id']);

        $appointment = Appointment::with('service')->findOrFail($request->appointment_id);

        if ((int) $appointment->client_id !== (int) auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // If not yet marked paid, verify directly with PayMongo checkout session
        if ($appointment->payment_status !== 'paid' && !empty($appointment->paymongo_session_id)) {
            try {
                $sessRes = Http::withBasicAuth($this->secretKey, '')
                    ->timeout(10)
                    ->get($this->baseUrl . '/checkout_sessions/' . $appointment->paymongo_session_id);

                if ($sessRes->successful()) {
                    $sData    = $sessRes->json('data');
                    $payments = $sData['attributes']['payments'] ?? [];
                    $piStatus = $sData['attributes']['payment_intent']['attributes']['status'] ?? '';

                    $isPaid = ($piStatus === 'succeeded');
                    if (!$isPaid && !empty($payments)) {
                        foreach ($payments as $p) {
                            if (($p['attributes']['status'] ?? '') === 'paid') {
                                $isPaid = true;
                                break;
                            }
                        }
                    }

                    if ($isPaid) {
                        $paidAmount = isset($sData['attributes']['line_items'])
                            ? collect($sData['attributes']['line_items'])->sum('amount') / 100
                            : (float) ($appointment->service->price ?? 0);

                        $methodUsed = $payments[0]['attributes']['source']['type']
                            ?? ($appointment->payment_method ?: 'online');

                        // Mark ALL siblings in the group as paid
                        $this->markGroupPaid(
                            $appointment->paymongo_session_id,
                            (float) $paidAmount,
                            $methodUsed
                        );

                        $appointment->refresh();
                    }
                }
            } catch (\Exception $e) {
                Log::warning('PayMongo checkout session verify check failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'payment_status' => $appointment->payment_status,
            'payment_method' => $appointment->payment_method,
            'paid_at'        => $appointment->paid_at?->toISOString(),
            'amount_paid'    => $appointment->amount_paid,
        ]);
    }

    // ── 4. Webhook Handler (PayMongo → Backend) ────────────────────────────────

    public function handleWebhook(Request $request)
    {
        $signature = $request->header('Paymongo-Signature');
        $rawBody   = $request->getContent();

        $webhookSecret = config('services.paymongo.webhook_secret', '');
        // Validate signature only if secret is configured and not in local testing bypass
        if ($webhookSecret && !$this->verifyWebhookSignature($signature, $rawBody, $webhookSecret)) {
            Log::warning('PayMongo webhook: invalid signature');
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $event    = $request->json('data') ?? $request->input('data') ?? [];
        $type     = $event['attributes']['type'] ?? ($request->input('type') ?? '');
        $resource = $event['attributes']['data'] ?? ($request->input('data') ?? []);

        Log::info('PayMongo webhook received', ['type' => $type, 'resource_id' => $resource['id'] ?? null]);

        if (in_array($type, ['checkout_session.payment.paid', 'payment.paid'], true)) {
            $this->handlePaymentPaid($resource);
        }

        return response()->json(['received' => true]);
    }

    // ── 5. Test Payment Simulation (for local testing / network bypass) ─────────

    public function simulateTestPayment(Request $request)
    {
        $request->validate(['appointment_id' => 'required|integer|exists:appointments,id']);
        $appointment = Appointment::with('service', 'client')->findOrFail($request->appointment_id);

        if ((int) $appointment->client_id !== (int) auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $method = $request->input('payment_method', 'gcash');

        // Load all siblings in the group and pay them all
        $siblings = $appointment->booking_group_id
            ? Appointment::with('service')->where('booking_group_id', $appointment->booking_group_id)->get()
            : collect([$appointment]);

        $totalAmount = $siblings->sum(fn($a) => (float) ($a->service->price ?? 0));

        DB::transaction(function () use ($siblings, $totalAmount, $method) {
            // Each appointment records its own service price; total is on the first
            $siblings->each(fn($a) => $a->update([
                'payment_status' => 'paid',
                'payment_method' => $method,
                'amount_paid'    => (float) ($a->service->price ?? 0),
                'paid_at'        => now(),
            ]));
        });

        $appointment->refresh();

        Log::info('Appointments marked as paid via Test Payment Simulator', [
            'group_id' => $appointment->booking_group_id,
            'ids'      => $siblings->pluck('id')->toArray(),
            'total'    => $totalAmount,
            'method'   => $method,
        ]);

        return response()->json([
            'success'         => true,
            'message'         => 'Test payment successfully confirmed!',
            'payment_status'  => 'paid',
            'payment_method'  => $method,
            'amount_paid'     => $totalAmount,
            'paid_at'         => $appointment->paid_at->toISOString(),
            'appointment_id'  => $appointment->id,
            'appointment_ids' => $siblings->pluck('id')->values(),
        ]);
    }

    // ── 6. Trigger Test Webhook (Public Test Utility) ───────────────────────────

    public function triggerTestWebhook(Request $request)
    {
        $appointmentId = $request->input('appointment_id');
        $appointment   = Appointment::with('service')->findOrFail($appointmentId);

        $priceCents = (int) round(($appointment->service->price ?? 100) * 100);

        $mockResource = [
            'id' => $appointment->paymongo_session_id ?: ('cs_test_' . uniqid()),
            'attributes' => [
                'reference_number' => 'CB-' . str_pad($appointment->id, 5, '0', STR_PAD_LEFT) . '-' . time(),
                'amount'           => $priceCents,
                'payments'         => [
                    [
                        'attributes' => [
                            'amount' => $priceCents,
                            'source' => ['type' => 'gcash'],
                        ]
                    ]
                ]
            ]
        ];

        $updated = $this->handlePaymentPaid($mockResource);

        return response()->json([
            'success'     => (bool) $updated,
            'message'     => 'Webhook test dispatched and processed successfully.',
            'appointment' => $updated,
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function handlePaymentPaid(array $resource): ?Appointment
    {
        $appointment = null;

        // 1. Check by session ID (PayMongo event resource ID is the checkout_session ID e.g. cs_...)
        $sessionId = $resource['id'] ?? ($resource['attributes']['checkout_session_id'] ?? null);
        if ($sessionId) {
            $appointment = Appointment::where('paymongo_session_id', $sessionId)->first();
        }

        // 2. Reference format fallback: CB-00001-timestamp
        if (!$appointment) {
            $refNumber = $resource['attributes']['reference_number']
                ?? ($resource['attributes']['description']
                ?? ($resource['attributes']['payment_intent']['attributes']['description'] ?? ''));

            if (preg_match('/CB-0*(\d+)-/', $refNumber, $m)) {
                $appointment = Appointment::find((int) $m[1]);
            }
        }

        // 3. Metadata fallback
        if (!$appointment && isset($resource['attributes']['metadata']['appointment_id'])) {
            $appointment = Appointment::find((int) $resource['attributes']['metadata']['appointment_id']);
        }

        if (!$appointment) {
            Log::warning('PayMongo webhook: No matching appointment found', ['resource_id' => $sessionId ?? 'unknown']);
            return null;
        }

        // Extract total amount from line_items (all services), payments array, or fallback
        $lineItemsTotal = isset($resource['attributes']['line_items'])
            ? collect($resource['attributes']['line_items'])->sum('amount')
            : null;

        $amountCents = $lineItemsTotal
            ?? ($resource['attributes']['payments'][0]['attributes']['amount']
            ?? ($resource['attributes']['amount']
            ?? null));

        $methodUsed = $resource['attributes']['payments'][0]['attributes']['source']['type']
            ?? ($resource['attributes']['payment_method_used']
            ?? ($appointment->payment_method ?: 'gcash'));

        // Mark ALL siblings in the group as paid (single paymongo_session_id stamps all)
        $this->markGroupPaid(
            $sessionId ?? $appointment->paymongo_session_id,
            $amountCents !== null ? (float) ($amountCents / 100) : null,
            $methodUsed,
            $appointment
        );

        Log::info('Appointment group marked as paid via PayMongo webhook', [
            'session_id'     => $sessionId,
            'primary_id'     => $appointment->id,
            'payment_method' => $methodUsed,
        ]);

        return $appointment;
    }

    /**
     * Mark all appointments sharing a paymongo_session_id (or booking_group_id) as paid.
     * Each appointment records its own service price; totalAmount is the grand total.
     */
    private function markGroupPaid(
        ?string $sessionId,
        ?float $totalAmount,
        string $method,
        ?Appointment $fallbackAppt = null
    ): void {
        DB::transaction(function () use ($sessionId, $totalAmount, $method, $fallbackAppt) {
            $siblings = $sessionId
                ? Appointment::with('service')->where('paymongo_session_id', $sessionId)->get()
                : collect($fallbackAppt ? [$fallbackAppt] : []);

            if ($siblings->isEmpty() && $fallbackAppt) {
                $siblings = collect([$fallbackAppt]);
            }

            $siblings->each(function ($a) use ($method) {
                $a->update([
                    'payment_status' => 'paid',
                    'payment_method' => $method,
                    'amount_paid'    => (float) ($a->service->price ?? 0),
                    'paid_at'        => now(),
                ]);
            });
        });
    }

    private function verifyWebhookSignature(?string $signature, string $body, string $secret): bool
    {
        if (!$signature) {
            return false;
        }

        $parts = [];
        foreach (explode(',', $signature) as $part) {
            [$key, $value] = array_pad(explode('=', $part, 2), 2, '');
            $parts[$key]   = $value;
        }

        $timestamp = $parts['t']  ?? '';
        $hash      = $parts['te'] ?? ($parts['li'] ?? '');
        $computed  = hash_hmac('sha256', $timestamp . '.' . $body, $secret);

        return hash_equals($computed, $hash);
    }
}
