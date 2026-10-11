# Concepts in this project (use this for revision)

| Concept | Where to look | Question to ask yourself |
|---|---|---|
| REST API + routes | `server/routes/*.js` | Why POST for follow/like but GET for feeds? |
| Mongoose schemas | `server/models/index.js` | Why store `followers` on both users? |
| Password hashing | `routes/auth.js` (bcrypt) | Why hash instead of encrypt? |
| JWT auth | `middleware/auth.js` (`protect`), `client/src/api.js` | Where is the token stored and sent? |
| Middleware | `protect`, `upload`, error handler | In what order does Express run them? |
| populate() | `routes/posts.js`, `users.js` | What does the DB store vs what the client receives? |
| Toggle like/follow | `toggleLike`, `/:id/follow` | What if two requests arrive together? |
| File upload | multer + `FormData` in `CreatePost.jsx` | Why can't JSON carry a file? |
| React state + effects | `pages/Home.jsx`, `Search.jsx` | When does `useEffect` re-run? |
| Context | `AuthContext.jsx` | Why not pass `user` as props? |
| Optimistic UI | `PostCard.jsx` (`like`) | What happens if the server fails? |
| React Router | `App.jsx`, `Layout.jsx` | How do nested routes and `Outlet` work? |
| Env vars + CORS | `.env`, `vite.config.js`, `server.js` | Why a proxy in dev but `VITE_API_URL` in prod? |
