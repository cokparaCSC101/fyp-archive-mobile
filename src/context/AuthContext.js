// =====================================================================
//  AuthContext — manages the user session on mobile.
//  Persists the JWT + user in AsyncStorage so the login survives
//  app restarts. Exposes login / register / logout.
// =====================================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session on launch

  // Restore any saved session when the app starts.
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

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    await persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['fyp_token', 'fyp_user']);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
