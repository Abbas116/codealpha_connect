import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Search from './pages/Search';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Connections from './pages/Connections';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/settings/profile" element={<EditProfile />} />
        <Route path="/:username" element={<Profile />} />
        <Route path="/:username/connections" element={<Connections />} />
      </Route>
    </Routes>
  );
}
