import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaChevronRight } from 'react-icons/fa'

export default function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) return null

  const breadcrumbMap = {
    'store': 'Store',
    'cart': 'Shopping Cart',
    'checkout': 'Checkout',
    'success': 'Order Confirmation',
    'login': 'Sign In',
    'signup': 'Sign Up',
    'my-orders': 'My Orders',
    'wishlist': 'Wishlist',
    'track-order': 'Track Order',
    'admin': 'Admin Portal',
    'dashboard': 'Dashboard',
    'products': 'Products',
    'orders': 'Orders',
    'customers': 'Customers',
    'settings': 'Settings',
  }

  return (
    <nav className="bg-surface border-b border-border py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ol className="flex items-center gap-2 text-sm">
          {/* Home */}
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 text-muted hover:text-brand transition-colors"
            >
              <FaHome className="text-xs" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>

          {pathnames.map((pathname, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
            const isLast = index === pathnames.length - 1
            const label = breadcrumbMap[pathname] || pathname

            return (
              <li key={pathname} className="flex items-center gap-2">
                <FaChevronRight className="text-xs text-muted" />
                {isLast ? (
                  <span className="font-medium text-brand">{label}</span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-muted hover:text-brand transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}