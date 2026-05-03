import { createContext, useContext, useState, useEffect } from 'react'
import { fetchSettings } from '../data/api'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    general: {
      storeName: 'Luxe Store',
      storeDescription: 'Premium lifestyle products',
      contactEmail: 'support@luxe.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Main St, Lagos, Nigeria',
      currency: 'USD',
      timezone: 'Africa/Lagos',
    },
    email: {
      enabled: true,
      provider: 'resend',
      fromName: 'Luxe Store',
      fromEmail: 'orders@luxe.com',
    },
    payment: {
      stripeEnabled: true,
      testMode: true,
    },
    shipping: {
      freeShippingThreshold: 50,
      standardRate: 5.99,
      expressRate: 15.99,
      estimatedDays: 7,
      expressEstimatedDays: 3,
    },
    tax: {
      enabled: true,
      rate: 8.5,
      inclusive: false,
    },
    appearance: {
      logo: '',
      favicon: '',
      primaryColor: '#1a1a2e',
      accentColor: '#e94560',
      accentColor2: '#f5a623',
      fontFamily: 'DM Sans',
    },
    maintenance: {
      enabled: false,
      message: 'We are currently performing maintenance. Please check back soon.',
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await fetchSettings()
      setSettings(prev => ({
        ...prev,
        ...data,
      }))
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  function getCurrencySymbol() {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      NGN: '₦',
    }
    return symbols[settings.general.currency] || '$'
  }

  function formatPrice(amount) {
    const symbol = getCurrencySymbol()
    return `${symbol}${parseFloat(amount).toFixed(2)}`
  }

  function calculateShipping(subtotal) {
    if (subtotal >= settings.shipping.freeShippingThreshold) {
      return 0
    }
    return settings.shipping.standardRate
  }

  function calculateTax(subtotal) {
    if (!settings.tax.enabled) return 0
    return subtotal * (settings.tax.rate / 100)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getCurrencySymbol,
        formatPrice,
        calculateShipping,
        calculateTax,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}