import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminFetchPosts, adminFetchBikes, adminFetchVideos } from '../../services/api'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ posts: '-', bikes: '-', videos: '-' })

  useEffect(() => {
    Promise.all([
      adminFetchPosts(),
      adminFetchBikes(),
      adminFetchVideos(),
    ]).then(([posts, bikes, videos]) => {
      setCounts({
        posts: posts.data['hydra:member']?.length ?? 0,
        bikes: bikes.data['hydra:member']?.length ?? 0,
        videos: videos.data['hydra:member']?.length ?? 0,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Touren / Posts', count: counts.posts, to: '/geheim-admin/posts' },
    { label: 'Bikes', count: counts.bikes, to: '/geheim-admin/bikes' },
    { label: 'YouTube Videos', count: counts.videos, to: '/geheim-admin/videos' },
    { label: 'Über mich', count: '—', to: '/geheim-admin/about' },
  ]

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Dashboard</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            style={{
              display: 'block',
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '1.5rem',
              textDecoration: 'none',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-accent)', marginBottom: '0.4rem' }}>
              {c.count}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
