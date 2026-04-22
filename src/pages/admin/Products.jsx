import { useState, useEffect } from 'react'
import { fetchProducts } from '../../data/api'
import StatusPill from '../../components/StatusPill'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('')

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchQ = !search   || p.name.toLowerCase().includes(search.toLowerCase())
    const matchC = !catFilter || p.category.toLowerCase() === catFilter.toLowerCase()
    return matchQ && matchC
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl font-semibold">Products</h2>
        <button className="px-4 py-1.5 bg-accent text-white rounded-lg text-[13px] hover:opacity-85 transition-opacity">
          + Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-[180px] px-3 py-2 border border-border rounded-lg text-[13px] bg-surface outline-none focus:border-brand"
        />
        <select
          value={catFilter}
          onChange={e => setCat(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-[13px] bg-surface cursor-pointer outline-none"
        >
          <option value="">All Categories</option>
          {['Tech', 'Fashion', 'Home', 'Beauty', 'Sports'].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                {['', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] text-muted uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-[#f0ede8] rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted text-sm">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="w-9 h-9 bg-[#f9f8f6] rounded-lg flex items-center justify-center text-lg border border-border">
                        {p.emoji}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 text-muted capitalize">{p.category}</td>
                    <td className="px-4 py-2.5 font-medium">${p.price}</td>
                    <td className={`px-4 py-2.5 ${p.stock < 15 ? 'text-red-500 font-medium' : 'text-muted'}`}>
                      {p.stock}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill status={p.stock > 0 ? 'Active' : 'Out of Stock'} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        {['Edit', 'Delete'].map(a => (
                          <button key={a} className="px-2 py-0.5 text-[11px] border border-border rounded hover:bg-bg transition-colors">{a}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}