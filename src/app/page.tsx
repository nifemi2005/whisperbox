import Link from 'next/link'

export const metadata = {
  title: 'WhisperBox — Private. Simple. Yours.',
}

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#0D2D2A' }}
    >
      <div className="w-full max-w-lg flex flex-col items-center gap-8 text-center">

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(29,158,117,0.15)',
            border: '1px solid rgba(29,158,117,0.3)',
          }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(29,158,117,0.2)',
              border: '1px solid rgba(29,158,117,0.4)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="10" width="16" height="10" rx="2.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" />
              <path d="M7 10V7.5a4 4 0 018 0V10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="11" cy="15.5" r="1.4" fill="rgba(255,255,255,0.9)" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-white text-3xl md:text-4xl font-medium tracking-tight">
            WhisperBox
          </h1>
          <p
            className="text-[13px] md:text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Private messaging that stays between you and the people you talk to.
            Every message is end-to-end encrypted in your browser before it ever touches our servers.
          </p>
        </div>

        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(29,158,117,0.15)', border: '0.5px solid rgba(93,202,165,0.4)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5DCAA5' }} />
          <span className="text-[11px]" style={{ color: '#9FE1CB' }}>
            End-to-end encrypted
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-sm mt-2">
          <Link
            href="/register"
            className="flex-1 rounded-lg py-2.5 text-[13px] font-medium text-white text-center transition-colors"
            style={{ background: '#1D9E75' }}
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="flex-1 rounded-lg py-2.5 text-[13px] font-medium text-center transition-colors"
            style={{
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            Sign in
          </Link>
        </div>

        <p
          className="text-[10px] mt-2"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Private. Simple. Yours.
        </p>

      </div>
    </main>
  )
}
