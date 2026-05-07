import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { checkUserRole } from '../data/api'
import Dashboard from './admin/Dashboard'
import Products from './admin/Products'
import Orders from './admin/Orders'
import Customers from './admin/Customers'
import Settings from './admin/Settings'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminPage({ session }) {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkRole() {
      if (session?.user?.id) {
        const role = await checkUserRole(session.user.id, session.user.email)
        setUserRole(role)
      }
      setLoading(false)
    }
    checkRole()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted mb-4">Please sign in to access the admin portal.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted mb-4">
            You need admin privileges to access this page.
          </p>
          <p className="text-sm text-muted mb-6">
            Contact an administrator at <strong>{'{store email}'}</strong> to request access.
          </p>
          <button
            onClick={() => window.location.href = '/store'}
            className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      
      <div className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
