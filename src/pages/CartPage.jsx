import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../data/api'

export default function CartPage({ setView }) {
  const { cart, changeQty, removeItem } = useCart()
  const [products, setProducts] = useState([])

  // Load all products once so we can look up names/prices/emojis
  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])

  const items = Object.entries(cart).filter(([, q]) => q > 0)

  const subtotal = items.reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === Number(id))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const shipping = subtotal >= 50 ? 0 : 5.99
  const tax      = subtotal * 0.085
  const total    = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted text-sm mb-6">Add some products to get started.</p>
        <button
          onClick={() => setView('store')}
          className="bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 border-b border-border">
        <h2 className="font-display text-xl font-semibold">Your Cart</h2>
      </div>

      {/* Items */}
      <div className="px-4 sm:px-6 divide-y divide-border">
        {items.map(([id, qty]) => {
          const p = products.find((x) => x.id === Number(id))

          // Still loading product data — show a placeholder row
          if (!p) return (
            <div key={id} className="flex gap-3 py-4 items-center animate-pulse">
              <div className="w-14 h-14 bg-[#f0ede8] rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#f0ede8] rounded w-2/3" />
                <div className="h-3 bg-[#f0ede8] rounded w-1/4" />
              </div>
            </div>
          )

          return (
            <div key={id} className="flex gap-3 py-4 items-center">
              <div className="w-14 h-14 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-2xl border border-border shrink-0">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px] truncate">{p.name}</p>
                <p className="text-accent font-semibold text-sm mt-0.5">
                  ${(p.price * qty).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={() => changeQty(p.id, -1)}
                    className="w-6 h-6 rounded-full border border-border text-base flex items-center justify-center hover:bg-bg transition-colors"
                  >−</button>
                  <span className="text-[13px] font-medium w-4 text-center">{qty}</span>
                  <button
                    onClick={() => changeQty(p.id, 1)}
                    className="w-6 h-6 rounded-full border border-border text-base flex items-center justify-center hover:bg-bg transition-colors"
                  >+</button>
                </div>
              </div>
              <button
                onClick={() => removeItem(p.id)}
                className="text-muted text-lg hover:text-red-500 transition-colors px-1"
              >×</button>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mx-4 sm:mx-6 my-4 bg-surface rounded-xl border border-border p-4 space-y-2">
        <div className="flex justify-between text-[13px] text-muted">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-muted">
          <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-[13px] text-muted">
          <span>Tax (8.5%)</span><span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-[15px] pt-2 mt-1 border-t border-border">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8">
        <button
          onClick={() => setView('checkout')}
          className="w-full py-3 bg-accent text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  )
}