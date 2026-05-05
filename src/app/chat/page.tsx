'use client'

import { useState } from 'react'
import ProtectedRoute from '../../components/shared/ProtectedRoute'
import ConversationList from '../../components/chat/ConversationList'
import ChatWindow from '../../components/chat/ChatWindow'

export default function ChatPage() {
  // selected conversation — only used on desktop split view
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  return (
    <ProtectedRoute>
      <main className="h-screen flex overflow-hidden" style={{ background: '#F5F4F0' }}>

        {/* sidebar — always visible on desktop, full screen on mobile when no chat selected */}
        <div
          className={`
            flex-shrink-0 flex flex-col border-r
            w-full md:w-[280px] lg:w-[300px]
            ${selectedUserId ? 'hidden md:flex' : 'flex'}
          `}
          style={{
            borderColor: 'var(--color-border-tertiary)',
            background: 'var(--color-background-primary)',
          }}
        >
          <ConversationList
            activeUserId={selectedUserId || undefined}
            onSelectConversation={setSelectedUserId}
          />
        </div>

        {/* chat window — hidden on mobile when no chat selected */}
        <div
          className={`
            flex-1 flex flex-col
            ${selectedUserId ? 'flex' : 'hidden md:flex'}
          `}
        >
          {selectedUserId ? (
            <ChatWindow
              recipientId={selectedUserId}
              onBack={() => setSelectedUserId(null)}
            />
          ) : (
            /* empty state — desktop only */
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#E1F5EE' }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="3" y="12" width="22" height="14" rx="3" fill="rgba(29,158,117,0.2)" stroke="#1D9E75" strokeWidth="1.5"/>
                  <path d="M9 12V8.5a5 5 0 0110 0V12" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="14" cy="19" r="2" fill="#1D9E75"/>
                </svg>
              </div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Your messages are private
              </p>
              <p className="text-[12px] text-center max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Select a conversation or start a new one. All messages are end-to-end encrypted.
              </p>
            </div>
          )}
        </div>

      </main>
    </ProtectedRoute>
  )
}