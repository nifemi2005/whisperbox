'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../../components/shared/ProtectedRoute'
import ConversationList from '../../../components/chat/ConversationList'
import ChatWindow from '../../../components/chat/ChatWindow'

export default function ChatUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  const router = useRouter()

  return (
    <ProtectedRoute>
      <main className="h-screen flex overflow-hidden" style={{ background: '#F5F4F0' }}>

        {/* sidebar — hidden on mobile */}
        <div
          className="hidden md:flex flex-shrink-0 flex-col border-r w-[280px] lg:w-[300px]"
          style={{
            borderColor: 'var(--color-border-tertiary)',
            background: 'var(--color-background-primary)',
          }}
        >
          <ConversationList activeUserId={userId} />
        </div>

        {/* chat window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            recipientId={userId}
            onBack={() => router.push('/chat')}
          />
        </div>

      </main>
    </ProtectedRoute>
  )
}