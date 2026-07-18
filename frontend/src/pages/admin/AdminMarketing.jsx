import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  Plus, Pencil, Trash2, Gift, Clock, Megaphone,
  CheckCircle2, AlertCircle, Copy,
} from 'lucide-react';

/* ── Mock promo campaigns (moved from Services & Offers) ────────── */
const MOCK_PROMOS = [
  { id: 1, name: 'Sparty Package Deluxe', desc: 'Indulge in a 3-hour group massage and nail spa package for up to 5 persons. Complimentary tea included.', price: 4999, duration: 180 },
  { id: 2, name: 'Kiddie Sparty Special', desc: 'Adapted massage strokes and organic non-toxic regular mani-pedi treatments for kids under 12.', price: 1999, duration: 120 },
  { id: 3, name: 'Seasonal Holiday Relief Promo', desc: 'A custom combination of Hilot Healing massage followed by hot banana wrap therapy. Available Dec-Jan.', price: 1299, duration: 90 },
];

/* ── Mock gift cards & vouchers ──────────────────────────────────── */
const MOCK_GIFT_CARDS = [
  { id: 1, code: 'CB-GIFT-1000', value: 1000, status: 'Active', redeemedBy: null },
  { id: 2, code: 'CB-GIFT-500',  value: 500,  status: 'Redeemed', redeemedBy: 'Sarah Martinez' },
  { id: 3, code: 'CB-VOUCHER-SPA20', value: 20, status: 'Active', redeemedBy: null, isPercent: true },
  { id: 4, code: 'CB-GIFT-2000', value: 2000, status: 'Expired', redeemedBy: null },
];

const STATUS_STYLES = {
  Active:   'bg-emerald-50 text-emerald-800 border-emerald-100',
  Redeemed: 'bg-slate-100 text-slate-600 border-slate-200',
  Expired:  'bg-red-50 text-red-600 border-red-100',
};

const AdminMarketing = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'giftcards';
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'promos': return 'Promo Campaigns';
      case 'giftcards':
      default: return 'Gift Cards & Vouchers';
    }
  };

  return (
    <AdminLayout title="Marketing & Loyalty" subtitle={getPageTitle()}>
      <div className="space-y-6">

        {toast && (
          <div
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-bold text-white shadow-2xl transition-all"
            style={{
              background: toast.type === 'success' ? 'linear-gradient(135deg,#062c22,#0a3d30)' : '#991b1b',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-red-300" />}
            {toast.msg}
          </div>
        )}

        {/* ── Gift Cards & Vouchers Tab ── */}
        {activeTab === 'giftcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Issued Gift Cards &amp; Vouchers</h3>
              <button
                onClick={() => showToast('Add gift card is mocked')}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Issue New
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {MOCK_GIFT_CARDS.map(gc => (
                <div key={gc.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{gc.code}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {gc.isPercent ? `${gc.value}% Off Voucher` : `₱${gc.value.toLocaleString()} Gift Card`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => showToast('Code copied (mock)')} className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-slate-500 hover:text-emerald-800 transition">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[gc.status]}`}>
                      {gc.status}
                    </span>
                    {gc.redeemedBy && (
                      <span className="text-[10px] text-slate-400">by {gc.redeemedBy}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Promo Campaigns Tab ── */}
        {activeTab === 'promos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Active Sparty Packages &amp; Seasonal Promos</h3>
              <button onClick={() => showToast('Add campaign is mocked')} className="flex items-center gap-1 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition">
                <Megaphone className="w-3.5 h-3.5" /> Add Campaign
              </button>
            </div>

            <div className="grid gap-4">
              {MOCK_PROMOS.map(promo => (
                <div key={promo.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">{promo.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{promo.desc}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5" /> {promo.duration}m duration</span>
                      <span>·</span>
                      <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">₱{promo.price.toLocaleString()} Standard Payout</span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
                    <button onClick={() => showToast('Edit promo is mocked')} className="p-2 border rounded-xl text-slate-500 hover:text-emerald-850 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 transition"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => showToast('Delete promo is mocked')} className="p-2 border border-red-100 rounded-xl text-red-500 hover:text-red-750 bg-red-50 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminMarketing;
