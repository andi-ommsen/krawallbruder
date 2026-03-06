import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Accept': 'application/ld+json',
    'Content-Type': 'application/ld+json',
  },
})

// Blog-Beiträge
export const fetchBlogPosts = (params = {}) =>
  api.get('/blog_posts', { params })

export const fetchBlogPost = (slug) =>
  api.get(`/blog_posts`, { params: { slug } })

// Bikes
export const fetchBikes = () =>
  api.get('/bikes')

export const fetchBike = (slug) =>
  api.get(`/bikes`, { params: { slug } })

// YouTube-Videos
export const fetchYouTubeVideos = (params = {}) =>
  api.get('/you_tube_videos', { params })

// Über mich
export const fetchAboutPage = () =>
  api.get('/about_pages')

export default api
