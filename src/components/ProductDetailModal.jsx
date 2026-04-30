import { useState, useEffect } from 'react'
import { FaTimes, FaShoppingCart, FaHeart, FaRegHeart, FaStar, FaStarHalfAlt } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { fetchReviews, createReview, addToWishlist, removeFromWishlist } from '../data/api'

export default function ProductDetailModal({ product, isOpen, onClose, session }) {
  const { addToCart } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [inWishlist, setInWishlist] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Mock multiple images (in real app, you'd have product.images array)
  const images = product?.images && product.images.length > 0
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : []

  useEffect(() => {
    if (product && isOpen) {
      setLoadingReviews(true)
      fetchReviews(product.id)
        .then(setReviews)
        .finally(() => setLoadingReviews(false))
    }
  }, [product, isOpen])

  if (!isOpen || !product) return null

  async function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id)
    }
    onClose()
  }

  async function handleToggleWishlist() {
    if (!session) {
      alert('Please sign in to add to wishlist')
      return
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id)
        setInWishlist(false)
      } else {
        await addToWishlist(product.id)
        setInWishlist(true)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleSubmitReview() {
    if (!session) {
      alert('Please sign in to leave a review')
      return
    }
    try {
      await createReview({
        productId: product.id,
        ...reviewForm
      })
      setShowReviewForm(false)
      setReviewForm({ rating: 5, title: '', comment: '' })
      const updatedReviews = await fetchReviews(product.id)
      setReviews(updatedReviews)
    } catch (err) {
      alert(err.message)
    }
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-bg transition-colors"
        >
          <FaTimes />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            
            {/* Left: Image gallery */}
            <div>
              {/* Main image */}
              <div className="bg-[#f9f8f6] rounded-2xl overflow-hidden mb-4 aspect-square">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {product.emoji}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === i ? 'border-brand' : 'border-border'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product info */}
            <div>
              {/* Badge */}
              {product.badge && (
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold uppercase mb-3 ${
                  product.badge === 'sale' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {product.badge}
                </span>
              )}

              <h1 className="font-display text-3xl font-bold mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const rating = avgRating || parseFloat(product.rating?.replace(/[★☆]/g, '') || '0')
                    return i < Math.floor(rating) ? (
                      <FaStar key={i} className="text-sm" />
                    ) : i < rating ? (
                      <FaStarHalfAlt key={i} className="text-sm" />
                    ) : (
                      <FaStar key={i} className="text-sm text-gray-300" />
                    )
                  })}
                </div>
                <span className="text-sm text-muted">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-accent">${product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-muted line-through">
                    ${product.original_price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted mb-6 leading-relaxed">
                {product.description || 'Premium quality product. Carefully curated for style and functionality.'}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-bg transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-bg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-3 bg-brand text-white rounded-xl font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaShoppingCart /> Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-bg transition-colors"
                >
                  {inWishlist ? (
                    <FaHeart className="text-red-500 text-lg" />
                  ) : (
                    <FaRegHeart className="text-muted text-lg" />
                  )}
                </button>
              </div>

              {/* Reviews section */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Customer Reviews</h3>
                  {session && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-sm text-accent hover:underline"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a review'}
                    </button>
                  )}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <div className="bg-bg rounded-xl p-4 mb-4">
                    <div className="mb-3">
                      <label className="block text-xs text-muted mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="text-2xl"
                          >
                            <FaStar className={star <= reviewForm.rating ? 'text-amber-500' : 'text-gray-300'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-muted mb-1">Title</label>
                      <input
                        value={reviewForm.title}
                        onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                        placeholder="Summarize your experience"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-muted mb-1">Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                        rows={3}
                        placeholder="Share your thoughts..."
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      className="w-full py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {loadingReviews ? (
                    <p className="text-sm text-muted">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-muted">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: review.customers?.color || '#1a1a2e' }}
                            >
                              {review.customers?.initials || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.customers?.name || 'Anonymous'}</p>
                              <div className="flex items-center gap-1 text-amber-500">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <FaStar key={i} className="text-xs" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <p className="font-medium text-sm mb-1">{review.title}</p>
                        )}
                        <p className="text-sm text-muted">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}