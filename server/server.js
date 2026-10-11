import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import auth from './routes/auth.js';
import users from './routes/users.js';
import posts from './routes/posts.js';

fs.mkdirSync('uploads', { recursive: true });
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads'))); // uploaded images
app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/posts', posts);

// One central error handler: every route's errors end up here
app.use((err, req, res, next) => {
  console.error(err.message);
  const code = err.status || (err.code === 11000 ? 409 : ['ValidationError', 'MulterError'].includes(err.name) ? 400 : err.name === 'CastError' ? 404 : 500);
  res.status(code).json({ message: err.code === 11000 ? 'Email or username already taken' : err.message });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on port ${port}`));
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
