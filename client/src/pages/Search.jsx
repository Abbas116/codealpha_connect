import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { Icon, UserRow } from '../components/ui';

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const [input, setInput] = useState(q);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sug, setSug] = useState([]);

  useEffect(() => { setInput(q); }, [q]); // keep the box in sync when a #tag link is clicked
  useEffect(() => { // debounce: wait 300ms after typing stops
    const t = setTimeout(() => { if (input !== q) setSp(input ? { q: input } : {}, { replace: true }); }, 300);
    return () => clearTimeout(t);
  }, [input]);
  useEffect(() => { api.get('/users/suggestions').then(r => setSug(r.data)); }, []);
  useEffect(() => {
    if (!q) { setUsers([]); setPosts([]); return; }
    api.get('/users/search', { params: { q } }).then(r => setUsers(r.data));
    api.get('/posts/search', { params: { q } }).then(r => setPosts(r.data));
  }, [q]);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="sticky top-14 z-20 flex items-center gap-2 rounded-full bg-white px-4 shadow-sm md:top-0">
        <Icon n="search" className="text-on-surface-variant" />
        <input className="w-full bg-transparent py-3 outline-none" placeholder="Search people, posts or #tags" value={input} onChange={e => setInput(e.target.value)} autoFocus />
        {input && <button onClick={() => setInput('')}><Icon n="close" className="text-on-surface-variant" /></button>}
      </div>
      {!q && (
        <>
          <h2 className="text-headline-md">People to connect with</h2>
          {sug.length === 0 && <p className="text-on-surface-variant">Nothing to suggest yet.</p>}
          {sug.map(u => <UserRow key={u._id} u={u} />)}
        </>
      )}
      {q && (
        <>
          <h2 className="text-headline-md">People</h2>
          {users.length === 0 && <p className="text-on-surface-variant">No people found for "{q}".</p>}
          {users.map(u => <UserRow key={u._id} u={u} />)}
          <h2 className="text-headline-md">Posts</h2>
          {posts.length === 0 && <p className="text-on-surface-variant">No posts found for "{q}".</p>}
          {posts.map(p => <PostCard key={p._id} post={p} onDelete={id => setPosts(l => l.filter(x => x._id !== id))} />)}
        </>
      )}
    </div>
  );
}
