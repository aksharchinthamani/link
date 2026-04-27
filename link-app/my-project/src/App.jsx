import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import SignOverlay from './components/SignOverlay';
import TranscriptBox from './components/TranscriptBox';
import VoiceOrb from './components/VoiceOrb';
import SignAnimationWindow from './components/SignAnimationWindow';
import DeveloperConsole from './components/DeveloperConsole';
import { useSpeech } from './hooks/useSpeech';

function App() {
  const [lang, setLang] = useState('en-IN');
  const { finalTranscript, interimTranscript, isListening, micStream } = useSpeech(lang);

  const [fps, setFps]             = useState(0);
  const [landmarks, setLandmarks] = useState(0);
  const [modelState, setModelState] = useState('Idle');
  const [focusMode, setFocusMode] = useState(false);
  const webcamRef = useRef(null);

  // ── TTS state ─────────────────────────────────────────────────────────────
  const [isTtsSpeaking, setIsTtsSpeaking]   = useState(false);
  const [lastSignLabel, setLastSignLabel]   = useState('');
  const lastSpokenSignRef = useRef(null); // debounce identical consecutive signs
  const ttsUnlockedRef    = useRef(false);  // browsers require a user gesture before TTS

  // ── Combine transcripts for keyword matching ──────────────────────────────
  const fullTranscript = finalTranscript + ' ' + interimTranscript;

  // ── Unlock TTS on first interaction (browser autoplay policy) ────────────
  const unlockTts = useCallback(() => {
    if (ttsUnlockedRef.current) return;
    ttsUnlockedRef.current = true;
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
  }, []);

  // ── TTS helper: speak a string ────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsTtsSpeaking(true);
    utterance.onend   = () => setIsTtsSpeaking(false);
    utterance.onerror = () => setIsTtsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  // ── Gesture handler from SignOverlay ──────────────────────────────────────
  // Every confirmed gesture is spoken IMMEDIATELY — no manual click needed.
  const handleGestureDetected = useCallback((gesture) => {
    if (!gesture || gesture === 'Analyzing...') return;

    // Debounce: don't re-speak the same sign until it changes
    if (gesture === lastSpokenSignRef.current) return;
    lastSpokenSignRef.current = gesture;
    setLastSignLabel(gesture);

    // Speak the recognised sign straight away
    speak(gesture);

    // Allow the same sign to trigger again after 3 s
    setTimeout(() => {
      lastSpokenSignRef.current = null;
    }, 3000);
  }, [speak]);

  return (
    <div
      className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden"
      onClick={unlockTts}
    >

      {/* ── Ambient background orbs ──────────────────────────────────────── */}
      <div
        className="ambient-orb w-96 h-96 top-[-80px] left-[-80px] opacity-20"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)', animationDelay: '0s' }}
      />
      <div
        className="ambient-orb w-96 h-96 bottom-[-80px] right-[-80px] opacity-15"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', animationDelay: '4s' }}
      />

      {/* ── Content wrapper (above orbs) ─────────────────────────────────── */}
      <div className="relative z-10 p-4 pb-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="text-center mb-6 flex flex-col items-center">
          {/* Logo wordmark */}
          <div className="mb-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass-emerald flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
              LINK
            </h1>
          </div>
          <p className="text-slate-400 text-sm tracking-wider">Bridging the Communication Gap</p>

          {/* Controls row */}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {/* Language selector */}
            <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl shadow-inner">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Language</span>
              <select
                className="bg-transparent text-white text-sm rounded outline-none focus:ring-1 focus:ring-emerald-500/60 transition-shadow cursor-pointer"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="en-IN" className="bg-slate-900">English (India)</option>
              </select>
            </div>

            {/* Focus Mode toggle */}
            <button
              id="btn-focus-mode"
              onClick={() => setFocusMode(!focusMode)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 text-sm ${
                focusMode
                  ? 'glass-emerald text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'glass text-slate-300 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
            </button>

            {/* Quick-speak test */}
            <button
              id="btn-test-tts"
              onClick={() => speak('Hello, testing LINK!')}
              className="px-4 py-2 rounded-xl font-semibold glass-blue text-blue-300 hover:text-white transition-all duration-200 flex items-center space-x-2 text-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>Test TTS</span>
            </button>
          </div>
        </header>

        {/* ── Gesture key legend ──────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mb-4 flex flex-wrap justify-center gap-3">
          {[
            { emoji: '🤚', label: 'Any sign → speaks immediately' },
            { emoji: '🔊', label: 'Audio output is automatic' },
          ].map(({ emoji, label }) => (
            <div key={label} className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-slate-400">
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <main
          className={`relative max-w-6xl mx-auto transition-all duration-500 ${
            focusMode ? 'h-[65vh]' : 'grid grid-cols-1 md:grid-cols-2 gap-6'
          }`}
        >

          {/* ── USER A'S SIDE (Sign → Instant Speech) ──────────────────── */}
          <div className={`flex flex-col space-y-3 transition-all duration-500 ${focusMode ? 'h-full w-full' : ''}`}>
            <div
              className={`relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-black group
                shadow-[0_0_30px_rgba(16,185,129,0.12)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]
                transition-shadow duration-500 ${focusMode ? 'h-full' : 'aspect-video'}`}
            >
              <Webcam
                ref={webcamRef}
                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-300"
                mirrored={true}
              />

              {/* Glassmorphism overlay vignette */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(2,6,23,0.6) 100%)' }}
              />

              <SignOverlay
                webcamRef={webcamRef}
                onMetricsUpdate={(f, l) => { setFps(f); setLandmarks(l); }}
                onGestureDetected={handleGestureDetected}
                onModelStateChange={setModelState}
              />

              {/* Tracking badge */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 glass px-3 py-1.5 rounded-full z-10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-300 tracking-wide">Hand Tracking</span>
              </div>

              {/* Label */}
              <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full z-10">
                <span className="text-xs text-slate-300 font-medium">User A</span>
              </div>

              {/* Speaking flash — shown while TTS is active */}
              {isTtsSpeaking && (
                <div className="absolute top-14 left-4 glass-emerald px-3 py-1 rounded-full z-10 animate-[fadeInScale_0.25s_ease-out]">
                  <span className="text-xs text-emerald-300 font-semibold animate-pulse">🔊 Speaking…</span>
                </div>
              )}

              {/* Sign status bar */}
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white drop-shadow">
                    {lastSignLabel
                      ? <>Last sign: <span className="text-emerald-300 font-bold">{lastSignLabel}</span></>
                      : <span className="text-slate-400">Show a sign to speak</span>
                    }
                  </span>
                  {isTtsSpeaking && (
                    <span className="text-xs text-emerald-400 font-medium animate-pulse">🔊 Speaking…</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── USER B'S SIDE (Speech → Sign Animation) ──────────────────── */}
          <div
            className={`flex flex-col space-y-3 transition-all duration-500 z-20 ${
              focusMode
                ? 'absolute bottom-4 right-4 w-64 md:w-80 shadow-2xl hover:scale-105 transform origin-bottom-right'
                : ''
            }`}
          >
            <div
              className={`relative rounded-2xl overflow-hidden border border-blue-500/30
                bg-slate-900/60 shadow-[0_0_30px_rgba(59,130,246,0.1)]
                hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-shadow duration-500
                flex items-center justify-center ${focusMode ? 'aspect-video' : 'aspect-video'}`}
            >
              {/* Glassmorphism inner bg */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.05), transparent 70%)',
                }}
              />

              {/* Avatar */}
              <div className={`text-center transition-transform ${focusMode ? 'scale-75' : ''}`}>
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center
                                glass border-2 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {!focusMode && (
                  <h3 className="text-lg font-semibold text-slate-200">User B</h3>
                )}
              </div>

              {/* Listening / Mic badge */}
              <div
                className={`absolute top-4 right-4 flex items-center space-x-2 glass rounded-full z-10 ${
                  focusMode ? 'px-2 py-1' : 'px-3 py-1.5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-blue-400 animate-pulse' : 'bg-red-500'}`} />
                {!focusMode && (
                  <span className={`text-xs font-semibold ${isListening ? 'text-blue-300' : 'text-red-400'}`}>
                    {isListening ? 'Listening…' : 'Mic Off'}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full z-10">
                <span className="text-xs text-slate-300 font-medium">User B</span>
              </div>

              {/* VoiceOrb */}
              <div className="absolute bottom-4 left-4 glass rounded-xl z-10 p-3">
                <VoiceOrb
                  stream={micStream}
                  size={focusMode ? 'sm' : 'md'}
                  isSpeaking={isTtsSpeaking}
                />
              </div>

              {/* Sign Animation Window */}
              {!focusMode && (
                <div
                  className="absolute bottom-4 right-4 w-44 h-64 flex flex-col glass-blue rounded-xl z-10 p-3 shadow-2xl"
                  style={{ boxShadow: '0 0 25px rgba(59,130,246,0.15)' }}
                >
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 text-center">
                    Sign Interpreter
                  </p>
                  <div className="flex-1 min-h-0">
                    <SignAnimationWindow transcript={fullTranscript} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>



        {/* ── Sign Animation (full-width in focus mode) ───────────────────── */}
        {focusMode && (
          <div className="max-w-6xl mx-auto mt-4 p-4 glass-blue rounded-2xl shadow-xl">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 text-center">
              Live Sign Interpreter — User B's Speech
            </p>
            <SignAnimationWindow transcript={fullTranscript} />
          </div>
        )}

        {/* ── Footer: transcript + dev console ───────────────────────────── */}
        <TranscriptBox finalTranscript={finalTranscript} interimTranscript={interimTranscript} />
        <DeveloperConsole fps={fps} landmarks={landmarks} modelState={modelState} />
      </div>
    </div>
  );
}

export default App;