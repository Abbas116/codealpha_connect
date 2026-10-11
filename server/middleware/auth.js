import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Image } from '../models/index.js';

// Express 4 doesn't catch errors in async handlers, so we forward them to the error handler
export const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Reads "Authorization: Bearer <token>", verifies it and stores the user id in req.uid
export const protect = (req, res, next) => {
  try {
    req.uid = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Please log in again' });
  }
};

// Image uploads are kept in memory (max 3MB, images only), then saved to MongoDB
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, f, cb) => f.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only images are allowed')),
});

// Saves an uploaded file and returns the URL path the client can use
export const saveImage = async f => '/api/images/' + (await Image.create({ data: f.buffer, mime: f.mimetype }))._id;
