import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleSystem({ color = "#00ff88", count = 150 }) {
  const meshRef = useRef();

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.005 + Math.random() * 0.01;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(() => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += speeds[i];
        if (pos[i * 3 + 1] > 5) {
          pos[i * 3 + 1] = -5;
        }
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function CarbonParticles({
  color = "#00ff88",
  height = "300px",
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ width: "100%", height }}
    >
      <ambientLight intensity={0.5} />
      <ParticleSystem color={color} count={200} />
    </Canvas>
  );
}