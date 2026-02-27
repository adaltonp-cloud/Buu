import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Results } from '@mediapipe/hands';
import * as THREE from 'three';
import { HandTracker } from './components/HandTracker';
import { Saturn } from './components/Experience';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, Sparkles, MousePointer2 } from 'lucide-react';

export default function App() {
  const [handPos, setHandPos] = useState<THREE.Vector3 | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const handleHandResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      // Use the middle finger MCP (landmark 9) as the center point
      const center = landmarks[9];
      // Map normalized coordinates (0-1) to centered coordinates (-0.5 to 0.5)
      setHandPos(new THREE.Vector3(
        (center.x - 0.5) * -2, // Invert X for mirror effect
        (0.5 - center.y) * 2,
        0
      ));
      if (showIntro) setShowIntro(false);
    } else {
      setHandPos(null);
    }
  }, [showIntro]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#000000']} />
        <Saturn handPos={handPos} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8">
        <header className="w-full flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-3">
              SATURN <span className="text-cyan-400">OS</span>
            </h1>
            <p className="text-cyan-500/60 text-xs font-mono tracking-widest uppercase">
              Interactive Particle System v1.0
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">System Status</span>
              <span className="text-white text-sm font-medium">Neural Link Active</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
          </motion.div>
        </header>

        <AnimatePresence>
          {showIntro && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-3xl max-w-md text-center"
            >
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                <Hand className="text-cyan-400 w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Gesture Control Required</h2>
              <p className="text-cyan-100/60 text-sm mb-6">
                Allow camera access and place your hand in view to interact with the planetary particle field.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <Sparkles className="w-4 h-4 text-cyan-400 mb-2" />
                  <span className="text-[10px] text-white/40 uppercase font-bold block">Interaction</span>
                  <span className="text-xs text-white">Hand Presence</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <MousePointer2 className="w-4 h-4 text-cyan-400 mb-2" />
                  <span className="text-[10px] text-white/40 uppercase font-bold block">Control</span>
                  <span className="text-xs text-white">Spatial Mapping</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="w-full flex justify-between items-end">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  className="w-full h-full bg-cyan-400"
                />
              </div>
            ))}
          </div>
          <div className="text-[10px] text-white/20 font-mono">
            COORDINATES: {handPos ? `${handPos.x.toFixed(2)}, ${handPos.y.toFixed(2)}` : 'IDLE'}
          </div>
        </footer>
      </div>

      {/* Hand Tracker Component */}
      <HandTracker onResults={handleHandResults} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}} />
    </div>
  );
}
