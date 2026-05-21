import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { fetchProducts, placeOrder } from '../data/api'
import { PaystackButton } from 'react-paystack'
import { FaCheckCircle, FaShieldAlt, FaUndo, FaTruck } from 'react-icons/fa'

export default function CheckoutPage({ setOrderId, appliedPromo }) {
  const navigate = useNavigate()
  const { items = [], clearCart } = useCart()
  const { formatPrice, calculateShipping, calculateTax, settings } = useSettings()
  
  const [step, setStep] = useState(1)
  const [products, setProducts] = useState([])
  const [preparing, setPreparing] = useState(true)
  const [error, setError] = useState(null)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
  })

  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    if (!items || items.length === 0) {
      setPreparing(false)
      return
    }

    fetchProducts().then(async (prods) => {
      setProducts(prods)

      const sub = items.reduce((sum, [id, qty]) => {
        const p = prods.find(x => x.id === Number(id))
        return sum + (p ? p.price * qty : 0)
      }, 0)

      const ship = calculateShipping(sub)
      const taxAmount = calculateTax(sub)
      const total = parseFloat((sub + ship + taxAmount).toFixed(2))

      try {
        // Create order
        const orderId = await placeOrder({ cartItems: items, total })
        setCurrentOrderId(orderId)
      } catch (err) {
        setError(err.message)
      } finally {
        setPreparing(false)
      }
    }).catch((err) => {
      setError(err.message)
      setPreparing(false)
    })
  }, [])

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))

  // Safety check: ensure items is an array before using reduce
  const subtotal = Array.isArray(items) ? items.reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id))
    return sum + (p ? p.price * qty : 0)
  }, 0) : 0

  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const discount = appliedPromo?.discount || 0
  const total = Math.max(0, subtotal + shipping + tax - discount)

  // Paystack configuration
  const paystackConfig = {
    reference: currentOrderId || `ORD-${Date.now()}`,
    email: formData.email,
    amount: Math.round(total * 100), // Amount in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: settings.general?.currency || 'NGN',
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${formData.firstName} ${formData.lastName}`
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: formData.phone
        },
        {
          display_name: "Order ID",
          variable_name: "order_id",
          value: currentOrderId
        }
      ]
    }
  }

  const handlePaystackSuccess = async (reference) => {
    console.log('Payment successful:', reference)
    
    // Update order status
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'charge.success',
        data: {
          reference: reference.reference,
          status: 'success',
          order_id: currentOrderId
        }
      })
    })

    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            orderId: currentOrderId,
            customerEmail: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`,
            items: items.map(([id, qty]) => {
              const product = products.find(p => p.id === Number(id))
              return {
                name: product?.name || 'Product',
                emoji: product?.emoji,
                quantity: qty,
                price: product?.price || 0,
              }
            }),
            total,
            shippingAddress: `${formData.firstName} ${formData.lastName}\n${formData.address}\n${formData.city}, ${formData.state}\n${formData.country}\nPhone: ${formData.phone}`,
            currency: settings.general?.currency === 'NGN' ? '₦' : '$',
          }),
        }
      )
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
    }

    clearCart()
    if (setOrderId) setOrderId(currentOrderId)
    navigate('/success')
  }

  const handlePaystackClose = () => {
    console.log('Payment closed')
  }

  const componentProps = {
    ...paystackConfig,
    text: `Pay ${formatPrice(total)}`,
    onSuccess: handlePaystackSuccess,
    onClose: handlePaystackClose,
  }

  // Early return for empty cart
  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/store')}
          className="bg-brand text-white px-6 py-2.5 rounded-full hover:bg-accent transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  if (preparing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted">Preparing your order...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/cart')}
          className="bg-brand text-white px-6 py-2.5 rounded-full hover:bg-accent transition-colors"
        >
          Back to Cart
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['Cart', 'Checkout', 'Payment'].map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-2 ${i + 1 <= step ? 'text-brand' : 'text-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i + 1 < step ? 'bg-brand text-white' : i + 1 === step ? 'bg-brand text-white' : 'bg-surface border border-border'
              }`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{label}</span>
            </div>
            {i < 2 && <div className="w-12 h-0.5 bg-border mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="font-display text-xl font-bold mb-6">Shipping Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">First Name *</label>
                  <input
                    value={formData.firstName}
                    onChange={set('firstName')}
                    required
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Last Name *</label>
                  <input
                    value={formData.lastName}
                    onChange={set('lastName')}
                    required
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={set('email')}
                  required
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={set('phone')}
                  required
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                  placeholder="+234 801 234 5678"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Street Address *</label>
                <input
                  value={formData.address}
                  onChange={set('address')}
                  required
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">City *</label>
                  <input
                    value={formData.city}
                    onChange={set('city')}
                    required
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                    placeholder="Lagos"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">State *</label>
                  <input
                    value={formData.state}
                    onChange={set('state')}
                    required
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                    placeholder="Lagos State"
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <FaShieldAlt className="text-2xl text-green-500 mx-auto mb-2" />
                <p className="text-xs text-muted">Secure Payment</p>
              </div>
              <div className="text-center">
                <FaUndo className="text-2xl text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-muted">30-Day Returns</p>
              </div>
              <div className="text-center">
                <FaTruck className="text-2xl text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-muted">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-6 sticky top-20">
            <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(([id, qty]) => {
                const p = products.find(x => x.id === Number(id))
                if (!p) return null
                return (
                  <div key={id} className="flex gap-3">
                    <div className="w-12 h-12 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-2xl shrink-0">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted">Qty: {qty}</p>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(p.price * qty)}</p>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2 py-4 border-t border-border text-sm">
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
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedPromo.code})</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Paystack Payment Button */}
            <PaystackButton
              {...componentProps}
              className="w-full py-3 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.email || !formData.firstName || !formData.lastName || !formData.phone || !formData.address}
            />

            <p className="text-xs text-muted text-center mt-4">
              Secured by Paystack. Your payment information is encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
