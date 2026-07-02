import { createContext, useContext, useEffect, useState } from 'react';
import { loginAdmin, getMe } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kasi360_admin_token');
    if (token) {
      getMe()
        .then((res) => {
          if (res.data.user?.role === 'admin') setUser(res.data.user);
          else { localStorage.removeItem('kasi360_admin_token'); }
        })
        .catch(() => localStorage.removeItem('kasi360_admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginAdmin({ email, password });
    if (res.data.user.role !== 'admin') throw new Error('Access denied — admin only');
    localStorage.setItem('kasi360_admin_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('kasi360_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
