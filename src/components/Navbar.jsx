import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

export default function Navbar({ view, setView, session }) {
  const { totalItems } = useCart()
  const isAdmin = session?.user?.email?.endsWith('@luxe.com')

  // Get initials from user metadata or email
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
  }

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 h-14 bg-brand text-white sticky top-0 z-50">

      {/* Logo */}
      <button onClick={() => setView('store')} className="font-display text-xl font-bold tracking-wide shrink-0">
        Lu<span className="text-accent2">x</span>e
      </button>

      {/* Nav links */}
      <div className="flex gap-1 items-center">
        <button
          onClick={() => setView('store')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all
            ${view === 'store' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
          Store
        </button>

        {session && !isAdmin && (
          <button
            onClick={() => setView('my-orders')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all
              ${view === 'my-orders' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            My Orders
          </button>
        )}

        <button
          onClick={() => setView('admin')}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all
            ${view === 'admin' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
        >
          Admin
        </button>
      </div>

      {/* Right side — auth + cart */}
      <div className="flex items-center gap-2 shrink-0">

        {session ? (
          /* ── Logged-in user pill ── */
          <div className="flex items-center gap-2">
            {/* Avatar with initials */}
            <button
              onClick={() => !isAdmin && setView('my-orders')}
              title={user?.email}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-2 sm:px-3 py-1.5 rounded-full transition-all"
            >
              <span className="w-6 h-6 rounded-full bg-accent2 text-brand flex items-center justify-center text-[11px] font-bold shrink-0">
                {initials}
              </span>
              <span className="hidden sm:block text-xs text-white font-medium max-w-[80px] truncate">
                {displayName}
              </span>
              {/* Green online dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all text-lg"
            >
              ↪
            </button>
          </div>
        ) : (
          /* ── Logged-out buttons ── */
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setView('login')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all
                ${view === 'login' ? 'bg-accent text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setView('signup')}
              className="hidden sm:block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-all"
            >
              Sign up
            </button>
          </div>
        )}

        {/* Cart */}
        <button
          onClick={() => setView('cart')}
          className="relative bg-white/15 border border-white/25 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm hover:bg-white/25 transition-all"
        >
          🛒 <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white rounded-full w-[18px] h-[18px] text-[10px] flex items-center justify-center font-semibold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

    </nav>
  )
}