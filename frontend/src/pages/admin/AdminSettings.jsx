import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Settings, Sliders, Globe, Bell, Save, CheckCircle2 } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [toast, setToast] = useState(false);

  const [spaConfig, setSpaConfig] = useState({
    name: 'Cozy Blissful Home Service Spa',
    hoursOpen: '06:00 AM',
    hoursClose: '11:00 PM',
    address: 'Metropolitan Manila, Philippines',
    phone: '+63 999 543 5913',
    maxConcurrent: 12
  });

  const [cmsConfig, setCmsConfig] = useState({
    heroTitle: 'Spa-Quality At Your Door.',
    heroSubtitle: 'Premium Home Service Spa & Wellness',
    heroDescription: 'Professional massage therapy and nail care — delivered to your sanctuary. Available 7 days a week, 6:00 AM – 11:00 PM.',
    facebookUrl: 'https://facebook.com/cozyblissful',
    instagramUrl: 'https://instagram.com/cozyblissful'
  });

  const [notifications, setNotifications] = useState({
    smsBookingCreated: true,
    smsBookingApproved: true,
    emailBookingCreated: true,
    emailPromoUpdates: false
  });

  const handleSave = (e) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <AdminLayout title="System Settings" subtitle="Configure operating hours, content management for landing page banners, and email/SMS triggers">
      <div className="space-y-6">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold border border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex gap-1.5 border-b border-slate-100 pb-px">
          {[
            { id: 'config', label: 'Spa Configuration', icon: Sliders },
            { id: 'cms', label: 'Content Management (CMS)', icon: Globe },
            { id: 'notifications', label: 'Notification Rules', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                  active
                    ? 'border-emerald-950 text-emerald-950'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          
          {activeTab === 'config' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Operating Profile</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Spa Name</label>
                  <input
                    type="text"
                    value={spaConfig.name}
                    onChange={(e) => setSpaConfig({ ...spaConfig, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                  <input
                    type="text"
                    value={spaConfig.phone}
                    onChange={(e) => setSpaConfig({ ...spaConfig, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Opening Time</label>
                  <input
                    type="text"
                    value={spaConfig.hoursOpen}
                    onChange={(e) => setSpaConfig({ ...spaConfig, hoursOpen: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closing Time</label>
                  <input
                    type="text"
                    value={spaConfig.hoursClose}
                    onChange={(e) => setSpaConfig({ ...spaConfig, hoursClose: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Coverage Area</label>
                  <input
                    type="text"
                    value={spaConfig.address}
                    onChange={(e) => setSpaConfig({ ...spaConfig, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Landing Page Hero Banner</h3>
              <div className="grid gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Main Heading Title</label>
                  <input
                    type="text"
                    value={cmsConfig.heroTitle}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pill Badge Subtitle</label>
                  <input
                    type="text"
                    value={cmsConfig.heroSubtitle}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hero Description Copy</label>
                  <textarea
                    rows="3"
                    value={cmsConfig.heroDescription}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-800 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Trigger Notifications</h3>
              <div className="space-y-3">
                {[
                  { key: 'smsBookingCreated', title: 'Send SMS on Booking Creation', desc: 'Alert therapist and customer immediately when booking is scheduled.' },
                  { key: 'smsBookingApproved', title: 'Send SMS on Booking Approval', desc: 'Notify customer when their requested time slot is officially confirmed.' },
                  { key: 'emailBookingCreated', title: 'Send Email Confirmation', desc: 'Email digital receipt and schedule details to customer address.' },
                  { key: 'emailPromoUpdates', title: 'Seasonal Promotional Emails', desc: 'Include in monthly marketing blasts and seasonal sparty packages.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={`w-9 h-5 rounded-full p-0.5 transition flex ${
                        notifications[item.key] ? 'bg-emerald-950 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-950/10"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
