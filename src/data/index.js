import { supabase } from '../lib/supabase'

// ── Static Data ───────────────────────────────────────────

export const PRODUCTS = [
  { id: 1, name: 'Koda Chair', emoji: '🪑', price: 98, og: 120, rating: '4.8', badge: 'sale', cat: 'home', category: 'home' },
  { id: 2, name: 'Voyage Sneakers', emoji: '👟', price: 74, og: 0, rating: '4.6', badge: '', cat: 'fashion', category: 'fashion' },
  { id: 3, name: 'Glyph Headphones', emoji: '🎧', price: 129, og: 159, rating: '4.9', badge: 'sale', cat: 'tech', category: 'tech' },
  { id: 4, name: 'Bamboo Tray', emoji: '🟫', price: 32, og: 0, rating: '4.4', badge: '', cat: 'home', category: 'home' },
  { id: 5, name: 'Nova Lamp', emoji: '💡', price: 58, og: 78, rating: '4.7', badge: 'sale', cat: 'home', category: 'home' },
  { id: 6, name: 'Luna Hoodie', emoji: '🧥', price: 52, og: 0, rating: '4.5', badge: '', cat: 'fashion', category: 'fashion' },
]

export const CATEGORIES = ['all', 'home', 'fashion', 'tech']

export const ORDERS_DATA = [
  { id: '#ORD-1021', customer: 'Mila Hart', items: 3, total: '$142.50', status: 'Processing', date: '2026-03-18' },
  { id: '#ORD-1020', customer: 'Noah Reed', items: 1, total: '$58.00', status: 'Delivered', date: '2026-03-17' },
  { id: '#ORD-1019', customer: 'Zoe Kim', items: 2, total: '$86.00', status: 'Pending', date: '2026-03-16' },
  { id: '#ORD-1018', customer: 'Aria Chen', items: 4, total: '$199.00', status: 'Cancelled', date: '2026-03-15' },
  { id: '#ORD-1017', customer: 'Evan Price', items: 5, total: '$249.99', status: 'Delivered', date: '2026-03-14' },
]

export const CUSTOMERS_DATA = [
  { initials: 'MH', name: 'Mila Hart', email: 'mila.hart@email.com', orders: 8, spent: '$1,274.00', status: 'Active', joined: '2025-08-14', color: '#6d28d9' },
  { initials: 'NR', name: 'Noah Reed', email: 'noah.reed@email.com', orders: 5, spent: '$792.00', status: 'Active', joined: '2025-09-03', color: '#0f766e' },
  { initials: 'ZK', name: 'Zoe Kim', email: 'zoe.kim@email.com', orders: 4, spent: '$463.00', status: 'Pending', joined: '2025-10-08', color: '#c2410c' },
  { initials: 'AC', name: 'Aria Chen', email: 'aria.chen@email.com', orders: 7, spent: '$1,039.00', status: 'Active', joined: '2025-11-21', color: '#1d4ed8' },
  { initials: 'EP', name: 'Evan Price', email: 'evan.price@email.com', orders: 6, spent: '$875.00', status: 'Active', joined: '2026-01-12', color: '#0ea5e9' },
]

export const REV_CHART = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [8600, 10200, 9400, 12300, 11500, 11800, 10700],
}

// ── Products ──────────────────────────────────────────────

export async function fetchProducts(category = null) {
  let query = supabase.from('products').select('*').order('id')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Orders ────────────────────────────────────────────────

export async function fetchOrders({ search = '', status = '' } = {}) {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('id', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw error
}

export async function placeOrder({ cartItems, total }) {
  const orderId = '#ORD-' + (1000 + Math.floor(Math.random() * 9000))

  // Get the current user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id:          orderId,
      total,
      status:      'Pending',
      customer_id: user?.id ?? null,
    })

  if (orderError) throw orderError

  const items = cartItems.map(([productId, quantity]) => ({
    order_id:   orderId,
    product_id: Number(productId),
    quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items)

  if (itemsError) throw itemsError

  return orderId
}

// ── Stripe ────────────────────────────────────────────────

export async function createPaymentIntent({ amount, orderId }) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
    {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ amount, orderId }),
    }
  )

  const data = await res.json()
  console.log('Edge Function response:', data)
  if (data.error) throw new Error(data.error)
  return data.clientSecret
}

// ── Customers ─────────────────────────────────────────────

export async function fetchCustomers(search = '') {
  let query = supabase
    .from('customers')
    .select('*')
    .order('joined', { ascending: false })

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Dashboard ─────────────────────────────────────────────

export async function fetchDashboardStats() {
  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from('orders').select('total, status, created_at'),
    supabase.from('products').select('id'),
    supabase.from('customers').select('id'),
  ])

  const orders    = ordersRes.data    || []
  const products  = productsRes.data  || []
  const customers = customersRes.data || []

  const revenue  = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const avgOrder = orders.length ? revenue / orders.length : 0

  return {
    revenue:      `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    orders:       orders.length.toLocaleString(),
    customers:    customers.length.toLocaleString(),
    avgOrder:     `$${avgOrder.toFixed(2)}`,
    recentOrders: orders.slice(0, 5),
  }
}