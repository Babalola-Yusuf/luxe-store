import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaSearch, FaTruck, FaCheckCircle, FaTimesCircle, FaBox } from 'react-icons/fa'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleTrack() {
    if (!orderId) return
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.toUpperCase())
        .single()
      
      if (error) throw new Error('Order not found')
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const statusSteps = [
    { key: 'Pending', label: 'Order Placed', icon: FaBox },
    { key: 'Processing', label: 'Processing', icon: FaTruck },
    { key: 'Delivered', label: 'Delivered', icon: FaCheckCircle },
  ]

  const currentStepIndex = order 
    ? statusSteps.findIndex(s => s.key === order.status)
    : -1

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-center mb-8">Track Your Order</h1>

      {/* Search */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <label className="block text-sm font-medium mb-3">Enter Order ID</label>
        <div className="flex gap-3">
          <input
            value={orderId}
            onChange={e => setOrderId(e.target.value.toUpperCase())}
            placeholder="#ORD-1234"
            className="flex-1 px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-brand"
          />
          <button
            onClick={handleTrack}
            disabled={loading || !orderId}
            className="px-8 py-3 bg-brand text-white rounded-xl font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FaSearch /> {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}
      </div>

      {/* Order details */}
      {order && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="font-display text-xl font-semibold mb-1">{order.id}</h2>
              <p className="text-sm text-muted">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Total</p>
              <p className="text-2xl font-bold text-accent">${Number(order.total).toFixed(2)}</p>
            </div>
          </div>

          {/* Tracking number */}
          {order.tracking_number && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <p className="text-xs text-blue-700 uppercase tracking-wide mb-1">Tracking Number</p>
              <p className="font-mono text-lg font-semibold text-blue-900">{order.tracking_number}</p>
            </div>
          )}

          {/* Progress stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isActive = index <= currentStepIndex
                const isCancelled = order.status === 'Cancelled'
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isCancelled && index === currentStepIndex
                        ? 'bg-red-500 text-white'
                        : isActive
                        ? 'bg-brand text-white'
                        : 'bg-surface border-2 border-border text-muted'
                    }`}>
                      {isCancelled && index === currentStepIndex ? (
                        <FaTimesCircle className="text-2xl" />
                      ) : (
                        <Icon className="text-xl" />
                      )}
                    </div>
                    <p className={`text-xs mt-2 text-center ${
                      isActive ? 'font-medium text-brand' : 'text-muted'
                    }`}>
                      {isCancelled && index === currentStepIndex ? 'Cancelled' : step.label}
                    </p>
                    {index < statusSteps.length - 1 && (
                      <div className={`absolute w-full h-1 top-7 left-1/2 -z-10 transition-all ${
                        index < currentStepIndex ? 'bg-brand' : 'bg-border'
                      }`} style={{ width: 'calc(100% - 56px)' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Estimated delivery */}
          {order.estimated_delivery && (
            <div className="text-center">
              <p className="text-sm text-muted">Estimated Delivery</p>
              <p className="text-lg font-semibold">
                {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}