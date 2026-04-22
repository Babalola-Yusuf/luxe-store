import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import StatusPill from '../components/StatusPill'

export default function MyOrdersPage({ setView, session }) {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) { setView('login'); return }

    supabase
      .from('orders')
      .select('*, order_items(quantity, product_id)')
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []))
      .finally(() => setLoading(false))
  }, [session])

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (!session) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-display text-2xl font-semibold mb-6">My Orders</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-[#f0ede8] rounded w-32 mb-2" />
              <div className="h-3 bg-[#f0ede8] rounded w-20" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="font-display text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted text-sm mb-6">Start shopping to see your orders here.</p>
          <button
            onClick={() => setView('store')}
            className="bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
          >
            Browse Store
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-accent">{o.id}</p>
                  <p className="text-[12px] text-muted mt-0.5">{formatDate(o.created_at)}</p>
                </div>
                <StatusPill status={o.status} />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <p className="text-[12px] text-muted">
                  {o.order_items?.length || 0} item{o.order_items?.length !== 1 ? 's' : ''}
                </p>
                <p className="font-semibold text-sm">${Number(o.total).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}