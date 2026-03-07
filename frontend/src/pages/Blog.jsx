import { useState, useEffect } from 'react'
import { fetchBlogPosts } from '../services/api'
import BlogCard from '../components/BlogCard'
import './Blog.css'

const ITEMS_PER_PAGE = 10
const CATEGORIES = ['Alle', 'Vespa', 'Voge', 'Indian', 'Alpentouren', 'Kurztrip']

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = { page, itemsPerPage: ITEMS_PER_PAGE }
    if (category) params.category = category
    if (search) params.title = search

    fetchBlogPosts(params)
      .then((res) => {
        setPosts(res.data['hydra:member'] || [])
        setTotal(res.data['hydra:totalItems'] || 0)
      })
      .catch(() => setError('Beiträge konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [page, category, search])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const handleCategoryChange = (cat) => {
    setCategory(cat === 'Alle' ? '' : cat)
    setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="blog-page">
      <div className="blog-page__hero">
        <div className="container">
          <h1>Blog</h1>
          <p>Touren, Konzerte, Abenteuer – ohne Filter.</p>
        </div>
      </div>

      <div className="container blog-page__content">
        {/* Filter & Suche */}
        <div className="blog-page__filters">
          <div className="blog-page__categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`blog-page__cat-btn${(cat === 'Alle' && !category) || cat === category ? ' active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <form className="blog-page__search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Beiträge durchsuchen…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="blog-page__search-input"
            />
            <button type="submit" className="btn btn-primary">Suchen</button>
          </form>
        </div>

        {/* Ergebnisanzeige */}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="page-loading">Lade Beiträge…</div>
        ) : (
          <>
            <p className="blog-page__count">{total} Beiträge</p>
            <div className="grid-3">
              {posts.map((post) => (
                <BlogCard key={post['@id']} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  ← Zurück
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === page ? 'active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                  Weiter →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
