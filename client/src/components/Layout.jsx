import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, FollowButton, Icon } from './ui';
import CreatePost from './CreatePost';

// App shell from the design:
// desktop = left rail + feed + right rail | tablet = icon rail + feed | mobile = top bar + bottom nav
export default function Layout() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const [create, setCreate] = useState(false);
  const [version, setVersion] = useState(0); // bump to make pages reload after a new post
  const [suggest, setSuggest] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/users/suggestions').then(r => setSuggest(r.data));
    api.get('/posts/trending').then(r => setTags(r.data));
  }, [user, version]);

  if (loading) return <div className="p-10 text-center text-on-surface-variant">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const links = [
    ['/', 'home', 'Home'],
    ['/search', 'search', 'Search'],
    [`/${user.username}`, 'account_circle', 'Profile'],
    [`/${user.username}/connections`, 'group', 'Connections'],
  ];
  const cls = ({ isActive }) => `flex items-center gap-3 rounded-full px-3 py-3 text-headline-sm transition ${isActive ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`;

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white/90 px-margin-mobile py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2 text-headline-md text-primary"><Icon n="all_inclusive" />Connect</Link>
        <Link to="/settings/profile"><Avatar user={user} size={32} /></Link>
      </header>

      <div className="mx-auto flex max-w-[1280px]">
        <aside className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col gap-space-sm p-space-md md:flex lg:w-[260px]">
          <Link to="/" className="mb-space-md flex items-center gap-2 px-2 text-headline-md text-primary">
            <Icon n="all_inclusive" /><span className="hidden lg:inline">Connect</span>
          </Link>
          {links.map(([to, ic, label]) => (
            <NavLink key={to} to={to} end className={cls}><Icon n={ic} /><span className="hidden lg:inline">{label}</span></NavLink>
          ))}
          <button onClick={() => setCreate(true)} className="btn mt-space-md !py-3"><Icon n="edit_square" /><span className="hidden lg:inline">Create post</span></button>
          <div className="mt-auto flex items-center gap-2 rounded-xl bg-surface-container-low p-2">
            <Link to={`/${user.username}`} className="flex min-w-0 flex-1 items-center gap-2">
              <Avatar user={user} />
              <div className="hidden min-w-0 lg:block">
                <div className="truncate text-label-lg">{user.name}</div>
                <div className="truncate text-body-sm text-on-surface-variant">@{user.username}</div>
              </div>
            </Link>
            <button title="Log out" onClick={() => { logout(); nav('/auth'); }} className="hidden rounded-full p-1 hover:bg-white lg:block"><Icon n="logout" /></button>
          </div>
        </aside>

        <main className="min-w-0 max-w-[640px] flex-1 px-margin-mobile pb-24 pt-space-md md:px-space-md md:pb-space-lg">
          <Outlet context={{ version, bump: () => setVersion(v => v + 1), openCreate: () => setCreate(true) }} />
        </main>

        <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 flex-col gap-space-lg overflow-y-auto p-space-lg xl:flex">
          <div className="card">
            <h3 className="mb-space-md text-headline-sm">Who to follow</h3>
            {suggest.length === 0 && <p className="text-body-sm text-on-surface-variant">No suggestions yet.</p>}
            {suggest.map(u => (
              <div key={u._id} className="mb-space-md flex items-center gap-space-sm last:mb-0">
                <Link to={`/${u.username}`}><Avatar user={u} size={36} /></Link>
                <Link to={`/${u.username}`} className="min-w-0 flex-1">
                  <div className="truncate text-label-lg">{u.name}</div>
                  <div className="truncate text-body-sm text-on-surface-variant">@{u.username}</div>
                </Link>
                <FollowButton user={u} />
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-space-md text-headline-sm">Trending topics</h3>
            {tags.length === 0 && <p className="text-body-sm text-on-surface-variant">Use #tags in posts to start a trend.</p>}
            {tags.map(t => (
              <Link key={t.tag} to={`/search?q=${encodeURIComponent('#' + t.tag)}`} className="mb-space-sm block last:mb-0">
                <div className="text-label-md text-on-surface-variant">{t.count} {t.count === 1 ? 'post' : 'posts'}</div>
                <div className="text-headline-sm hover:text-primary">#{t.tag}</div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-outline-variant bg-white/85 backdrop-blur md:hidden">
        <NavLink to="/" end className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}><Icon n="home" /></NavLink>
        <NavLink to="/search" className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}><Icon n="search" /></NavLink>
        <button onClick={() => setCreate(true)} className="rounded-full bg-primary p-2 text-white shadow-md"><Icon n="add" /></button>
        <NavLink to={`/${user.username}/connections`} className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}><Icon n="group" /></NavLink>
        <NavLink to={`/${user.username}`} end className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}><Icon n="account_circle" /></NavLink>
      </nav>

      {create && <CreatePost onClose={() => setCreate(false)} onPosted={() => setVersion(v => v + 1)} />}
    </div>
  );
}
