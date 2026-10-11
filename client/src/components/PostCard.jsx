import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { media } from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon, RichText, timeAgo } from './ui';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [p, setP] = useState(post);
  const a = p.author;

  // Optimistic update: change the UI first, undo if the server fails
  const like = async () => {
    setP(x => ({ ...x, liked: !x.liked, likesCount: x.likesCount + (x.liked ? -1 : 1) }));
    try { await api.post(`/posts/${p._id}/like`); } catch { setP(post); }
  };
  const del = async () => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/posts/${p._id}`);
    onDelete?.(p._id);
  };

  return (
    <article className="card flex flex-col gap-space-md transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <Link to={`/${a.username}`} className="flex items-center gap-space-sm">
          <Avatar user={a} />
          <div>
            <div className="text-headline-sm">{a.name}</div>
            <div className="text-body-sm text-on-surface-variant">@{a.username} · {timeAgo(p.createdAt)}</div>
          </div>
        </Link>
        {a._id === user._id && (
          <button onClick={del} title="Delete post" className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-rose-600"><Icon n="delete" /></button>
        )}
      </div>
      {p.text && <p className="whitespace-pre-wrap break-words text-body-lg"><RichText text={p.text} /></p>}
      {p.image && <img src={media(p.image)} alt="" className="max-h-[480px] w-full rounded-xl object-cover" />}
      <div className="flex items-center gap-space-lg text-on-surface-variant">
        <button onClick={like} className={`flex items-center gap-1 rounded-full px-2 py-1 text-label-lg transition ${p.liked ? 'bg-rose-100 text-rose-600' : 'hover:bg-surface-container-low'}`}>
          <Icon n="favorite" fill={p.liked} className="!text-[20px]" />{p.likesCount}
        </button>
        <Link to={`/post/${p._id}`} className="flex items-center gap-1 rounded-full px-2 py-1 text-label-lg hover:bg-surface-container-low">
          <Icon n="chat_bubble" className="!text-[20px]" />{p.commentsCount}
        </Link>
        <button title="Copy link" onClick={() => navigator.clipboard.writeText(`${location.origin}/post/${p._id}`)} className="ml-auto rounded-full p-1 hover:bg-surface-container-low">
          <Icon n="share" className="!text-[20px]" />
        </button>
      </div>
    </article>
  );
}
