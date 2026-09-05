import API from './axios';

/**
 * PayMongo Checkout API Service for Cozy Blissful Spa & Salon.
 */

/**
 * Request PayMongo Checkout Session from backend
 * @param {Object} bookingData - { appointment_id?, service_id, datetime, notes?, client_name?, client_email?, client_phone? }
 * @returns {Promise<{ checkout_url: string, session_id: string, appointment_id: number, amount: number }>}
 */
export const createCheckoutSession = async (bookingData) => {
  const response = await API.post('/payment/checkout-session', bookingData);
  return response.data;
};

/**
 * Verify checkout session payment status upon returning to success page
 * @param {string} sessionId - PayMongo Checkout Session ID (cs_xxx)
 * @returns {Promise<{ is_paid: boolean, session_id: string, payment_method: string, appointment: Object }>}
 */
export const verifyCheckoutSession = async (sessionId) => {
  const response = await API.get(`/payment/verify-session/${sessionId}`);
  return response.data;
};

export default {
  createCheckoutSession,
  verifyCheckoutSession,
};
