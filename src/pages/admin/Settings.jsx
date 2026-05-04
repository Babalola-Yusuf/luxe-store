import { useState, useEffect } from 'react'
import { fetchSettings, updateSetting, fetchPromoCodes, createPromoCode, deletePromoCode } from '../../data/api'
import { FaSave, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
import Modal from '../../components/Modal'
import { useSettings as useSettingsContext } from '../../context/SettingsContext'

export default function Settings() {
  const { refreshSettings } = useSettingsContext()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [activeTab, setActiveTab] = useState('general')
  const [promoCodes, setPromoCodes] = useState([])
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_percent: '',
    discount_amount: '',
    expires_at: '',
    max_uses: '',
  })

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'email', label: 'Email' },
    { id: 'payment', label: 'Payment' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'tax', label: 'Tax' },
    { id: 'promo', label: 'Promo Codes' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'maintenance', label: 'Maintenance' },
  ]

  useEffect(() => {
    loadSettings()
    loadPromoCodes()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const data = await fetchSettings()
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadPromoCodes() {
    try {
      const data = await fetchPromoCodes()
      setPromoCodes(data)
    } catch (err) {
      console.error('Failed to load promo codes:', err)
    }
  }

  async function handleSave(key) {
    setSaving(key)
    try {
      await updateSetting(key, settings[key])
      await refreshSettings()
      alert('Settings saved successfully!')
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  function updateField(key, field, value) {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  async function handleCreatePromo() {
    try {
      const data = {
        code: promoForm.code.toUpperCase(),
        discount_percent: promoForm.discount_percent ? parseFloat(promoForm.discount_percent) : null,
        discount_amount: promoForm.discount_amount ? parseFloat(promoForm.discount_amount) : null,
        expires_at: promoForm.expires_at || null,
        max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
      }
      await createPromoCode(data)
      await loadPromoCodes()
      setShowPromoModal(false)
      setPromoForm({ code: '', discount_percent: '', discount_amount: '', expires_at: '', max_uses: '' })
    } catch (err) {
      alert('Failed to create promo code: ' + err.message)
    }
  }

  async function handleDeletePromo(id) {
    if (!confirm('Delete this promo code?')) return
    try {
      await deletePromoCode(id)
      await loadPromoCodes()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-6">Store Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand text-white'
                : 'text-muted hover:bg-bg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && settings.general && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">General Settings</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs text-muted mb-1">Store Name</label>
              <input
                value={settings.general.storeName || ''}
                onChange={e => updateField('general', 'storeName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Description</label>
              <textarea
                value={settings.general.storeDescription || ''}
                onChange={e => updateField('general', 'storeDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.general.contactEmail || ''}
                  onChange={e => updateField('general', 'contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Contact Phone</label>
                <input
                  value={settings.general.contactPhone || ''}
                  onChange={e => updateField('general', 'contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Address</label>
              <input
                value={settings.general.address || ''}
                onChange={e => updateField('general', 'address', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Currency</label>
                <select
                  value={settings.general.currency || 'USD'}
                  onChange={e => updateField('general', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="NGN">NGN - Nigerian Naira (₦)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                  <option value="CAD">CAD - Canadian Dollar (CA$)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                  <option value="INR">INR - Indian Rupee (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Timezone</label>
                <select
                  value={settings.general.timezone || 'Africa/Lagos'}
                  onChange={e => updateField('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
                >
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => handleSave('general')}
              disabled={saving === 'general'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'general' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && settings.email && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Email Notifications</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="checkbox"
                  checked={settings.email.enabled || false}
                  onChange={e => updateField('email', 'enabled', e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
                <span className="text-sm flex-1">Enable email notifications</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">From Name</label>
                <input
                  value={settings.email.fromName || ''}
                  onChange={e => updateField('email', 'fromName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail || ''}
                  onChange={e => updateField('email', 'fromEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted mb-2">Notification Types:</p>
              {['orderConfirmation', 'shippingNotification', 'deliveryNotification'].map(type => (
                <label key={type} className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.email[type] || false}
                    onChange={e => updateField('email', type, e.target.checked)}
                    className="w-4 h-4 accent-brand cursor-pointer"
                  />
                  <span className="text-sm flex-1 capitalize">
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={() => handleSave('email')}
              disabled={saving === 'email'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'email' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && settings.payment && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Payment Settings</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="checkbox"
                  checked={settings.payment.stripeEnabled || false}
                  onChange={e => updateField('payment', 'stripeEnabled', e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
                <span className="text-sm flex-1">Enable Stripe payments</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="checkbox"
                  checked={settings.payment.testMode || false}
                  onChange={e => updateField('payment', 'testMode', e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
                <span className="text-sm flex-1">Test mode (use test API keys)</span>
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800 mb-2">
                <strong>Note:</strong> API keys are configured via environment variables.
              </p>
              <p className="text-xs text-blue-600">
                Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800 mb-2">
                <strong>Currency Support:</strong>
              </p>
              <p className="text-xs text-blue-600 mb-2">
                The payment currency is set in General Settings. Stripe supports: USD, EUR, GBP, NGN, JPY, CAD, AUD, INR, and many more.
              </p>
              <p className="text-xs text-blue-600">
                <strong>Note:</strong> Some currencies (like NGN) may have limited payment method availability. Test mode uses your configured currency.
              </p>
            </div>
            <button
              onClick={() => handleSave('payment')}
              disabled={saving === 'payment'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'payment' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === 'shipping' && settings.shipping && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Shipping Settings</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs text-muted mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.freeShippingThreshold || 0}
                onChange={e => updateField('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Standard Shipping Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shipping.standardRate || 0}
                  onChange={e => updateField('shipping', 'standardRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Express Shipping Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shipping.expressRate || 0}
                  onChange={e => updateField('shipping', 'expressRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Standard Delivery (days)</label>
                <input
                  type="number"
                  value={settings.shipping.estimatedDays || 0}
                  onChange={e => updateField('shipping', 'estimatedDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Express Delivery (days)</label>
                <input
                  type="number"
                  value={settings.shipping.expressEstimatedDays || 0}
                  onChange={e => updateField('shipping', 'expressEstimatedDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
            <button
              onClick={() => handleSave('shipping')}
              disabled={saving === 'shipping'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'shipping' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Tax Settings */}
      {activeTab === 'tax' && settings.tax && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Tax Settings</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="checkbox"
                  checked={settings.tax.enabled || false}
                  onChange={e => updateField('tax', 'enabled', e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
                <span className="text-sm flex-1">Enable tax calculation</span>
              </label>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.tax.rate || 0}
                onChange={e => updateField('tax', 'rate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="checkbox"
                  checked={settings.tax.inclusive || false}
                  onChange={e => updateField('tax', 'inclusive', e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
                <span className="text-sm flex-1">Tax is inclusive (already included in prices)</span>
              </label>
            </div>
            <button
              onClick={() => handleSave('tax')}
              disabled={saving === 'tax'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'tax' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Promo Codes */}
      {activeTab === 'promo' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Promo Codes</h3>
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
            >
              <FaPlus /> Create Promo Code
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {['Code', 'Discount', 'Expires', 'Uses', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] text-muted uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted text-sm">
                      No promo codes yet. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  promoCodes.map(promo => {
                    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
                    const isMaxed = promo.max_uses && promo.times_used >= promo.max_uses
                    
                    return (
                      <tr key={promo.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-accent">{promo.code}</td>
                        <td className="px-4 py-3">
                          {promo.discount_percent ? `${promo.discount_percent}%` : `$${promo.discount_amount}`}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {promo.times_used || 0} / {promo.max_uses || '∞'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isExpired || isMaxed
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isExpired ? 'Expired' : isMaxed ? 'Max Uses' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && settings.appearance && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Appearance</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Primary Color</label>
                <input
                  type="color"
                  value={settings.appearance.primaryColor || '#1a1a2e'}
                  onChange={e => updateField('appearance', 'primaryColor', e.target.value)}
                  className="w-full h-10 border border-border rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Accent Color</label>
                <input
                  type="color"
                  value={settings.appearance.accentColor || '#e94560'}
                  onChange={e => updateField('appearance', 'accentColor', e.target.value)}
                  className="w-full h-10 border border-border rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Accent Color 2</label>
                <input
                  type="color"
                  value={settings.appearance.accentColor2 || '#f5a623'}
                  onChange={e => updateField('appearance', 'accentColor2', e.target.value)}
                  className="w-full h-10 border border-border rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Font Family</label>
              <select
                value={settings.appearance.fontFamily || 'DM Sans'}
                onChange={e => updateField('appearance', 'fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand bg-surface"
              >
                <option value="DM Sans">DM Sans</option>
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
              </select>
            </div>
            <button
              onClick={() => handleSave('appearance')}
              disabled={saving === 'appearance'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'appearance' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Mode */}
      {activeTab === 'maintenance' && settings.maintenance && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Maintenance Mode</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="checkbox"
                  checked={settings.maintenance.enabled || false}
                  onChange={e => updateField('maintenance', 'enabled', e.target.checked)}
                  className="w-5 h-5 accent-brand cursor-pointer"
                />
                <span className="text-sm flex-1">Enable maintenance mode</span>
              </label>
            </div>
            {settings.maintenance.enabled && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-800">
                  <strong>Warning:</strong> When enabled, customers will see a maintenance message and won't be able to access the store.
                </p>
              </div>
            )}
            <div>
              <label className="block text-xs text-muted mb-1">Maintenance Message</label>
              <textarea
                value={settings.maintenance.message || ''}
                onChange={e => updateField('maintenance', 'message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand resize-none"
                placeholder="We are currently performing maintenance..."
              />
            </div>
            <button
              onClick={() => handleSave('maintenance')}
              disabled={saving === 'maintenance'}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving === 'maintenance' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      <Modal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        title="Create Promo Code"
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Promo Code *</label>
            <input
              value={promoForm.code}
              onChange={e => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand font-mono"
              placeholder="SUMMER2026"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Discount (%)</label>
              <input
                type="number"
                value={promoForm.discount_percent}
                onChange={e => setPromoForm(prev => ({ ...prev, discount_percent: e.target.value, discount_amount: '' }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Or Fixed Amount ($)</label>
              <input
                type="number"
                value={promoForm.discount_amount}
                onChange={e => setPromoForm(prev => ({ ...prev, discount_amount: e.target.value, discount_percent: '' }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="5.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Expires At</label>
              <input
                type="date"
                value={promoForm.expires_at}
                onChange={e => setPromoForm(prev => ({ ...prev, expires_at: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Max Uses</label>
              <input
                type="number"
                value={promoForm.max_uses}
                onChange={e => setPromoForm(prev => ({ ...prev, max_uses: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-brand"
                placeholder="100"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreatePromo}
              disabled={!promoForm.code || (!promoForm.discount_percent && !promoForm.discount_amount)}
              className="flex-1 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              Create Promo Code
            </button>
            <button
              onClick={() => setShowPromoModal(false)}
              className="px-6 py-2.5 border border-border rounded-lg font-medium hover:bg-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
