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


