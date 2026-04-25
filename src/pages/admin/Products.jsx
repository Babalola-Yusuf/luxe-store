import { useState, useEffect } from 'react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../data/api'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import Modal from '../../components/Modal'
import StatusPill from '../../components/StatusPill'

const CATEGORIES = ['tech', 'fashion', 'home', 'beauty', 'sports']

export default function Products() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catFilter, setCat]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData]   = useState({
    name: '', price: '', original_price: '', emoji: '', category: 'tech',
    rating: '★★★★★', badge: '', stock: 0, image_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p => {
    const matchQ = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchC = !catFilter || p.category.toLowerCase() === catFilter.toLowerCase()
    return matchQ && matchC
  })

  function openAddModal() {
    setEditingId(null)
    setFormData({
      name: '', price: '', original_price: '', emoji: '', category: 'tech',
      rating: '★★★★★', badge: '', stock: 0, image_url: '',
    })
    setShowModal(true)
  }

  function openEditModal(product) {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      price: product.price,
      original_price: product.original_price || '',
      emoji: product.emoji || '',
      category: product.category,
      rating: product.rating || '★★★★★',
      badge: product.badge || '',
      stock: product.stock,
      image_url: product.image_url || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        emoji: formData.emoji,
        category: formData.category,
        rating: formData.rating,
        badge: formData.badge || null,
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
      }

      if (editingId) {
        await updateProduct(editingId, data)
      } else {
        await createProduct(data)
      }

      await loadProducts()
      setShowModal(false)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(productId) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeleting(productId)
    try {
      await deleteProduct(productId)
      await loadProducts()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  function set(key) {
    return (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl font-semibold">Products</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-[180px] px-3 py-2 border border-border rounded-lg text-sm bg-surface outline-none focus:border-brand"
        />
        <select
          value={catFilter}
          onChange={e => setCat(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-surface cursor-pointer outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {['', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-muted uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-[#f0ede8] rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted text-sm">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-lg border border-border">
                          {p.emoji}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[10px] text-muted">ID: {p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted capitalize">{p.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">${p.price}</p>
                      {p.original_price && (
                        <p className="text-[10px] text-muted line-through">${p.original_price}</p>
                      )}
                    </td>
                    <td className={`px-4 py-3 font-medium ${p.stock < 15 ? 'text-red-500' : 'text-muted'}`}>
                      {p.stock}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={p.stock > 0 ? 'Active' : 'Out of Stock'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
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
        title={editingId ? 'Edit Product' : 'Add New Product'}
      >
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Product Name *</label>
              <input
                value={formData.name}
                onChange={set('name')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="Wireless Headphones"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={set('category')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={set('price')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="99.99"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={set('original_price')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="129.99"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={set('stock')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Image URL</label>
            <input
              value={formData.image_url}
              onChange={set('image_url')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Emoji</label>
              <input
                value={formData.emoji}
                onChange={set('emoji')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="🎧"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Badge</label>
              <select
                value={formData.badge}
                onChange={set('badge')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
              >
                <option value="">None</option>
                <option value="sale">Sale</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Rating</label>
            <select
              value={formData.rating}
              onChange={set('rating')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
            >
              <option value="★★★★★">★★★★★ (5 stars)</option>
              <option value="★★★★☆">★★★★☆ (4 stars)</option>
              <option value="★★★☆☆">★★★☆☆ (3 stars)</option>
              <option value="★★☆☆☆">★★☆☆☆ (2 stars)</option>
              <option value="★☆☆☆☆">★☆☆☆☆ (1 star)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.price}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
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