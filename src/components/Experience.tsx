import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars } from '@react-three/drei';

interface SaturnProps {
  handPos: THREE.Vector3 | null;
}

export const Saturn: React.FC<SaturnProps> = ({ handPos }) => {
  const planetRef = useRef<THREE.Points>(null);
  const ringsRef = useRef<THREE.Points>(null);
  
  // Original positions for the explosion effect
  const planetInitialPositions = useMemo(() => {
    const geo = new THREE.SphereGeometry(3, 64, 64);
    const pos = geo.attributes.position.array as Float32Array;
    const dirs = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i++) {
      dirs[i] = (Math.random() - 0.5) * 2;
    }
    return { pos: pos.slice(), dirs };
  }, []);

  const ringsInitialPositions = useMemo(() => {
    const count = 15000;
    const pos = new Float32Array(count * 3);
    const dirs = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 3;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 2] = Math.sin(a) * r;
      
      dirs[i * 3] = (Math.random() - 0.5) * 1.5;
      dirs[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      dirs[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return { pos, dirs };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (planetRef.current && ringsRef.current) {
      // Rotation
      planetRef.current.rotation.y = time * 0.1;
      ringsRef.current.rotation.y = time * 0.15;
      ringsRef.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.2) * 0.1;

      const planetPosAttr = planetRef.current.geometry.attributes.position;
      const ringPosAttr = ringsRef.current.geometry.attributes.position;

      // Interaction logic
      const explosionFactor = handPos ? 1.0 : 0.0;
      const lerpSpeed = 0.05;

      // Update planet particles
      for (let i = 0; i < planetInitialPositions.pos.length; i += 3) {
        const targetX = planetInitialPositions.pos[i] + planetInitialPositions.dirs[i] * explosionFactor * 5;
        const targetY = planetInitialPositions.pos[i+1] + planetInitialPositions.dirs[i+1] * explosionFactor * 5;
        const targetZ = planetInitialPositions.pos[i+2] + planetInitialPositions.dirs[i+2] * explosionFactor * 5;

        planetPosAttr.array[i] += (targetX - planetPosAttr.array[i]) * lerpSpeed;
        planetPosAttr.array[i+1] += (targetY - planetPosAttr.array[i+1]) * lerpSpeed;
        planetPosAttr.array[i+2] += (targetZ - planetPosAttr.array[i+2]) * lerpSpeed;
      }

      // Update ring particles
      for (let i = 0; i < ringsInitialPositions.pos.length; i += 3) {
        const targetX = ringsInitialPositions.pos[i] + ringsInitialPositions.dirs[i] * explosionFactor * 4;
        const targetY = ringsInitialPositions.pos[i+1] + ringsInitialPositions.dirs[i+1] * explosionFactor * 4;
        const targetZ = ringsInitialPositions.pos[i+2] + ringsInitialPositions.dirs[i+2] * explosionFactor * 4;

        ringPosAttr.array[i] += (targetX - ringPosAttr.array[i]) * lerpSpeed;
        ringPosAttr.array[i+1] += (targetY - ringPosAttr.array[i+1]) * lerpSpeed;
        ringPosAttr.array[i+2] += (targetZ - ringPosAttr.array[i+2]) * lerpSpeed;
      }

      planetPosAttr.needsUpdate = true;
      ringPosAttr.needsUpdate = true;

      // If hand is present, move the whole group slightly
      if (handPos) {
        planetRef.current.position.lerp(new THREE.Vector3(handPos.x * 5, handPos.y * 5, 0), 0.1);
        ringsRef.current.position.lerp(new THREE.Vector3(handPos.x * 5, handPos.y * 5, 0), 0.1);
      } else {
        planetRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        ringsRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      }
    }
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <points ref={planetRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={planetInitialPositions.pos.length / 3}
            array={planetInitialPositions.pos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#0088ff" size={0.05} transparent opacity={0.8} />
      </points>

      <points ref={ringsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={ringsInitialPositions.pos.length / 3}
            array={ringsInitialPositions.pos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#00ffff" size={0.03} transparent opacity={0.6} />
      </points>
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
    </group>
  );
};
