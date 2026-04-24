import { useState, useEffect } from 'react'
import { fetchProducts } from '../data/api'
import { useCart } from '../context/CartContext'
import {
  FaShoppingBag, FaHeart, FaRegHeart, FaStar, FaStarHalfAlt,
  FaSearch, FaChevronLeft, FaChevronRight, FaArrowRight,
  FaLaptop, FaTshirt, FaHome, FaSprayCan, FaDumbbell, FaThLarge,
  FaFilter, FaTimes
} from 'react-icons/fa'

const CATEGORIES = [
  { id: 'all',     label: 'All',     icon: FaThLarge },
  { id: 'tech',    label: 'Tech',    icon: FaLaptop },
  { id: 'fashion', label: 'Fashion', icon: FaTshirt },
  { id: 'home',    label: 'Home',    icon: FaHome },
  { id: 'beauty',  label: 'Beauty',  icon: FaSprayCan },
  { id: 'sports',  label: 'Sports',  icon: FaDumbbell },
]

const HERO_SLIDES = [
  {
    title: 'Discover Premium',
    subtitle: 'Collections',
    description: 'Curated lifestyle products that blend style, quality, and affordability.',
    badge: 'New Collection 2026',
    cta: 'Shop Now',
    bg: 'from-brand via-[#2d2d5e] to-[#1a1a2e]',
  },
  {
    title: 'Tech Essentials',
    subtitle: 'For Modern Living',
    description: 'Cutting-edge gadgets and accessories to elevate your digital lifestyle.',
    badge: 'Latest Tech',
    cta: 'Explore Tech',
    bg: 'from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8]',
  },
  {
    title: 'Summer Fashion',
    subtitle: 'Trending Now',
    description: 'Stay ahead with our handpicked selection of fashion-forward pieces.',
    badge: 'Hot Deals',
    cta: 'Shop Fashion',
    bg: 'from-[#be123c] via-[#e11d48] to-[#f43f5e]',
  },
]

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  function goToSlide(index) {
    setCurrentSlide(index)
  }

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  const slide = HERO_SLIDES[currentSlide]

  return (
    <div className="relative overflow-hidden">
      <div className={`bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left content */}
            <div className="text-white">
              <div className="inline-block mb-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
                <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide backdrop-blur-sm border border-white/20">
                  {slide.badge}
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
                {slide.title}
                <span className="block text-accent2 mt-1">{slide.subtitle}</span>
              </h1>

              <p className="text-white/80 text-base sm:text-lg mb-8 max-w-md leading-relaxed opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
                <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
                  {slide.cta} <FaArrowRight className="text-sm" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-3.5 rounded-full font-medium transition-all">
                  View Collections
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
                {[
                  { label: 'Products', value: '500+' },
                  { label: 'Customers', value: '10k+' },
                  { label: 'Rating', value: '4.9★' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-accent2">{stat.value}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
                <div className="w-80 h-80 bg-white/10 rounded-3xl rotate-6 blur-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaShoppingBag className="text-9xl text-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <FaChevronRight />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded]       = useState(false)
  const [wishlist, setWishlist] = useState(false)

  function handleAdd() {
    addToCart(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
      {/* Wishlist button */}
      <button
        onClick={(e) => { e.stopPropagation(); setWishlist(!wishlist) }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white transition-all"
      >
        {wishlist ? (
          <FaHeart className="text-red-500 text-base" />
        ) : (
          <FaRegHeart className="text-muted text-base" />
        )}
      </button>

      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${
            product.badge === 'sale'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Product image */}
      <div className="relative h-48 sm:h-56 bg-[#f9f8f6] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            <FaShoppingBag className="text-muted" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Product info */}
      <div className="p-4">
        <p className="font-medium text-sm leading-snug mb-2 line-clamp-2 min-h-[40px]">
          {product.name}
        </p>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-accent">${product.price}</span>
          {product.original_price && (
            <span className="text-xs text-muted line-through">
              ${product.original_price}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => {
              const rating = parseFloat(product.rating?.replace(/[★☆]/g, '') || '0')
              return i < Math.floor(rating) ? (
                <FaStar key={i} className="text-xs" />
              ) : i < rating ? (
                <FaStarHalfAlt key={i} className="text-xs" />
              ) : (
                <FaStar key={i} className="text-xs text-gray-300" />
              )
            })}
          </div>
          <span className="text-[11px] text-muted">{product.stock} left</span>
        </div>

        <button
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-brand text-white hover:bg-accent hover:shadow-lg'
          }`}
        >
          <FaShoppingBag className="text-sm" />
          {added ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-48 sm:h-56 bg-[#f0ede8]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#f0ede8] rounded w-3/4" />
        <div className="h-5 bg-[#f0ede8] rounded w-1/3" />
        <div className="h-9 bg-[#f0ede8] rounded" />
      </div>
    </div>
  )
}

export default function StorePage() {
  const [products, setProducts]         = useState([])
  const [filteredProducts, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [showFilters, setShowFilters]   = useState(false)
  const [priceRange, setPriceRange]     = useState([0, 500])
  const [minRating, setMinRating]       = useState(0)
  const [inStockOnly, setInStockOnly]   = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchProducts(activeCategory)
      .then(data => {
        setProducts(data)
        setFiltered(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeCategory])

  // Apply filters whenever search or filter values change
  useEffect(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Price range filter
    result = result.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => {
        const rating = parseFloat(p.rating?.replace(/[★☆]/g, '') || '0')
        return rating >= minRating
      })
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0)
    }

    setFiltered(result)
  }, [products, searchQuery, priceRange, minRating, inStockOnly])

  function resetFilters() {
    setSearchQuery('')
    setPriceRange([0, 500])
    setMinRating(0)
    setInStockOnly(false)
  }

  return (
    <div className="bg-gradient-to-b from-bg to-[#faf9f7]">
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        
        {/* Section header with search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Featured Products</h2>
              <p className="text-sm text-muted mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-sm bg-surface outline-none focus:border-brand transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category filters + Advanced filters button */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 flex-1 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                    activeCategory === cat.id
                      ? 'bg-brand text-white border-brand shadow-md scale-105'
                      : 'bg-surface text-muted border-border hover:border-brand/40 hover:bg-bg'
                  }`}
                >
                  <Icon className="text-base" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border bg-surface text-muted border-border hover:border-brand/40 hover:bg-bg transition-all"
          >
            <FaFilter className="text-sm" />
            Filters
          </button>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="bg-surface border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Advanced Filters</h3>
              <button
                onClick={resetFilters}
                className="text-xs text-accent hover:underline"
              >
                Reset all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price range */}
              <div>
                <label className="block text-xs text-muted mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                    placeholder="Min"
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Min rating */}
              <div>
                <label className="block text-xs text-muted mb-2">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={e => setMinRating(+e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
                >
                  <option value={0}>All ratings</option>
                  <option value={4}>4★ & above</option>
                  <option value={4.5}>4.5★ & above</option>
                  <option value={5}>5★ only</option>
                </select>
              </div>

              {/* In stock only */}
              <div>
                <label className="block text-xs text-muted mb-2">Availability</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-brand"
                  />
                  <span className="text-sm">In stock only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mx-auto mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl max-w-2xl">
            Failed to load products: {error}
            <button
              onClick={() => setActiveCategory(activeCategory)}
              className="ml-3 underline font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
          }

          {/* Empty state */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20">
              <FaSearch className="text-5xl text-muted mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No products found</p>
              <p className="text-sm text-muted mb-4">Try adjusting your filters or search query</p>
              <button
                onClick={resetFilters}
                className="text-accent hover:underline font-medium"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <button className="bg-surface border border-border text-brand px-8 py-3 rounded-full font-medium hover:bg-bg hover:shadow-md transition-all inline-flex items-center gap-2">
              Load More Products
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}