'use client'

import { useState } from 'react'
import ProtectedRoute from '../../components/shared/ProtectedRoute'
import ConversationList from '../../components/chat/ConversationList'
import ChatWindow from '../../components/chat/ChatWindow'
import type { ConversationSummary } from '../../types/message'

export default function ChatPage() {
  const [selectedConv, setSelectedConv] = useState<ConversationSummary | null>(null)

  return (
    <ProtectedRoute>
      <main className="h-screen flex overflow-hidden" style={{ background: '#F5F4F0' }}>

        {/* sidebar — always visible on desktop, full screen on mobile when no chat selected */}
        <div
          className={`
            flex-shrink-0 flex flex-col border-r
            w-full md:w-[280px] lg:w-[300px]
            ${selectedConv ? 'hidden md:flex' : 'flex'}
          `}
          style={{
            borderColor: '#e0ddd8',
            background: '#ffffff',
          }}
        >
          <ConversationList
            activeUserId={selectedConv?.user_id}
            onSelectConversation={setSelectedConv}
          />
        </div>

        {/* chat window — hidden on mobile when no chat selected */}
        <div
          className={`
            flex-1 flex flex-col
            ${selectedConv ? 'flex' : 'hidden md:flex'}
          `}
        >
          {selectedConv ? (
            <ChatWindow
              recipientId={selectedConv.user_id}
              recipientName={selectedConv.display_name}
              recipientUsername={selectedConv.username}
              onBack={() => setSelectedConv(null)}
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
              <p className="text-[14px] font-medium" style={{ color: '#111827' }}>
                Your messages are private
              </p>
              <p className="text-[12px] text-center max-w-xs" style={{ color: '#6b7280' }}>
                Select a conversation or start a new one. All messages are end-to-end encrypted.
              </p>
            </div>
          )}
        </div>

      </main>
    </ProtectedRoute>
  )
}