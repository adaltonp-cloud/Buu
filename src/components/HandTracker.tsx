import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import React, { useEffect, useRef, useState } from 'react';

interface HandTrackerProps {
  onResults: (results: Results) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onResults }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      onResults(results);
      if (!isLoaded) setIsLoaded(true);
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [onResults, isLoaded]);

  return (
    <div className="fixed bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-cyan-500/30 bg-black/50 z-50">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        playsInline
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-cyan-400 text-xs animate-pulse">
          Initializing Camera...
        </div>
      )}
    </div>
  );
};
