import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { verifyPayment } from '../../api/paymongo';

export default function PaymentSuccess() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const apptId    = params.get('appointment_id');

  const [status, setStatus]   = useState('loading'); // loading | paid | pending | error
  const [details, setDetails] = useState(null);
  const pollRef               = useRef(null);
  const POLL_MAX              = 12; // 12 × 5s = 60s timeout
  const pollCount             = useRef(0);

  useEffect(() => {
    if (!apptId) { setStatus('error'); return; }

    const poll = async () => {
      try {
        const data = await verifyPayment(apptId);
        setDetails(data);
        if (data.payment_status === 'paid') {
          setStatus('paid');
          clearInterval(pollRef.current);
        } else if (pollCount.current >= POLL_MAX) {
          setStatus('pending');
          clearInterval(pollRef.current);
        }
        pollCount.current += 1;
      } catch {
        setStatus('error');
        clearInterval(pollRef.current);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [apptId]);

  const amountFormatted = details?.amount_paid
    ? `₱${Number(details.amount_paid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    : null;

  const paidAtFormatted = details?.paid_at
    ? new Date(details.paid_at).toLocaleString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg,#062c22 0%,#0a3d30 50%,#0f5040 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#bfa15f,transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#bfa15f,transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-10 pb-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <Sparkles className="w-full h-full" />
          </div>

          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}
            >
              <Loader2 className="w-10 h-10 text-amber-300" />
            </motion.div>
          )}

          {status === 'paid' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#bfa15f,#d4b87a)', boxShadow: '0 8px 24px rgba(191,161,95,0.4)' }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
          )}

          {(status === 'pending' || status === 'error') && (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.3)' }}
            >
              <Calendar className="w-10 h-10 text-amber-300" />
            </div>
          )}

          <h1 className="text-2xl font-black text-white mb-1">
            {status === 'loading' ? 'Confirming Payment…' :
             status === 'paid'    ? 'Payment Successful!' :
             status === 'pending' ? 'Payment Pending' : 'Something Went Wrong'}
          </h1>
          <p className="text-emerald-200/80 text-sm">
            {status === 'loading' ? 'Please wait while we verify your payment with PayMongo.' :
             status === 'paid'    ? 'Your spa appointment has been fully confirmed.' :
             status === 'pending' ? 'Your payment is being processed. We will notify you shortly.' :
             'Could not verify payment. Please contact support.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-5">
          {status === 'paid' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Receipt</p>

              {amountFormatted && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-semibold">Amount Paid</span>
                  <span className="text-xl font-black text-emerald-900">{amountFormatted}</span>
                </div>
              )}

              {paidAtFormatted && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-semibold text-slate-700 text-right max-w-[60%]">{paidAtFormatted}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2 border-t border-black/5">
                <span className="text-slate-500">Appointment ID</span>
                <span className="font-black text-emerald-900">#{String(apptId || 1).padStart(5, '0')}</span>
              </div>
            </motion.div>
          )}

          {/* Booking notice */}
          <div
            className="flex items-start gap-3 p-4 rounded-2xl text-xs"
            style={{ background: 'rgba(191,161,95,0.08)', border: '1px solid rgba(191,161,95,0.2)' }}
          >
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-slate-600 leading-relaxed">
              <span className="font-bold text-amber-700">Cozy Blissful Spa</span> — A confirmation email will be sent to your inbox. Please arrive 5 minutes before your appointment.
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => navigate('/client/dashboard')}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg,#062c22,#0f5040)',
              boxShadow: '0 6px 20px rgba(6,44,34,0.3)',
            }}
          >
            <Calendar className="w-4 h-4" />
            Go to My Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
