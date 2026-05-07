import { NavLink } from 'react-router-dom'
import { FaChartLine, FaBox, FaShoppingCart, FaUsers, FaCog } from 'react-icons/fa'

export default function AdminSidebar() {
  const navItems = [
    { to: '/admin/dashboard', icon: FaChartLine, label: 'Dashboard' },
    { to: '/admin/products', icon: FaBox, label: 'Products' },
    { to: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { to: '/admin/customers', icon: FaUsers, label: 'Customers' },
    { to: '/admin/settings', icon: FaCog, label: 'Settings' },
  ]

  return (
    <aside className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-surface border-r border-border">
      <nav className="p-4">
        <div className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-muted hover:bg-bg hover:text-brand'
                }`
              }
            >
              <Icon className="text-lg" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}