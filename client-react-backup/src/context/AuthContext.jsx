import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Load session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('tez_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.warn('Session expired or invalid token', err);
          localStorage.removeItem('tez_token');
          localStorage.removeItem('tez_user_id');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.data?.token) {
        localStorage.setItem('tez_token', res.data.token);
        localStorage.setItem('tez_user_id', res.data.user.id.toString());
      }
      setUser(res.data.user);
      addToast(res.message || `Welcome back, ${res.data.user.name}!`);
      return res.data.user;
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.auth.register(userData);
      // Explicitly do NOT set token or user: user must sign in with their credentials
      addToast(res.message || 'Registration successful, now you can login to Tez Thaila.', 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = async (redirectUrl = '/') => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API notification error', err);
    } finally {
      localStorage.removeItem('tez_token');
      localStorage.removeItem('tez_user_id');
      setUser(null);
      addToast('Logged out successfully');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
