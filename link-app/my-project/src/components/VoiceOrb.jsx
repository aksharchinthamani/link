import React, { useEffect, useRef, useState } from 'react';

/**
 * VoiceOrb – pulsing, multi-ring orb that reacts to mic volume.
 *
 * Props:
 *   stream     – MediaStream from useSpeech (optional; falls back to silence)
 *   size       – 'sm' | 'md' | 'lg'  (default 'md')
 *   isSpeaking – bool   – external "activity" flag (TTS speaking on other side)
 */
const VOLUME_LOUD   = 55;   // threshold for red "shout" alert
const VOLUME_ACTIVE = 8;    // threshold for normal speaking

export default function VoiceOrb({ stream, size = 'md', isSpeaking = false }) {
  const orbRef    = useRef(null);
  const ring1Ref  = useRef(null);
  const ring2Ref  = useRef(null);
  const animIdRef = useRef(null);
  const [volume, setVolume] = useState(0); // 0-100

  // Audio analysis loop
  useEffect(() => {
    if (!stream) return;

    let audioCtx, analyser;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
    } catch (err) {
      console.warn('VoiceOrb AudioContext error:', err);
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length;
      const vol = Math.min(100, avg * 1.5);

      setVolume(vol);

      const isLoud = vol > VOLUME_LOUD;

      if (orbRef.current) {
        const coreScale = 1 + vol / 120;
        orbRef.current.style.transform = `scale(${coreScale})`;
        orbRef.current.style.boxShadow = isLoud
          ? `0 0 ${20 + vol / 4}px ${6 + vol / 8}px rgba(239,68,68,0.75)`
          : `0 0 ${12 + vol / 5}px ${4 + vol / 10}px rgba(59,130,246,${vol > VOLUME_ACTIVE ? 0.7 : 0.3})`;
        orbRef.current.style.background = isLoud
          ? 'radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 60%, #b91c1c)'
          : 'radial-gradient(circle at 35% 35%, #93c5fd, #3b82f6 60%, #1d4ed8)';
      }
      if (ring1Ref.current) {
        ring1Ref.current.style.transform = `scale(${1 + vol / 80})`;
        ring1Ref.current.style.opacity   = `${Math.max(0, 0.6 - vol / 200)}`;
        ring1Ref.current.style.borderColor = isLoud ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)';
      }
      if (ring2Ref.current) {
        ring2Ref.current.style.transform = `scale(${1 + vol / 50})`;
        ring2Ref.current.style.opacity   = `${Math.max(0, 0.35 - vol / 300)}`;
        ring2Ref.current.style.borderColor = isLoud ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)';
      }

      animIdRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      audioCtx.close();
    };
  }, [stream]);

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  const sz = sizeMap[size] || sizeMap.md;

  const isActive = volume > VOLUME_ACTIVE;
  const isLoud   = volume > VOLUME_LOUD;

  // Haptic feedback on loud noise (mobile)
  useEffect(() => {
    if (isLoud && navigator.vibrate) {
      navigator.vibrate(30); // short 30ms buzz
    }
  }, [isLoud]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Orb stack */}
      <div className={`relative flex items-center justify-center ${sz}`}>
        {/* Screen-shake shell when LOUD */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-75 ${isLoud ? 'animate-[shake_0.15s_ease-in-out_infinite]' : ''}`}
        >
          {/* Outermost ripple ring */}
          <div
            ref={ring2Ref}
            className="absolute inset-0 rounded-full border"
            style={{
              background: 'rgba(59,130,246,0.1)',
              borderColor: 'rgba(59,130,246,0.3)',
              willChange: 'transform, opacity',
            }}
          />
          {/* Middle ring */}
          <div
            ref={ring1Ref}
            className="absolute inset-0 rounded-full border"
            style={{
              background: 'rgba(59,130,246,0.2)',
              borderColor: 'rgba(59,130,246,0.5)',
              willChange: 'transform, opacity',
            }}
          />
          {/* Core orb */}
          <div
            ref={orbRef}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #93c5fd, #3b82f6 60%, #1d4ed8)',
              boxShadow: '0 0 12px 2px rgba(59,130,246,0.3)',
              willChange: 'transform, box-shadow, background',
              transition: 'background 0.3s ease',
            }}
          />
          {/* Mic icon */}
          <svg
            className="relative z-10 w-5 h-5 text-white drop-shadow"
            style={{ position: 'absolute', inset: 0, margin: 'auto' }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-1 14.93V20H9v2h6v-2h-2v-2.07A8.001 8.001 0 0020 11h-2a6 6 0 01-12 0H4a8.001 8.001 0 007 7.93z" />
          </svg>
        </div>
      </div>

      {/* Status label */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              isLoud   ? 'bg-red-400 animate-ping'  :
              isActive ? 'bg-blue-400 animate-pulse' :
                         'bg-slate-500'
            }`}
          />
          <span
            className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${
              isLoud   ? 'text-red-300'  :
              isActive ? 'text-blue-300' :
                         'text-slate-400'
            }`}
          >
            {isLoud ? '🔴 Loud!' : isActive ? 'Speaking' : 'Listening…'}
          </span>
        </div>

        {/* "User B is speaking…" activity indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-emerald-400 font-medium tracking-wider animate-pulse">
              ● User A is signing…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
