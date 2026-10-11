import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { media } from '../api';
import { useAuth } from '../AuthContext';

export const Icon = ({ n, fill, className = '' }) => (
  <span className={`material-symbols-outlined ${fill ? 'fill' : ''} ${className}`}>{n}</span>
);

// Shows the photo, or initials when the user has no avatar
export function Avatar({ user, size = 40 }) {
  const s = { width: size, height: size, fontSize: size / 2.6 };
  return user?.avatar
    ? <img src={media(user.avatar)} alt="" style={s} className="shrink-0 rounded-full object-cover" />
    : <div style={s} className="flex shrink-0 items-center justify-center rounded-full bg-primary-fixed font-semibold text-primary">{user?.name?.slice(0, 2).toUpperCase()}</div>;
}

export function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  return h < 24 ? h + 'h' : Math.floor(h / 24) + 'd';
}

// Turns #tags inside text into links to the search page
export const RichText = ({ text }) =>
  text.split(/(#\w+)/g).map((p, i) =>
    p.startsWith('#')
      ? <Link key={i} to={`/search?q=${encodeURIComponent(p)}`} className="font-medium text-primary hover:underline">{p}</Link>
      : p);

// Follow <-> Following (shows "Unfollow" on hover). Hidden on your own profile.
export function FollowButton({ user, onToggle }) {
  const { user: me } = useAuth();
  const [on, setOn] = useState(user.isFollowing);
  if (me._id === user._id) return null;
  const click = async () => {
    const { data } = await api.post(`/users/${user._id}/follow`);
    setOn(data.isFollowing);
    onToggle?.(data.isFollowing);
  };
  return (
    <button onClick={click} className={`group shrink-0 rounded-full px-4 py-1.5 text-label-lg transition ${on
      ? 'border border-outline-variant bg-white text-on-surface-variant hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
      : 'bg-primary text-on-primary hover:bg-primary-container'}`}>
      {on ? <><span className="group-hover:hidden">Following</span><span className="hidden group-hover:inline">Unfollow</span></> : 'Follow'}
    </button>
  );
}

export const UserRow = ({ u }) => (
  <div className="card flex items-center gap-space-md !p-space-md">
    <Link to={`/${u.username}`}><Avatar user={u} size={48} /></Link>
    <Link to={`/${u.username}`} className="min-w-0 flex-1">
      <div className="truncate text-headline-sm">{u.name}</div>
      <div className="truncate text-body-sm text-on-surface-variant">@{u.username} · {u.followersCount} followers</div>
      {u.bio && <div className="truncate text-body-sm text-on-surface-variant">{u.bio}</div>}
    </Link>
    <FollowButton user={u} />
  </div>
);
