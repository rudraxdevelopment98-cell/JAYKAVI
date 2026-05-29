'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Particle mesh ────────────────────────────────────────────────────────────

interface ParticlesProps {
  count?: number;
  color?: string;
  mouseX: number;
  mouseY: number;
}

function Particles({ count = 1200, color = '#7c3aed', mouseX, mouseY }: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const { size } = useThree();

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return { positions, velocities };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.025,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3] + Math.sin(t * 0.3 + i * 0.01) * 0.001;
      pos[i3 + 1] += velocities[i3 + 1] + Math.cos(t * 0.2 + i * 0.01) * 0.001;
      pos[i3 + 2] += velocities[i3 + 2];

      // Wrap particles back into view
      for (let ax = 0; ax < 3; ax++) {
        if (Math.abs(pos[i3 + ax]) > 8) pos[i3 + ax] *= -0.98;
      }
    }

    geo.attributes.position.needsUpdate = true;

    // Mouse parallax rotation
    meshRef.current.rotation.y = mouseX * 0.15 + t * 0.04;
    meshRef.current.rotation.x = mouseY * 0.1 + Math.sin(t * 0.1) * 0.05;
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}

// ─── Lines connecting nearby particles ───────────────────────────────────────

function ConnectionLines({ count = 60 }: { count?: number }) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      for (let j = 0; j < 6; j++) {
        positions[i6 + j] = (Math.random() - 0.5) * 10;
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#c9a84c'),
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    linesRef.current.rotation.z = state.clock.getElapsedTime() * 0.01;
  });

  return <lineSegments ref={linesRef} geometry={geometry} material={material} />;
}

// ─── Public component ────────────────────────────────────────────────────────

interface ParticleFieldProps {
  className?: string;
}

export function ParticleField({ className }: ParticleFieldProps) {
  const reducedMotion = useReducedMotion();
  const { x, y } = useMouseParallax(0.01);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  // Convert spring values to plain refs for the canvas
  useEffect(() => {
    const unsubX = x.on('change', (v) => { mouseXRef.current = v; });
    const unsubY = y.on('change', (v) => { mouseYRef.current = v; });
    return () => { unsubX(); unsubY(); };
  }, [x, y]);

  if (reducedMotion) return null;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        style={{ background: 'transparent' }}
      >
        <Particles mouseX={mouseXRef.current} mouseY={mouseYRef.current} />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
