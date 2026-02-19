import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

function Earth() {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= 0.001;
    }
  });

  return (
    <group>
      {/* Main Earth */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#0a4a2a"
          wireframe={false}
          distort={0.15}
          speed={2}
          roughness={0.8}
          metalness={0.2}
          emissive="#00ff88"
          emissiveIntensity={0.08}
        />
      </Sphere>

      {/* Glow atmosphere */}
      <Sphere ref={glowRef} args={[1.65, 32, 32]}>
        <meshBasicMaterial
          color="#00ff88"
          transparent={true}
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Outer atmosphere */}
      <Sphere args={[1.8, 32, 32]}>
        <meshBasicMaterial
          color="#0ea5e9"
          transparent={true}
          opacity={0.02}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

function FloatingParticles() {
  const pointsRef = useRef();
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00ff88"
        size={0.03}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

export default function EarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Earth />
      <FloatingParticles />
    </Canvas>
  );
}