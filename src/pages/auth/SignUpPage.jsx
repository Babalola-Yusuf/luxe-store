import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SignUpPage({ setView }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  function set(k) {
    return (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSignUp() {
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name:  form.lastName,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Create a row in the customers table
    if (data.user) {
      await supabase.from('customers').insert({
        id:       data.user.id,
        name:     `${form.firstName} ${form.lastName}`.trim(),
        email:    form.email,
        initials: `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase(),
        color:    randomColor(),
        status:   'Active',
      })
    }

    setLoading(false)
    setView('store')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="font-display text-3xl font-bold text-brand">
            Lu<span className="text-accent2">x</span>e
          </span>
          <p className="text-muted text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] text-muted mb-1">First name</label>
              <input
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="Amara"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">Last name</label>
              <input
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Osei"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] text-muted mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@email.com"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] text-muted mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[11px] text-muted mb-1">Confirm password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat password"
              onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-bg outline-none focus:border-brand transition-colors"
            />
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading || !form.email || !form.password || !form.firstName}
            className="w-full py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-[12px] text-muted mt-4">
            Already have an account?{' '}
            <button
              onClick={() => setView('login')}
              className="text-accent hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function randomColor() {
  const colors = ['#1a1a2e','#e94560','#f5a623','#16a34a','#7c3aed','#0891b2','#db2777']
  return colors[Math.floor(Math.random() * colors.length)]
}