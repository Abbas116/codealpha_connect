import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Icon, UserRow } from '../components/ui';

// Followers / Following lists with tabs and a filter box
export default function Connections() {
  const { username } = useParams();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') === 'following' ? 'following' : 'followers';
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    setList(null);
    api.get(`/users/${username}/${tab}`).then(r => setList(r.data)).catch(() => setList([]));
  }, [username, tab]);

  const shown = (list || []).filter(u => (u.name + u.username).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center gap-space-md">
        <button onClick={() => nav(-1)} className="rounded-full p-2 hover:bg-white"><Icon n="arrow_back" /></button>
        <Link to={`/${username}`} className="text-headline-md">@{username}</Link>
      </div>
      <div className="flex rounded-full bg-surface-container p-1">
        {['followers', 'following'].map(t => (
          <button key={t} onClick={() => setSp({ tab: t })} className={`flex-1 rounded-full py-2 text-label-lg capitalize transition ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}>{t}</button>
        ))}
      </div>
      <input className="input" placeholder={`Search ${tab} by name or @username`} value={q} onChange={e => setQ(e.target.value)} />
      {list === null && <p className="py-6 text-center text-on-surface-variant">Loading…</p>}
      {list && shown.length === 0 && <div className="card text-center text-on-surface-variant">{q ? 'No matches.' : `No ${tab} yet.`}</div>}
      {shown.map(u => <UserRow key={u._id} u={u} />)}
    </div>
  );
}
