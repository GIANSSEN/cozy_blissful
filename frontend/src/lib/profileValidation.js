/**
 * profileValidation — centralized, senior-grade validation for the
 * unified profile editor (all roles) + avatar file guards.
 *
 * Every validator returns '' when valid, otherwise a human message.
 */

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
export const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateFullName = (value) => {
  const v = String(value || '').trim();
  if (!v) return 'Full name is required.';
  if (v.length < 2) return 'Name must be at least 2 characters.';
  if (v.length > 80) return 'Name must be 80 characters or fewer.';
  if (!/^[a-zA-ZÀ-ÿ'.\- ]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens and apostrophes.';
  return '';
};

export const validatePhonePH = (value, { required = false } = {}) => {
  const v = String(value || '').trim();
  if (!v) return required ? 'Mobile number is required.' : '';
  const digits = v.replace(/\D/g, '');
  const local = digits.startsWith('63') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  if (!/^9\d{9}$/.test(local)) return 'Enter a valid PH mobile number (e.g. 0917 123 4567).';
  return '';
};

export const validateSpecialty = (value, { required = false } = {}) => {
  const v = String(value || '').trim();
  if (!v && required) return 'Specialty is required.';
  if (v.length > 100) return 'Specialty must be 100 characters or fewer.';
  return '';
};

export const validateNotes = (value) => {
  const v = String(value || '');
  if (v.length > 500) return 'Notes must be 500 characters or fewer.';
  return '';
};

export const validateAddress = (value) => {
  const v = String(value || '');
  if (v.length > 300) return 'Address must be 300 characters or fewer.';
  return '';
};

export const validateAvatarFile = (file) => {
  if (!file) return '';
  if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) return 'Avatar must be JPG, PNG or WebP.';
  if (file.size > MAX_AVATAR_BYTES) return 'Avatar must be 2 MB or smaller.';
  return '';
};

export const validateNewPassword = (value) => {
  const v = String(value || '');
  if (!v) return '';
  if (v.length < 8) return 'New password must be at least 8 characters.';
  if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter (A-Z).';
  if (!/[0-9]/.test(v)) return 'Include at least one number (0-9).';
  return '';
};

/**
 * Validate the whole profile form. Returns an errors object
 * keyed by field name (only failing fields present).
 */
export const validateProfileForm = (form, role = 'client') => {
  const errors = {};
  const nameErr = validateFullName(form.name);
  if (nameErr) errors.name = nameErr;

  const phoneErr = validatePhonePH(form.phone, { required: role === 'therapist' || role === 'staff' });
  if (phoneErr) errors.phone = phoneErr;

  if (role === 'therapist') {
    const sErr = validateSpecialty(form.specialty);
    if (sErr) errors.specialty = sErr;
    const nErr = validateNotes(form.notes);
    if (nErr) errors.notes = nErr;
  }

  if (role === 'client') {
    const aErr = validateAddress(form.address);
    if (aErr) errors.address = aErr;
  }

  if (form.new_password || form.new_password_confirmation || form.current_password) {
    if (!form.current_password) errors.current_password = 'Enter your current password to change it.';
    const npErr = validateNewPassword(form.new_password);
    if (npErr) errors.new_password = npErr;
    else if (!form.new_password) errors.new_password = 'Enter a new password.';
    if (form.new_password !== form.new_password_confirmation) {
      errors.new_password_confirmation = 'Password confirmation does not match.';
    }
  }

  if (form.avatarError) errors.avatar = form.avatarError;
  return errors;
};

/**
 * Downscale an avatar image to a small data-URL so per-user
 * localStorage persistence never blows the quota.
 */
export const fileToAvatarDataUrl = (file, maxDim = 256) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file.'));
    };
    img.src = url;
  });
