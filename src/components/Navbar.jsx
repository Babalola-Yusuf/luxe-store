import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa'

export default function Navbar({ view, setView, session }) {
  const { totalItems } = useCart()
  const { settings } = useSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = session?.user?.email?.endsWith('@luxe.com')

  const user = session?.user
  const meta = user?.user_metadata
  const initials = meta?.first_name && meta?.last_name
    ? `${meta.first_name[0]}${meta.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const displayName = meta?.first_name
    ? meta.first_name
    : user?.email?.split('@')[0] ?? ''

  async function handleSignOut() {
    await supabase.auth.signOut()
    setView('store')
    setMobileMenuOpen(false)
  }

  function navigate(to) {
    setView(to)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-brand text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        
        {/* Logo - use settings */}
        <button onClick={() => navigate('store')} className="font-display text-xl font-bold tracking-wide shrink-0">
          {settings.general.storeName || 'Luxe'}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-1 items-center">
          <button
            onClick={() => navigate('store')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              view === 'store' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Store
          </button>

          {session && !isAdmin && (
            <>
              <button
                onClick={() => navigate('my-orders')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  view === 'my-orders' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => navigate('wishlist')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  view === 'wishlist' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Wishlist
              </button>
            </>
          )}

          <button
            onClick={() => navigate('track-order')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              view === 'track-order' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Track
          </button>

          <button
            onClick={() => navigate('admin')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              view === 'admin' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop Auth */}
          {session ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => !isAdmin && navigate('my-orders')}
                title={user?.email}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition-all"
              >
                <span className="w-6 h-6 rounded-full bg-accent2 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </span>
                <span className="text-xs text-white font-medium max-w-[80px] truncate">
                  {displayName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              </button>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all text-lg"
              >
                ↪
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('login')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  view === 'login' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('signup')}
                className="px-4 py-1.5 rounded-full text-sm bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-all"
              >
                Sign up
              </button>
            </div>
          )}

          {/* Cart */}
          <button
            onClick={() => navigate('cart')}
            className="relative bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-full text-sm hover:bg-white/25 transition-all flex items-center gap-2"
          >
            <FaShoppingCart />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => navigate('store')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                view === 'store' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              Store
            </button>

            {session && !isAdmin && (
              <>
                <button
                  onClick={() => navigate('my-orders')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    view === 'my-orders' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => navigate('wishlist')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    view === 'wishlist' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  Wishlist
                </button>
              </>
            )}

            <button
              onClick={() => navigate('track-order')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                view === 'track-order' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              Track Order
            </button>

            <button
              onClick={() => navigate('admin')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                view === 'admin' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              Admin Portal
            </button>

            <div className="border-t border-white/10 my-2 pt-2">
              {session ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p className="text-white/50 text-xs mb-1">Signed in as</p>
                    <p className="text-white font-medium">{displayName}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('login')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-all"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => navigate('signup')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-all"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}