import { useState, useEffect } from 'react'
import { fetchProducts } from '../data/api'
import { useCart } from '../context/CartContext'

const CATEGORIES = ['all', 'tech', 'fashion', 'home', 'beauty', 'sports']

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer">
      <div className="h-28 sm:h-32 flex items-center justify-center text-4xl bg-[#f9f8f6]">
        {product.emoji}
      </div>
      <div className="p-3">
        {product.badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            product.badge === 'sale'
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-700'
          }`}>
            {product.badge.toUpperCase()}
          </span>
        )}
        <p className="font-medium text-[13px] mt-1 leading-snug">{product.name}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-base font-semibold text-accent">${product.price}</span>
          {product.original_price && (
            <span className="text-[11px] text-muted line-through">
              ${product.original_price}
            </span>
          )}
        </div>
        <p className="text-[11px] text-amber-600 mt-0.5">{product.rating}</p>
        <button
          onClick={handleAdd}
          className={`w-full mt-2 py-1.5 rounded-lg text-xs text-white transition-all ${
            added ? 'bg-green-600' : 'bg-brand hover:bg-accent'
          }`}
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

// Skeleton card shown while loading
function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="h-28 sm:h-32 bg-[#f0ede8]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#f0ede8] rounded w-3/4" />
        <div className="h-4 bg-[#f0ede8] rounded w-1/3" />
        <div className="h-7 bg-[#f0ede8] rounded mt-3" />
      </div>
    </div>
  )
}

export default function StorePage() {
  const [products, setProducts]         = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchProducts(activeFilter)
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeFilter])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand to-[#2d2d5e] px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-2">
            Discover <em className="not-italic text-accent2">Premium</em>
            <br />Collections
          </h1>
          <p className="text-white/70 text-sm mb-5">
            Curated lifestyle products, delivered to your door.
          </p>
          <button className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            Shop Now
          </button>
        </div>
        <div className="w-full sm:w-40 lg:w-52 h-24 sm:h-32 lg:h-36 bg-white/8 border border-white/15 rounded-xl flex items-center justify-center text-5xl lg:text-6xl shrink-0">
          🛍️
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 pt-5 pb-3">
        <h2 className="font-display text-lg font-semibold">Featured Products</h2>
        <a className="text-xs text-accent cursor-pointer">See all →</a>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-4 sm:px-6 lg:px-10 pb-3 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            disabled={loading}
            className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border capitalize transition-all ${
              activeFilter === cat
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-muted border-border hover:border-brand/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-10 mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          Failed to load products: {error}
          <button
            onClick={() => setActiveFilter(activeFilter)}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4 sm:px-6 lg:px-10 pb-10">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)
        }

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted">
            <p className="text-3xl mb-3">🏷️</p>
            <p className="text-sm">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}