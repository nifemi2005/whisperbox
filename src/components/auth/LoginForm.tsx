'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { unwrapPrivateKey } from '../../lib/crypto'
import { login } from '../../lib/api'
import { savePrivateKey } from '../../lib/storage'
import AuthInput from '../shared/AuthInput'

export default function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      setLoadingStep('Signing in...')
      const session = await login({ username, password })

      setLoadingStep('Decrypting your keys...')
      const privateKey = await unwrapPrivateKey(
        session.user.wrapped_private_key,
        password,
        session.user.pbkdf2_salt
      )

      setLoadingStep('Almost there...')
      await savePrivateKey(session.user.id, privateKey)

      setUser(session.user)
      router.push('/chat')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      <div className="flex flex-col gap-1 mb-1">
        <h1 className="text-[15px] font-medium text-gray-900 text-center">
          Welcome back
        </h1>
        <p className="text-[11px] text-gray-400 text-center">
          Sign in to your account
        </p>
      </div>

      <AuthInput
        id="username"
        label="Username"
        type="text"
        value={username}
        onChange={setUsername}
        placeholder="your_username"
        required
        autoComplete="username"
      />

      <AuthInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      {/* error message */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px]"
          style={{
            background: '#FCEBEB',
            border: '0.5px solid #F09595',
            color: '#A32D2D',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#A32D2D" strokeWidth="1.2" />
            <path d="M6 3.5v3" stroke="#A32D2D" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6" cy="8.5" r="0.6" fill="#A32D2D" />
          </svg>
          {error}
        </div>
      )}

      {/* loading step */}
      {loading && loadingStep && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px]"
          style={{
            background: '#E1F5EE',
            border: '0.5px solid #5DCAA5',
            color: '#085041',
          }}
        >
          <div
            className="w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
            style={{ borderColor: '#9FE1CB', borderTopColor: '#1D9E75' }}
          />
          {loadingStep}
        </div>
      )}

      {/* submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-2.5 text-[12px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        style={{ background: loading ? '#9FE1CB' : '#1D9E75' }}
      >
        {loading ? 'Signing in...' : 'Continue'}
      </button>

      {/* divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] text-gray-300">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* sign up link */}
      <Link
        href="/register"
        className="text-center text-[12px] font-medium transition-colors"
        style={{ color: '#1D9E75' }}
      >
        Create an account
      </Link>

      {/* e2e badge */}
      <div className="flex items-center justify-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
        <span className="text-[10px]" style={{ color: '#3B6D11' }}>
          End-to-end encrypted
        </span>
      </div>

    </form>
  )
}