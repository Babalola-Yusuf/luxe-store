import { useState, useEffect } from 'react'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../data/api'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'
import Modal from '../../components/Modal'
import StatusPill from '../../components/StatusPill'

const COLORS = ['#1a1a2e', '#e94560', '#f5a623', '#16a34a', '#7c3aed', '#0891b2', '#db2777']

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData]   = useState({
    name: '', email: '', initials: '', color: COLORS[0], status: 'Active',
  })
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  function openAddModal() {
    setEditingId(null)
    setFormData({
      name: '', email: '', initials: '', color: COLORS[0], status: 'Active',
    })
    setShowModal(true)
  }

  function openEditModal(customer) {
    setEditingId(customer.id)
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      initials: customer.initials || '',
      color: customer.color || COLORS[0],
      status: customer.status || 'Active',
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const data = {
        name: formData.name,
        email: formData.email,
        initials: formData.initials,
        color: formData.color,
        status: formData.status,
      }

      if (editingId) {
        await updateCustomer(editingId, data)
      } else {
        await createCustomer(data)
      }

      await loadCustomers()
      setShowModal(false)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(customerId) {
    if (!confirm('Delete this customer? This cannot be undone.')) return
    setDeleting(customerId)
    try {
      await deleteCustomer(customerId)
      await loadCustomers()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  function set(key) {
    return (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))
  }

  function formatDate(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl font-semibold">Customers</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
        >
          <FaPlus /> Add Customer
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface outline-none focus:border-brand"
        />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {['', 'Customer', 'Email', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-muted uppercase tracking-wide font-medium">{h}</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.initials}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.email}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(c.joined)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Customer' : 'Add New Customer'}
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Full Name *</label>
            <input
              value={formData.name}
              onChange={set('name')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              placeholder="Amara Osei"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={set('email')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              placeholder="amara@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Initials</label>
              <input
                value={formData.initials}
                onChange={set('initials')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="AO"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Status</label>
              <select
                value={formData.status}
                onChange={set('status')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-2">Avatar Color</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-brand scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.email}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving ? 'Saving...' : editingId ? 'Update Customer' : 'Create Customer'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}