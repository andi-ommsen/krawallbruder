import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Bikes from './pages/Bikes'
import BikeDetail from './pages/BikeDetail'
import AboutMe from './pages/AboutMe'
import YouTube from './pages/YouTube'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/touren" element={<Blog />} />
          <Route path="/touren/:slug" element={<BlogPost />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/bikes/:slug" element={<BikeDetail />} />
          <Route path="/ueber-mich" element={<AboutMe />} />
          <Route path="/youtube" element={<YouTube />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
