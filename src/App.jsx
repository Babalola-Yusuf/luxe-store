import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        await handleGoogleAuthUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await handleGoogleAuthUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleGoogleAuthUser(user) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingCustomer) {
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts[nameParts.length - 1] || 'Name'
      const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
      const colors = ['#1a1a2e', '#e94560', '#f5a623', '#16a34a', '#7c3aed', '#0891b2', '#db2777']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const { error } = await supabase
        .from('customers')
        .insert({
          id: user.id,
          name: fullName,
          email: user.email,
          initials,
          color: randomColor,
          joined: new Date().toISOString(),
          status: 'Active',
          role: 'customer',
        })

      if (error) {
        console.error('Failed to create customer record:', error)
      }
    }
  }

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

      <EnhancedFooter settings={settings} />
    </div>
  )
}

function EnhancedFooter({ settings }) {
  return (
    <footer className="bg-brand text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          <div>
            <h3 className="font-display font-bold text-lg mb-4">
              {settings.general?.storeName || 'Luxe Store'}
            </h3>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              {settings.general?.storeDescription || 'Premium lifestyle products curated for style and quality.'}
            </p>
            <div className="flex gap-3">
              {['Facebook', 'Twitter', 'Instagram'].map(label => (
                <a
                  key={label}
                  href="#"
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label={label}
                >
                  <span className="text-xs font-bold">{label[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2">
              {['All Products', 'Tech', 'Fashion', 'Home & Living', 'Beauty'].map(label => (
                <li key={label}>
                  <Link to="/store" className="text-white/70 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/track-order" className="text-white/70 hover:text-white text-sm transition-colors">Track Order</Link></li>
              <li><Link to="/my-orders" className="text-white/70 hover:text-white text-sm transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="text-white/70 hover:text-white text-sm transition-colors">Wishlist</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Stay Connected</h4>
            <div className="space-y-3 mb-4 text-sm text-white/70">
              <p>{settings.general?.contactEmail || 'support@luxe.com'}</p>
              <p>{settings.general?.contactPhone || '+1 (555) 123-4567'}</p>
              <p>{settings.general?.address || '123 Main St, City, Country'}</p>
            </div>

            <div>
              <p className="text-xs text-white/70 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40 transition-colors"
                />
                <button className="px-4 py-2 bg-accent hover:bg-accent2 rounded-lg text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>
              © {new Date().getFullYear()} {settings.general?.storeName || 'Luxe Store'}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
