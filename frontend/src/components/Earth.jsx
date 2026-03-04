import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// --- INTERNAL MOON COMPONENT ---
const Moon = ({ onClick }) => {
  const moonTexture = useTexture('/moon.jpg'); 
  const moonOrbitRef = useRef();
  const moonMeshRef = useRef(); // Ref for the Moon itself (for tracking)

  useFrame((state, delta) => {
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y += delta * 0.2; 
    }
  });

  return (
    <group ref={moonOrbitRef} rotation={[0, 0, Math.PI / 8]}>
      {/* Moon Mesh */}
      <mesh 
        ref={moonMeshRef}
        position={[4, 0, 0]} 
        scale={0.27}
        onClick={(e) => {
          e.stopPropagation(); // Stop click from hitting Earth behind it
          onClick(moonMeshRef, "Moon"); // Send 'Moon' and its Ref up
        }}
        cursor="pointer"
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={moonTexture} />
      </mesh>
    </group>
  );
};

// --- MAIN EARTH COMPONENT ---
// Accepts 'onMoonClick' prop to pass down
export const Earth = ({ onMoonClick }) => {
  const [colorMap, specularMap, nightMap] = useTexture([
    '/earth_day.jpg',
    '/earth_specular.jpg',
    '/earth_night.jpg'
  ]);

  const earthRef = useRef();

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          roughnessMap={specularMap} 
          roughness={0.5} 
          metalness={0.1}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xffff88)} 
          emissiveIntensity={2.5} 
        />
      </mesh>

      {/* Pass the click handler to the Moon */}
      <Moon onClick={onMoonClick} />
    </group>
  );
};