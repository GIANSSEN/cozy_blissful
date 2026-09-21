import React, { useEffect, useRef, useState } from 'react';
import { User as UserIcon, Camera, Trash2, Eye, EyeOff, KeyRound, Save, Phone, MapPin, Sparkles } from 'lucide-react';
import ModalShell from '../ui/ModalShell';
import ProfileField, { profileInputClass } from '../ui/ProfileField';
import { SpringElement } from '../ui/spring-element';
import { getRoleMeta, initialOf } from '../../lib/roleMeta';
import {
  validateProfileForm,
  validateAvatarFile,
  fileToAvatarDataUrl,
} from '../../lib/profileValidation';

/**
 * ProfileModal — per-role self profile editor with avatar attach.
 * Works for admin / staff / therapist / client with the same
 * minimalist luxury UX + strict inline validation.
 *
 * Props:
 *  open, onClose, user {name,email,phone,...}, role,
 *  avatarUrl, onAvatarChange(dataUrl|null), onSave(payload) -> Promise<{ok, errors?, message?}>
 *  isDark
 */
const ProfileModal = ({
  open,
  onClose,
  user,
  role = 'client',
  avatarUrl = null,
  onAvatarChange,
  onSave,
  isDark = false,
}) => {
  const meta = getRoleMeta(role);
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', specialty: '', notes: '', address: '',
    current_password: '', new_password: '', new_password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [avatarErr, setAvatarErr] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        name: user?.name || '',
        phone: user?.phone || '',
        specialty: user?.specialty || '',
        notes: user?.notes || '',
        address: user?.address || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setErrors({});
      setAvatarErr('');
      setSaving(false);
      setShowPwSection(false);
    }
  }, [open, user]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => {
      if (!p[k]) return p;
      const n = { ...p };
      delete n[k];
      return n;
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    const err = validateAvatarFile(file);
    if (err) {
      setAvatarErr(err);
      return;
    }
    setAvatarErr('');
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      onAvatarChange?.(dataUrl);
    } catch {
      setAvatarErr('Could not read that image. Try a different file.');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validation = validateProfileForm({ ...form, avatarError: avatarErr }, role);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(role === 'therapist' ? { specialty: form.specialty.trim(), notes: form.notes.trim() } : {}),
        ...(role === 'client' ? { address: form.address.trim() } : {}),
        ...(showPwSection && form.new_password
          ? {
              current_password: form.current_password,
              new_password: form.new_password,
              new_password_confirmation: form.new_password_confirmation,
            }
          : {}),
      };
      const res = await onSave?.(payload);
      if (res?.ok === false) {
        if (res.errors) setErrors(res.errors);
        return;
      }
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (k) => profileInputClass(errors[k], isDark);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="My Profile"
      subtitle={`${meta.fullLabel} • ${user?.email || ''}`}
      icon={<UserIcon className="w-5 h-5 text-[#e8cc8a]" />}
      maxWidth="max-w-lg"
      busy={saving}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 sm:flex-none sm:min-w-[110px] py-2.5 px-4 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 sm:flex-none sm:min-w-[150px] py-2.5 px-5 rounded-2xl text-xs font-black text-[#041e16] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer min-h-[44px] disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)', boxShadow: '0 4px 16px rgba(191,161,95,0.35)' }}
          >
            {saving
              ? <span className="w-3.5 h-3.5 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" />
              : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Avatar attach */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl border border-dashed transition-all"
          style={{
            borderColor: dragOver ? '#bfa15f' : avatarErr ? '#f87171' : isDark ? 'rgba(255,255,255,0.14)' : 'rgba(191,161,95,0.4)',
            background: dragOver ? 'rgba(191,161,95,0.08)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(191,161,95,0.05)',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
        >
          {/* Spring-draggable preview: pull the photo, gold tether
              stretches, snap-back on release. overlayClassName lifts the
              tether above the modal backdrop (z-120). */}
          <SpringElement
            className="relative block w-16 h-16 flex-shrink-0"
            springClassName="[stroke-width:1.5] stroke-[#bfa15f]"
            overlayClassName="z-[130]"
          >
            <span
              className="relative block w-16 h-16 rounded-full flex-shrink-0"
              aria-hidden="true"
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a,#bfa15f)' }}
              />
              <span className="absolute flex items-center justify-center overflow-hidden rounded-full" style={{ inset: '2.5px', background: 'linear-gradient(135deg,#041e16,#0c4a36)' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile preview" className="w-full h-full object-cover" draggable={false} />
                  : <span className="text-xl font-black text-white">{initialOf(form.name || user?.name, meta.label.charAt(0))}</span>}
              </span>
            </span>
          </SpringElement>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">Profile photo</p>
            <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG or WebP • max 2 MB • drag &amp; drop or browse</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-[#041e16] transition hover:brightness-110 active:scale-95 cursor-pointer min-h-[40px]"
                style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)' }}
              >
                <Camera className="w-3.5 h-3.5" /> {avatarUrl ? 'Change photo' : 'Attach photo'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => { onAvatarChange?.(null); setAvatarErr(''); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 transition cursor-pointer min-h-[40px]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            {avatarErr && <p role="alert" className="text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1.5">{avatarErr}</p>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Upload profile photo"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </div>

        {/* Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField id="pf-name" label="Full name" required error={errors.name}>
            <input
              id="pf-name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Maria Santos"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'pf-name-error' : undefined}
              className={inputCls('name')}
            />
          </ProfileField>
          <ProfileField
            id="pf-phone"
            label="Mobile number"
            required={role === 'therapist' || role === 'staff'}
            error={errors.phone}
            hint="PH format: 0917 123 4567"
          >
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="pf-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="0917 123 4567"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className={`${inputCls('phone')} pl-9`}
              />
            </div>
          </ProfileField>
        </div>

        <ProfileField id="pf-email" label="Email address" hint="Email is your login identity and cannot be changed here.">
          <input id="pf-email" type="email" value={user?.email || ''} disabled readOnly className={`${inputCls()} opacity-70 cursor-not-allowed`} />
        </ProfileField>

        {role === 'therapist' && (
          <div className="grid grid-cols-1 gap-4">
            <ProfileField id="pf-specialty" label="Specialty" error={errors.specialty}>
              <div className="relative">
                <Sparkles className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="pf-specialty"
                  type="text"
                  value={form.specialty}
                  onChange={(e) => set('specialty', e.target.value)}
                  placeholder="e.g. Swedish & Hot Stone"
                  aria-invalid={!!errors.specialty}
                  className={`${inputCls('specialty')} pl-9`}
                />
              </div>
            </ProfileField>
            <ProfileField id="pf-notes" label="Therapist notes" error={errors.notes} hint="Visible to front-desk when assigning sessions.">
              <textarea
                id="pf-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={2}
                placeholder="Focus areas, certifications, preferred modalities…"
                className={`${inputCls('notes')} resize-none leading-relaxed`}
              />
            </ProfileField>
          </div>
        )}

        {role === 'client' && (
          <ProfileField id="pf-address" label="Address" error={errors.address} hint="Used for client records only.">
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <textarea
                id="pf-address"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                rows={2}
                placeholder="Street / Barangay / City"
                className={`${inputCls('address')} pl-9 resize-none leading-relaxed`}
              />
            </div>
          </ProfileField>
        )}

        {/* Password */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPwSection((v) => !v)}
            aria-expanded={showPwSection}
            className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer min-h-[48px]"
          >
            <span className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Change password
              <span className="text-[10px] font-bold text-slate-400">(optional)</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${showPwSection ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
              {showPwSection ? 'On' : 'Off'}
            </span>
          </button>
          {showPwSection && (
            <div className="px-4 pb-4 pt-1 grid grid-cols-1 gap-4">
              <ProfileField id="pf-cur" label="Current password" required error={errors.current_password}>
                <div className="relative">
                  <input
                    id="pf-cur"
                    type={showPw ? 'text' : 'password'}
                    value={form.current_password}
                    onChange={(e) => set('current_password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!errors.current_password}
                    className={`${inputCls('current_password')} pr-11`}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide passwords' : 'Show passwords'} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </ProfileField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileField id="pf-new" label="New password" required={showPwSection} error={errors.new_password} hint="Min 8 chars, 1 uppercase + 1 number.">
                  <input
                    id="pf-new"
                    type={showPw ? 'text' : 'password'}
                    value={form.new_password}
                    onChange={(e) => set('new_password', e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    aria-invalid={!!errors.new_password}
                    className={inputCls('new_password')}
                  />
                </ProfileField>
                <ProfileField id="pf-confirm" label="Confirm new password" required={showPwSection} error={errors.new_password_confirmation}>
                  <input
                    id="pf-confirm"
                    type={showPw ? 'text' : 'password'}
                    value={form.new_password_confirmation}
                    onChange={(e) => set('new_password_confirmation', e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.new_password_confirmation}
                    className={inputCls('new_password_confirmation')}
                  />
                </ProfileField>
              </div>
            </div>
          )}
        </div>
      </form>
    </ModalShell>
  );
};

export default ProfileModal;
