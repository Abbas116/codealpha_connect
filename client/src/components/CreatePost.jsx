import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon } from './ui';

// Modal on desktop, bottom sheet on mobile
export default function CreatePost({ onClose, onPosted }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setBusy(true);
    try {
      const fd = new FormData(); // FormData is needed to send a file
      fd.append('text', text);
      if (file) fd.append('image', file);
      await api.post('/posts', fd);
      onPosted();
      onClose();
    } catch (e) { setErr(errMsg(e)); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-full w-full flex-col gap-space-md overflow-y-auto rounded-t-2xl bg-white p-space-lg shadow-xl sm:max-w-xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-headline-md">Create post</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-surface-container-low"><Icon n="close" /></button>
        </div>
        <div className="flex items-center gap-space-sm">
          <Avatar user={user} />
          <div><div className="text-headline-sm">{user.name}</div><div className="text-body-sm text-on-surface-variant">@{user.username}</div></div>
        </div>
        <textarea autoFocus rows={5} maxLength={500} value={text} onChange={e => setText(e.target.value)} placeholder="What's happening in your world? Add #tags" className="input resize-none text-body-lg" />
        {file && (
          <div className="relative">
            <img src={URL.createObjectURL(file)} alt="" className="max-h-64 w-full rounded-xl object-cover" />
            <button onClick={() => setFile(null)} className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white"><Icon n="close" className="!text-[18px]" /></button>
          </div>
        )}
        {err && <p className="text-body-sm text-error">{err}</p>}
        <div className="flex items-center justify-between">
          <label className="cursor-pointer rounded-full p-2 text-primary hover:bg-surface-container-low" title="Add image">
            <Icon n="image" /><input type="file" accept="image/*" hidden onChange={e => setFile(e.target.files[0] || null)} />
          </label>
          <div className="flex items-center gap-space-md">
            <span className="text-label-md text-on-surface-variant">{text.length}/500</span>
            <button className="btn" disabled={busy || (!text.trim() && !file)} onClick={submit}>Publish post</button>
          </div>
        </div>
      </div>
    </div>
  );
}
