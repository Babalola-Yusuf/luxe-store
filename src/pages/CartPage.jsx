import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { fetchProducts, validatePromoCode } from '../data/api'
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaTimes } from 'react-icons/fa'

export default function CartPage({ setAppliedPromo }) {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity } = useCart()
  const { formatPrice, calculateShipping, calculateTax, settings } = useSettings()
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const prods = await fetchProducts()
      setProducts(prods)
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }

  async function applyPromo() {
    if (!promoCode.trim()) return
    
    setPromoError('')
    setPromoSuccess('')

    try {
      const result = await validatePromoCode(promoCode)
      if (result.valid) {
        const discount = result.discount_percent 
          ? (subtotal * result.discount_percent / 100)
          : (result.discount_amount || 0)
        
        setPromoDiscount(discount)
        setPromoSuccess(`Promo code applied! You saved ${formatPrice(discount)}`)
      } else {
        setPromoError('Invalid or expired promo code')
      }
    } catch (err) {
      setPromoError('Failed to validate promo code')
    }
  }

  function removePromo() {
    setPromoCode('')
    setPromoDiscount(0)
    setPromoError('')
    setPromoSuccess('')
  }

  const subtotal = items.reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const total = Math.max(0, subtotal + shipping + tax - promoDiscount)

  const freeShippingThreshold = settings.shipping?.freeShippingThreshold || 100
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100)

  function goToCheckout() {
    // Save promo info before navigation
    if (setAppliedPromo) {
      setAppliedPromo({ 
        code: promoCode, 
        discount: promoDiscount 
      })
    }
    // Navigate to checkout
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <FaShoppingBag className="text-6xl text-muted mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted mb-6">Add some products to get started</p>
        <button
          onClick={() => navigate('/store')}
          className="bg-brand text-white px-6 py-2.5 rounded-full hover:bg-accent transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(([id, qty]) => {
            const p = products.find(x => x.id === Number(id))
            if (!p) return null

            return (
              <div key={id} className="bg-surface rounded-xl border border-border p-4 flex gap-4">
                <div className="w-24 h-24 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-4xl shrink-0">
                  {p.images?.[0] || p.image_url ? (
                    <img src={p.images?.[0] || p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    p.emoji
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{p.name}</h3>
                  <p className="text-sm text-muted mb-3">{p.category}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-bg border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(id, qty - 1)}
                        className="p-2 hover:bg-surface transition-colors"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="w-8 text-center font-medium">{qty}</span>
                      <button
                        onClick={() => updateQuantity(id, qty + 1)}
                        disabled={qty >= p.stock}
                        className="p-2 hover:bg-surface transition-colors disabled:opacity-50"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                    
                    <p className="font-bold text-lg">{formatPrice(p.price * qty)}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(id)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-6 sticky top-20">
            <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>

            {/* Free Shipping Progress */}
            {subtotal < freeShippingThreshold && (
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">
                    {formatPrice(freeShippingThreshold - subtotal)} away from free shipping
                  </span>
                  <span className="font-medium">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="h-2 bg-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand to-accent transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Promo Code */}
            <div className="mb-4 pb-4 border-b border-border">
              <label className="block text-xs text-muted mb-2">Promo Code</label>
              {promoDiscount > 0 ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-green-700">{promoCode}</span>
                  <button onClick={removePromo} className="text-green-700 hover:text-green-900">
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-accent transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && <p className="text-xs text-red-600 mt-2">{promoError}</p>}
              {promoSuccess && <p className="text-xs text-green-600 mt-2">{promoSuccess}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={goToCheckout}
              className="w-full py-3 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/store')}
              className="w-full py-2 mt-2 text-sm text-muted hover:text-brand transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}