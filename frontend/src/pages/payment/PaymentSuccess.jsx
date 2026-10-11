import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, Loader2, Sparkles, Check, Scissors } from 'lucide-react';
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

  const rawAmount = details?.total_amount_paid ?? details?.amount_paid;
  const amountFormatted = rawAmount
    ? `₱${Number(rawAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    : null;

  const paidAtFormatted = details?.paid_at
    ? new Date(details.paid_at).toLocaleString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : null;

  const services = details?.services || [];
  const isMulti = details?.is_multi_service || services.length > 1;

  const methodLabel = (m) => {
    if (!m) return 'Online Payment';
    const s = String(m).toLowerCase();
    if (s.includes('gcash')) return 'GCash';
    if (s.includes('maya')) return 'Maya';
    if (s.includes('qrph')) return 'QR Ph (InstaPay)';
    if (s.includes('card')) return 'Credit / Debit Card';
    return s.toUpperCase();
  };

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
        className="relative w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl my-6"
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
             status === 'paid'    ? (isMulti ? `All ${services.length || details?.services_count} spa treatments in your package have been fully confirmed!` : 'Your spa appointment has been fully confirmed.') :
             status === 'pending' ? 'Your payment is being processed. We will notify you shortly.' :
             'Could not verify payment. Please contact support.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 space-y-4">
          {status === 'paid' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 space-y-3.5"
              style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Receipt</p>
                {isMulti && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" /> {services.length || details?.services_count} Services Package
                  </span>
                )}
              </div>

              {amountFormatted && (
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Amount Paid</span>
                    <p className="text-[11px] text-emerald-800 font-bold">Covering all booked services</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-900 tabular-nums">{amountFormatted}</span>
                </div>
              )}

              {details?.payment_method && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    {methodLabel(details.payment_method)}
                  </span>
                </div>
              )}

              {paidAtFormatted && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-semibold text-slate-700 text-right max-w-[65%]">{paidAtFormatted}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Primary Booking ID</span>
                <span className="font-black text-emerald-900 font-mono text-sm">#{String(apptId || 1).padStart(5, '0')}</span>
              </div>

              {/* Multi-Service Itemized Breakdown */}
              {isMulti && services.length > 0 && (
                <div className="pt-3 border-t border-black/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-amber-950 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-700" /> Included Treatments ({services.length})
                    </span>
                    <span className="text-emerald-800 text-[10px] font-bold">100% Paid in Full</span>
                  </div>

                  <div className="rounded-xl bg-white/80 border border-amber-200/60 p-2.5 divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {services.map((svc, idx) => (
                      <div key={svc.id || idx} className="py-2 first:pt-1 last:pb-1 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{svc.name}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>#{String(svc.id).padStart(5, '0')}</span>
                            <span>•</span>
                            <span>{svc.duration} mins</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <span className="font-black text-emerald-900 tabular-nums">
                            ₱{Number(svc.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5 text-emerald-700" /> Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {details?.appointment_ids?.length > 1 && (
                    <p className="text-[10px] text-slate-500 font-mono text-right pt-0.5">
                      Confirmed IDs: #{details.appointment_ids.map(id => String(id).padStart(5, '0')).join(', #')}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Booking notice */}
          <div
            className="flex items-start gap-3 p-4 rounded-2xl text-xs"
            style={{ background: 'rgba(191,161,95,0.08)', border: '1px solid rgba(191,161,95,0.2)' }}
          >
            <p className="text-slate-600 leading-relaxed">
              <span className="font-bold text-amber-700">Cozy Blissful Spa</span> — A confirmation email for all booked treatments has been sent to your inbox. Please arrive 10 minutes before your appointment time.
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => navigate('/client/dashboard')}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg cursor-pointer"
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
