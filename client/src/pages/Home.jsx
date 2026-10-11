import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';
import { Avatar, Icon } from '../components/ui';

export default function Home() {
  const { user } = useAuth();
  const { version, openCreate } = useOutletContext();
  const [tab, setTab] = useState('all');
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    setPosts(null);
    api.get('/posts', { params: { feed: tab } }).then(r => setPosts(r.data));
  }, [tab, version]);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="sticky top-14 z-20 flex rounded-2xl bg-white/90 shadow-sm backdrop-blur md:top-0">
        {[['all', 'For You'], ['following', 'Following']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`relative flex-1 py-space-md text-headline-sm ${tab === k ? 'text-primary' : 'text-on-surface-variant'}`}>
            {label}{tab === k && <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <button onClick={openCreate} className="card flex items-center gap-space-md text-left !p-space-md">
        <Avatar user={user} />
        <span className="flex-1 rounded-xl bg-surface-container-low p-3 text-on-surface-variant">What's happening in your world?</span>
        <Icon n="image" className="text-primary" />
      </button>

      {posts === null && <p className="py-10 text-center text-on-surface-variant">Loading…</p>}
      {posts?.length === 0 && (
        <div className="card text-center text-on-surface-variant">
          {tab === 'following' ? 'Follow people to see their posts here.' : 'No posts yet. Be the first to post!'}
        </div>
      )}
      {posts?.map(p => <PostCard key={p._id} post={p} onDelete={id => setPosts(l => l.filter(x => x._id !== id))} />)}
      {posts?.length > 0 && (
        <div className="py-space-lg text-center text-body-sm text-on-surface-variant">
          <Icon n="check_circle" className="text-primary" /><div className="font-semibold text-on-surface">You're all caught up</div>
        </div>
      )}
    </div>
  );
}
