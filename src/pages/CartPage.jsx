import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { fetchProducts } from '../data/api'
import { FaShoppingCart, FaTrash, FaArrowRight, FaGift, FaTruck } from 'react-icons/fa'

export default function CartPage({ setView }) {
  const { cart, changeQty, removeItem } = useCart()
  const { formatPrice, calculateShipping, calculateTax, settings } = useSettings()
  const [products, setProducts] = useState([])
  const [promoCode, setPromoCode] = useState('')

  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])

  const items = Object.entries(cart).filter(([, q]) => q > 0)
  const subtotal = items.reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === Number(id))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const total = subtotal + shipping + tax

  // Calculate estimated delivery (5-7 business days from now)
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
  const deliveryDate = estimatedDelivery.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })

  // Get recommended products (random 4 products not in cart)
  const recommendedProducts = products
    .filter(p => !cart[p.id])
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <FaShoppingCart className="text-6xl text-muted mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted text-sm mb-6">Add some products to get started.</p>
        <button
          onClick={() => setView('store')}
          className="bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors flex items-center gap-2"
        >
          Continue Shopping <FaArrowRight />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Cart items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Shopping Cart</h2>
            <button
              onClick={() => setView('store')}
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Continue Shopping
            </button>
          </div>

          {/* Free shipping progress */}
          {subtotal < 50 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                <FaTruck />
                <span className="font-medium">
                  Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-surface rounded-xl border border-border divide-y divide-border">
            {items.map(([id, qty]) => {
              const p = products.find((x) => x.id === Number(id))
              if (!p) return (
                <div key={id} className="flex gap-3 p-4 animate-pulse">
                  <div className="w-20 h-20 bg-[#f0ede8] rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#f0ede8] rounded w-2/3" />
                    <div className="h-3 bg-[#f0ede8] rounded w-1/4" />
                  </div>
                </div>
              )

              return (
                <div key={id} className="flex gap-4 p-4 hover:bg-bg/60 transition-colors">
                  {/* Product image */}
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-3xl border border-border shrink-0">
                      {p.emoji}
                    </div>
                  )}

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base mb-1">{p.name}</h3>
                    <p className="text-xs text-muted mb-2 capitalize">{p.category}</p>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQty(p.id, -1)}
                          className="w-7 h-7 rounded-full border border-border text-sm flex items-center justify-center hover:bg-bg transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{qty}</span>
                        <button
                          onClick={() => changeQty(p.id, 1)}
                          className="w-7 h-7 rounded-full border border-border text-sm flex items-center justify-center hover:bg-bg transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(p.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        <FaTrash className="text-xs" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-base sm:text-lg font-bold text-accent">
                      {formatPrice(p.price * qty)}
                    </p>
                    {p.original_price && (
                      <p className="text-xs text-muted line-through">
                        {formatPrice(p.original_price * qty)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          {/* Free shipping progress */}
          {subtotal < settings.shipping.freeShippingThreshold && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                <FaTruck />
                <span className="font-medium">
                  Add {formatPrice(settings.shipping.freeShippingThreshold - subtotal)} more for FREE shipping!
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((subtotal / settings.shipping.freeShippingThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-surface rounded-xl border border-border p-5 sticky top-4">
            <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>

            {/* Promo code */}
            <div className="mb-4">
              <label className="block text-xs text-muted mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
                <button className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  Apply
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Tax (8.5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 mt-1 border-t border-border">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Estimated delivery */}
            <div className="bg-bg rounded-lg p-3 mb-4 flex items-start gap-2 text-xs">
              <FaTruck className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-brand">Estimated Delivery</p>
                <p className="text-muted">By {deliveryDate}</p>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => setView('checkout')}
              className="w-full py-3 bg-accent text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-2"
            >
              Proceed to Checkout <FaArrowRight />
            </button>

            <button
              onClick={() => setView('store')}
              className="w-full py-2.5 border border-border text-brand rounded-xl text-sm font-medium hover:bg-bg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Recommended products */}
      {recommendedProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="font-display text-xl font-semibold mb-6">You might also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedProducts.map(p => (
              <div
                key={p.id}
                className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-[#f9f8f6] flex items-center justify-center text-4xl">
                    {p.emoji}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium mb-1 line-clamp-2">{p.name}</p>
                  <p className="text-base font-bold text-accent">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}