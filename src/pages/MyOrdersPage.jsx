import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchOrders } from '../data/api'
import { useSettings } from '../context/SettingsContext'
import { FaBox, FaShoppingBag } from 'react-icons/fa'
import StatusPill from '../components/StatusPill'

export default function MyOrdersPage({ session }) {
  const navigate = useNavigate()
  const { formatPrice } = useSettings()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      navigate('/login')
      return
    }

    loadOrders()
  }, [session, navigate])

  async function loadOrders() {
    try {
      const allOrders = await fetchOrders()
      // Filter orders for current user
      const myOrders = allOrders.filter(o => o.customer_id === session.user.id)
      setOrders(myOrders)
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FaBox className="text-3xl text-accent" />
        <h1 className="font-display text-3xl font-bold">My Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-6 animate-pulse">
              <div className="h-4 bg-[#f0ede8] rounded w-1/4 mb-3" />
              <div className="h-3 bg-[#f0ede8] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <FaShoppingBag className="text-6xl text-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted text-sm mb-6">
            Start shopping to see your orders here
          </p>
          <button
            onClick={() => navigate('/store')}
            className="bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-lg mb-1">{order.id}</p>
                  <p className="text-sm text-muted">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted mb-1">Total</p>
                  <p className="text-xl font-bold text-accent">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusPill status={order.status} />
                
                {order.tracking_number && (
                  <div className="text-sm">
                    <span className="text-muted">Tracking: </span>
                    <span className="font-mono font-medium">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}