import { useState, useEffect, useRef } from 'react';

export function useSpeech(lang = 'en-US') {
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const streamRef = useRef(null);

  // Acquire the mic stream once and share it
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        streamRef.current = stream;
        setMicStream(stream);
      })
      .catch((err) => console.warn('Mic access denied:', err));

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart so it stays continuous
      try { recognition.start(); } catch (e) { console.debug('Recognition auto-restart:', e); }
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentFinal) {
        setFinalTranscript(prev => prev + (prev ? ' ' : '') + currentFinal.trim());
      }
      setInterimTranscript(currentInterim);
    };

    recognition.start();

    return () => {
      recognition.onend = null; // prevent auto-restart on cleanup
      try { recognition.stop(); } catch { /* already stopped */ }
    };
  }, [lang]);

  return { finalTranscript, interimTranscript, isListening, micStream };
}
