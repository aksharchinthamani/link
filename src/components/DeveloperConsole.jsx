import React, { useState } from 'react';

export default function DeveloperConsole({ fps, landmarks }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-4 mb-2 shadow-2xl backdrop-blur-md w-64 text-sm text-slate-300 font-mono">
          <h4 className="text-slate-100 font-bold mb-2 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Dev Console</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </h4>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between items-center">
              <span>Webcam FPS:</span>
              <span className="text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded">{fps}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Landmarks:</span>
              <span className="text-blue-400 font-semibold bg-blue-400/10 px-2 py-0.5 rounded">{landmarks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Model State:</span>
              <span className="text-yellow-400 font-semibold bg-yellow-400/10 px-2 py-0.5 rounded">Idle</span>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-full px-4 py-2 text-xs font-bold shadow-lg transition-colors flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        <span>{isOpen ? 'Close Console' : 'Open Dev Console'}</span>
      </button>
    </div>
  );
}
