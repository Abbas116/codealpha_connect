import axios from 'axios';

// Empty in dev (Vite proxy handles it). In production = your Render URL.
const API = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: API + '/api' });

// Attach the JWT to every request
api.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const media = u => (u && u.startsWith('/') ? API + u : u); // "/uploads/x.jpg" -> full URL
export const errMsg = e => e.response?.data?.message || e.message;
export default api;
