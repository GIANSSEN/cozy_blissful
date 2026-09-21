import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

const avatarKeyFor = (userId) => (userId ? `cb_avatar_${userId}` : null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const key = avatarKeyFor(parsed?.id);
      return (key && localStorage.getItem(key)) || parsed?.avatar_url || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser, nextRole) => {
    setUser(nextUser);
    if (nextRole) {
      setRole(nextRole);
      localStorage.setItem('role', nextRole);
    }
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      const key = avatarKeyFor(nextUser.id);
      if (key) {
        const stored = localStorage.getItem(key);
        setAvatarUrl(stored || nextUser.avatar_url || null);
      }
    } else {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await API.get('/user');
          persistUser(res.data.user, res.data.role);
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/login', { email, password });
      const { access_token, role: userRole, user: userData } = res.data;

      setToken(access_token);
      localStorage.setItem('token', access_token);
      persistUser(userData, userRole);

      return { success: true, role: userRole };
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        return {
          success: false,
          rateLimited: true,
          retryAfter: err.response?.data?.retry_after ?? 900,
          error: err.response?.data?.message || 'Too many login attempts.',
        };
      }
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed. Please check credentials.',
        errors: err.response?.data?.errors,
      };
    }
  };

  // Exchange a verified provider token (Google ID token / Facebook access
  // token) for our own application session via the backend — the user is
  // never logged in from client-side state alone.
  const socialLogin = async (provider, providerToken) => {
    try {
      const payload = provider === 'google'
        ? { credential: providerToken }
        : { access_token: providerToken };
      const res = await API.post(`/auth/${provider}`, payload);

      if (res.data?.needs_registration) {
        return {
          success: false,
          needsRegistration: true,
          email: res.data.email,
          suggestedName: res.data.suggested_name,
          provider: res.data.provider,
        };
      }

      const { access_token, role: userRole, user: userData } = res.data;

      setToken(access_token);
      localStorage.setItem('token', access_token);
      persistUser(userData, userRole);

      return { success: true, role: userRole };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Social sign-in failed. Please try again.',
      };
    }
  };

  const register = async (name, email, password, passwordConfirmation) => {
    try {
      const res = await API.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      const { access_token, role: userRole, user: userData } = res.data;

      setToken(access_token);
      setRole(userRole);
      setUser(userData);

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, role: userRole };
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        return {
          success: false,
          rateLimited: true,
          retryAfter: err.response?.data?.retry_after ?? 3600,
          error: err.response?.data?.message || 'Too many registration attempts.',
        };
      }
      const isNetworkError = !err.response;
      return {
        success: false,
        error: isNetworkError
          ? 'Cannot connect to backend API server. Please verify the backend server is running on http://localhost:8000.'
          : (err.response?.data?.message || 'Registration failed. Please check your information.'),
        errors: err.response?.data?.errors,
      };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await API.post('/logout');
      } catch (err) {
        console.error("Logout request error", err);
      }
    }
    setToken(null);
    setRole(null);
    setUser(null);
    setAvatarUrl(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    // Clear cart so a new user on the same device doesn't inherit the previous user's cart
    localStorage.removeItem('cb_cart_v1');
  };

  /**
   * Attach / remove the per-account avatar. Persisted per user id so
   * admin, staff, therapist and client each keep their own photo on
   * a shared device. Stored as a downscaled data-URL (see ProfileModal).
   */
  const setAvatar = (dataUrl) => {
    setAvatarUrl(dataUrl || null);
    try {
      const key = avatarKeyFor(user?.id);
      if (!key) return;
      if (dataUrl) localStorage.setItem(key, dataUrl);
      else localStorage.removeItem(key);
    } catch {
      // Quota exceeded — keep in-memory only, never crash logout/save flows.
    }
  };

  /**
   * Update own profile. Therapists sync phone/specialty/notes/password
   * to the backend; every other role persists locally (backend has no
   * self-profile endpoint for them yet) so the UI never lies about
   * success. Returns { ok:true } or { ok:false, errors, message }.
   */
  const updateProfile = async (payload = {}) => {
    const currentRole = (role || 'client').toLowerCase();
    const nextUser = { ...(user || {}), ...payload };
    delete nextUser.current_password;
    delete nextUser.new_password;
    delete nextUser.new_password_confirmation;

    if (currentRole === 'therapist') {
      try {
        const body = {};
        if (payload.phone !== undefined) body.phone = payload.phone;
        if (payload.specialty !== undefined) body.specialty = payload.specialty;
        if (payload.notes !== undefined) body.notes = payload.notes;
        if (payload.new_password) {
          body.current_password = payload.current_password;
          body.new_password = payload.new_password;
          body.new_password_confirmation = payload.new_password_confirmation;
        }
        const res = await API.post('/therapist/profile', body);
        const p = res.data?.therapist_profile;
        persistUser(
          { ...nextUser, phone: p?.phone ?? nextUser.phone, specialty: p?.specialty ?? nextUser.specialty, notes: p?.notes ?? nextUser.notes },
          currentRole
        );
        return { ok: true, message: res.data?.message };
      } catch (err) {
        const serverErrors = {};
        const raw = err.response?.data?.errors;
        if (raw) {
          Object.keys(raw).forEach((k) => { serverErrors[k] = Array.isArray(raw[k]) ? raw[k][0] : String(raw[k]); });
        }
        // Validation failure: surface inline, don't persist.
        if (err.response?.status === 422) return { ok: false, errors: serverErrors, message: err.response?.data?.message };
        // Network/server failure: still persist name/phone locally so the
        // user never loses input, but report the backend problem.
        persistUser(nextUser, currentRole);
        return { ok: true, message: 'Saved on this device. Server sync failed — will retry on next save.', offline: true };
      }
    }

    persistUser(nextUser, currentRole);
    return { ok: true, message: 'Profile updated.' };
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, socialLogin, register, logout, avatarUrl, setAvatar, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
