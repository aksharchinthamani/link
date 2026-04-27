import React, { useEffect, useRef } from 'react';
import { createHandLandmarker } from '../utils/handLandmarker';
import { classifyGesture } from '../utils/gestureLogic';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle finger
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // palm base
];

export default function SignOverlay({ webcamRef, onMetricsUpdate, onGestureDetected }) {
  const canvasRef = useRef(null); 
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const landmarkerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const consecutiveSignRef = useRef(null);
  const consecutiveSignCountRef = useRef(0);

  useEffect(() => {
    let animationId;

    const setup = async () => {
      try {
        landmarkerRef.current = await createHandLandmarker();
        animate();
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
      }
    };

    const animate = () => {
      const canvas = canvasRef.current;
      const webcam = webcamRef?.current;
      
      if (!canvas || !webcam || !webcam.video || webcam.video.readyState !== 4 || !landmarkerRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const video = webcam.video;

      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      const startTimeMs = performance.now();

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        try {
          const results = landmarkerRef.current.detectForVideo(video, startTimeMs);

          frameCountRef.current++;
          if (startTimeMs - lastTimeRef.current >= 1000) {
            const fps = Math.round((frameCountRef.current * 1000) / (startTimeMs - lastTimeRef.current));
            const numLandmarks = results.landmarks ? results.landmarks.length * 21 : 0;
            if (onMetricsUpdate) {
              onMetricsUpdate(fps, numLandmarks);
            }
            frameCountRef.current = 0;
            lastTimeRef.current = startTimeMs;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            const gesture = classifyGesture(results.landmarks[0]);
            
            if (gesture === consecutiveSignRef.current) {
              consecutiveSignCountRef.current++;
              if (consecutiveSignCountRef.current === 20) {
                if (onGestureDetected) {
                  onGestureDetected(gesture);
                }
              }
            } else {
              consecutiveSignRef.current = gesture;
              consecutiveSignCountRef.current = 1;
              if (gesture === 'Analyzing...' && onGestureDetected) {
                onGestureDetected(gesture);
              }
            }

            for (const landmarks of results.landmarks) {
              ctx.strokeStyle = '#22c55e'; // Emerald green
              ctx.lineWidth = 3;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
                const start = landmarks[startIdx];
                const end = landmarks[endIdx];
                
                ctx.beginPath();
                const sx = start.x * canvas.width; 
                const sy = start.y * canvas.height;
                const ex = end.x * canvas.width;
                const ey = end.y * canvas.height;
                
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
              });

              ctx.fillStyle = '#3b82f6'; // LINK Blue
              landmarks.forEach((point) => {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
              });
            }
          }
        } catch (e) {
          console.error("Detection error:", e);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    setup();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, [webcamRef, onMetricsUpdate, onGestureDetected]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ transform: "scaleX(-1)" }} 
      id="output_canvas" 
    />
  );
}
