import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blogs } from "./pages/Blogs";
import { PublishNew } from './pages/PublishNew';
import { Blog } from './pages/Blog';
import { MyPosts } from './pages/MyPosts';
import { SavedPosts } from './pages/SavedPosts';
import { EditPost } from './pages/EditPost';

function AppNew() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/publish" element={<PublishNew />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/saved-posts" element={<SavedPosts />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default AppNew
