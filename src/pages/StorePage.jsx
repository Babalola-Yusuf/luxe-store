import { useState, useEffect } from 'react'
import { fetchProducts } from '../data/api'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import {
  FaShoppingBag, FaHeart, FaRegHeart, FaStar, FaStarHalfAlt,
  FaSearch, FaChevronLeft, FaChevronRight, FaArrowRight,
  FaLaptop, FaTshirt, FaHome, FaSprayCan, FaDumbbell, FaThLarge,
  FaFilter, FaTimes, FaUsers
} from 'react-icons/fa'
import ProductDetailModal from '../components/ProductDetailModal'

const CATEGORIES = [
  { id: 'all',     label: 'All',     icon: FaThLarge },
  { id: 'tech',    label: 'Tech',    icon: FaLaptop },
  { id: 'fashion', label: 'Fashion', icon: FaTshirt },
  { id: 'home',    label: 'Home',    icon: FaHome },
  { id: 'beauty',  label: 'Beauty',  icon: FaSprayCan },
  { id: 'sports',  label: 'Sports',  icon: FaDumbbell },
]

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const HERO_SLIDES = [
    {
      title: 'Discover Premium',
      subtitle: 'Collections',
      description: 'Curated lifestyle products that blend style, quality, and affordability.',
      badge: 'New Arrivals 2026',
      cta: 'Shop Now',
      bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop',
      gradient: 'from-purple-900/80 via-indigo-900/70 to-blue-900/60',
    },
    {
      title: 'Tech Essentials',
      subtitle: 'For Modern Living',
      description: 'Cutting-edge gadgets and accessories to elevate your digital lifestyle.',
      badge: 'Latest Tech',
      cta: 'Explore Tech',
      bgImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=800&fit=crop',
      gradient: 'from-slate-900/80 via-gray-900/70 to-zinc-900/60',
    },
    {
      title: 'Summer Fashion',
      subtitle: 'Trending Now',
      description: 'Stay ahead with our handpicked selection of fashion-forward pieces.',
      badge: 'Hot Deals',
      cta: 'Shop Fashion',
      bgImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=800&fit=crop',
      gradient: 'from-rose-900/80 via-pink-900/70 to-red-900/60',
    },
    {
      title: 'Home & Living',
      subtitle: 'Create Your Space',
      description: 'Transform your space with our carefully selected home essentials.',
      badge: 'Interior Picks',
      cta: 'Browse Collection',
      bgImage: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1920&h=800&fit=crop',
      gradient: 'from-emerald-900/80 via-teal-900/70 to-cyan-900/60',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
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
    <div className="relative overflow-hidden h-[500px] sm:h-[600px] lg:h-[700px]">
      {/* Background Images */}
      {HERO_SLIDES.map((s, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${s.bgImage})`,
              transform: currentSlide === index ? 'scale(1)' : 'scale(1.1)',
              transition: 'transform 6s ease-out',
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
        </div>
      ))}

      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent2/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* CSS-Based Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
          <div className="max-w-3xl">
            
            {/* Badge */}
            <div className="mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wide border border-white/20">
                <span className="w-2 h-2 rounded-full bg-accent2 animate-pulse" />
                {slide.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
              <span className="text-white drop-shadow-2xl">
                {slide.title}
              </span>
              <br />
              <span className="text-accent2 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-accent2 to-accent">
                {slide.subtitle}
              </span>
            </h1>

            {/* Description */}
            <p className="text-white/90 text-base sm:text-lg md:text-xl mb-8 max-w-2xl leading-relaxed drop-shadow-lg opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
              <button className="group relative px-8 py-4 bg-white text-brand rounded-full font-semibold shadow-2xl hover:shadow-accent/50 transition-all overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  {slide.cta}
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent2 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/20 hover:border-white/50 transition-all shadow-lg">
                View Collections
              </button>
            </div>

            {/* Stats with Professional Icons */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20 max-w-xl opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
              {[
                { label: 'Products', value: '500+', Icon: FaShoppingBag },
                { label: 'Customers', value: '10k+', Icon: FaUsers },
                { label: 'Rating', value: '4.9', Icon: FaStar },
              ].map(stat => (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-2 group-hover:scale-110 transition-transform">
                    <stat.Icon className="text-xl sm:text-2xl text-accent2" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all shadow-xl group"
      >
        <FaChevronLeft className="text-lg group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all shadow-xl group"
      >
        <FaChevronRight className="text-lg group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              currentSlide === index
                ? 'w-12 h-3 bg-white shadow-lg shadow-white/50'
                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
            } rounded-full`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 text-white/60 animate-bounce">
        <span className="text-xs uppercase tracking-wider">Scroll</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onOpenDetail }) {
  const { addToCart } = useCart()
  const { formatPrice } = useSettings()
  const [added, setAdded]       = useState(false)
  const [wishlist, setWishlist] = useState(false)

  function handleAdd(e) {
    e.stopPropagation()
    addToCart(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  function handleWishlistToggle(e) {
    e.stopPropagation()
    setWishlist(!wishlist)
  }

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
    >
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white transition-all"
      >
        {wishlist ? (
          <FaHeart className="text-red-500 text-base" />
        ) : (
          <FaRegHeart className="text-muted text-base" />
        )}
      </button>

      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${
            product.badge === 'sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {product.badge}
          </span>
        </div>
      )}

      <div className="relative h-48 sm:h-56 bg-[#f9f8f6] overflow-hidden">
        {product.images?.[0] || product.image_url ? (
          <img
            src={product.images?.[0] || product.image_url}
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

      <div className="p-4">
        <p className="font-medium text-sm leading-snug mb-2 line-clamp-2 min-h-[40px]">
          {product.name}
        </p>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-accent">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-xs text-muted line-through">{formatPrice(product.original_price)}</span>
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
            added ? 'bg-green-600 text-white' : 'bg-brand text-white hover:bg-accent hover:shadow-lg'
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

export default function StorePage({ session }) {
  const [products, setProducts]             = useState([])
  const [filteredProducts, setFiltered]     = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [searchQuery, setSearchQuery]       = useState('')
  const [showFilters, setShowFilters]       = useState(false)
  const [priceRange, setPriceRange]         = useState([0, 500])
  const [minRating, setMinRating]           = useState(0)
  const [inStockOnly, setInStockOnly]       = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

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

  useEffect(() => {
    let result = [...products]

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    result = result.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    if (minRating > 0) {
      result = result.filter(p => {
        const rating = parseFloat(p.rating?.replace(/[★☆]/g, '') || '0')
        return rating >= minRating
      })
    }

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
      
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Featured Products</h2>
              <p className="text-sm text-muted mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

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

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-brand text-white border-brand shadow-md scale-105'
                      : 'bg-surface text-muted border-border hover:border-brand/40 hover:bg-bg'
                  }`}
                >
                  <Icon className="text-base" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                showFilters
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-muted border-border hover:border-brand/40 hover:bg-bg'
              }`}
            >
              <FaFilter className="text-sm" />
              <span>Filters</span>
              {(minRating > 0 || priceRange[0] > 0 || priceRange[1] < 500 || inStockOnly) && (
                <span className="ml-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm sm:text-base">Advanced Filters</h3>
              <button
                onClick={resetFilters}
                className="text-xs sm:text-sm text-accent hover:underline flex items-center gap-1"
              >
                <FaTimes className="text-xs" /> Reset all
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-2">Price Range ($)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                    placeholder="Min"
                  />
                  <span className="hidden sm:block text-muted">to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                    placeholder="Max"
                  />
                </div>
              </div>

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

              <div>
                <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="w-5 h-5 accent-brand cursor-pointer"
                  />
                  <span className="text-sm flex-1">Show only items in stock</span>
                </label>
              </div>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetail={(product) => {
                    setSelectedProduct(product)
                    setShowDetailModal(true)
                  }}
                />
              ))
          }

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

        {!loading && filteredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <button className="bg-surface border border-border text-brand px-8 py-3 rounded-full font-medium hover:bg-bg hover:shadow-md transition-all inline-flex items-center gap-2">
              Load More Products
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        session={session}
      />
    </div>
  )
}