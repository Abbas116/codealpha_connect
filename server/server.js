import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import users from './routes/users.js';
import posts from './routes/posts.js';
import { Image } from './models/index.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true }));
app.use(express.json());

// Serverless-friendly: connect once and reuse the connection between requests
let conn;
app.use(async (req, res, next) => {
  try { conn ||= mongoose.connect(process.env.MONGO_URI); await conn; next(); }
  catch (e) { conn = null; next(e); }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/images/:id', async (req, res, next) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) return res.sendStatus(404);
    res.set('Content-Type', img.mime).set('Cache-Control', 'public, max-age=31536000').send(img.data);
  } catch (e) { next(e); }
});
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/posts', posts);

// One central error handler: every route's errors end up here
app.use((err, req, res, next) => {
  console.error(err.message);
  const code = err.status || (err.code === 11000 ? 409 : ['ValidationError', 'MulterError'].includes(err.name) ? 400 : err.name === 'CastError' ? 404 : 500);
  res.status(code).json({ message: err.code === 11000 ? 'Email or username already taken' : err.message });
});

// On Vercel the platform runs the app; locally we start a normal server
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on port ${port}`));
}
export default app;
