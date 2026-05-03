import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'

export default function SuccessPage({ orderId, setView }) {
  const { formatPrice, settings } = useSettings()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!orderId) return

    async function loadOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (error) throw error
        setOrder(data)
      } catch (err) {
        console.error('Failed to load order:', err)
      }
    }

    loadOrder()
  }, [orderId])

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">✓</div>
      <h2 className="font-display text-2xl font-semibold mb-2">Order Confirmed!</h2>
      <p className="text-muted text-sm mb-1">Your order has been placed and is being processed.</p>
      <p className="font-semibold text-accent text-base mt-1">{orderId}</p>
      {order && (
        <>
          <p className="text-3xl font-bold text-accent mt-4 mb-2">{formatPrice(order.total)}</p>
          <p className="text-sm text-muted mb-6">
            Estimated delivery: {settings.shipping.estimatedDays} business days
          </p>
        </>
      )}
      <button
        onClick={() => setView('store')}
        className="mt-8 px-8 py-2.5 bg-brand text-white rounded-full text-sm hover:bg-accent transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  )
}
