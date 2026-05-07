import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FaUser, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      })

      if (authError) throw authError

      // Create customer record
      const initials = `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
      const colors = ['#1a1a2e', '#e94560', '#f5a623', '#16a34a', '#7c3aed', '#0891b2', '#db2777']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: authData.user.id,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          initials,
          color: randomColor,
          joined: new Date().toISOString(),
          status: 'Active',
          role: 'customer', // Ensure role is set
        })

      if (customerError) throw customerError

      // Navigate to store on success
      navigate('/store')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted">Join us and start shopping</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={set('firstName')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-brand transition-colors"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={set('lastName')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-brand transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={set('email')}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-brand transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-brand transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-muted mt-1">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-white rounded-xl font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-accent font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
