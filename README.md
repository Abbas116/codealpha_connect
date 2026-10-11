# Connect - MERN social media app

React (Vite) + Tailwind | Node + Express | MongoDB (Mongoose) | JWT auth.
UI follows the Stitch "Luminous Social" design (indigo/rose, Inter, Material icons), fully responsive.

**Features:** user profiles (edit, avatar, cover) | posts with images + comments | likes (posts and comments) | follow / unfollow | followers & following lists | search (people, posts, #tags) | trending tags | "Who to follow".

## Folder structure
```
connect-app/
├─ server/                 # Express API
│  ├─ server.js            # app setup, DB connection, error handler
│  ├─ models/index.js      # User, Post, Comment schemas
│  ├─ middleware/auth.js   # JWT check (protect), image upload (multer)
│  └─ routes/              # auth.js, users.js, posts.js
└─ client/                 # React app
   └─ src/
      ├─ api.js            # axios instance (adds the JWT to every request)
      ├─ AuthContext.jsx   # logged-in user state
      ├─ components/       # Layout, PostCard, CreatePost, ui (Avatar, FollowButton...)
      └─ pages/            # Auth, Home, PostDetail, Profile, EditProfile, Search, Connections
```

## Run locally
Needs Node 18+ and a MongoDB Atlas connection string.

```bash
# 1) API
cd server
npm install
cp .env.example .env        # then edit .env: MONGO_URI and JWT_SECRET
npm run dev                 # http://localhost:5000

# 2) Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```
Open http://localhost:5173, create two accounts (use two browsers), then try follow, post, like and comment.

## Push to GitHub
```bash
cd connect-app
git init
git add .
git commit -m "Connect: MERN social app"
git branch -M main
git remote add origin https://github.com/<you>/connect-app.git
git push -u origin main
```
`.gitignore` already keeps `.env` and `node_modules` out of GitHub.

## Deploy (all free tiers)
**1. Database - MongoDB Atlas:** Database Access -> add a user. Network Access -> allow `0.0.0.0/0`. Connect -> Drivers -> copy the connection string (put your password in, add `/connect` before `?`).

**2. API - Render** (New -> Web Service -> pick your GitHub repo):
- Root Directory: `server` | Build Command: `npm install` | Start Command: `npm start`
- Environment: `MONGO_URI`, `JWT_SECRET` (long random text), `CLIENT_URL` (add after step 3)
- Test: `https://<your-api>.onrender.com/api/health` should return `{"ok":true}`

**3. Client - Vercel** (Add New Project -> pick the repo):
- Root Directory: `client` | Framework: Vite
- Environment variable: `VITE_API_URL` = your Render URL (no trailing slash)
- Deploy, copy the Vercel URL.

**4.** Back on Render, set `CLIENT_URL` = your Vercel URL and redeploy (this allows CORS).

**Note:** Render's free disk is temporary, so uploaded images disappear on restart/redeploy. For real use, move uploads to Cloudinary (change `upload` in `server/middleware/auth.js`). Free Render also sleeps after inactivity, so the first request can take ~50s.
