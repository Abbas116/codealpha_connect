import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { media } from '../api';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';
import { Avatar, FollowButton, Icon } from '../components/ui';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [u, setU] = useState(null); // null = loading, false = not found
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    setU(null); setPosts(null);
    api.get(`/users/${username}`).then(r => setU(r.data)).catch(() => setU(false));
    api.get(`/posts/user/${username}`).then(r => setPosts(r.data));
  }, [username]);

  if (u === false) return <div className="card text-center">User not found</div>;
  if (!u) return <p className="py-10 text-center text-on-surface-variant">Loading…</p>;
  const mine = u._id === me._id;
  const stat = (n, label, to) => {
    const inner = <><div className="text-headline-md">{n}</div><div className="text-label-md text-on-surface-variant">{label}</div></>;
    return to ? <Link to={to} className="flex-1 text-center hover:text-primary">{inner}</Link> : <div className="flex-1 text-center">{inner}</div>;
  };

  return (
    <div className="flex flex-col gap-space-md">
      <div className="card overflow-hidden !p-0">
        <div className="h-36 bg-gradient-to-r from-primary to-primary-fixed-dim bg-cover bg-center sm:h-48" style={u.cover ? { backgroundImage: `url(${media(u.cover)})` } : undefined} />
        <div className="px-space-lg pb-space-lg">
          <div className="-mt-12 flex items-end justify-between">
            <div className="rounded-full border-4 border-white"><Avatar user={u} size={88} /></div>
            {mine
              ? <Link to="/settings/profile" className="mb-1 flex items-center gap-1 rounded-full border border-outline-variant px-4 py-1.5 text-label-lg hover:bg-surface-container-low"><Icon n="edit" className="!text-[18px]" />Edit profile</Link>
              : <div className="mb-1"><FollowButton user={u} onToggle={on => setU(x => ({ ...x, followersCount: x.followersCount + (on ? 1 : -1) }))} /></div>}
          </div>
          <h1 className="mt-space-sm text-headline-lg">{u.name}</h1>
          <div className="text-on-surface-variant">@{u.username}</div>
          {u.bio && <p className="mt-space-sm">{u.bio}</p>}
          <div className="mt-space-sm flex flex-wrap gap-x-space-md gap-y-1 text-body-sm text-on-surface-variant">
            {u.location && <span className="flex items-center gap-1"><Icon n="location_on" className="!text-[16px]" />{u.location}</span>}
            {u.website && <a href={u.website.startsWith('http') ? u.website : 'https://' + u.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Icon n="link" className="!text-[16px]" />{u.website.replace(/^https?:\/\//, '')}</a>}
            <span className="flex items-center gap-1"><Icon n="calendar_today" className="!text-[16px]" />Joined {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="mt-space-md flex rounded-xl bg-surface-container-low py-space-md">
            {stat(u.postsCount, 'Posts')}
            {stat(u.followersCount, 'Followers', `/${u.username}/connections?tab=followers`)}
            {stat(u.followingCount, 'Following', `/${u.username}/connections?tab=following`)}
          </div>
        </div>
      </div>
      {posts === null && <p className="py-6 text-center text-on-surface-variant">Loading posts…</p>}
      {posts?.length === 0 && <div className="card text-center text-on-surface-variant">{mine ? "You haven't posted yet." : `${u.name} hasn't posted yet.`}</div>}
      {posts?.map(p => <PostCard key={p._id} post={p} onDelete={id => { setPosts(l => l.filter(x => x._id !== id)); setU(x => ({ ...x, postsCount: x.postsCount - 1 })); }} />)}
    </div>
  );
}
