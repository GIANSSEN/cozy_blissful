import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Receipt,
  Shield,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  CASH SETTLEMENT MODAL                                  */
/*  Step 1: Enter amounts  â†’  Step 2: Review & Confirm     */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function CashSettlementModal({
  appt,
  onClose,
  onConfirmSettlement,
  isDark = false,
}) {
  const initialDue = Number(appt.service_price || appt.amount_paid || 0);
  const [amountDue,    setAmountDue]    = useState(initialDue);
  const [cashTendered, setCashTendered] = useState(initialDue > 0 ? initialDue : '');
  const [notes,        setNotes]        = useState('');
  const [step,         setStep]         = useState(1);
  const [submitting,   setSubmitting]   = useState(false);
  const [errors,       setErrors]       = useState({});

  const numDue      = Number(amountDue) || 0;
  const numTendered = Number(cashTendered) || 0;
  const change      = Math.max(0, numTendered - numDue);
  const isUnderpaid = numTendered > 0 && numTendered < numDue;
  const isExact     = numTendered === numDue;

  useEffect(() => {
    if (initialDue > 0) { setAmountDue(initialDue); setCashTendered(initialDue); }
  }, [initialDue]);

  const rawDt       = appt.datetime || '';
  const fmtFullDate = rawDt ? new Date(rawDt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'â€”';
  const fmtTime     = rawDt ? new Date(rawDt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
  const clientName  = appt.client_name  || appt.client  || 'Client';
  const serviceName = appt.service      || 'Spa Treatment';
  const therapist   = appt.therapist_name || appt.therapist || 'â€”';

  const quickPresets = [
    { label: 'Exact',  value: numDue },
    { label: 'â‚±500',   value: 500    },
    { label: 'â‚±1,000', value: 1000   },
    { label: 'â‚±1,500', value: 1500   },
    { label: 'â‚±2,000', value: 2000   },
  ];

  const validate = () => {
    const errs = {};
    if (!numDue || numDue <= 0)
      errs.amountDue = 'Session fee is required. Enter the total treatment cost.';
    if (!numTendered || numTendered <= 0)
      errs.cashTendered = 'Cash received amount is required.';
    else if (numTendered < numDue)
      errs.cashTendered = `Cash tendered (â‚±${numTendered.toFixed(2)}) is less than amount due (â‚±${numDue.toFixed(2)}). Collect the full amount first.`;
    return errs;
  };

  const handleProceedToReview = (e) => {
    e?.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  };

  const handleFinalConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirmSettlement(appt.id, {
        amount_paid: numDue, cash_tendered: numTendered, change,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || 'Failed to settle payment. Please try again.' });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  /* â”€â”€ styles â”€â”€ */
  const inputBg     = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1';
  const textColor   = isDark ? '#e2e8f3' : '#1e293b';

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 14px 10px 32px', borderRadius: 12,
    border: `1.5px solid ${hasErr ? '#ef4444' : inputBorder}`,
    background: inputBg, color: textColor, fontSize: 14, fontWeight: 700,
    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
  });

  const btnBase = {
    height: 44, borderRadius: 14, fontSize: 13, fontWeight: 900,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, transition: 'all 0.18s', border: 'none',
  };

  const canProceed = numDue > 0 && numTendered > 0 && !isUnderpaid;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      className="sm:items-center"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{
          width: '100%', maxWidth: 520,
          background: isDark ? 'linear-gradient(145deg,#182030,#121824)' : 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.9)',
          color: textColor, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: '96vh',
          boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
          borderRadius: '24px 24px 0 0',
        }}
        className="sm:rounded-[24px] sm:max-h-[92vh]"
      >
        {/* â”€â”€ Header â”€â”€ */}
        <div style={{ padding: '20px 24px 16px', background: 'linear-gradient(135deg,#062c22,#0a3d30)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,191,36,0.18)', border: '1.5px solid rgba(251,191,36,0.3)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Banknote size={21} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(251,191,36,0.75)' }}>
                  {step === 1 ? 'Front Desk Checkout' : 'Review & Confirm'}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '3px 0 0' }}>
                  {step === 1 ? 'Settle Cash & Complete Session' : 'Confirm Settlement'}
                </h3>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={submitting}
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            {[1, 2].map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: step >= s ? '#34d399' : 'rgba(255,255,255,0.12)', color: step >= s ? '#064e3b' : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>
                    {step > s ? <CheckCircle size={12} /> : s}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: step >= s ? '#a7f3d0' : 'rgba(255,255,255,0.35)' }}>
                    {s === 1 ? 'Enter Amount' : 'Confirm'}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* â”€â”€ Scrollable Body â”€â”€ */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Session recap */}
          <div style={{ padding: '13px 15px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(6,44,34,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(6,44,34,0.09)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5 }}>Session</span>
              <span style={{ fontSize: 10, fontWeight: 900, fontFamily: 'monospace', color: '#b45309', background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)', padding: '1px 7px', borderRadius: 7 }}>#{String(appt.id).padStart(5, '0')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <p style={{ fontWeight: 900, fontSize: 14, margin: 0 }}>{clientName}</p>
                <p style={{ fontSize: 12, opacity: 0.65, fontWeight: 600, margin: '2px 0 0' }}>{serviceName}</p>
                <p style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, margin: '2px 0 0' }}>by <strong>{therapist}</strong></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{fmtFullDate}</p>
                <p style={{ fontSize: 11, opacity: 0.6, fontWeight: 600, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <Clock size={10} style={{ color: '#059669' }} /> {fmtTime}
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* â”€â”€ STEP 1 â”€â”€ */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Amount Due */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.58, marginBottom: 5 }}>
                    Total Treatment Fee (â‚±) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, opacity: 0.4 }}>â‚±</span>
                    <input type="number" step="0.01" min="0" value={amountDue}
                      onChange={e => { setAmountDue(e.target.value); setErrors(p => ({ ...p, amountDue: '' })); }}
                      placeholder="0.00" style={inputStyle(errors.amountDue)} />
                  </div>
                  {errors.amountDue && <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{errors.amountDue}</p>}
                </div>

                {/* Cash Tendered */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.58 }}>
                      Cash Received (â‚±) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>Cash only</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, opacity: 0.4 }}>â‚±</span>
                    <input type="number" step="0.01" min="0" value={cashTendered}
                      onChange={e => { setCashTendered(e.target.value); setErrors(p => ({ ...p, cashTendered: '' })); }}
                      placeholder="0.00" style={inputStyle(errors.cashTendered)} />
                  </div>
                  {errors.cashTendered && <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{errors.cashTendered}</p>}
                  {/* Quick presets */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                    {quickPresets.map((p, i) => (
                      <button key={i} type="button"
                        onClick={() => { setCashTendered(p.value); setErrors(prev => ({ ...prev, cashTendered: '' })); }}
                        style={{ padding: '4px 10px', borderRadius: 9, fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.13s', background: numTendered === p.value ? 'linear-gradient(135deg,#062c22,#0f5040)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), color: numTendered === p.value ? '#fff' : 'inherit', border: numTendered === p.value ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'}` }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live calculation */}
                {numDue > 0 && numTendered > 0 && (
                  <div style={{ padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${isUnderpaid ? '#fca5a5' : '#6ee7b7'}`, background: isUnderpaid ? (isDark ? 'rgba(239,68,68,0.08)' : 'rgba(254,226,226,0.5)') : (isDark ? 'rgba(5,150,105,0.08)' : 'rgba(209,250,229,0.5)') }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.6 }}>{isUnderpaid ? 'Shortfall' : isExact ? 'Exact â€” No Change' : 'Change Due'}</span>
                        <p style={{ fontSize: 22, fontWeight: 900, margin: '3px 0 0', color: isUnderpaid ? '#dc2626' : '#059669', fontFamily: 'monospace' }}>
                          â‚±{isUnderpaid ? (numDue - numTendered).toFixed(2) : change.toFixed(2)}
                        </p>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isUnderpaid ? 'rgba(239,68,68,0.12)' : 'rgba(5,150,105,0.12)', color: isUnderpaid ? '#dc2626' : '#059669' }}>
                        {isUnderpaid ? <AlertCircle size={18} /> : <Receipt size={18} />}
                      </div>
                    </div>
                    {isUnderpaid && <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', margin: '7px 0 0' }}>âš  Collect at least â‚±{numDue.toFixed(2)} before confirming settlement.</p>}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.58, marginBottom: 5 }}>
                    Counter Notes <span style={{ opacity: 0.45, fontWeight: 600, textTransform: 'none' }}>(optional)</span>
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="e.g. Client paid exact, requested receiptâ€¦"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 11, border: `1.5px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: 12, fontWeight: 600, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                {errors.submit && <div style={{ padding: '9px 12px', borderRadius: 11, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.28)', color: '#ef4444', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><AlertCircle size={13} />{errors.submit}</div>}
              </motion.div>
            )}

            {/* â”€â”€ STEP 2 â”€â”€ */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {[
                  { label: 'Service Fee',     value: `â‚±${numDue.toFixed(2)}` },
                  { label: 'Cash Received',   value: `â‚±${numTendered.toFixed(2)}` },
                  { label: 'Change Returned', value: `â‚±${change.toFixed(2)}`, green: true },
                  ...(notes ? [{ label: 'Notes', value: notes }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: row.green ? '#059669' : textColor }}>{row.value}</span>
                  </div>
                ))}

                {/* Warning */}
                <div style={{ padding: '13px 15px', borderRadius: 14, background: isDark ? 'rgba(245,158,11,0.09)' : 'rgba(254,243,199,0.7)', border: '1.5px solid rgba(245,158,11,0.35)', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <Shield size={15} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: isDark ? '#fbbf24' : '#92400e', lineHeight: 1.6 }}>
                    By confirming, this session will be marked <strong>Completed</strong> and the payment recorded as settled. <strong>This cannot be undone.</strong>
                  </p>
                </div>

                {errors.submit && <div style={{ padding: '9px 12px', borderRadius: 11, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.28)', color: '#ef4444', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><AlertCircle size={13} />{errors.submit}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* â”€â”€ Footer â”€â”€ */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', display: 'flex', gap: 10, flexShrink: 0 }}>
          {step === 1 ? (
            <>
              <button type="button" onClick={onClose} disabled={submitting}
                style={{ ...btnBase, flex: 1, background: 'transparent', color: textColor, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleProceedToReview}
                disabled={!canProceed || submitting}
                style={{ ...btnBase, flex: 2, background: canProceed ? 'linear-gradient(135deg,#062c22,#0f5040)' : (isDark ? '#1e293b' : '#e2e8f0'), color: canProceed ? '#fff' : (isDark ? '#475569' : '#94a3b8'), cursor: canProceed && !submitting ? 'pointer' : 'not-allowed', boxShadow: canProceed ? '0 4px 16px rgba(5,150,105,0.25)' : 'none' }}>
                Review Summary <ChevronRight size={15} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep(1)} disabled={submitting}
                style={{ ...btnBase, flex: 1, background: 'transparent', color: textColor, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button type="button" onClick={handleFinalConfirm} disabled={submitting}
                style={{ ...btnBase, flex: 2, background: submitting ? (isDark ? '#1e293b' : '#e2e8f0') : 'linear-gradient(135deg,#059669,#047857)', color: submitting ? (isDark ? '#475569' : '#94a3b8') : '#fff', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 20px rgba(5,150,105,0.35)' }}>
                {submitting ? (
                  <><span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.65s linear infinite', display: 'inline-block' }} /> Finalizingâ€¦</>
                ) : (
                  <><CheckCircle size={15} /> Confirm Cash & Finalize</>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

