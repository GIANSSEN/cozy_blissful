/**
 * roleMeta — single source of truth for role identity across
 * Admin / Staff / Therapist / Client surfaces.
 *
 * Keeps the header identity pill minimalist and consistent:
 * one avatar + one role label, luxury emerald/gold tokens.
 */

export const ROLE_META = {
  admin: {
    key: 'admin',
    label: 'Admin',
    fullLabel: 'Administrator',
    dashboard: '/admin/dashboard',
    accent: '#34d399',
    accentSoft: 'rgba(52,211,153,0.12)',
    dot: '#10b981',
  },
  staff: {
    key: 'staff',
    label: 'Staff',
    fullLabel: 'Staff Member',
    dashboard: '/staff/dashboard',
    accent: '#38bdf8',
    accentSoft: 'rgba(56,189,248,0.12)',
    dot: '#0ea5e9',
  },
  therapist: {
    key: 'therapist',
    label: 'Therapist',
    fullLabel: 'Therapist Practitioner',
    dashboard: '/therapist/dashboard',
    accent: '#d4b87a',
    accentSoft: 'rgba(191,161,95,0.14)',
    dot: '#bfa15f',
  },
  client: {
    key: 'client',
    label: 'Client',
    fullLabel: 'CB Club Member',
    dashboard: '/client/dashboard',
    accent: '#34d399',
    accentSoft: 'rgba(52,211,153,0.12)',
    dot: '#10b981',
  },
};

/** Normalize any backend role string to a known key. Defaults to client. */
export const normalizeRole = (raw) => {
  const r = String(raw || '').toLowerCase().trim();
  if (ROLE_META[r]) return r;
  if (r === 'customer' || r === 'member') return 'client';
  if (r === 'manager' || r === 'receptionist') return 'staff';
  return 'client';
};

export const getRoleMeta = (raw) => ROLE_META[normalizeRole(raw)];

/** First-letter fallback when no photo is attached. */
export const initialOf = (name, fallback = 'C') => {
  const c = String(name || '').trim().charAt(0);
  return (c || fallback).toUpperCase();
};
