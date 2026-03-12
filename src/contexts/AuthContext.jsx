import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, saveSession, clearSession } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on page load
    const session = getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    saveSession(userData);
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
