'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LuSearch, LuSquarePen, LuLogOut } from 'react-icons/lu'
import { useAuth } from '../../context/AuthContext'
import { getConversations } from '../../lib/api'
import type { ConversationSummary } from '../../types/message'
import type { User } from '../../types/auth'
import NewConversationModal from './NewConversationModal'

type Props = {
  activeUserId?: string
  onSelectConversation?: (conv: ConversationSummary) => void
}

// generates initials from display name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// avatar background colors — cycles through based on name
function getAvatarColor(name: string): { bg: string; color: string } {
  const colors = [
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#FCEBEB', color: '#A32D2D' },
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// formats the last message time
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export default function ConversationList({ activeUserId, onSelectConversation }: Props) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [filtered, setFiltered] = useState<ConversationSummary[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewConv, setShowNewConv] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // load conversations on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getConversations()
        setConversations(data)
        setFiltered(data)
      } catch {
        console.error('Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // filter conversations when search changes
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(conversations)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      conversations.filter(
        c =>
          c.display_name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      )
    )
  }, [search, conversations])

  // when a new conversation is selected from the modal
  function handleNewConversation(selectedUser: User) {
    setShowNewConv(false)

    const existing = conversations.find(c => c.user_id === selectedUser.id)
    const conv: ConversationSummary = existing || {
      user_id: selectedUser.id,
      display_name: selectedUser.display_name,
      username: selectedUser.username,
      last_message_at: new Date().toISOString(),
    }

    if (!existing) {
      setConversations(prev => [conv, ...prev])
    }

    if (onSelectConversation) {
      onSelectConversation(conv)
    } else {
      router.push(`/chat/${selectedUser.id}`)
    }
  }

  async function confirmLogout() {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/login')
    } finally {
      setLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">

        {/* top header — dark teal */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: '#0D2D2A' }}
        >
          <div className="flex items-center gap-2">
            {/* logo mark */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(29,158,117,0.25)',
                border: '1px solid rgba(29,158,117,0.4)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="7" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="1" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </div>
            <span className="text-[13px] font-medium text-white">WhisperBox</span>
          </div>

          {/* new conversation button */}
          <button
            onClick={() => setShowNewConv(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(29,158,117,0.2)',
              border: '1px solid rgba(29,158,117,0.35)',
            }}
            aria-label="New conversation"
          >
            <LuSquarePen size={13} color="#1D9E75" />
          </button>
        </div>

        {/* search bar */}
        <div
          className="px-3 py-2.5 flex-shrink-0"
          style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: 'var(--color-background-secondary)',
              border: '0.5px solid grey',
            }}
          >
            <LuSearch size={12} color="var(--color-text-tertiary)" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 border-none bg-transparent text-[11px] outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* section label */}
        <div className="px-4 py-2 flex-shrink-0">
          <p
            className="text-[9px] font-medium tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Recent
          </p>
        </div>

        {/* conversation list */}
        <div className="flex-1 overflow-y-auto px-2">
          {loading && (
            <div className="flex justify-center py-8">
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: '#9FE1CB', borderTopColor: '#1D9E75' }}
              />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                {search ? 'No conversations found' : 'No conversations yet'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowNewConv(true)}
                  className="text-[11px] font-medium"
                  style={{ color: '#1D9E75' }}
                >
                  Start a new conversation
                </button>
              )}
            </div>
          )}

          {filtered.map(conv => {
            const colors = getAvatarColor(conv.display_name)
            const isActive = conv.user_id === activeUserId

            return (
              <button
                key={conv.user_id}
                onClick={() => {
                  if (onSelectConversation) {
                    onSelectConversation(conv)
                  } else {
                    router.push(`/chat/${conv.user_id}`)
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors"
                style={{
                  background: isActive ? '#E1F5EE' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-background-secondary)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-medium relative"
                  style={{ background: colors.bg, color: colors.color }}
                >
                  {getInitials(conv.display_name)}
                  {/* online dot — in real app this would be dynamic */}
                  <div
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: '#1D9E75',
                      border: `2px solid ${isActive ? '#E1F5EE' : 'var(--color-background-primary)'}`,
                    }}
                  />
                </div>

                {/* conversation info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className="text-[12px] font-medium truncate"
                      style={{ color: isActive ? '#085041' : 'var(--color-text-primary)' }}
                    >
                      {conv.display_name}
                    </p>
                    <span
                      className="text-[9px] flex-shrink-0 ml-2"
                      style={{ color: isActive ? '#0F6E56' : 'var(--color-text-tertiary)' }}
                    >
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* small lock icon on preview */}
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <rect x="0.5" y="3" width="6" height="4" rx="1" stroke={isActive ? '#0F6E56' : '#aaa'} strokeWidth="0.8"/>
                      <path d="M2 3V2a1.5 1.5 0 013 0v1" stroke={isActive ? '#0F6E56' : '#aaa'} strokeWidth="0.8" strokeLinecap="round"/>
                    </svg>
                    <p
                      className="text-[10px] truncate"
                      style={{ color: isActive ? '#0F6E56' : 'var(--color-text-secondary)' }}
                    >
                      Encrypted message
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* footer — current user */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
          style={{ borderTop: '0.5px solid var(--color-border-tertiary)' }}
        >
          {/* user avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium"
            style={{
              background: '#E1F5EE',
              border: '1.5px solid #5DCAA5',
              color: '#085041',
            }}
          >
            {user ? getInitials(user.display_name) : 'YN'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {user?.display_name || 'Your Name'}
            </p>
            <p className="text-[9px]" style={{ color: '#1D9E75' }}>Online</p>
          </div>

          {/* logout button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            style={{
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
            }}
            aria-label="Log out"
          >
            <LuLogOut size={13} color="var(--color-text-secondary)" />
          </button>
        </div>

      </div>

      {/* new conversation modal */}
      {showNewConv && (
        <NewConversationModal
          onClose={() => setShowNewConv(false)}
          onSelect={handleNewConversation}
        />
      )}

      {/* logout confirmation modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => !loggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-5 flex flex-col gap-4"
            style={{ border: '1px solid #e0ddd8' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#FCEBEB' }}
              >
                <LuLogOut size={16} color="#A32D2D" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[13px] font-semibold" style={{ color: '#111827' }}>
                  Log out?
                </h3>
                <p className="text-[11px] leading-relaxed" style={{ color: '#6b7280' }}>
                  You&apos;ll need to sign in again to read your messages.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors disabled:opacity-50"
                style={{
                  background: '#fafaf8',
                  border: '1px solid #e0ddd8',
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={loggingOut}
                className="flex-1 rounded-lg py-2 text-[12px] font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#A32D2D' }}
              >
                {loggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}