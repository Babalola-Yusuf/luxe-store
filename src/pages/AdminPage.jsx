import { useState } from 'react'
import Dashboard from './admin/Dashboard'
import Orders    from './admin/Orders'
import Products  from './admin/Products'
import Customers from './admin/Customers'
import Settings  from './admin/Settings'

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'orders',    icon: '📦', label: 'Orders',    dot: true },
  { id: 'products',  icon: '🏷️', label: 'Products'  },
  { id: 'customers', icon: '👥', label: 'Customers' },
  { id: 'settings',  icon: '⚙️', label: 'Settings'  },
]

const SECTION_MAP = {
  dashboard: Dashboard,
  orders:    Orders,
  products:  Products,
  customers: Customers,
  settings:  Settings,
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const ActiveComponent = SECTION_MAP[activeSection]

  return (
    <div className="flex flex-col sm:flex-row min-h-[calc(100vh-56px)]">
      {/* Sidebar — horizontal on mobile, vertical on sm+ */}
      <aside className="bg-brand text-white flex sm:flex-col overflow-x-auto sm:overflow-x-visible sm:w-44 shrink-0">
        <div className="hidden sm:block px-5 py-4 font-display text-base font-semibold border-b border-white/10 mb-1">
          Admin
        </div>

        <div className="hidden sm:block">
          <p className="px-5 py-2 text-[10px] text-white/35 uppercase tracking-widest">Overview</p>
        </div>

        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeSection === item.id
          const showDivider = idx === 0 // divider after dashboard on desktop
          return (
            <div key={item.id}>
              {showDivider && idx > 0 && (
                <div className="hidden sm:block h-px bg-white/10 mx-4 my-1" />
              )}
              <button
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2.5 text-[12px] sm:text-[13px] whitespace-nowrap w-auto sm:w-full transition-all
                  border-b-2 sm:border-b-0 sm:border-r-2
                  ${isActive
                    ? 'bg-white/10 text-white border-accent'
                    : 'text-white/65 border-transparent hover:bg-white/6 hover:text-white'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden xs:inline sm:inline">{item.label}</span>
                {item.dot && (
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-accent ml-auto" />
                )}
              </button>
              {idx === 0 && (
                <div className="hidden sm:block h-px bg-white/10 mx-4 my-1" />
              )}
            </div>
          )
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-bg p-4 sm:p-5 lg:p-7 overflow-auto">
        <ActiveComponent />
      </main>
    </div>
  )
}
