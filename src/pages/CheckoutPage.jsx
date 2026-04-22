import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { fetchProducts, placeOrder, createPaymentIntent } from '../data/api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function FormField({ label, type = 'text', placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] text-muted mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] bg-bg text-brand outline-none focus:border-brand transition-colors"
      />
    </div>
  )
}

function PaymentForm({ total, onSuccess, form, setForm }) {
  const stripe      = useStripe()
  const elements    = useElements()
  const { clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  function set(k) {
    return (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit() {
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
          <FormField label="First name" value={form.firstName} onChange={set('firstName')} />
          <FormField label="Last name"  value={form.lastName}  onChange={set('lastName')}  />
        </div>
        <FormField label="Email" type="email" value={form.email} onChange={set('email')} />
      </div>

      {/* Shipping */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-3">
        <h3 className="text-[11px] font-medium text-muted uppercase tracking-wider mb-3">
          Shipping Address
        </h3>
        <div className="mb-3">
          <FormField label="Street address" value={form.address} onChange={set('address')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="City"  value={form.city}  onChange={set('city')}  />
          <FormField label="State" value={form.state} onChange={set('state')} />
        </div>
      </div>

      {/* Stripe Payment Element */}
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
        className="w-full py-3.5 bg-brand text-white rounded-xl text-[15px] font-medium hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing payment…' : `Pay $${total.toFixed(2)}`}
      </button>

      <p className="text-center text-[11px] text-muted mt-3">
        Test card: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any CVC
      </p>
    </div>
  )
}

export default function CheckoutPage({ setView, setOrderId }) {
  const { cart } = useCart()

  const [products, setProducts]             = useState([])
  const [clientSecret, setClientSecret]     = useState(null)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [preparing, setPreparing]           = useState(true)
  const [error, setError]                   = useState(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    address: '', city: '', state: '',
  })

  const items = Object.entries(cart).filter(([, q]) => q > 0)

  const subtotal = items.reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id))
    return sum + (p ? p.price * qty : 0)
  }, 0)
  const shipping = subtotal >= 50 ? 0 : 5.99
  const tax      = subtotal * 0.085
  const total    = subtotal + shipping + tax

  useEffect(() => {
    if (items.length === 0) { setPreparing(false); return }

    fetchProducts().then(async (prods) => {
      setProducts(prods)

      // Calculate total from live prices
      const sub = items.reduce((sum, [id, qty]) => {
        const p = prods.find(x => x.id === Number(id))
        return sum + (p ? p.price * qty : 0)
      }, 0)
      const t = parseFloat((sub + (sub >= 50 ? 0 : 5.99) + sub * 0.085).toFixed(2))

      try {
        // 1. Save order to Supabase
        const orderId = await placeOrder({ cartItems: items, total: t })
        setCurrentOrderId(orderId)

        // 2. Create Stripe PaymentIntent
        const secret = await createPaymentIntent({ amount: t, orderId })
        setClientSecret(secret)
      } catch (err) {
        setError(err.message)
      } finally {
        setPreparing(false)
      }
    })
  }, [])

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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 pb-10">
      <h2 className="font-display text-xl font-semibold mb-4">Checkout</h2>

      {/* Order total bar */}
      <div className="flex justify-between items-center bg-surface border border-border rounded-xl px-4 py-3.5 mb-4">
        <span className="text-sm text-muted">Order total</span>
        <span className="text-xl font-semibold text-accent">
          {products.length === 0 ? '—' : `$${total.toFixed(2)}`}
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {preparing ? (
        // Loading skeleton while order is being created
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4 animate-pulse">
              <div className="h-3 bg-[#f0ede8] rounded w-24 mb-3" />
              <div className="h-10 bg-[#f0ede8] rounded" />
            </div>
          ))}
        </div>
      ) : clientSecret ? (
        // Stripe Elements loaded and ready
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary:    '#1a1a2e',
                colorBackground: '#ffffff',
                borderRadius:    '8px',
                fontFamily:      '"DM Sans", sans-serif',
              },
            },
          }}
        >
          <PaymentForm
            total={total}
            form={form}
            setForm={setForm}
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
  )
}