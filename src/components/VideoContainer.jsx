import React from 'react';

export default function VideoContainer({ children }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black aspect-video">
      {children}
    </div>
  );
}
