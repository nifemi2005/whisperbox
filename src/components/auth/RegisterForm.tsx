'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { generateKeyPair, generateSalt, wrapPrivateKey } from '../../lib/crypto'
import { register } from '../../lib/api'
import { savePrivateKey } from '../../lib/storage'
import AuthInput from '../shared/AuthInput'

export default function RegisterForm() {
  const router = useRouter()
  const { setUser } = useAuth()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const normalizedUsername = username.trim().toLowerCase()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (normalizedUsername.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    setLoading(true)

    try {
      setLoadingStep('Generating encryption keys...')
      const { publicKeyBase64, privateKey } = await generateKeyPair()

      setLoadingStep('Generating salt...')
      const saltBase64 = generateSalt()

      setLoadingStep('Securing your private key...')
      const wrappedPrivateKeyBase64 = await wrapPrivateKey(
        privateKey,
        password,
        saltBase64
      )

      setLoadingStep('Creating your account...')
      const session = await register({
        username: normalizedUsername,
        display_name: displayName,
        password,
        public_key: publicKeyBase64,
        wrapped_private_key: wrappedPrivateKeyBase64,
        pbkdf2_salt: saltBase64,
      })

      setLoadingStep('Saving your keys...')
      await savePrivateKey(session.user.id, privateKey)

      setUser(session.user)
      router.push('/chat')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      <div className="flex flex-col gap-1 mb-1">
        <h1 className="text-[15px] font-medium text-gray-900 text-center">
          Create your account
        </h1>
        <p className="text-[11px] text-gray-400 text-center">
          Secure from day one
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
        minLength={3}
        maxLength={32}
        autoComplete="username"
      />

      <AuthInput
        id="displayName"
        label="Display name"
        type="text"
        value={displayName}
        onChange={setDisplayName}
        placeholder="Your Name"
        required
        maxLength={128}
        autoComplete="name"
      />

      <AuthInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Min. 8 characters"
        required
        minLength={8}
        maxLength={128}
        autoComplete="new-password"
      />

      <AuthInput
        id="confirmPassword"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Repeat your password"
        required
        autoComplete="new-password"
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
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{
            background: '#E1F5EE',
            border: '0.5px solid #5DCAA5',
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
            style={{ borderColor: '#9FE1CB', borderTopColor: '#1D9E75' }}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] font-medium" style={{ color: '#085041' }}>
              {loadingStep}
            </p>
            <p className="text-[10px]" style={{ color: '#0F6E56' }}>
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-2.5 text-[12px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        style={{ background: loading ? '#9FE1CB' : '#1D9E75' }}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      {/* divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] text-gray-300">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* login link */}
      <Link
        href="/login"
        className="text-center text-[12px] font-medium"
        style={{ color: '#1D9E75' }}
      >
        Already have an account? Sign in
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