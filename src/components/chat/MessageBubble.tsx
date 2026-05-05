import { LuLock, LuCheck, LuCheckCheck } from 'react-icons/lu'
import type { DecryptedMessage } from '../../types/message'

type Props = {
  message: DecryptedMessage
  currentUserId: string
  senderName?: string
  senderInitials?: string
}

function getAvatarColor(name: string): { bg: string; color: string } {
  const colors = [
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#EEEDFE', color: '#3C3489' },
  ]
  const index = (name?.charCodeAt(0) || 0) % colors.length
  return colors[index]
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MessageBubble({
  message,
  currentUserId,
  senderName,
  senderInitials,
}: Props) {
  // is this message sent by the current user?
  const isSent = message.from_user_id === currentUserId
  const colors = getAvatarColor(senderName || '')

  return (
    <div className={`flex flex-col gap-1 ${isSent ? 'items-end' : 'items-start'}`}>

      {/* sender name + avatar for received messages */}
      {!isSent && senderName && (
        <div className="flex items-center gap-1.5 ml-8">
          <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
            {senderName}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* avatar for received messages */}
        {!isSent && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-medium"
            style={{ background: colors.bg, color: colors.color }}
          >
            {senderInitials || '?'}
          </div>
        )}

        {/* message bubble */}
        <div
          className="max-w-[75%] md:max-w-[65%] rounded-2xl px-3 py-2.5 word-break"
          style={{
            background: isSent ? '#1D9E75' : 'var(--color-background-primary)',
            border: isSent ? 'none' : '0.5px solid var(--color-border-tertiary)',
            borderBottomRightRadius: isSent ? 4 : 16,
            borderBottomLeftRadius: isSent ? 16 : 4,
            wordBreak: 'break-word',
          }}
        >
          {/* message text */}
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: isSent ? '#fff' : 'var(--color-text-primary)' }}
          >
            {message.text}
          </p>

          {/* message footer — time + encrypted indicator + tick */}
          <div className="flex items-center justify-end gap-1.5 mt-1.5">
            {/* encrypted indicator */}
            <div className="flex items-center gap-1">
              <LuLock
                size={8}
                color={isSent ? 'rgba(255,255,255,0.5)' : '#1D9E75'}
              />
              <span
                className="text-[9px]"
                style={{ color: isSent ? 'rgba(255,255,255,0.5)' : '#0F6E56' }}
              >
                encrypted
              </span>
            </div>

            {/* timestamp */}
            <span
              className="text-[9px]"
              style={{ color: isSent ? 'rgba(255,255,255,0.55)' : 'var(--color-text-tertiary)' }}
            >
              {formatTime(message.created_at)}
            </span>

            {/* delivery tick for sent messages */}
            {isSent && (
              message.delivered
                ? <LuCheckCheck size={11} color="rgba(255,255,255,0.7)" />
                : <LuCheck size={11} color="rgba(255,255,255,0.5)" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}