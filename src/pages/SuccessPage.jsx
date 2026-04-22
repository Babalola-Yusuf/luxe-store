export default function SuccessPage({ orderId, setView }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">✓</div>
      <h2 className="font-display text-2xl font-semibold mb-2">Order Confirmed!</h2>
      <p className="text-muted text-sm mb-1">Your order has been placed and is being processed.</p>
      <p className="font-semibold text-accent text-base mt-1">{orderId}</p>
      <button
        onClick={() => setView('store')}
        className="mt-8 px-8 py-2.5 bg-brand text-white rounded-full text-sm hover:bg-accent transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  )
}
