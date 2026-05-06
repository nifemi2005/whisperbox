import { LuCheck, LuCheckCheck } from 'react-icons/lu'
import type { DecryptedMessage } from '../../types/message'

type Props = {
  message: DecryptedMessage
  currentUserId: string
  senderName?: string
  senderInitials?: string
}

function getAvatarColor(name: string): { bg: string; color: string; ring: string } {
  const palettes = [
    { bg: '#E6F1FB', color: '#0C447C', ring: '#7FB1E0' },
    { bg: '#FAEEDA', color: '#633806', ring: '#E0B968' },
    { bg: '#E1F5EE', color: '#085041', ring: '#5DCAA5' },
    { bg: '#EEEDFE', color: '#3C3489', ring: '#A39ED9' },
  ]
  const index = (name?.charCodeAt(0) || 0) % palettes.length
  return palettes[index]
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
  const isSent = message.from_user_id === currentUserId
  const colors = getAvatarColor(senderName || '')

  return (
    <div className={`flex flex-col w-full gap-1 ${isSent ? 'items-end' : 'items-start'}`}>

      {/* sender row — avatar + name above the bubble (received only) */}
      {!isSent && senderName && (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold"
            style={{
              background: colors.bg,
              color: colors.color,
              border: `1.5px solid ${colors.ring}`,
            }}
          >
            {senderInitials || '?'}
          </div>
          <span className="text-[12px] font-medium" style={{ color: '#1f2937' }}>
            {senderName}
          </span>
        </div>
      )}

      {/* bubble — indented past avatar for received messages so it aligns with name */}
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-[78%] md:max-w-[65%] ${!isSent && senderName ? 'ml-9' : ''}`}
        style={{
          background: isSent ? '#1D9E75' : '#ffffff',
          color: isSent ? '#ffffff' : '#1f2937',
          border: isSent ? 'none' : '1px solid #e5e7eb',
          boxShadow: isSent ? '0 1px 2px rgba(13,45,42,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          wordBreak: 'break-word',
        }}
      >
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
      </div>

      {/* meta row — green dot + encrypted + time + tick, BELOW the bubble */}
      <div className={`flex items-center gap-1.5 text-[10px] ${!isSent && senderName ? 'ml-9' : ''}`}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1D9E75' }} />
        <span style={{ color: '#9ca3af' }}>encrypted</span>
        <span style={{ color: '#9ca3af' }}>{formatTime(message.created_at)}</span>
        {isSent && (
          message.delivered
            ? <LuCheckCheck size={12} color="#1D9E75" />
            : <LuCheck size={12} color="#9ca3af" />
        )}
      </div>
    </div>
  )
}
