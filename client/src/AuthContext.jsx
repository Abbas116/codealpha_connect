import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

// Holds the logged-in user for the whole app (login, logout, refresh on page load)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const login = async (path, body) => {
    const { data } = await api.post('/auth/' + path, body);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <Ctx.Provider value={{ user, setUser, loading, login, logout }}>{children}</Ctx.Provider>;
}
