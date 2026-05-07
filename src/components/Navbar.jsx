import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { checkUserRole } from '../data/api'
import { supabase } from '../lib/supabase'
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa'

export default function Navbar({ session }) {
  const { totalItems } = useCart()
  const { settings } = useSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleChecked, setRoleChecked] = useState(false)
  const [checkedUserId, setCheckedUserId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const user = session?.user
  const { initials, displayName } = useMemo(() => {
    const meta = user?.user_metadata
    return {
      initials: meta?.first_name && meta?.last_name
        ? `${meta.first_name[0]}${meta.last_name[0]}`.toUpperCase()
        : user?.email?.[0]?.toUpperCase() ?? '?',
      displayName: meta?.first_name
        ? meta.first_name
        : user?.email?.split('@')[0] ?? '',
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function checkAdmin() {
      const userId = session?.user?.id

      if (userId && (!roleChecked || checkedUserId !== userId)) {
        try {
          const role = await checkUserRole(userId, session.user.email)
          if (cancelled) return
          setIsAdmin(role === 'admin')
          setRoleChecked(true)
          setCheckedUserId(userId)
        } catch (err) {
          if (cancelled) return
          console.error('Failed to check role:', err)
          setIsAdmin(false)
          setRoleChecked(true)
          setCheckedUserId(userId)
        }
      } else if (!userId) {
        setIsAdmin(false)
        setRoleChecked(false)
        setCheckedUserId(null)
      }
    }

    checkAdmin()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, roleChecked, checkedUserId])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
    setIsAdmin(false)
    setRoleChecked(false)
    setCheckedUserId(null)
    navigate('/store')
  }

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <nav className="bg-brand text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/store" className="flex items-center gap-2 shrink-0">
          {settings.appearance?.logo ? (
            <img 
              src={settings.appearance.logo} 
              alt={settings.general?.storeName || 'Logo'} 
              className="h-8 w-auto"
            />
          ) : (
            <span className="font-display text-xl font-bold tracking-wide">
              {settings.general?.storeName || 'Luxe'}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-1 items-center">
          <Link
            to="/store"
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              isActive('/store') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Store
          </Link>

          {session && !isAdmin && (
            <>
              <Link
                to="/my-orders"
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  isActive('/my-orders') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                My Orders
              </Link>
              <Link
                to="/wishlist"
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  isActive('/wishlist') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Wishlist
              </Link>
            </>
          )}

          <Link
            to="/track-order"
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              isActive('/track-order') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Track
          </Link>

          {isAdmin && (
            <Link
            to="/admin"
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              location.pathname.startsWith('/admin') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Admin
          </Link>  
          )}
          
        </div>

        {/* Rest of navbar remains the same... */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop Auth */}
          {session ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to={isAdmin ? '/admin' : '/my-orders'}
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
              </Link>
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
              <Link
                to="/login"
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  isActive('/login') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 rounded-full text-sm bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-all"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-full text-sm hover:bg-white/25 transition-all flex items-center gap-2"
          >
            <FaShoppingCart />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Link>

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
            <Link
              to="/store"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                isActive('/store') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              Store
            </Link>

            {session && !isAdmin && (
              <>
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    isActive('/my-orders') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    isActive('/wishlist') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  Wishlist
                </Link>
              </>
            )}

            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                isActive('/track-order') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              Track Order
            </Link>

            
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  location.pathname.startsWith('/admin') ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
                }`}
            >
              Admin Portal
            </Link>
            )}
            <div className="border-t border-white/10 my-2 pt-2">
              {session ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p className="text-white/50 text-xs mb-1">Signed in as</p>
                    <p className="text-white font-medium">{displayName}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-accent text-white rounded-full">
                        Admin
                      </span>
                    )}
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
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-all"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-all"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
