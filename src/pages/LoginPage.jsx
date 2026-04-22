import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="font-display text-3xl font-bold text-brand">
            Lu<span className="text-accent2">x</span>e
          </span>
          <p className="text-muted text-sm mt-2">Admin Portal</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-5">Sign in</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="block text-[11px] text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@luxe.com"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[11px] text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

      </div>
    </div>
  )
}