import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('acms_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile once on mount (not on every token change)
  useEffect(() => {
    const savedToken = localStorage.getItem('acms_token');
    if (!savedToken) { setLoading(false); return; }
    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    api.get('/api/users/me')
      .then(({ data }) => {
        setUser(data.user);
        setToken(savedToken);
      })
      .catch(() => {
        localStorage.removeItem('acms_token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('acms_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('acms_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
