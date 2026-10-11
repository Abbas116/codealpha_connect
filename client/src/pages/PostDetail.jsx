import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import PostCard from '../components/PostCard';
import { Avatar, Icon, timeAgo } from '../components/ui';

function CommentItem({ c, canDelete, onDelete }) {
  const [x, setX] = useState(c);
  const like = async () => { const { data } = await api.post(`/posts/comments/${x._id}/like`); setX(v => ({ ...v, ...data })); };
  const del = async () => { await api.delete(`/posts/comments/${x._id}`); onDelete(x._id); };
  return (
    <div className="card flex gap-space-md !p-space-md">
      <Link to={`/${x.author.username}`}><Avatar user={x.author} /></Link>
      <div className="min-w-0 flex-1">
        <div className="text-body-sm text-on-surface-variant"><b className="text-headline-sm text-on-surface">{x.author.name}</b> @{x.author.username} · {timeAgo(x.createdAt)}</div>
        <p className="whitespace-pre-wrap break-words text-body-md">{x.text}</p>
        <div className="mt-1 flex items-center gap-space-md text-on-surface-variant">
          <button onClick={like} className={`flex items-center gap-1 text-label-md ${x.liked ? 'text-rose-600' : ''}`}><Icon n="favorite" fill={x.liked} className="!text-[18px]" />{x.likesCount}</button>
          {canDelete && <button onClick={del} className="text-label-md hover:text-rose-600">Delete</button>}
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    api.get(`/posts/${id}`).then(r => setPost(r.data)).catch(() => nav('/'));
    api.get(`/posts/${id}/comments`).then(r => setComments(r.data));
  }, [id]);

  const send = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post(`/posts/${id}/comments`, { text });
    setComments(c => [data, ...c]);
    setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }));
    setText('');
  };
  const removed = cid => { setComments(c => c.filter(x => x._id !== cid)); setPost(p => ({ ...p, commentsCount: p.commentsCount - 1 })); };

  if (!post) return <p className="py-10 text-center text-on-surface-variant">Loading…</p>;
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center gap-space-md">
        <button onClick={() => nav(-1)} className="rounded-full p-2 hover:bg-white"><Icon n="arrow_back" /></button>
        <h1 className="text-headline-md">Thread</h1>
      </div>
      <PostCard key={post.commentsCount} post={post} onDelete={() => nav('/')} />
      <form onSubmit={send} className="card flex items-start gap-space-md !p-space-md">
        <Avatar user={user} />
        <div className="flex-1">
          <textarea className="input resize-none" rows={2} maxLength={280} placeholder="Write your reply…" value={text} onChange={e => setText(e.target.value)} />
          <div className="mt-2 flex items-center justify-end gap-space-md">
            <span className="text-label-md text-on-surface-variant">{text.length}/280</span>
            <button className="btn" disabled={!text.trim()}>Reply</button>
          </div>
        </div>
      </form>
      <h2 className="text-headline-sm">Responses <span className="rounded-full bg-primary-fixed px-2 text-label-md text-primary">{comments.length}</span></h2>
      {comments.length === 0 && <p className="text-center text-on-surface-variant">No replies yet. Start the conversation.</p>}
      {comments.map(c => (
        <CommentItem key={c._id} c={c} onDelete={removed} canDelete={c.author._id === user._id || post.author._id === user._id} />
      ))}
    </div>
  );
}
