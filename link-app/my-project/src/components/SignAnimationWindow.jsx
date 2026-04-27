import React, { useState, useEffect, useRef } from 'react';

/**
 * SIGN_LIBRARY – maps keyword → display config.
 * When actual GIF/MP4 assets are added to public/signs/, replace
 * `emoji` with a `src` key and switch the renderer below.
 */
const SIGN_LIBRARY = {
  // ── Greetings & Conversation ──────────────────────────────────────────
  'how are you':  { emoji: '🤚', label: 'How Are You?',     color: '#38bdf8' },
  'nice to meet': { emoji: '🤝', label: 'Nice To Meet You', color: '#34d399' },
  'good morning': { emoji: '🌅', label: 'Good Morning',     color: '#fb923c' },
  'good night':   { emoji: '🌙', label: 'Good Night',       color: '#818cf8' },
  hello:          { emoji: '👋', label: 'Hello / Hi',       color: '#3b82f6' },
  goodbye:        { emoji: '👋', label: 'Goodbye',          color: '#3b82f6' },
  bye:            { emoji: '👋', label: 'Bye',              color: '#3b82f6' },
  hi:             { emoji: '👋', label: 'Hi',               color: '#3b82f6' },

  // ── Responses & Affirmations ──────────────────────────────────────────
  'thank you':    { emoji: '🙏', label: 'Thank You',        color: '#8b5cf6' },
  thanks:         { emoji: '🙏', label: 'Thank You',        color: '#8b5cf6' },
  sorry:          { emoji: '😔', label: 'Sorry',            color: '#a855f7' },
  please:         { emoji: '🤲', label: 'Please',           color: '#ec4899' },
  yes:            { emoji: '✅', label: 'Yes',              color: '#22c55e' },
  no:             { emoji: '❌', label: 'No',               color: '#ef4444' },
  okay:           { emoji: '👌', label: 'Okay',             color: '#22c55e' },
  good:           { emoji: '👍', label: 'Good',             color: '#22c55e' },
  great:          { emoji: '🌟', label: 'Great!',           color: '#f59e0b' },

  // ── Feelings ─────────────────────────────────────────────────────────
  happy:          { emoji: '😊', label: 'Happy',            color: '#facc15' },
  sad:            { emoji: '😔', label: 'Sad',              color: '#60a5fa' },
  hungry:         { emoji: '🍽️', label: 'Hungry',           color: '#f59e0b' },
  tired:          { emoji: '😴', label: 'Tired',            color: '#94a3b8' },
  pain:           { emoji: '😣', label: 'Pain',             color: '#f97316' },

  // ── Needs & Requests ─────────────────────────────────────────────────
  help:           { emoji: '🆘', label: 'Help',             color: '#ef4444' },
  stop:           { emoji: '✋', label: 'Stop',             color: '#eab308' },
  wait:           { emoji: '🤚', label: 'Wait',             color: '#eab308' },
  water:          { emoji: '💧', label: 'Water',            color: '#06b6d4' },
  food:           { emoji: '🍽️', label: 'Food',             color: '#f59e0b' },
  medicine:       { emoji: '💊', label: 'Medicine',         color: '#a855f7' },
  toilet:         { emoji: '🚻', label: 'Toilet',           color: '#94a3b8' },
  phone:          { emoji: '📞', label: 'Phone / Call',     color: '#34d399' },
};


// Ordered by specificity (multi-word first)
const KEYWORDS = Object.keys(SIGN_LIBRARY).sort((a, b) => b.length - a.length);

/**
 * SignAnimationWindow
 * Props:
 *   transcript – the running speech transcript string (from useSpeech)
 */
export default function SignAnimationWindow({ transcript }) {
  const [activeSign, setActiveSign] = useState(null);
  const [history, setHistory]       = useState([]);
  const [animate, setAnimate]       = useState(false);

  // Track how much of the transcript we've already scanned so we only
  // inspect genuinely NEW text on each update (avoids re-firing old keywords).
  const scannedUpToRef = useRef(0);

  useEffect(() => {
    if (!transcript) return;

    // Only look at text that was added since the last scan.
    // This prevents old keywords (e.g. "hello") from blocking new ones
    // (e.g. "how are you") because the transcript keeps accumulating.
    const newText = transcript.slice(scannedUpToRef.current).toLowerCase();
    if (!newText.trim()) return;

    const found = KEYWORDS.find((kw) => newText.includes(kw));

    if (found) {
      // Advance the scan pointer past the matched keyword so it won't re-fire.
      // Use the full transcript length so even partial overlaps are skipped.
      scannedUpToRef.current = transcript.length;

      const sign = { ...SIGN_LIBRARY[found], key: found };
      setActiveSign(sign);
      setAnimate(false);
      // Trigger CSS entrance animation on next two frames
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));

      setHistory((prev) => [sign, ...prev].slice(0, 5));

      // Auto-clear after 4 s
      const t = setTimeout(() => setActiveSign(null), 4000);
      return () => clearTimeout(t);
    } else {
      // No keyword found yet – still advance pointer so we don't re-scan
      // the same text again on the next interim update.
      scannedUpToRef.current = transcript.length;
    }
  }, [transcript]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Main display area ─────────────────────────────────── */}
      <div
        className="flex-1 min-h-[150px] shrink-0 flex flex-col items-center justify-center rounded-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
          border: '1px solid rgba(148,163,184,0.1)',
        }}
      >
        {/* Ambient glow behind active sign */}
        {activeSign && (
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${activeSign.color}22 0%, transparent 70%)`,
              opacity: animate ? 1 : 0,
            }}
          />
        )}

        {activeSign ? (
          /* ── Active sign card ──────────────────────────────── */
          <div
            className="relative z-10 flex flex-col items-center gap-3 transition-all duration-500"
            style={{
              opacity: animate ? 1 : 0,
              transform: animate ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(16px)',
            }}
          >
            {/* If a real video/gif file exists, swap this div for a <video> or <img> */}
            <div
              className="w-36 h-36 rounded-3xl flex items-center justify-center text-8xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${activeSign.color}33, ${activeSign.color}11)`,
                border: `2px solid ${activeSign.color}55`,
                boxShadow: `0 0 32px ${activeSign.color}44`,
              }}
            >
              {activeSign.emoji}
            </div>

            {/* Sign label text */}
            <p
              className="text-sm font-bold text-center tracking-wide"
              style={{ color: activeSign.color }}
            >
              {activeSign.label}
            </p>

            {/* Progress bar – auto-drains in 4s */}
            <div className="w-36 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: animate ? '0%' : '100%',
                  background: activeSign.color,
                  transition: 'width 4s linear',
                }}
              />
            </div>
          </div>
        ) : (
          /* ── Idle state ──────────────────────────────────────────── */
          <div className="flex flex-col items-center gap-3 opacity-30">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center">
              {/* Hand / gesture icon */}
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0V11" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 text-center leading-snug">
              Waiting for<br />speech keywords…
            </p>
          </div>
        )}
      </div>

      {/* ── Keyword history chips ──────────────────────────────── */}
      {history.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 justify-center shrink-0">
          {history.map((s, i) => (
            <span
              key={`${s.key}-${i}`}
              className="px-3 py-1.5 rounded-2xl text-2xl shadow-sm"
              style={{
                background: `${s.color}33`,
                border: `1px solid ${s.color}55`,
                color: s.color,
                opacity: 1 - i * 0.18,
              }}
            >
              {s.emoji}
            </span>
          ))}
        </div>
      )}

      {/* ── Keyword legend ─────────────────────────────────────── */}
      <div className="mt-2 pt-2 border-t border-slate-700/50 overflow-y-auto min-h-0">
        <p className="text-[10px] text-slate-500 text-center mb-1 uppercase tracking-widest sticky top-0 bg-black/80 backdrop-blur-md">Listening for</p>
        <div className="flex flex-wrap gap-1 justify-center">
          {KEYWORDS.filter(k => !['thanks'].includes(k)).map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800 border border-slate-700"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
