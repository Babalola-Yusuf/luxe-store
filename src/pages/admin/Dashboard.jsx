import { useState, useEffect } from 'react'
import { fetchDashboardStats, fetchOrders, fetchProducts, fetchCustomers, exportToCSV } from '../../data/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FaDollarSign, FaShoppingBag, FaUsers, FaChartLine, FaDownload, FaMoon, FaSun, FaSync } from 'react-icons/fa'
import StatusPill from '../../components/StatusPill'

const COLORS = ['#1a1a2e', '#e94560', '#f5a623', '#16a34a', '#7c3aed']

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    loadDashboard()
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadDashboard, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [statsData, ordersData, productsData, customersData] = await Promise.all([
        fetchDashboardStats(),
        fetchOrders(),
        fetchProducts(),
        fetchCustomers(),
      ])
      setStats(statsData)
      setOrders(ordersData)
      setProducts(productsData)
      setCustomers(customersData)
    } finally {
      setLoading(false)
    }
  }

  function handleExportOrders() {
    const data = orders.map(o => ({
      'Order ID': o.id,
      'Total': o.total,
      'Status': o.status,
      'Date': new Date(o.created_at).toLocaleDateString(),
    }))
    exportToCSV(data, `orders-${Date.now()}.csv`)
  }

  function handleExportProducts() {
    const data = products.map(p => ({
      'ID': p.id,
      'Name': p.name,
      'Category': p.category,
      'Price': p.price,
      'Stock': p.stock,
    }))
    exportToCSV(data, `products-${Date.now()}.csv`)
  }

  function handleExportCustomers() {
    const data = customers.map(c => ({
      'Name': c.name,
      'Email': c.email,
      'Status': c.status,
      'Joined': new Date(c.joined).toLocaleDateString(),
    }))
    exportToCSV(data, `customers-${Date.now()}.csv`)
  }

  // Prepare chart data
  const revenueData = orders.slice(0, 7).reverse().map((o, i) => ({
    name: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(o.total || 0),
  }))

  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const statusData = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const barData = Object.entries(statusData).map(([name, value]) => ({ name, value }))

  const topProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)

  const recentOrders = orders.slice(0, 5)

  function formatDate(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="text-xl text-white" />
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl font-bold">{loading ? '...' : value}</p>
    </div>
  )

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Dashboard</h2>
            <p className="text-sm text-muted mt-1">Welcome back! Here's your store overview</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-surface border border-border hover:bg-bg'
              }`}
            >
              <FaSync className={autoRefresh ? 'animate-spin' : ''} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg transition-colors disabled:opacity-50"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg transition-colors"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FaDollarSign}
            label="Total Revenue"
            value={stats?.revenue || '$0'}
            trend={12}
            color="bg-green-500"
          />
          <StatCard
            icon={FaShoppingBag}
            label="Total Orders"
            value={stats?.orders || '0'}
            trend={8}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaUsers}
            label="Customers"
            value={stats?.customers || '0'}
            trend={-3}
            color="bg-purple-500"
          />
          <StatCard
            icon={FaChartLine}
            label="Avg Order Value"
            value={stats?.avgOrder || '$0'}
            trend={5}
            color="bg-amber-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Chart */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Revenue Trend</h3>
              <button
                onClick={handleExportOrders}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <FaDownload /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e8e4dc',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1a1a2e" 
                  strokeWidth={2}
                  dot={{ fill: '#1a1a2e', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Chart */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e8e4dc',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#e94560" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Products by Category</h3>
              <button
                onClick={handleExportProducts}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <FaDownload /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-10 h-10 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-xl border border-border">
                      {p.emoji}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted">{p.stock} in stock</p>
                  </div>
                  <p className="text-sm font-bold">${p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
            <button
              onClick={handleExportCustomers}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <FaDownload /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  {['Order ID', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] text-muted uppercase tracking-wide font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-3 bg-[#f0ede8] rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                      <td className="px-5 py-3 font-medium text-accent">{o.id}</td>
                      <td className="px-5 py-3 font-medium">${Number(o.total).toFixed(2)}</td>
                      <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                      <td className="px-5 py-3 text-muted">{formatDate(o.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}