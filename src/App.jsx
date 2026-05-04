import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { CartProvider } from './context/CartContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import Navbar              from './components/Navbar'
import Footer              from './components/Footer'
import StorePage           from './pages/StorePage'
import CartPage            from './pages/CartPage'
import CheckoutPage        from './pages/CheckoutPage'
import SuccessPage         from './pages/SuccessPage'
import AdminPage           from './pages/AdminPage'
import LoginPage           from './pages/LoginPage'
import CustomerLoginPage   from './pages/auth/CustomerLoginPage'
import SignUpPage          from './pages/auth/SignUpPage'
import MyOrdersPage        from './pages/MyOrdersPage'
import WishlistPage        from './pages/WishlistPage'
import TrackOrderPage from './pages/TrackOrderPage'


const STOREFRONT_VIEWS = ['store', 'cart', 'checkout', 'success', 'login', 'signup', 'my-orders', 'wishlist', 'track-order']

function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </SettingsProvider>
  )
}

function AppContent() {
  const { settings } = useSettings()
  const [view, setView]         = useState('store')
  const [orderId, setOrderId]   = useState('')
  const [appliedPromo, setAppliedPromo] = useState({ code: '', discount: 0 })
  const [session, setSession]   = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  // Apply appearance settings dynamically
  useEffect(() => {
    if (settings.appearance) {
      // Colors
      document.documentElement.style.setProperty('--color-brand', settings.appearance.primaryColor)
      document.documentElement.style.setProperty('--color-accent', settings.appearance.accentColor)
      document.documentElement.style.setProperty('--color-accent2', settings.appearance.accentColor2)

      // Font
      if (settings.appearance.fontFamily) {
        document.body.style.fontFamily = `"${settings.appearance.fontFamily}", sans-serif`
      }
      
      // Title
      document.title = settings.general?.storeName || 'Luxe Store'
    }
  }, [settings])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-display text-2xl text-brand opacity-50">
          Lu<span className="text-accent2">x</span>e
        </span>
      </div>
    )
  }

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

  // Admin portal — needs admin session (you can add role check here later)
  if (view === 'admin' && !session) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar view={view} setView={setView} session={session} />

      <main className="flex-1">
        {view === 'store'     && <StorePage session={session} />}
        {view === 'cart'      && <CartPage       setView={setView} setAppliedPromo={setAppliedPromo} />}
        {view === 'checkout'  && <CheckoutPage   setView={setView} setOrderId={setOrderId} appliedPromo={appliedPromo} />}
        {view === 'success'   && <SuccessPage    setView={setView} orderId={orderId} />}
        {view === 'admin'     && <AdminPage      session={session} />}
        {view === 'login'     && <CustomerLoginPage setView={setView} />}
        {view === 'signup'    && <SignUpPage        setView={setView} />}
        {view === 'my-orders' && <MyOrdersPage      setView={setView} session={session} />}
        {view === 'wishlist'  && <WishlistPage      setView={setView} session={session} />}
        {view === 'track-order' && <TrackOrderPage />}
        
      </main>

      {STOREFRONT_VIEWS.includes(view) && <Footer />}
    </div>
  )
}

export default App
