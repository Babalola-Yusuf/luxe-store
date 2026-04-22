import { useState, useEffect } from 'react'
import { fetchDashboardStats, fetchOrders } from '../../data/api'
import { REV_CHART } from '../../data'
import StatusPill from '../../components/StatusPill'

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchOrders(),
    ]).then(([s, o]) => {
      setStats(s)
      setOrders(o.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const maxRev = Math.max(...REV_CHART.values)

  const STAT_KEYS = [
    { label: 'Total Revenue',   key: 'revenue',   up: true  },
    { label: 'Orders',          key: 'orders',    up: true  },
    { label: 'Customers',       key: 'customers', up: true  },
    { label: 'Avg Order Value', key: 'avgOrder',  up: false },
  ]

  function formatDate(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl font-semibold">Dashboard</h2>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 border border-border rounded-lg text-[13px] hover:bg-bg transition-colors">Export</button>
          <button className="px-4 py-1.5 bg-accent text-white rounded-lg text-[13px] hover:opacity-85 transition-opacity">+ New Product</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STAT_KEYS.map(({ label, key, up }) => (
          <div key={label} className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[11px] text-muted uppercase tracking-wide mb-1">{label}</p>
            {loading ? (
              <div className="h-7 bg-[#f0ede8] rounded animate-pulse w-24 mt-1" />
            ) : (
              <p className="font-display text-2xl font-semibold">{stats?.[key] ?? '—'}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-[13px] font-medium text-muted mb-3">Revenue — last 7 days</h3>
          <div className="flex items-end gap-1.5 h-20">
            {REV_CHART.values.map((v, i) => (
              <div key={i} title={`$${v.toLocaleString()}`} className="flex-1 rounded-t" style={{
                height: `${(v / maxRev * 100).toFixed(0)}%`,
                background: i >= 5 ? '#e94560' : '#1a1a2e',
                opacity: 0.75,
              }} />
            ))}
          </div>
          <div className="flex gap-1.5 mt-1">
            {REV_CHART.days.map(d => (
              <span key={d} className="flex-1 text-[10px] text-muted text-center">{d}</span>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-[13px] font-medium text-muted mb-3">Sales by category</h3>
          <div className="flex items-center gap-4">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e8e4dc" strokeWidth="16"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#1a1a2e" strokeWidth="16" strokeDasharray="75.4 113.1" strokeDashoffset="0" transform="rotate(-90 40 40)"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e94560" strokeWidth="16" strokeDasharray="45.2 143.3" strokeDashoffset="-75.4" transform="rotate(-90 40 40)"/>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#f5a623" strokeWidth="16" strokeDasharray="37.7 150.8" strokeDashoffset="-120.6" transform="rotate(-90 40 40)"/>
            </svg>
            <div className="space-y-1.5">
              {[['#1a1a2e','Tech 40%'],['#e94560','Fashion 24%'],['#f5a623','Home 20%'],['#e8e4dc','Other 16%']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders — now live from Supabase */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <h3 className="text-sm font-medium">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                {['Order ID', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] text-muted uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-[#f0ede8] rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">
                    No orders yet. Place one from the store!
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-accent">{o.id}</td>
                    <td className="px-4 py-2.5 font-medium">${Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-2.5 text-muted">{formatDate(o.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}