'use client'

import { useState } from 'react'

type AuthInputProps = {
  id: string
  label: string
  type: 'text' | 'password'
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
  minLength?: number
  maxLength?: number
  autoComplete?: string
}

// lock icon SVG
function LockIcon({ active }: { active: boolean }) {
  const color = active ? '#1D9E75' : '#bbb'
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="2" y="6" width="9" height="6" rx="1.5" stroke={color} strokeWidth="1.2" />
      <path d="M4.5 6V4.5a2 2 0 014 0V6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6.5" cy="9.5" r="0.8" fill={color} />
    </svg>
  )
}

// user icon SVG
function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="4.5" r="2.5" stroke="#bbb" strokeWidth="1.2" />
      <path d="M1 12c0-3.04 2.46-5.5 5.5-5.5S12 8.96 12 12" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// eye icon for password toggle
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      {open ? (
        <>
          <path d="M1 6.5S3 2 6.5 2 12 6.5 12 6.5 10 11 6.5 11 1 6.5 1 6.5z" stroke="#bbb" strokeWidth="1.2" />
          <circle cx="6.5" cy="6.5" r="1.5" stroke="#bbb" strokeWidth="1.2" />
        </>
      ) : (
        <>
          <path d="M1 6.5S3 2 6.5 2 12 6.5 12 6.5 10 11 6.5 11 1 6.5 1 6.5z" stroke="#bbb" strokeWidth="1.2" />
          <line x1="2" y1="2" x2="11" y2="11" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// password strength calculator
function getPasswordStrength(password: string): number {
  // returns 0-4 based on password complexity
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++
  return score
}

function StrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  // color based on strength level
  const colors = ['#eee', '#E24B4A', '#EF9F27', '#1D9E75', '#1D9E75']

  return (
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className="flex-1 h-0.5 rounded-full transition-colors duration-300"
          style={{ background: level <= strength ? colors[strength] : '#eee' }}
        />
      ))}
    </div>
  )
}

export default function AuthInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  maxLength,
  autoComplete,
}: AuthInputProps) {
  // whether the input is focused
  const [focused, setFocused] = useState(false)

  // toggle password visibility
  const [showPassword, setShowPassword] = useState(false)

  // whether this is a password field
  const isPassword = type === 'password'

  // actual input type — text if showing password, otherwise the passed type
  const inputType = isPassword && showPassword ? 'text' : type

  // whether to show active/focused styles
  const isActive = focused || value.length > 0

  return (
    <div className="flex flex-col gap-1">
      {/* label */}
      <label
        htmlFor={id}
        className="text-[10px] font-medium tracking-wide"
        style={{ color: isActive && isPassword ? '#1D9E75' : '#888' }}
      >
        {label}
      </label>

      {/* input wrapper */}
      <div
        className="flex items-center rounded-lg overflow-hidden transition-all duration-150"
        style={{
          border: `1px solid ${isActive ? '#1D9E75' : '#e8e5e0'}`,
          background: isActive ? '#F5FDFB' : '#fafaf8',
        }}
      >
        {/* left icon */}
        <div className="px-2.5 flex items-center flex-shrink-0">
          {isPassword ? <LockIcon active={isActive} /> : <UserIcon />}
        </div>

        {/* input field */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className="flex-1 border-none bg-transparent py-2 text-[12px] text-gray-900 outline-none placeholder:text-gray-300"
        />

        {/* eye toggle for password fields */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-2.5 flex items-center flex-shrink-0 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>

      {/* password strength bar */}
      {isPassword && value.length > 0 && (
        <StrengthBar password={value} />
      )}
    </div>
  )
}