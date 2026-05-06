'use client'

import { useState } from 'react'
import { LuX, LuSearch, LuUser } from 'react-icons/lu'
import { searchUsers } from '../../lib/api'
import type { User } from '../../types/auth'

type Props = {
  onClose: () => void
  onSelect: (user: User) => void
}

export default function NewConversationModal({ onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // search for users as the user types
  async function handleSearch(value: string) {
    setQuery(value)

    // don't search if query is too short
    if (value.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const users = await searchUsers(value.trim())
      setResults(users)
    } catch {
      setError('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  // get initials from display name
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    // backdrop — clicking outside closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      {/* modal card — stop click propagation so clicking inside doesn't close */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: '#0D2D2A' }}
        >
          <h2 className="text-[13px] font-medium text-white">
            New conversation
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-label="Close"
          >
            <LuX size={12} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* search input */}
        <div className="p-3 bg-white" style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors focus-within:border-[#1D9E75]"
            style={{
              background: '#fafaf8',
              borderColor: '#e0ddd8',
            }}
          >
            <LuSearch size={13} color="#1D9E75" />
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by username..."
              autoFocus
              className="flex-1 border-none bg-transparent text-[12px] outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
            {loading && (
              <div
                className="w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
                style={{ borderColor: '#9FE1CB', borderTopColor: '#1D9E75' }}
              />
            )}
          </div>
        </div>

        {/* results */}
        <div className="flex flex-col bg-white" style={{ maxHeight: 300, overflowY: 'auto' }}>
          {error && (
            <p className="text-[11px] text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="text-[11px] text-center py-6" style={{ color: 'var(--color-text-secondary)' }}>
              No users found for &quot;{query}&quot;
            </p>
          )}

          {query.length < 2 && (
            <p className="text-[11px] text-center py-6" style={{ color: 'var(--color-text-secondary)' }}>
              Type at least 2 characters to search
            </p>
          )}

          {results.map(user => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-colors w-full"
              style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-medium"
                style={{ background: '#E1F5EE', color: '#085041' }}
              >
                {getInitials(user.display_name)}
              </div>

              {/* user info */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {user.display_name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  @{user.username}
                </p>
              </div>

              <LuUser size={14} color="var(--color-text-tertiary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}