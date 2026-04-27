import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer() {
  const orbRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;

    async function setupAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!orbRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Map average volume to scale
          const scale = 1 + (average / 128); 
          orbRef.current.style.transform = `scale(${scale})`;
          
          animationRef.current = requestAnimationFrame(draw);
        };

        draw();
      } catch (err) {
        console.error("Error accessing microphone for visualizer:", err);
      }
    }

    setupAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext) audioContext.close();
    };
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <div className="relative w-4 h-4 flex items-center justify-center">
        <div 
          ref={orbRef}
          className="absolute w-full h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.9)] transition-transform duration-75"
        ></div>
      </div>
      <span className="text-sm font-semibold text-slate-200 tracking-wide drop-shadow-md">User B Speaking</span>
    </div>
  );
}
