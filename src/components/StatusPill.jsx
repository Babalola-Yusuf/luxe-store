const STATUS_STYLES = {
  Processing: 'bg-blue-50 text-blue-600',
  Delivered:  'bg-green-50 text-green-700',
  Active:     'bg-green-50 text-green-700',
  Pending:    'bg-amber-50 text-amber-700',
  Cancelled:  'bg-red-50 text-red-600',
  Inactive:   'bg-red-50 text-red-600',
  'Out of Stock': 'bg-red-50 text-red-600',
}

export default function StatusPill({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
