import { useState, useEffect } from 'react'
import { fetchOrders, updateOrderStatus } from '../../data/api'
import { supabase } from '../../lib/supabase'
import { FaSync } from 'react-icons/fa'
import StatusPill from '../../components/StatusPill'
import Modal from '../../components/Modal'

const STATUSES = ['Processing', 'Delivered', 'Pending', 'Cancelled']

export default function Orders() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [updating, setUpdating]   = useState(null)
  const [trackingModal, setTrackingModal] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    load()
  }, [search, statusFilter])

  async function load() {
    setLoading(true)
    try {
      const data = await fetchOrders({ search, status: statusFilter })
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
    } finally {
      setUpdating(null)
    }
  }

  async function handleUpdateTracking(orderId) {
    if (!trackingNumber) return
    try {
      await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber })
        .eq('id', orderId)
      
      setTrackingModal(null)
      setTrackingNumber('')
      load()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  function formatDate(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short'
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl font-semibold">Orders</h2>
        <button
          onClick={load}
          className="px-4 py-1.5 border border-border rounded-lg text-[13px] hover:bg-bg transition-colors flex items-center gap-2"
        >
          <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID..."
          className="flex-1 min-w-[180px] px-3 py-2 border border-border rounded-lg text-[13px] bg-surface outline-none focus:border-brand"
        />
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-[13px] bg-surface cursor-pointer outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {['Order ID', 'Total', 'Status', 'Tracking', 'Date', 'Update Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] text-muted uppercase tracking-wide font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-[#f0ede8] rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-accent">{o.id}</td>
                    <td className="px-4 py-2.5 font-medium">${Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-2.5">
                      {o.tracking_number ? (
                        <div className="text-xs">
                          <p className="font-mono text-brand">{o.tracking_number}</p>
                          <button
                            onClick={() => {
                              setTrackingModal(o.id)
                              setTrackingNumber(o.tracking_number)
                            }}
                            className="text-accent hover:underline text-[10px]"
                          >
                            Update
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setTrackingModal(o.id)
                            setTrackingNumber('')
                          }}
                          className="text-xs text-accent hover:underline"
                        >
                          Add Tracking
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted whitespace-nowrap">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="px-2 py-1 border border-border rounded text-[11px] bg-surface cursor-pointer outline-none disabled:opacity-50"
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <Modal
          isOpen={true}
          onClose={() => setTrackingModal(null)}
          title="Update Tracking Number"
        >
          <div className="px-6 py-5">
            <label className="block text-xs text-muted mb-2">Tracking Number</label>
            <input
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="1Z999AA10123456784"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateTracking(trackingModal)}
                className="flex-1 py-2 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setTrackingModal(null)}
                className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}