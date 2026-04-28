import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { CartProvider } from './context/CartContext'
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

export default function App() {
  const [view, setView]         = useState('store')
  const [orderId, setOrderId]   = useState('')
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-display text-2xl text-brand opacity-50">
          Lu<span className="text-accent2">x</span>e
        </span>
      </div>
    )
  }

  // Admin portal — needs admin session (you can add role check here later)
  if (view === 'admin' && !session) {
    return <LoginPage />
  }

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar view={view} setView={setView} session={session} />

        <main className="flex-1">
          {view === 'store'     && <StorePage session={session} />}
          {view === 'cart'      && <CartPage       setView={setView} />}
          {view === 'checkout'  && <CheckoutPage   setView={setView} setOrderId={setOrderId} />}
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
    </CartProvider>
  )
}