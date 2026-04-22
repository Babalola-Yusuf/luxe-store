import { useState } from 'react'
import { CUSTOMERS_DATA } from '../../data'
import StatusPill from '../../components/StatusPill'

export default function Customers() {
  const [search, setSearch] = useState('')

  const filtered = CUSTOMERS_DATA.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-xl font-semibold">Customers</h2>
        <button className="px-4 py-1.5 bg-accent text-white rounded-lg text-[13px] hover:opacity-85 transition-opacity">+ Add Customer</button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full sm:w-80 px-3 py-2 border border-border rounded-lg text-[13px] bg-surface outline-none focus:border-brand"
        />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {['', 'Name', 'Email', 'Orders', 'Spent', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] text-muted uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.email} className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors">
                  <td className="px-4 py-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                      style={{ background: c.color }}
                    >
                      {c.initials}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-2.5 text-muted">{c.email}</td>
                  <td className="px-4 py-2.5">{c.orders}</td>
                  <td className="px-4 py-2.5 font-medium">{c.spent}</td>
                  <td className="px-4 py-2.5"><StatusPill status={c.status} /></td>
                  <td className="px-4 py-2.5 text-muted whitespace-nowrap">{c.joined}</td>
                  <td className="px-4 py-2.5">
                    <button className="px-2 py-0.5 text-[11px] border border-border rounded hover:bg-bg transition-colors">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted text-sm">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
