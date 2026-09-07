import API from './axios';

// ── PayMongo method IDs ────────────────────────────────────────────────────
export const PAYMENT_METHODS = {
  gcash:   { id: 'gcash',   label: 'GCash',       icon: '📱', color: '#00b14f', bg: '#e8f9ef' },
  paymaya: { id: 'paymaya', label: 'Maya',         icon: '💳', color: '#0073ce', bg: '#e6f2ff' },
  qrph:    { id: 'qrph',    label: 'QR Ph',        icon: '📷', color: '#6c3483', bg: '#f5eafb' },
  card:    { id: 'card',    label: 'Credit / Debit Card', icon: '💳', color: '#374151', bg: '#f3f4f6' },
};

// ── Create a PayMongo Checkout Session ─────────────────────────────────────
export async function createCheckoutSession({ appointmentId, paymentMethodTypes }) {
  const res = await API.post('/payment/create-checkout-session', {
    appointment_id:       appointmentId,
    payment_method_types: paymentMethodTypes,
    frontend_url:         typeof window !== 'undefined' ? window.location.origin : undefined,
  });
  return res.data; // { checkout_url, session_id, appointment_id, reference }
}

// ── Poll session status ────────────────────────────────────────────────────
export async function getSessionStatus(sessionId) {
  const res = await API.get(`/payment/session-status/${sessionId}`);
  return res.data; // { session_id, status, payments }
}

// ── Verify appointment payment status ──────────────────────────────────────
export async function verifyPayment(appointmentId) {
  const res = await API.get('/payment/verify', { params: { appointment_id: appointmentId } });
  return res.data; // { payment_status, payment_method, paid_at, amount_paid }
}
