<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create a PayMongo Checkout Session for a Cozy Blissful booking.
     * Supports: GCash, Maya, Card, QR Ph.
     */
    public function createCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'service_id'     => 'required_without:appointment_id|exists:services,id',
            'datetime'       => 'required_without:appointment_id|date',
            'notes'          => 'nullable|string',
            'client_name'    => 'nullable|string',
            'client_email'   => 'nullable|email',
            'client_phone'   => 'nullable|string',
        ]);

        $user = $request->user();

        // 1. Resolve or Create the Appointment
        $appointment = null;
        if (!empty($validated['appointment_id'])) {
            $appointment = Appointment::with(['service', 'client'])->findOrFail($validated['appointment_id']);
            
            // Security: Client can only initiate payment for their own appointment
            if ($user && $appointment->client_id && (int)$appointment->client_id !== (int)$user->id && !$user->hasAnyRole(['admin', 'staff'])) {
                return response()->json(['message' => 'Unauthorized: You do not have permission to pay for this appointment.'], 403);
            }

            // Prevent double payments
            if ($appointment->payment_status === 'paid') {
                return response()->json(['message' => 'This appointment has already been fully paid.'], 400);
            }

            $service = $appointment->service;
            $clientName = $appointment->client?->name ?? ($user?->name ?? 'Valued Client');
            $clientEmail = $appointment->client?->email ?? ($user?->email ?? 'guest@cozyblissful.com');
            $clientPhone = $appointment->client?->phone ?? ($validated['client_phone'] ?? '09170000000');
        } else {
            $service = Service::findOrFail($validated['service_id']);
            $clientName = $user?->name ?? ($validated['client_name'] ?? 'Valued Client');
            $clientEmail = $user?->email ?? ($validated['client_email'] ?? 'guest@cozyblissful.com');
            $clientPhone = $user?->phone ?? ($validated['client_phone'] ?? '09170000000');

            // Atomic creation of the booking in Pending state
            $appointment = DB::transaction(function () use ($user, $service, $validated) {
                return Appointment::create([
                    'client_id'      => $user?->id ?? User::where('email', 'like', '%client%')->first()?->id ?? 1,
                    'service_id'     => $service->id,
                    'datetime'       => $validated['datetime'],
                    'notes'          => $validated['notes'] ?? null,
                    'status'         => 'Pending',
                    'payment_status' => 'unpaid',
                ]);
            });
        }

        if (!$service) {
            return response()->json(['message' => 'Service not found for this booking.'], 404);
        }

        // 2. Compute Amount in Centavos (e.g., ₱750.00 -> 75000)
        $servicePrice = (float) $service->price;
        $amountInCentavos = (int) round($servicePrice * 100);

        // Fail-safe minimum for PayMongo (minimum ₱20.00 = 2000 centavos)
        if ($amountInCentavos < 2000) {
            $amountInCentavos = 2000;
        }

        // 3. URLs for redirection (Dynamically use request origin if available)
        $origin = $request->header('origin');
        if (!empty($origin) && (str_contains($origin, 'localhost') || str_contains($origin, 'ngrok') || str_contains($origin, 'cozy'))) {
            $frontendUrl = rtrim($origin, '/');
        } else {
            $frontendUrl = rtrim(config('services.paymongo.frontend_url', env('FRONTEND_URL', 'http://localhost:5174')), '/');
        }
        $successUrl = "{$frontendUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&appointment_id={$appointment->id}";
        $cancelUrl  = "{$frontendUrl}/booking/cancel?appointment_id={$appointment->id}";

        // 4. Construct PayMongo Payload
        $payload = [
            'data' => [
                'attributes' => [
                    'billing' => [
                        'name'  => $clientName,
                        'email' => $clientEmail,
                        'phone' => !empty($clientPhone) ? preg_replace('/[^0-9]/', '', $clientPhone) : '09170000000',
                    ],
                    'send_email_receipt'   => true,
                    'show_description'    => true,
                    'show_line_items'     => true,
                    'description'         => "Cozy Blissful Spa & Salon — Booking #{$appointment->id} ({$service->name})",
                    'line_items' => [
                        [
                            'currency'    => 'PHP',
                            'amount'      => $amountInCentavos,
                            'name'        => $service->name,
                            'quantity'    => 1,
                            'description' => ($service->duration ?? 60) . ' mins Luxury Spa Treatment',
                        ]
                    ],
                    'payment_method_types' => [
                        'gcash',
                        'paymaya',
                        'card',
                        'qrph',
                    ],
                    'success_url' => $successUrl,
                    'cancel_url'  => $cancelUrl,
                    'metadata'    => [
                        'appointment_id' => (string) $appointment->id,
                        'client_id'      => (string) ($appointment->client_id ?? ''),
                        'service_id'     => (string) $service->id,
                        'service_name'   => $service->name,
                    ],
                ]
            ]
        ];

        // 5. Send Request to PayMongo Checkout Sessions API
        $secretKey = config('services.paymongo.secret_key');
        $baseUrl   = rtrim(config('services.paymongo.base_url', 'https://api.paymongo.com/v1'), '/');

        try {
            $response = Http::withoutVerifying()
                ->withBasicAuth($secretKey, '')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                ])
                ->timeout(15)
                ->post("{$baseUrl}/checkout_sessions", $payload);

            if ($response->failed()) {
                Log::error('PayMongo Checkout Session Creation Failed', [
                    'status' => $response->status(),
                    'body'   => $response->json(),
                ]);
                return response()->json([
                    'message' => 'PayMongo session creation failed',
                    'details' => $response->json()['errors'] ?? $response->body(),
                ], 422);
            }

            $responseData = $response->json();
            $sessionId   = $responseData['data']['id'] ?? null;
            $checkoutUrl = $responseData['data']['attributes']['checkout_url'] ?? null;

            // 6. Update Appointment with Session ID
            if ($sessionId) {
                $appointment->update([
                    'paymongo_session_id' => $sessionId,
                    'amount_paid'         => $servicePrice,
                ]);
            }

            // Log Audit
            AuditLog::create([
                'action'        => 'PAYMENT_SESSION_CREATED',
                'description'   => "Initiated PayMongo Checkout Session {$sessionId} for Appointment #{$appointment->id} (₱{$servicePrice})",
                'user_id'       => $user?->id ?? null,
                'ip_address'    => $request->ip(),
                'user_agent'    => $request->userAgent(),
                'created_at'    => now(),
            ]);

            return response()->json([
                'message'        => 'Checkout session created successfully.',
                'checkout_url'   => $checkoutUrl,
                'session_id'     => $sessionId,
                'appointment_id' => $appointment->id,
                'amount'         => $servicePrice,
                'service'        => $service->name,
            ]);

        } catch (\Throwable $e) {
            Log::error('Exception in PayMongo Checkout Session creation: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Unable to connect to PayMongo payment gateway.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook Handler for PayMongo events.
     * Specifically catches 'checkout_session.payment.paid'.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->all();
        Log::info('PayMongo Webhook Received', $payload);

        $eventType = $payload['data']['attributes']['type'] ?? null;
        $eventData = $payload['data']['attributes']['data'] ?? null;

        if ($eventType === 'checkout_session.payment.paid' && $eventData) {
            $sessionId = $eventData['id'] ?? null;
            $attributes = $eventData['attributes'] ?? [];
            $metadata = $attributes['metadata'] ?? [];
            $appointmentId = $metadata['appointment_id'] ?? null;

            // Extract Payment details
            $payments = $attributes['payments'] ?? [];
            $firstPayment = !empty($payments) ? $payments[0] : null;
            $paymentId = $firstPayment['id'] ?? null;
            $paymentSource = $firstPayment['attributes']['source']['type'] ?? 'paymongo';
            $paidCentavos = $firstPayment['attributes']['amount'] ?? 0;
            $amountPaid = $paidCentavos > 0 ? ($paidCentavos / 100) : null;

            // Find Appointment
            $appointment = null;
            if ($appointmentId) {
                $appointment = Appointment::find($appointmentId);
            }
            if (!$appointment && $sessionId) {
                $appointment = Appointment::where('paymongo_session_id', $sessionId)->first();
            }

            if ($appointment) {
                $appointment->update([
                    'payment_status'      => 'paid',
                    'payment_method'      => $paymentSource,
                    'paymongo_payment_id' => $paymentId,
                    'amount_paid'         => $amountPaid ?? $appointment->amount_paid,
                ]);

                // Create Admin notification
                Notification::create([
                    'type'           => 'payment_paid',
                    'title'          => 'Payment Confirmed',
                    'description'    => "Payment of ₱" . number_format($amountPaid ?? $appointment->amount_paid, 2) . " received via " . strtoupper($paymentSource) . " for Appointment #{$appointment->id}",
                    'appointment_id' => $appointment->id,
                ]);

                AuditLog::create([
                    'action'        => 'PAYMENT_RECEIVED',
                    'description'   => "PayMongo payment {$paymentId} (₱{$amountPaid}) received for Appointment #{$appointment->id} via {$paymentSource}",
                    'user_id'       => $appointment->client_id,
                    'ip_address'    => $request->ip(),
                    'user_agent'    => $request->userAgent(),
                    'created_at'    => now(),
                ]);

                Log::info("Appointment #{$appointment->id} marked as PAID via PayMongo Webhook.");
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Webhook handled']);
    }

    /**
     * Verify Session Status on frontend return (useful for instant sync & local dev).
     */
    public function verifySession(Request $request, $sessionId)
    {
        $secretKey = config('services.paymongo.secret_key');
        $baseUrl   = rtrim(config('services.paymongo.base_url', 'https://api.paymongo.com/v1'), '/');

        try {
            $response = Http::withoutVerifying()
                ->withBasicAuth($secretKey, '')
                ->withHeaders(['Accept' => 'application/json'])
                ->get("{$baseUrl}/checkout_sessions/{$sessionId}");

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Could not retrieve PayMongo session details.',
                ], 404);
            }

            $sessionData = $response->json()['data'] ?? [];
            $attributes  = $sessionData['attributes'] ?? [];
            $payments    = $attributes['payments'] ?? [];
            $status      = $attributes['status'] ?? 'active';

            $isPaid = false;
            $paymentSource = null;
            $paymentId = null;
            $paidCentavos = 0;

            if (!empty($payments)) {
                $firstPayment = $payments[0];
                if (($firstPayment['attributes']['status'] ?? '') === 'paid') {
                    $isPaid = true;
                    $paymentId = $firstPayment['id'] ?? null;
                    $paymentSource = $firstPayment['attributes']['source']['type'] ?? 'paymongo';
                    $paidCentavos = $firstPayment['attributes']['amount'] ?? 0;
                }
            }

            // Sync with local database appointment
            $appointment = Appointment::where('paymongo_session_id', $sessionId)->first();
            if (!$appointment && !empty($attributes['metadata']['appointment_id'])) {
                $appointment = Appointment::find($attributes['metadata']['appointment_id']);
            }

            if ($appointment && $isPaid && $appointment->payment_status !== 'paid') {
                $amount = $paidCentavos > 0 ? ($paidCentavos / 100) : $appointment->amount_paid;
                $appointment->update([
                    'payment_status'      => 'paid',
                    'payment_method'      => $paymentSource,
                    'paymongo_payment_id' => $paymentId,
                    'amount_paid'         => $amount,
                ]);

                Notification::create([
                    'type'           => 'payment_paid',
                    'title'          => 'Payment Confirmed',
                    'description'    => "Payment of ₱" . number_format($amount, 2) . " received via " . strtoupper($paymentSource ?? 'online') . " for Appointment #{$appointment->id}",
                    'appointment_id' => $appointment->id,
                ]);
            }

            return response()->json([
                'session_id'     => $sessionId,
                'is_paid'        => $isPaid,
                'payment_method' => $paymentSource,
                'payment_id'     => $paymentId,
                'appointment'    => $appointment ? [
                    'id'             => $appointment->id,
                    'status'         => $appointment->status,
                    'payment_status' => $appointment->payment_status,
                    'datetime'       => $appointment->datetime,
                ] : null,
            ]);

        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error verifying session: ' . $e->getMessage()], 500);
        }
    }
}
