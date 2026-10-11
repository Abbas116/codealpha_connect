import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const userRef = { type: Schema.Types.ObjectId, ref: 'User' };

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[a-z0-9_]{3,20}$/, 'Username: 3-20 letters, numbers or _'] },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // hidden from queries by default
  bio: { type: String, default: '', maxlength: 160 },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  avatar: { type: String, default: '' },
  cover: { type: String, default: '' },
  followers: [userRef],
  following: [userRef],
}, { timestamps: true }));

export const Post = model('Post', new Schema({
  author: { ...userRef, required: true },
  text: { type: String, default: '', maxlength: 500 },
  image: { type: String, default: '' },
  tags: [String],
  likes: [userRef],
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true }));

// Images live in MongoDB (Vercel has no writable disk)
export const Image = model('Image', new Schema({ data: Buffer, mime: String }, { timestamps: true }));

export const Comment = model('Comment', new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { ...userRef, required: true },
  text: { type: String, required: true, maxlength: 280 },
  likes: [userRef],
}, { timestamps: true }));
