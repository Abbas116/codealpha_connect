import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

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

// Image uploads -> server/uploads (max 5MB, images only)
export const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads',
    filename: (req, f, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(f.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, f, cb) => f.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only images are allowed')),
});
