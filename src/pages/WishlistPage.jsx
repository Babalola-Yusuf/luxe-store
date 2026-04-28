import { useState, useEffect } from 'react'
import { fetchWishlist, removeFromWishlist } from '../data/api'
import { useCart } from '../context/CartContext'
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa'

export default function WishlistPage({ setView, session }) {
  const { addToCart } = useCart()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setView('login')
      return
    }
    loadWishlist()
  }, [session])

  async function loadWishlist() {
    setLoading(true)
    try {
      const data = await fetchWishlist()
      setWishlist(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(productId) {
    await removeFromWishlist(productId)
    await loadWishlist()
  }

  async function handleAddToCart(productId) {
    addToCart(productId)
    await handleRemove(productId)
  }

  if (!session) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FaHeart className="text-3xl text-accent" />
        <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="h-48 bg-[#f0ede8]" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[#f0ede8] rounded w-3/4" />
                <div className="h-4 bg-[#f0ede8] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20">
          <FaHeart className="text-6xl text-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted text-sm mb-6">
            Save items you love to buy them later
          </p>
          <button
            onClick={() => setView('store')}
            className="bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map(item => {
            const p = item.products
            return (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Product image */}
                <div className="relative h-48 bg-[#f9f8f6]">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {p.emoji}
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="text-red-500 text-xs" />
                  </button>
                </div>

                {/* Product info */}
                <div className="p-4">
                  <p className="font-medium text-sm mb-2 line-clamp-2">{p.name}</p>
                  <p className="text-base font-bold text-accent mb-3">${p.price}</p>
                  
                  <button
                    onClick={() => handleAddToCart(p.id)}
                    disabled={p.stock === 0}
                    className="w-full py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart className="text-xs" />
                    {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}