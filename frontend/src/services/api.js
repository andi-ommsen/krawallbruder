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

// ── Admin API ──────────────────────────────────────────────────────────────

const adminApi = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Accept': 'application/ld+json',
    'Content-Type': 'application/ld+json',
  },
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminLogin = (username, password) =>
  axios.post(`${API_BASE}/api/admin/login`, { username, password })

// Blog Posts
export const adminFetchPosts = (params = {}) =>
  adminApi.get('/blog_posts', { params: { ...params, pagination: false } })

export const adminFetchPost = (id) =>
  adminApi.get(`/blog_posts/${id}`)

export const adminCreatePost = (data) =>
  adminApi.post('/blog_posts', data)

export const adminUpdatePost = (id, data) =>
  adminApi.put(`/blog_posts/${id}`, data)

export const adminDeletePost = (id) =>
  adminApi.delete(`/blog_posts/${id}`)

// Bikes
export const adminFetchBikes = () =>
  adminApi.get('/bikes', { params: { pagination: false } })

export const adminFetchBike = (id) =>
  adminApi.get(`/bikes/${id}`)

export const adminCreateBike = (data) =>
  adminApi.post('/bikes', data)

export const adminUpdateBike = (id, data) =>
  adminApi.put(`/bikes/${id}`, data)

export const adminDeleteBike = (id) =>
  adminApi.delete(`/bikes/${id}`)

// YouTube Videos
export const adminFetchVideos = () =>
  adminApi.get('/you_tube_videos', { params: { pagination: false } })

export const adminFetchVideo = (id) =>
  adminApi.get(`/you_tube_videos/${id}`)

export const adminCreateVideo = (data) =>
  adminApi.post('/you_tube_videos', data)

export const adminUpdateVideo = (id, data) =>
  adminApi.put(`/you_tube_videos/${id}`, data)

export const adminDeleteVideo = (id) =>
  adminApi.delete(`/you_tube_videos/${id}`)

// About Page
export const adminFetchAbout = () =>
  adminApi.get('/about_pages')

export const adminCreateAbout = (data) =>
  adminApi.post('/about_pages', data)

export const adminUpdateAbout = (id, data) =>
  adminApi.put(`/about_pages/${id}`, data)

// Comments (public)
export const fetchComments = (blogPostId) =>
  api.get('/comments', { params: { 'blogPost': blogPostId, pagination: false } })

export const postComment = (data) =>
  axios.post(`${API_BASE}/api/comments`, data, {
    headers: { 'Content-Type': 'application/json' },
  })

// Comments (admin)
export const adminFetchComments = () =>
  adminApi.get('/comments', { params: { pagination: false } })

export const adminDeleteComment = (id) =>
  adminApi.delete(`/comments/${id}`)
