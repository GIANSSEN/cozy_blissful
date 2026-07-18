import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await API.get('/user');
          setUser(res.data.user);
          setRole(res.data.role);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('role', res.data.role);
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/login', { email, password });
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
      const { access_token, role: userRole, user: userData } = res.data;

      setToken(access_token);
      setRole(userRole);
      setUser(userData);

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(userData));

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
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed. Please try again.',
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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, socialLogin, register, logout }}>
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
