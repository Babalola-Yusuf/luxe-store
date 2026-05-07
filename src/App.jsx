import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { CartProvider } from './context/CartContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SuccessPage from './pages/SuccessPage'
import CustomerLoginPage from './pages/auth/CustomerLoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import MyOrdersPage from './pages/MyOrdersPage'
import WishlistPage from './pages/WishlistPage'
import TrackOrderPage from './pages/TrackOrderPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}

function AppContent() {
  const { settings } = useSettings()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState(null)
  const [appliedPromo, setAppliedPromo] = useState({ code: '', discount: 0 })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Apply appearance settings dynamically
  useEffect(() => {
    if (settings.appearance) {
      document.documentElement.style.setProperty('--color-brand', settings.appearance.primaryColor)
      document.documentElement.style.setProperty('--color-accent', settings.appearance.accentColor)
      document.documentElement.style.setProperty('--color-accent2', settings.appearance.accentColor2)
      
      if (settings.appearance.fontFamily) {
        document.body.style.fontFamily = `"${settings.appearance.fontFamily}", sans-serif`
      }
      
      document.title = settings.general?.storeName || 'Luxe Store'
      
      // Update favicon
      if (settings.appearance.favicon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = settings.appearance.favicon
        document.getElementsByTagName('head')[0].appendChild(link)
      }
    }
  }, [settings])

  // Check maintenance mode
  if (settings.maintenance?.enabled && !session?.user?.email?.endsWith('@luxe.com')) {
    return (
      <div className="min-h-screen bg-brand flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Under Maintenance</h1>
          <p className="text-white/80 text-lg mb-6">{settings.maintenance.message}</p>
          <p className="text-white/60 text-sm">We'll be back soon!</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar session={session} />
      <Breadcrumbs />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/store" replace />} />
          <Route path="/store" element={<StorePage session={session} />} />
          <Route path="/cart" element={<CartPage setAppliedPromo={setAppliedPromo} />} />
          <Route path="/checkout" element={<CheckoutPage setOrderId={setOrderId} appliedPromo={appliedPromo} />} />
          <Route path="/success" element={<SuccessPage orderId={orderId} />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={session ? <Navigate to="/my-orders" replace /> : <CustomerLoginPage />} />
          <Route path="/signup" element={session ? <Navigate to="/my-orders" replace /> : <SignUpPage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/my-orders" element={session ? <MyOrdersPage session={session} /> : <Navigate to="/login" replace />} />
          <Route path="/wishlist" element={session ? <WishlistPage session={session} /> : <Navigate to="/login" replace />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminPage session={session} />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <h3 className="font-display font-bold text-lg mb-2">{settings.general?.storeName || 'Luxe Store'}</h3>
              <p className="text-sm text-muted">{settings.general?.storeDescription || 'Premium lifestyle products'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Contact</h4>
              <p className="text-xs text-muted">{settings.general?.contactEmail}</p>
              <p className="text-xs text-muted">{settings.general?.contactPhone}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Address</h4>
              <p className="text-xs text-muted">{settings.general?.address}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted">
            © {new Date().getFullYear()} {settings.general?.storeName || 'Luxe Store'}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function NotFound() {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-brand mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/store')}
        className="bg-brand text-white px-6 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
      >
        Back to Store
      </button>
    </div>
  )
}

export default App