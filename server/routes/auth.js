import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { protect, sign, wrap } from '../middleware/auth.js';

const r = Router();
const reply = (res, u, code = 200) => {
  const user = u.toObject();
  delete user.password;
  res.status(code).json({ token: sign(u.id), user });
};

r.post('/register', wrap(async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'All fields are required (password: 6+ characters)' });
  // Never store plain passwords: bcrypt stores a salted hash
  reply(res, await User.create({ name, username, email, password: await bcrypt.hash(password, 10) }), 201);
}));

r.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ message: 'Wrong email or password' });
  reply(res, user);
}));

r.get('/me', protect, wrap(async (req, res) => res.json(await User.findById(req.uid))));
export default r;
