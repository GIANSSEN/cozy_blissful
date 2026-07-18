import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  Search, Info, Star, HeartPulse, MessageSquare,
  ShieldAlert, AlertTriangle,
} from 'lucide-react';

/* ── Mock customer registry ─────────────────────────────────────── */
const MOCK_CUSTOMERS = [
  { id: 1, name: 'Sarah Martinez', email: 'sarah@example.com', phone: '+63 917 123 4567', bookings: 12, notes: 'Prefers Swedish Massage with Lavender Oil, medium pressure.' },
  { id: 2, name: 'David Lim', email: 'david.lim@example.com', phone: '+63 918 987 6543', bookings: 5, notes: 'Requires Deep Tissue focus on lower back and neck.' },
  { id: 3, name: 'Patricia Go', email: 'patty.go@example.com', phone: '+63 919 444 5555', bookings: 8, notes: 'Regular gel nails client. Prefers Anna Reyes.' },
  { id: 4, name: 'John Vincent', email: 'vincent.j@example.com', phone: '+63 922 555 1234', bookings: 1, notes: 'First time. Prefers standard Hilot massage.' },
];

/* ── Mock reviews & feedback ────────────────────────────────────── */
const MOCK_REVIEWS = [
  { id: 1, customer: 'Sarah Martinez', rating: 5, comment: 'Amazing Swedish massage, very relaxing atmosphere!', date: '2026-07-10' },
  { id: 2, customer: 'David Lim', rating: 4, comment: 'Great deep tissue session, would love a longer duration option.', date: '2026-07-08' },
  { id: 3, customer: 'Patricia Go', rating: 5, comment: 'Anna is amazing with gel nails, super detailed work.', date: '2026-07-03' },
];

/* ── Mock medical & allergy records ─────────────────────────────── */
const MOCK_MEDICAL = [
  { id: 1, customer: 'Sarah Martinez', condition: 'Sensitive skin', allergy: 'Lavender oil (mild)', flagged: true },
  { id: 2, customer: 'David Lim', condition: 'Lower back strain', allergy: 'None reported', flagged: false },
  { id: 3, customer: 'Patricia Go', condition: 'None reported', allergy: 'Acetone sensitivity', flagged: true },
  { id: 4, customer: 'John Vincent', condition: 'None reported', allergy: 'None reported', flagged: false },
];

const AdminCustomers = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getPageTitle = () => {
    switch (activeTab) {
      case 'reviews': return 'Reviews & Feedback';
      case 'medical': return 'Medical & Allergy Records';
      case 'profiles':
      default: return 'Customer Profiles';
    }
  };

  return (
    <AdminLayout title="Customers" subtitle={getPageTitle()}>
      <div className="space-y-6">

        {/* ── Customer Profiles Tab ── */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Customer Registry</h2>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search customer name..."
                  value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:text-slate-100 dark:bg-slate-900 focus:outline-none focus:border-emerald-800"
                  style={{ background: '#faf9f6' }} />
              </div>
            </div>
            <div className="grid gap-4">
              {filteredCustomers.map(cust => (
                <div key={cust.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center font-bold text-sm">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-none">{cust.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{cust.email} · {cust.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-full">
                      {cust.bookings} Bookings
                    </span>
                  </div>
                  {cust.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Treatment Notes:</strong> {cust.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews & Feedback Tab ── */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Customer Reviews</h2>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                {(MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1)} ★ Average
              </span>
            </div>
            <div className="grid gap-4">
              {MOCK_REVIEWS.map(rv => (
                <div key={rv.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2.5 hover:shadow-md transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-800" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rv.customer}</h4>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rv.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rv.comment}</p>
                  <p className="text-[10px] text-slate-400">{rv.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Medical & Allergy Records Tab ── */}
        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Medical & Allergy Records</h2>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Confidential
              </span>
            </div>
            <div className="grid gap-4">
              {MOCK_MEDICAL.map(rec => (
                <div key={rec.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rec.customer}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Condition: {rec.condition}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Allergy: {rec.allergy}</p>
                    </div>
                  </div>
                  {rec.flagged && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 flex-shrink-0">
                      <AlertTriangle className="w-3 h-3" /> Flagged
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
