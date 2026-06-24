// =====================================================================
//  AuthContext — manages the user session on mobile.
//  Persists the JWT + user in AsyncStorage. New accounts must verify
//  their email (verifyEmail) before they are signed in.
// =====================================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('fyp_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        // ignore corrupt storage
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (token, userData) => {
    await AsyncStorage.setItem('fyp_token', token);
    await AsyncStorage.setItem('fyp_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await persist(data.token, data.user);
    return data.user;
  }, []);

  // Creates the account and triggers the email code. Does NOT sign in.
  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data; // { requiresVerification, email, message }
  }, []);

  // Confirms the emailed code, then signs the user in.
  const verifyEmail = useCallback(async (email, code) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    await persist(data.token, data.user);
    return data.user;
  }, []);

  const resendCode = useCallback(async (email) => {
    const { data } = await api.post('/auth/resend-code', { email });
    return data;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['fyp_token', 'fyp_user']);
    setUser(null);
  }, []);

  const role = user?.role || null;
  const value = {
    user,
    loading,
    role,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isHod: role === 'hod',
    isLecturer: role === 'lecturer',
    isStaff: role === 'admin' || role === 'hod' || role === 'lecturer',
    canApprove: role === 'admin' || role === 'hod',
    login,
    register,
    verifyEmail,
    resendCode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
