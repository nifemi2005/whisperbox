'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LuChevronLeft, LuLock, LuEllipsis } from 'react-icons/lu'
import { useAuth } from '../../context/AuthContext'
import { getMessageHistory, getUserPublicKey, sendMessage } from '../../lib/api'
import { getPrivateKey } from '../../lib/storage'
import { encryptMessage, decryptMessage } from '../../lib/crypto'
import type { MessageResponse, DecryptedMessage } from '../../types/message'
import type { User } from '../../types/auth'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

type Props = {
  recipientId: string
  recipientUser?: User
  onBack?: () => void
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string): { bg: string; color: string } {
  const colors = [
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#EEEDFE', color: '#3C3489' },
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export default function ChatWindow({ recipientId, recipientUser, onBack }: Props) {
  const router = useRouter()
  const { user } = useAuth()

  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipientName, setRecipientName] = useState(
    recipientUser?.display_name || 'Loading...'
  )
  const [recipientPublicKey, setRecipientPublicKey] = useState<string | null>(null)

  // ref to scroll to bottom of messages
  const bottomRef = useRef<HTMLDivElement>(null)

  // scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // decrypt a single message
  const decryptSingleMessage = useCallback(
    async (msg: MessageResponse, privateKey: CryptoKey): Promise<DecryptedMessage> => {
      try {
        const isSent = msg.from_user_id === user?.id

        // use the correct encrypted key based on whether we sent or received
        const encryptedKeyToUse = isSent
          ? msg.payload.encryptedKeyForSelf
          : msg.payload.encryptedKey

        const text = await decryptMessage(
          msg.payload.ciphertext,
          msg.payload.iv,
          encryptedKeyToUse,
          privateKey
        )

        return {
          id: msg.id,
          from_user_id: msg.from_user_id,
          to_user_id: msg.to_user_id,
          text,
          created_at: msg.created_at,
          delivered: msg.delivered,
        }
      } catch {
        // if decryption fails show a placeholder
        return {
          id: msg.id,
          from_user_id: msg.from_user_id,
          to_user_id: msg.to_user_id,
          text: '[Failed to decrypt message]',
          created_at: msg.created_at,
          delivered: msg.delivered,
        }
      }
    },
    [user?.id]
  )

  // load message history
  useEffect(() => {
    if (!user) return

    async function load() {
      setLoading(true)
      setError(null)

      try {
        // get private key from IndexedDB
        const privateKey = await getPrivateKey(user!.id)
        if (!privateKey) {
          setError('Private key not found. Please log in again.')
          return
        }

        // get recipient public key and message history in parallel
        const [history, pubKey] = await Promise.all([
          getMessageHistory(recipientId),
          getUserPublicKey(recipientId),
        ])

        setRecipientPublicKey(pubKey)

        // decrypt all messages
        const decrypted = await Promise.all(
          history.map(msg => decryptSingleMessage(msg, privateKey))
        )

        // sort by date oldest first
        decrypted.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        setMessages(decrypted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [recipientId, user, decryptSingleMessage])

  // send a new message
  async function handleSend(text: string) {
    if (!user || !recipientPublicKey) return

    const privateKey = await getPrivateKey(user.id)
    if (!privateKey) return

    try {
      // encrypt the message
      const payload = await encryptMessage(
        text,
        recipientPublicKey,
        user.public_key
      )

      // send to server
      const sent = await sendMessage(recipientId, payload)

      // add to local messages immediately (optimistic update)
      const newMessage: DecryptedMessage = {
        id: sent.id,
        from_user_id: user.id,
        to_user_id: recipientId,
        text,
        created_at: sent.created_at,
        delivered: sent.delivered,
      }

      setMessages(prev => [...prev, newMessage])
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    }
  }

  const avatarColors = getAvatarColor(recipientName)

  // group messages by date for date dividers
  function getDateDividers() {
    const seen = new Set<string>()
    return messages.map(msg => {
      const date = new Date(msg.created_at).toDateString()
      const showDivider = !seen.has(date)
      seen.add(date)
      return { msg, showDivider }
    })
  }

  return (
    <div className="flex flex-col h-full">

      {/* chat header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: 'var(--color-background-primary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
        }}
      >
        {/* back button — shown on mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex-shrink-0 md:hidden"
            aria-label="Go back"
          >
            <LuChevronLeft size={22} color="var(--color-text-primary)" />
          </button>
        )}

        {/* recipient avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-medium"
          style={{ background: avatarColors.bg, color: avatarColors.color }}
        >
          {getInitials(recipientName)}
        </div>

        {/* recipient info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
            {recipientName}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1D9E75' }} />
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
              Online
            </p>
          </div>
        </div>

        {/* e2e badge + options */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: '#E1F5EE', border: '0.5px solid #5DCAA5' }}
          >
            <LuLock size={9} color="#085041" />
            <span className="text-[9px] font-medium" style={{ color: '#085041' }}>
              End-to-end encrypted
            </span>
          </div>

          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
            }}
            aria-label="More options"
          >
            <LuEllipsis size={14} color="var(--color-text-secondary)" />
          </button>
        </div>
      </div>

      {/* messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {loading && (
          <div className="flex justify-center py-8">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: '#9FE1CB', borderTopColor: '#1D9E75' }}
            />
          </div>
        )}

        {error && (
          <div
            className="text-center text-[11px] py-3 px-4 rounded-lg mx-auto"
            style={{ background: '#FCEBEB', color: '#A32D2D', maxWidth: 300 }}
          >
            {error}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: '#E1F5EE' }}
            >
              <LuLock size={20} color="#1D9E75" />
            </div>
            <p className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
              No messages yet
            </p>
            <p className="text-[11px] text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Your messages are end-to-end encrypted.<br />Only you and {recipientName} can read them.
            </p>
          </div>
        )}

        {getDateDividers().map(({ msg, showDivider }) => (
          <div key={msg.id}>
            {showDivider && (
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px" style={{ background: 'var(--color-border-tertiary)' }} />
                <div
                  className="text-[9px] px-3 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  {formatDate(msg.created_at)}
                </div>
                <div className="flex-1 h-px" style={{ background: 'var(--color-border-tertiary)' }} />
              </div>
            )}
            <MessageBubble
              message={msg}
              currentUserId={user?.id || ''}
              senderName={msg.from_user_id !== user?.id ? recipientName : undefined}
              senderInitials={msg.from_user_id !== user?.id ? getInitials(recipientName) : undefined}
            />
          </div>
        ))}

        {/* invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>

      {/* message input */}
      <MessageInput
        onSend={handleSend}
        disabled={loading || !!error}
      />
    </div>
  )
}