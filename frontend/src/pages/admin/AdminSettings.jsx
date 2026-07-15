import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Sliders, Globe, Bell, Save, CheckCircle2 } from 'lucide-react';

const AdminSettings = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('config');
  const [toast, setToast] = useState(false);

  const [spaConfig, setSpaConfig] = useState({
    name: 'Cozy Blissful Home Service Spa',
    hoursOpen: '06:00 AM',
    hoursClose: '11:00 PM',
    address: 'Metropolitan Manila, Philippines',
    phone: '+63 999 543 5913',
  });

  const [cmsConfig, setCmsConfig] = useState({
    heroTitle: 'Spa-Quality At Your Door.',
    heroSubtitle: 'Premium Home Service Spa & Wellness',
    heroDescription: 'Professional massage therapy and nail care — delivered to your sanctuary. Available 7 days a week, 6:00 AM – 11:00 PM.',
    facebookUrl: 'https://facebook.com/cozyblissful',
    instagramUrl: 'https://instagram.com/cozyblissful',
  });

  const [notifications, setNotifications] = useState({
    smsBookingCreated: true,
    smsBookingApproved: true,
    emailBookingCreated: true,
    emailPromoUpdates: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const tabItems = [
    { id: 'config', label: 'Spa Configuration', icon: Sliders },
    { id: 'cms', label: 'Content Management', icon: Globe },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
  ];

  const fieldStyles = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition shadow-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200/80 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20';

  return (
    <AdminLayout title="System Settings" subtitle="Configure operating hours, content management for landing page banners, and email/SMS triggers">
      <div className="space-y-6">
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-2xl border border-emerald-800 bg-emerald-950 px-5 py-3 text-xs font-semibold text-emerald-100 shadow-2xl shadow-emerald-950/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/90 dark:border-slate-700 dark:bg-slate-950/90 p-1 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.12)]">
          <div className="grid gap-2 rounded-[26px] bg-white/95 dark:bg-slate-950/95 p-2 sm:grid-cols-3">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[3.2rem] items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-all ${
                    active
                      ? theme === 'dark'
                        ? 'border-emerald-400 bg-slate-900 text-emerald-100 shadow-[0_0_0_1px_rgba(52,201,158,0.15)]'
                        : 'border-emerald-400 bg-emerald-100 text-emerald-950 shadow-[0_0_0_1px_rgba(52,201,158,0.15)]'
                      : theme === 'dark'
                        ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSave} className="rounded-[32px] border border-slate-200/70 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/95 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.12)]">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500 dark:text-emerald-400">Operating profile</p>
                  <h2 className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Spa details & availability</h2>
                </div>
                <p className={`max-w-xl text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Keep your name, contact, and business hours up to date for easy management.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {[
                  { label: 'Spa Name', value: spaConfig.name, setter: (val) => setSpaConfig({ ...spaConfig, name: val }) },
                  { label: 'Contact Number', value: spaConfig.phone, setter: (val) => setSpaConfig({ ...spaConfig, phone: val }) },
                  { label: 'Opening Time', value: spaConfig.hoursOpen, setter: (val) => setSpaConfig({ ...spaConfig, hoursOpen: val }) },
                  { label: 'Closing Time', value: spaConfig.hoursClose, setter: (val) => setSpaConfig({ ...spaConfig, hoursClose: val }) },
                ].map((field) => (
                  <div key={field.label} className="space-y-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className={fieldStyles}
                    />
                  </div>
                ))}

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">Service Coverage Area</label>
                  <input
                    type="text"
                    value={spaConfig.address}
                    onChange={(e) => setSpaConfig({ ...spaConfig, address: e.target.value })}
                    className={fieldStyles}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Content management</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Hero banner copy</h2>
                </div>
                <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">Update the landing page messages shown to new clients.</p>
              </div>

              <div className="grid gap-5">
                {[
                  { label: 'Main Heading Title', value: cmsConfig.heroTitle, setter: (val) => setCmsConfig({ ...cmsConfig, heroTitle: val }) },
                  { label: 'Pill Badge Subtitle', value: cmsConfig.heroSubtitle, setter: (val) => setCmsConfig({ ...cmsConfig, heroSubtitle: val }) },
                ].map((field) => (
                  <div key={field.label} className="space-y-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className={fieldStyles}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">Hero Description Copy</label>
                  <textarea
                    rows="4"
                    value={cmsConfig.heroDescription}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroDescription: e.target.value })}
                    className={`${fieldStyles} resize-none min-h-[120px]`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Notification rules</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Email and SMS triggers</h2>
                </div>
                <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">Turn on the right alerts for bookings and marketing.</p>
              </div>

              <div className="grid gap-4">
                {[
                  { key: 'smsBookingCreated', title: 'Send SMS on Booking Creation', desc: 'Alert therapist and customer immediately when booking is scheduled.' },
                  { key: 'smsBookingApproved', title: 'Send SMS on Booking Approval', desc: 'Notify customer when their requested time slot is officially confirmed.' },
                  { key: 'emailBookingCreated', title: 'Send Email Confirmation', desc: 'Email digital receipt and schedule details to customer address.' },
                  { key: 'emailPromoUpdates', title: 'Seasonal Promotional Emails', desc: 'Include in monthly marketing blasts and seasonal offers.' },
                ].map((item) => (
                  <div key={item.key} className={`flex flex-col rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between gap-4 ${theme === 'dark' ? 'border border-slate-700 bg-slate-900/95' : 'border border-slate-200 bg-white shadow-sm'}`}>
                    <div className="space-y-1">
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      aria-pressed={notifications[item.key]}
                      className={`inline-flex h-10 w-[72px] items-center rounded-full p-1 transition ${
                        notifications[item.key]
                          ? 'bg-emerald-400 justify-end shadow-inner '
                          : theme === 'dark'
                            ? 'bg-slate-700 justify-start shadow-inner'
                            : 'bg-slate-300 justify-start shadow-inner'
                      }`}
                    >
                      <span className={`h-8 w-8 rounded-full shadow-[0_3px_10px_rgba(15,23,42,0.12)] ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-8 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>These changes update the admin settings UI locally. Connect API persistence later to save permanently.</p>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
