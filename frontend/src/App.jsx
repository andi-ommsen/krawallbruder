import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Bikes from './pages/Bikes'
import BikeDetail from './pages/BikeDetail'
import AboutMe from './pages/AboutMe'
import YouTube from './pages/YouTube'
import Impressum from './pages/Impressum'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPosts from './pages/admin/AdminPosts'
import AdminPostEdit from './pages/admin/AdminPostEdit'
import AdminBikes from './pages/admin/AdminBikes'
import AdminBikeEdit from './pages/admin/AdminBikeEdit'
import AdminVideos from './pages/admin/AdminVideos'
import AdminVideoEdit from './pages/admin/AdminVideoEdit'
import AdminAbout from './pages/admin/AdminAbout'

function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/bikes" element={<Bikes />} />
            <Route path="/bikes/:slug" element={<BikeDetail />} />
            <Route path="/ueber-mich" element={<AboutMe />} />
            <Route path="/youtube" element={<YouTube />} />
            <Route path="/impressum" element={<Impressum />} />
          </Route>

          {/* Admin routes – no public header/footer */}
          <Route path="/geheim-admin/login" element={<AdminLogin />} />
          <Route path="/geheim-admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/neu" element={<AdminPostEdit />} />
            <Route path="posts/:id" element={<AdminPostEdit />} />
            <Route path="bikes" element={<AdminBikes />} />
            <Route path="bikes/neu" element={<AdminBikeEdit />} />
            <Route path="bikes/:id" element={<AdminBikeEdit />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="videos/neu" element={<AdminVideoEdit />} />
            <Route path="videos/:id" element={<AdminVideoEdit />} />
            <Route path="about" element={<AdminAbout />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
