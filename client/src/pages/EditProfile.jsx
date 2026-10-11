import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg, media } from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon } from '../components/ui';

export default function EditProfile() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: user.name, username: user.username, bio: user.bio, location: user.location, website: user.website });
  const [files, setFiles] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async e => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      Object.entries({ ...f, ...files }).forEach(([k, v]) => fd.append(k, v));
      const { data } = await api.put('/users/me', fd);
      setUser(data);
      nav('/' + data.username);
    } catch (x) { setErr(errMsg(x)); setBusy(false); }
  };
  const field = (k, label, max, area) => (
    <label className="block">
      <div className="mb-1 flex justify-between text-label-lg">{label}{max && <span className="text-label-md text-on-surface-variant">{f[k].length}/{max}</span>}</div>
      {area
        ? <textarea className="input resize-none" rows={3} maxLength={max} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
        : <input className="input" maxLength={max} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />}
    </label>
  );
  const pick = k => e => e.target.files[0] && setFiles({ ...files, [k]: e.target.files[0] });
  const cover = files.cover ? URL.createObjectURL(files.cover) : media(user.cover);
  const avatar = files.avatar ? URL.createObjectURL(files.avatar) : user.avatar;

  return (
    <form onSubmit={save} className="card flex flex-col gap-space-md !p-0 overflow-hidden">
      <div className="flex items-center justify-between p-space-md">
        <div className="flex items-center gap-space-sm">
          <button type="button" onClick={() => nav(-1)} className="rounded-full p-2 hover:bg-surface-container-low"><Icon n="close" /></button>
          <h1 className="text-headline-md">Edit profile</h1>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
      <div className="relative h-36 bg-gradient-to-r from-primary to-primary-fixed-dim bg-cover bg-center" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
        <label className="absolute right-3 top-3 flex cursor-pointer items-center gap-1 rounded-full bg-white px-3 py-1.5 text-label-md shadow"><Icon n="add_a_photo" className="!text-[18px]" />Change cover<input type="file" accept="image/*" hidden onChange={pick('cover')} /></label>
      </div>
      <div className="-mt-14 px-space-lg">
        <label className="relative inline-block cursor-pointer rounded-full border-4 border-white">
          <Avatar user={{ ...user, avatar }} size={88} />
          <span className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-white"><Icon n="photo_camera" className="!text-[18px]" /></span>
          <input type="file" accept="image/*" hidden onChange={pick('avatar')} />
        </label>
      </div>
      <div className="flex flex-col gap-space-md px-space-lg pb-space-lg">
        <div className="grid gap-space-md sm:grid-cols-2">{field('name', 'Display name', 50)}{field('username', 'Username', 20)}</div>
        {field('bio', 'Bio', 160, true)}
        <div className="grid gap-space-md sm:grid-cols-2">{field('location', 'Location', 40)}{field('website', 'Website', 80)}</div>
        {err && <p className="text-body-sm text-error">{err}</p>}
        <button type="button" onClick={() => { logout(); nav('/auth'); }} className="flex items-center gap-1 self-start text-label-lg text-rose-600"><Icon n="logout" className="!text-[18px]" />Log out</button>
      </div>
    </form>
  );
}
