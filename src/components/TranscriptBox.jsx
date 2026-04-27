import React, { useEffect, useRef } from 'react';

export default function TranscriptBox({ finalTranscript, interimTranscript }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [finalTranscript, interimTranscript]);

  return (
    <footer className="mt-8 max-w-6xl mx-auto bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-slate-200">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <span>Live Transcript</span>
      </h2>
      <div 
        ref={scrollRef}
        className="h-32 overflow-y-auto bg-slate-900/80 p-4 rounded-lg border border-slate-700/50 shadow-inner scroll-smooth"
      >
        <span className="text-white font-bold tracking-wide text-lg">
          {finalTranscript}
        </span>
        <span className="text-slate-400 italic ml-1 transition-opacity duration-200 text-lg">
          {interimTranscript}
        </span>
        {!finalTranscript && !interimTranscript && (
          <span className="text-slate-500 italic text-lg flex items-center h-full justify-center opacity-50">
            Waiting for speech...
          </span>
        )}
      </div>
    </footer>
  );
}
