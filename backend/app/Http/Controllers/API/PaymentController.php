<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
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
            'appointment_id'       => 'required|integer|exists:appointments,id',
            'payment_method_types' => 'required|array|min:1',
            'payment_method_types.*' => 'in:card,gcash,paymaya,qrph,dob,dob_ubp',
            'frontend_url'         => 'nullable|string',
        ]);

        $appointment = Appointment::with('service', 'client')->findOrFail($request->appointment_id);

        // Authorization: only the owner can initiate payment
        if ((int) $appointment->client_id !== (int) auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($appointment->payment_status === 'paid') {
            return response()->json(['message' => 'This appointment is already fully paid.'], 422);
        }

        $price       = (float) ($appointment->service->price ?? 0);
        $amountCents = (int) round($price * 100); // PayMongo uses centavos (smallest unit)

        if ($amountCents < 10000) {
            $amountCents = 10000; // PayMongo minimum is ₱100.00 = 10,000 centavos
        }

        $frontendUrl = $request->input('frontend_url') ?: config('services.paymongo.frontend_url') ?: env('FRONTEND_URL', 'http://localhost:5174');
        $frontendUrl = rtrim($frontendUrl, '/');
        $successUrl  = $frontendUrl . '/payment/success?appointment_id=' . $appointment->id;
        $cancelUrl   = $frontendUrl . '/payment/cancel?appointment_id='  . $appointment->id;

        $refNum = 'CB-' . str_pad($appointment->id, 5, '0', STR_PAD_LEFT) . '-' . time();

        // Normalize phone to E.164 format (+63XXXXXXXXXX) required by PayMongo
        $rawPhone = $appointment->client->phone ?? '';
        $phone = preg_replace('/[^0-9+]/', '', $rawPhone);
        if ($phone && !str_starts_with($phone, '+')) {
            // Convert 09XXXXXXXX → +639XXXXXXXX
            if (str_starts_with($phone, '09') && strlen($phone) === 11) {
                $phone = '+63' . substr($phone, 1);
            } elseif (str_starts_with($phone, '9') && strlen($phone) === 10) {
                $phone = '+63' . $phone;
            } elseif (str_starts_with($phone, '63') && strlen($phone) === 12) {
                $phone = '+' . $phone;
            }
        }

        $payload = [
            'data' => [
                'attributes' => [
                    'billing' => [
                        'name'  => $appointment->client->name   ?? 'Client',
                        'email' => $appointment->client->email  ?? '',
                        'phone' => $phone ?: null,
                    ],
                    'send_email_receipt' => true,
                    'show_description'   => true,
                    'show_line_items'    => true,
                    'line_items' => [
                        [
                            'currency'    => 'PHP',
                            'amount'      => $amountCents,
                            'name'        => $appointment->service->name ?? 'Spa Treatment',
                            'quantity'    => 1,
                            'description' => sprintf(
                                '%s — %s',
                                $appointment->service->name ?? 'Spa Treatment',
                                $appointment->datetime->format('D, M j Y g:i A')
                            ),
                        ],
                    ],
                    'payment_method_types' => $request->payment_method_types,
                    'success_url'          => $successUrl,
                    'cancel_url'           => $cancelUrl,
                    'description'          => 'Cozy Blissful Spa — Appointment #' . str_pad($appointment->id, 5, '0', STR_PAD_LEFT),
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
                    'appt_id' => $appointment->id,
                ]);

                $pmErrors = $response->json('errors') ?? [];
                $firstMsg = !empty($pmErrors) ? ($pmErrors[0]['detail'] ?? 'Payment gateway error.') : $response->body();
                return response()->json([
                    'message' => $firstMsg,
                    'errors'  => $pmErrors,
                ], 422);
            }

            $session = $response->json('data');

            // Mark appointment as awaiting online payment and save session id
            $appointment->update([
                'payment_status'      => 'awaiting_payment',
                'payment_method'      => 'online',
                'paymongo_session_id' => $session['id'],
            ]);

            return response()->json([
                'checkout_url'   => $session['attributes']['checkout_url'],
                'session_id'     => $session['id'],
                'appointment_id' => $appointment->id,
                'reference'      => $refNum,
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
                    $sData = $sessRes->json('data');
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
                        $paidAmount = isset($sData['attributes']['line_items'][0]['amount'])
                            ? (float) ($sData['attributes']['line_items'][0]['amount'] / 100)
                            : (float) ($appointment->service->price ?? 0);

                        $appointment->update([
                            'payment_status' => 'paid',
                            'amount_paid'    => $paidAmount,
                            'paid_at'        => now(),
                        ]);
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
        if ($webhookSecret && !$this->verifyWebhookSignature($signature, $rawBody, $webhookSecret)) {
            Log::warning('PayMongo webhook: invalid signature');
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $event    = $request->json('data');
        $type     = $event['attributes']['type']    ?? '';
        $resource = $event['attributes']['data']     ?? [];

        Log::info('PayMongo webhook received', ['type' => $type]);

        if (in_array($type, ['checkout_session.payment.paid', 'payment.paid'], true)) {
            $this->handlePaymentPaid($resource);
        }

        return response()->json(['received' => true]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function handlePaymentPaid(array $resource): void
    {
        // Check by checkout_session_id attribute if present
        $sessionId = $resource['attributes']['checkout_session_id'] ?? null;
        if ($sessionId) {
            $appointment = Appointment::where('paymongo_session_id', $sessionId)->first();
            if ($appointment) {
                $amountCents = $resource['attributes']['amount'] ?? 0;
                $appointment->update([
                    'payment_status' => 'paid',
                    'amount_paid'    => $amountCents / 100,
                    'paid_at'        => now(),
                ]);
                Log::info('Appointment paid via PayMongo session match', ['id' => $appointment->id]);
                return;
            }
        }

        // Reference format fallback: CB-00001-timestamp
        $refNumber = $resource['attributes']['reference_number']
            ?? $resource['attributes']['description']
            ?? '';

        if (preg_match('/CB-0*(\d+)-/', $refNumber, $m)) {
            $appointmentId = (int) $m[1];
            $appointment   = Appointment::find($appointmentId);

            if ($appointment) {
                $amountCents = $resource['attributes']['amount'] ?? 0;
                $appointment->update([
                    'payment_status' => 'paid',
                    'amount_paid'    => $amountCents / 100,
                    'paid_at'        => now(),
                ]);
                Log::info('Appointment paid via PayMongo reference match', ['id' => $appointmentId, 'amount' => $amountCents / 100]);
            }
        }
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
