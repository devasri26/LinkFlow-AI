import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session token on component mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('linkflow_token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('linkflow_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('linkflow_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    localStorage.setItem('linkflow_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('linkflow_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
