import { Router } from 'express';
import { Post, Comment, User } from '../models/index.js';
import { protect, saveImage, upload, wrap } from '../middleware/auth.js';

const r = Router();
r.use(protect); // everything below needs a logged-in user
const AUTHOR = 'name username avatar';
const has = (arr, id) => arr.some(x => String(x) === id);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Client gets a like count + "did I like it?" instead of the full likes array
const shape = (p, me) => ({ ...p, likes: undefined, likesCount: p.likes.length, liked: has(p.likes, me) });
const find = async (filter, me) =>
  (await Post.find(filter).sort('-createdAt').limit(50).populate('author', AUTHOR).lean()).map(p => shape(p, me));

r.get('/', wrap(async (req, res) => {
  let filter = {};
  if (req.query.feed === 'following') {
    const me = await User.findById(req.uid);
    filter = { author: { $in: [...me.following, me._id] } };
  }
  res.json(await find(filter, req.uid));
}));

r.get('/trending', wrap(async (req, res) => {
  const tags = await Post.aggregate([{ $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
  res.json(tags.map(t => ({ tag: t._id, count: t.count })));
}));

r.get('/search', wrap(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  res.json(await find(q.startsWith('#') ? { tags: q.slice(1).toLowerCase() } : { text: new RegExp(esc(q), 'i') }, req.uid));
}));

r.get('/user/:username', wrap(async (req, res) => {
  const u = await User.findOne({ username: req.params.username.toLowerCase() });
  res.json(u ? await find({ author: u._id }, req.uid) : []);
}));

r.post('/', upload.single('image'), wrap(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text && !req.file) return res.status(400).json({ message: 'Write something or add an image' });
  const tags = [...new Set((text.match(/#(\w+)/g) || []).map(t => t.slice(1).toLowerCase()))];
  const p = await Post.create({ author: req.uid, text, tags, image: req.file ? await saveImage(req.file) : '' });
  await p.populate('author', AUTHOR);
  res.status(201).json(shape(p.toObject(), req.uid));
}));

// Like toggle shared by posts and comments
const toggleLike = (Model, param) => wrap(async (req, res) => {
  const doc = await Model.findById(req.params[param]);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const liked = has(doc.likes, req.uid);
  if (liked) doc.likes.pull(req.uid); else doc.likes.addToSet(req.uid);
  await doc.save();
  res.json({ liked: !liked, likesCount: doc.likes.length });
});
r.post('/comments/:cid/like', toggleLike(Comment, 'cid'));
r.delete('/comments/:cid', wrap(async (req, res) => {
  const c = await Comment.findById(req.params.cid);
  if (!c) return res.status(404).json({ message: 'Comment not found' });
  const post = await Post.findById(c.post);
  if (String(c.author) !== req.uid && String(post?.author) !== req.uid) return res.status(403).json({ message: 'Not allowed' });
  await c.deleteOne();
  await Post.findByIdAndUpdate(c.post, { $inc: { commentsCount: -1 } });
  res.json({ ok: true });
}));

r.get('/:id', wrap(async (req, res) => {
  const p = await Post.findById(req.params.id).populate('author', AUTHOR).lean();
  if (!p) return res.status(404).json({ message: 'Post not found' });
  res.json(shape(p, req.uid));
}));

r.delete('/:id', wrap(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Post not found' });
  if (String(p.author) !== req.uid) return res.status(403).json({ message: 'Not your post' });
  await Promise.all([p.deleteOne(), Comment.deleteMany({ post: p._id })]);
  res.json({ ok: true });
}));

r.post('/:id/like', toggleLike(Post, 'id'));

r.get('/:id/comments', wrap(async (req, res) => {
  const list = await Comment.find({ post: req.params.id }).sort('-createdAt').populate('author', AUTHOR).lean();
  res.json(list.map(c => shape(c, req.uid)));
}));

r.post('/:id/comments', wrap(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Comment is empty' });
  if (!(await Post.exists({ _id: req.params.id }))) return res.status(404).json({ message: 'Post not found' });
  const c = await Comment.create({ post: req.params.id, author: req.uid, text });
  await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
  await c.populate('author', AUTHOR);
  res.status(201).json(shape(c.toObject(), req.uid));
}));
export default r;
