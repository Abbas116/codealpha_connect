import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { Icon } from '../components/ui';

export default function Auth() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(mode === 'login' ? 'login' : 'register', f); nav('/'); }
    catch (x) { setErr(errMsg(x)); setBusy(false); }
  };
  const reg = mode === 'register';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-fixed/60 via-background to-surface-container p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-space-md flex items-center justify-center gap-2 text-headline-lg text-primary"><Icon n="all_inclusive" />Connect</div>
        <p className="mb-space-lg text-center text-on-surface-variant">Where meaningful conversations spark real connection.</p>
        <div className="mb-space-lg flex rounded-full bg-surface-container p-1">
          {[['login', 'Log in'], ['register', 'Create account']].map(([k, label]) => (
            <button type="button" key={k} onClick={() => { setMode(k); setErr(''); }} className={`flex-1 rounded-full py-2 text-label-lg transition ${mode === k ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>{label}</button>
          ))}
        </div>
        <div className="flex flex-col gap-space-md">
          {reg && <input className="input" placeholder="Full name" value={f.name} onChange={set('name')} required />}
          {reg && <input className="input" placeholder="Username (letters, numbers, _)" value={f.username} onChange={set('username')} required />}
          <input className="input" type="email" placeholder="Email address" value={f.email} onChange={set('email')} required />
          <input className="input" type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required />
          {err && <p className="text-body-sm text-error">{err}</p>}
          <button className="btn !py-3" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Log in'}</button>
        </div>
      </form>
    </div>
  );
}
