import { Router } from 'express';
import { User, Post } from '../models/index.js';
import { protect, upload, wrap } from '../middleware/auth.js';

const r = Router();
r.use(protect);
const PUBLIC = '-email -updatedAt -__v';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Public shape of a user: counts instead of id arrays + "do I follow them?"
const view = (u, me) => ({
  ...u,
  followersCount: u.followers.length,
  followingCount: u.following.length,
  isFollowing: u.followers.some(f => String(f) === me),
  followers: undefined,
  following: undefined,
});

r.get('/suggestions', wrap(async (req, res) => {
  const me = await User.findById(req.uid);
  const list = await User.find({ _id: { $nin: [me._id, ...me.following] } }).select(PUBLIC).sort('-createdAt').limit(5).lean();
  res.json(list.map(u => view(u, req.uid)));
}));

r.get('/search', wrap(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const rx = new RegExp(esc(q), 'i');
  const list = await User.find({ $or: [{ name: rx }, { username: rx }] }).select(PUBLIC).limit(20).lean();
  res.json(list.map(u => view(u, req.uid)));
}));

r.put('/me', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), wrap(async (req, res) => {
  const data = {};
  for (const k of ['name', 'username', 'bio', 'location', 'website']) if (req.body[k] !== undefined) data[k] = req.body[k];
  if (req.files?.avatar) data.avatar = '/uploads/' + req.files.avatar[0].filename;
  if (req.files?.cover) data.cover = '/uploads/' + req.files.cover[0].filename;
  res.json(await User.findByIdAndUpdate(req.uid, data, { new: true, runValidators: true }));
}));

r.get('/:username', wrap(async (req, res) => {
  const u = await User.findOne({ username: req.params.username.toLowerCase() }).select(PUBLIC).lean();
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json({ ...view(u, req.uid), postsCount: await Post.countDocuments({ author: u._id }) });
}));

// Follow / unfollow toggle. Both users' arrays are updated so they stay in sync.
r.post('/:id/follow', wrap(async (req, res) => {
  const { id } = req.params;
  if (id === req.uid) return res.status(400).json({ message: "You can't follow yourself" });
  const target = await User.findById(id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  const already = target.followers.some(f => String(f) === req.uid);
  const op = already ? '$pull' : '$addToSet';
  await User.findByIdAndUpdate(id, { [op]: { followers: req.uid } });
  await User.findByIdAndUpdate(req.uid, { [op]: { following: id } });
  res.json({ isFollowing: !already });
}));

// populate() swaps stored ids for the real user documents
const connections = field => wrap(async (req, res) => {
  const u = await User.findOne({ username: req.params.username.toLowerCase() }).populate({ path: field, select: PUBLIC }).lean();
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u[field].map(x => view(x, req.uid)));
});
r.get('/:username/followers', connections('followers'));
r.get('/:username/following', connections('following'));
export default r;
