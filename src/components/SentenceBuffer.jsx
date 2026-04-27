import React, { useEffect, useRef } from 'react';

/**
 * SentenceBuffer – the "Buffer Bar" for User A's sign-to-speech flow.
 *
 * Props:
 *   words       – string[]  – accumulated words
 *   onSpeak     – () => void – called when user wants to speak the sentence
 *   onClear     – () => void – clears the buffer
 *   isSpeaking  – bool      – TTS is currently active
 */
export default function SentenceBuffer({ words = [], onSpeak, onClear, isSpeaking }) {
  const scrollRef = useRef(null);

  // Auto-scroll chip row when new words arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [words]);

  const isEmpty = words.length === 0;

  return (
    <div
      className="max-w-6xl mx-auto mt-4 rounded-2xl border border-emerald-500/20 bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden"
      style={{ boxShadow: '0 0 30px rgba(16,185,129,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-emerald-950/30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isEmpty ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Sentence Builder
          </span>
          {words.length > 0 && (
            <span className="text-xs text-emerald-600 font-mono">
              ({words.length} word{words.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Hint */}
        <span className="text-[10px] text-slate-500 italic hidden sm:block">
          👍 = Add word &nbsp;|&nbsp; ✊ = Speak sentence &nbsp;|&nbsp; 🤙 = Clear
        </span>
      </div>

      {/* Chip row */}
      <div className="flex items-center gap-3 px-5 py-3 min-h-[60px]">
        {/* Scrollable chips */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {isEmpty ? (
            <span className="text-sm text-slate-500 italic select-none">
              Make a sign to add words here…
            </span>
          ) : (
            words.map((word, i) => (
              <span
                key={i}
                className="whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold
                           bg-emerald-500/15 border border-emerald-500/30 text-emerald-300
                           shadow-[0_0_8px_rgba(16,185,129,0.2)]
                           animate-[fadeInScale_0.25s_ease-out]"
              >
                {word}
              </span>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Speak button */}
          <button
            onClick={onSpeak}
            disabled={isEmpty || isSpeaking}
            title="Speak full sentence"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${isSpeaking
                ? 'bg-emerald-700/30 text-emerald-600 cursor-not-allowed'
                : isEmpty
                  ? 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'
              }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-1 14.93V20H9v2h6v-2h-2v-2.07A8.001 8.001 0 0120 11h-2a6 6 0 01-12 0H4a8.001 8.001 0 007 7.93z" />
            </svg>
            <span>{isSpeaking ? 'Speaking…' : 'Speak'}</span>
          </button>

          {/* Clear button */}
          <button
            onClick={onClear}
            disabled={isEmpty}
            title="Clear buffer"
            className={`p-2 rounded-xl transition-all duration-200
              ${isEmpty
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 active:scale-95'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Speaking progress bar */}
      {isSpeaking && (
        <div className="h-0.5 bg-slate-800 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-300 animate-[speakBar_2s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );
}
