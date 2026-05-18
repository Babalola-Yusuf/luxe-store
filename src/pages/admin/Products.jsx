import { useState, useEffect } from 'react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../data/api'
import { useSettings } from '../../context/SettingsContext'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa'
import Modal from '../../components/Modal'
import ImageUpload from '../../components/ImageUpload'

export default function Products() {
  const { formatPrice } = useSettings()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [uploadMethod, setUploadMethod] = useState('url') // 'url' or 'upload'
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: 0,
    original_price: 0,
    stock: 0,
    emoji: '📦',
    image_url: '',
    images: [],
    badge: '',
    rating: 0,
  })

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

  function set(key) {
    return (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))
  }

  function openAddModal() {
    setEditingId(null)
    setFormData({
      name: '',
      category: '',
      description: '',
      price: 0,
      original_price: 0,
      stock: 0,
      emoji: '📦',
      image_url: '',
      images: [],
      badge: '',
      rating: 0,
    })
    setUploadMethod('url')
    setShowModal(true)
  }

  function openEditModal(product) {
    setEditingId(product.id)
    setFormData({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || 0,
      original_price: product.original_price || 0,
      stock: product.stock || 0,
      emoji: product.emoji || '📦',
      image_url: product.image_url || '',
      images: product.images || [],
      badge: product.badge || '',
      rating: product.rating || 0,
    })
    setUploadMethod(product.image_url ? 'url' : 'upload')
    setShowModal(true)
  }

async function handleSave() {
  const data = {
    ...formData,
    price: parseFloat(formData.price),
    original_price: parseFloat(formData.original_price),
    stock: parseInt(formData.stock),
    rating: parseFloat(formData.rating) || 0, // Ensure it's a number
  }

  try {
    if (editingId) {
      await updateProduct(editingId, data)
    } else {
      await createProduct(data)
    }
    await loadProducts()
    setShowModal(false)
  } catch (err) {
    alert(err.message)
  }
}
  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      await loadProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  function handleImageUpload(url) {
    setFormData(prev => ({ ...prev, image_url: url }))
  }

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean)
  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-accent transition-colors"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg">
                <th className="px-4 py-3 text-left text-xs text-muted uppercase tracking-wide font-medium">Product</th>
                <th className="px-4 py-3 text-left text-xs text-muted uppercase tracking-wide font-medium">Category</th>
                <th className="px-4 py-3 text-left text-xs text-muted uppercase tracking-wide font-medium">Price</th>
                <th className="px-4 py-3 text-left text-xs text-muted uppercase tracking-wide font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-xs text-muted uppercase tracking-wide font-medium">Rating</th>
                <th className="px-4 py-3 text-right text-xs text-muted uppercase tracking-wide font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-4 bg-[#f0ede8] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">No products found</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-xl shrink-0">
                          {p.images?.[0] || p.image_url ? (
                            <img src={p.images?.[0] || p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            p.emoji
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          {p.badge && (
                            <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">{p.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatPrice(p.price)}</p>
                      {p.original_price && (
                        <p className="text-xs text-muted line-through">{formatPrice(p.original_price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' : 
                        p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.stock} in stock
                      </span>
                    </td>
                   <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{(parseFloat(p.rating) || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Product Name *</label>
            <input
              value={formData.name}
              onChange={set('name')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              placeholder="Premium Headphones"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Category *</label>
              <input
                value={formData.category}
                onChange={set('category')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="Electronics"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Emoji</label>
              <input
                value={formData.emoji}
                onChange={set('emoji')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="🎧"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={set('description')}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand resize-none"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={set('price')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Original Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={set('original_price')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={set('stock')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={set('rating')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Badge</label>
            <input
              value={formData.badge}
              onChange={set('badge')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              placeholder="New Arrival, Best Seller, etc."
            />
          </div>

          {/* Image Upload Method Toggle */}
          <div>
            <label className="block text-xs text-muted mb-2">Product Image</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setUploadMethod('url')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'url' 
                    ? 'bg-brand text-white' 
                    : 'bg-surface border border-border text-muted hover:border-brand'
                }`}
              >
                Image URL
              </button>
              <button
                onClick={() => setUploadMethod('upload')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'upload' 
                    ? 'bg-brand text-white' 
                    : 'bg-surface border border-border text-muted hover:border-brand'
                }`}
              >
                Upload Image
              </button>
            </div>

            {uploadMethod === 'url' ? (
              <input
                value={formData.image_url}
                onChange={set('image_url')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="https://example.com/image.jpg"
              />
            ) : (
              <ImageUpload 
                onUploadComplete={handleImageUpload}
                existingUrl={formData.image_url}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-brand text-white rounded-lg hover:bg-accent transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-2 border border-border rounded-lg hover:bg-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}