import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { fetchProducts, placeOrder, createPaymentIntent, validatePromoCode, incrementPromoUse } from '../data/api'
import { FaLock, FaShieldAlt, FaUndo, FaTag, FaTimes, FaCheckCircle } from 'react-icons/fa'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const STEPS = ['Cart', 'Checkout', 'Payment']

function ProgressStepper({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                index <= currentStep
                  ? 'bg-brand text-white'
                  : 'bg-surface border-2 border-border text-muted'
              }`}>
                {index < currentStep ? <FaCheckCircle /> : index + 1}
              </div>
              <span className="text-xs mt-2 text-muted">{step}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-1 mx-2 transition-all ${
                index < currentStep ? 'bg-brand' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FormField({ label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-[11px] text-muted mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 border rounded-lg text-[13px] bg-bg text-brand outline-none transition-colors ${
          error ? 'border-red-500' : 'border-border focus:border-brand'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function OrderSummary({ products, cart, subtotal, shipping, tax, discount, total, promoCode, onRemovePromo, formatPrice }) {
  const items = Object.entries(cart).filter(([, q]) => q > 0)

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 sticky top-4">
      <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map(([id, qty]) => {
          const p = products.find(x => x.id === Number(id))
          if (!p) return null
          return (
            <div key={id} className="flex gap-3">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-border" />
              ) : (
                <div className="w-12 h-12 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-xl border border-border">
                  {p.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-muted">Qty: {qty}</p>
              </div>
              <p className="text-xs font-semibold">${(p.price * qty).toFixed(2)}</p>
            </div>
          )
        })}
      </div>

      {/* Promo code display */}
      {promoCode && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center gap-2 text-green-700 text-xs">
            <FaTag />
            <span className="font-medium">{promoCode}</span>
          </div>
          <button onClick={onRemovePromo} className="text-green-600 hover:text-green-800">
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-accent">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <FaLock className="text-green-600" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <FaShieldAlt className="text-green-600" />
          <span>30-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <FaUndo className="text-green-600" />
          <span>Free returns within 14 days</span>
        </div>
      </div>
    </div>
  )
}

function PaymentForm({ total, promoCode, onSuccess, form, setForm, formErrors, setFormErrors }) {
  const stripe = useStripe()
  const elements = useElements()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(k) {
    return (e) => {
      setForm(f => ({ ...f, [k]: e.target.value }))
      setFormErrors(prev => ({ ...prev, [k]: '' }))
    }
  }

  function validateForm() {
    const errors = {}
    if (!form.firstName) errors.firstName = 'Required'
    if (!form.lastName) errors.lastName = 'Required'
    if (!form.email) errors.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email'
    if (!form.address) errors.address = 'Required'
    if (!form.city) errors.city = 'Required'
    if (!form.state) errors.state = 'Required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) return
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
      return
    }

    if (promoCode) {
      try {
        await incrementPromoUse(promoCode)
      } catch (err) {
        console.error('Failed to increment promo usage:', err)
      }
    }

    clearCart()
    onSuccess()
    setLoading(false)
  }

  return (
    <div>
      {/* Contact */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-3">
        <h3 className="text-[11px] font-medium text-muted uppercase tracking-wider mb-3">
          Contact Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <FormField label="First name" value={form.firstName} onChange={set('firstName')} error={formErrors.firstName} />
          <FormField label="Last name" value={form.lastName} onChange={set('lastName')} error={formErrors.lastName} />
        </div>
        <FormField label="Email" type="email" value={form.email} onChange={set('email')} error={formErrors.email} />
      </div>

      {/* Shipping */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-3">
        <h3 className="text-[11px] font-medium text-muted uppercase tracking-wider mb-3">
          Shipping Address
        </h3>
        <div className="mb-3">
          <FormField label="Street address" value={form.address} onChange={set('address')} error={formErrors.address} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="City" value={form.city} onChange={set('city')} error={formErrors.city} />
          <FormField label="State" value={form.state} onChange={set('state')} error={formErrors.state} />
        </div>
      </div>

      {/* Payment */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-4">
        <h3 className="text-[11px] font-medium text-muted uppercase tracking-wider mb-3">
          Payment
        </h3>
        <PaymentElement />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!stripe || loading}
        className="w-full py-3.5 bg-brand text-white rounded-xl text-[15px] font-medium hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaLock />
        {loading ? 'Processing payment…' : `Pay $${total.toFixed(2)}`}
      </button>

      <p className="text-center text-[11px] text-muted mt-3">
        Test card: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any CVC
      </p>
    </div>
  )
}

export default function CheckoutPage({ setView, setOrderId, appliedPromo }) {
  const { cart } = useCart()
  const { formatPrice, calculateShipping, calculateTax, settings } = useSettings()
  const hasRun = useRef(false)

  const [products, setProducts] = useState([])
  const [clientSecret, setClientSecret] = useState(null)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [preparing, setPreparing] = useState(true)
  const [error, setError] = useState(null)
  const [promoCode, setPromoCode] = useState(appliedPromo?.code || '')
  const [promoInput, setPromoInput] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(appliedPromo?.discount || 0)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    address: '', city: '', state: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const items = Object.entries(cart).filter(([, q]) => q > 0)
  const subtotal = items.reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id))
    return sum + (p ? p.price * qty : 0)
  }, 0)
  
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const discount = promoDiscount
  const total = Math.max(0, subtotal + shipping + tax - discount)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    if (items.length === 0) { setPreparing(false); return }

    fetchProducts().then(async (prods) => {
      setProducts(prods)

      const sub = items.reduce((sum, [id, qty]) => {
        const p = prods.find(x => x.id === Number(id))
        return sum + (p ? p.price * qty : 0)
      }, 0)
      const ship = calculateShipping(sub)
      const taxAmount = calculateTax(sub)
      const discountAmount = appliedPromo?.discount || 0
      const t = Math.max(0, parseFloat((sub + ship + taxAmount - discountAmount).toFixed(2)))

      try {
        const orderId = await placeOrder({ cartItems: items, total: t })
        setCurrentOrderId(orderId)

        const currency = settings.general?.currency || 'USD'
        const secret = await createPaymentIntent({
          amount: t,
          orderId,
          currency,
        })
        setClientSecret(secret)
      } catch (err) {
        setError(err.message)
      } finally {
        setPreparing(false)
      }
    })
  }, [])

  async function handleApplyPromo() {
    if (!promoInput) return
    setApplyingPromo(true)
    setPromoError('')

    try {
      const promo = await validatePromoCode(promoInput)
      setPromoCode(promo.code)

      if (promo.discount_percent) {
        setPromoDiscount((subtotal * promo.discount_percent) / 100)
      } else if (promo.discount_amount) {
        setPromoDiscount(promo.discount_amount)
      }

      setPromoInput('')
    } catch (err) {
      setPromoError(err.message)
    } finally {
      setApplyingPromo(false)
    }
  }

  function handleRemovePromo() {
    setPromoCode('')
    setPromoDiscount(0)
  }

  function handleSuccess() {
    setOrderId(currentOrderId)
    setView('success')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <p className="text-muted text-sm">Your cart is empty.</p>
        <button
          onClick={() => setView('store')}
          className="mt-4 bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
        >
          Back to Store
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ProgressStepper currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-semibold mb-6">Checkout</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Promo code input */}
          {!promoCode && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-4">
              <label className="block text-xs font-medium text-muted mb-2">Have a promo code?</label>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={applyingPromo || !promoInput}
                  className="px-6 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {applyingPromo ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
            </div>
          )}

          {preparing ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface rounded-xl border border-border p-4 animate-pulse">
                  <div className="h-3 bg-[#f0ede8] rounded w-24 mb-3" />
                  <div className="h-10 bg-[#f0ede8] rounded" />
                </div>
              ))}
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: settings.appearance?.primaryColor || '#1a1a2e',
                    colorBackground: '#ffffff',
                    borderRadius: '8px',
                    fontFamily: '"DM Sans", sans-serif',
                  },
                },
                locale: 'auto',
              }}
            >
              <PaymentForm
                total={total}
                promoCode={promoCode}
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                onSuccess={handleSuccess}
              />
            </Elements>
          ) : (
            !error && (
              <div className="text-center py-10 text-muted text-sm">
                Preparing checkout…
              </div>
            )
          )}
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            products={products}
            cart={cart}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            discount={discount}
            total={total}
            promoCode={promoCode}
            onRemovePromo={handleRemovePromo}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </div>
  )
}
