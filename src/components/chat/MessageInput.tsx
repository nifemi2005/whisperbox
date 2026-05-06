'use client'

import { useState, useRef, useEffect } from 'react'
import { LuSend, LuPaperclip } from 'react-icons/lu'

type Props = {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSend() {
    const trimmed = text.trim()
    // don't send empty messages
    if (!trimmed || sending || disabled) return

    setSending(true)
    try {
      await onSend(trimmed)
      // clear input after sending
      setText('')
    } finally {
      setSending(false)
      // refocus input after sending
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // send on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
      style={{
        background: 'var(--color-background-primary)',
        borderTop: '0.5px solid var(--color-border-tertiary)',
      }}
    >
      {/* input wrapper */}
      <div
        className="flex items-center gap-2 flex-1 rounded-full px-4 py-2 border transition-colors focus-within:border-[#1D9E75]"
        style={{
          background: '#fafaf8',
          borderColor: '#e0ddd8',
        }}
      >
        {/* attachment icon */}
        <button
          className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
          aria-label="Attach file"
          type="button"
        >
          <LuPaperclip size={15} color="var(--color-text-secondary)" />
        </button>

        {/* text input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          className="flex-1 border-none bg-transparent text-[12px] outline-none disabled:opacity-50"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending || disabled}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
        style={{ background: '#1D9E75' }}
        aria-label="Send message"
      >
        {sending ? (
          <div
            className="w-4 h-4 rounded-full border-2"
            style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }}
          />
        ) : (
          <LuSend size={15} color="white" />
        )}
      </button>
    </div>
  )
}