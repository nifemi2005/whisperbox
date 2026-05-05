export default function AuthPanel() {
  return (
    <div
      className="flex flex-row md:flex-col items-center justify-center gap-4 p-6 md:p-8 h-full min-h-[120px]"
      style={{ background: "#0D2D2A" }}
    >
      {/* lock icon */}
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(29,158,117,0.15)",
          border: "1px solid rgba(29,158,117,0.3)",
        }}
      >
        <div
          className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(29,158,117,0.2)",
            border: "1px solid rgba(29,158,117,0.4)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect
              x="3"
              y="10"
              width="16"
              height="10"
              rx="2.5"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.4"
            />
            <path
              d="M7 10V7.5a4 4 0 018 0V10"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="11" cy="15.5" r="1.4" fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>
      </div>

      {/* brand info — row on mobile, column on desktop */}
      <div className="flex flex-col md:items-center gap-1 md:gap-3">
        <p className="text-white font-medium text-base tracking-tight">
          WhisperBox
        </p>

        {/* divider — hidden on mobile */}
        <div
          className="hidden md:block w-8"
          style={{ height: "0.5px", background: "rgba(255,255,255,0.1)" }}
        />

        <p
          className="text-[10px] leading-relaxed md:text-center"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Private. Simple. Yours.
        </p>
      </div>
    </div>
  );
}
