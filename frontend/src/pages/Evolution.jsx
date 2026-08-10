import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { Earth } from '../components/Earth'; 

// --- CAMERA TRACKER ---
const CameraTracker = ({ selectedPlanetRef, controlsRef }) => {
  const { camera } = useThree();
  const previousPlanetPos = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (selectedPlanetRef?.current) {
      isTransitioning.current = true;
      const startPos = new THREE.Vector3();
      selectedPlanetRef.current.getWorldPosition(startPos);
      previousPlanetPos.current.copy(startPos);
    }
  }, [selectedPlanetRef]);

  useFrame(() => {
    if (!selectedPlanetRef?.current || !controlsRef.current) return;

    const currentPlanetPos = new THREE.Vector3();
    selectedPlanetRef.current.getWorldPosition(currentPlanetPos);
    const delta = currentPlanetPos.clone().sub(previousPlanetPos.current);

    camera.position.add(delta);
    controlsRef.current.target.add(delta);

    if (isTransitioning.current) {
      // Offset slightly closer/adjusted for tracking view
      const offset = new THREE.Vector3(8, 4, 8); 
      const desiredCamPos = currentPlanetPos.clone().add(offset);
      
      camera.position.lerp(desiredCamPos, 0.05);
      controlsRef.current.target.lerp(currentPlanetPos, 0.05);

      if (camera.position.distanceTo(desiredCamPos) < 0.5) {
        isTransitioning.current = false;
      }
    } 

    previousPlanetPos.current.copy(currentPlanetPos);
    controlsRef.current.update();
  });

  return null;
};

// --- TEXTURED PLANET (Updated with initialAngle) ---
const TexturedPlanet = ({ 
  distance, 
  size, 
  imgUrl, 
  name, 
  orbitSpeed, 
  rotationSpeed, 
  onPlanetClick, 
  initialAngle = 0 
}) => {
  const orbitRef = useRef();
  const planetRef = useRef();
  const texture = useTexture(imgUrl);

  // Set initial starting position on mount
  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = initialAngle;
    }
  }, [initialAngle]);

  useFrame((state, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += orbitSpeed * delta;
    if (planetRef.current) planetRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group ref={orbitRef}>
      <group position={[distance, 0, 0]}>
        <mesh 
          ref={planetRef}
          onClick={(e) => { e.stopPropagation(); onPlanetClick(planetRef, name); }}
          cursor="pointer"
        >
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        
        {name === 'Saturn' && (
           <mesh rotation={[Math.PI / 2, 0, 0]}>
             <torusGeometry args={[size + 2, 0.6, 2, 100]} />
             <meshStandardMaterial color="#C2B280" opacity={0.7} transparent />
           </mesh>
        )}

        <Html distanceFactor={15} style={{ pointerEvents: 'none' }}>
           <div style={{ color: 'white', fontSize: '10px' }}>{name}</div>
        </Html>
      </group>
    </group>
  );
};

// --- EARTH WRAPPER (Updated with initialAngle) ---
const EarthPlanet = ({ 
  distance, 
  size, 
  name, 
  orbitSpeed, 
  rotationSpeed, 
  onPlanetClick, 
  initialAngle = 0 
}) => {
  const orbitRef = useRef();
  const planetRef = useRef();

  // Set initial starting position on mount
  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = initialAngle;
    }
  }, [initialAngle]);

  useFrame((state, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += orbitSpeed * delta;
  });

  return (
    <group ref={orbitRef}>
      <group position={[distance, 0, 0]}>
        <mesh 
          ref={planetRef}
          onClick={(e) => { e.stopPropagation(); onPlanetClick(planetRef, name); }}
          cursor="pointer"
        >
             <sphereGeometry args={[size, 32, 32]} /> 
             <meshBasicMaterial transparent opacity={0} /> 
             
             {/* Pass the click handler down to Earth */}
             <group scale={size / 1}>
                <Earth onMoonClick={onPlanetClick} />
             </group>
        </mesh>
        <Html distanceFactor={15}><div style={{ color: 'white', fontSize: '10px' }}>{name}</div></Html>
      </group>
    </group>
  );
};

// --- SUN ---
const Sun = ({ onClick }) => {
  const sunTexture = useTexture('/sun.jpg');
  return (
    <mesh onClick={onClick}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial map={sunTexture} />
    </mesh>
  );
};

// --- MAIN PAGE ---
export const Evolution = () => {
  const [selectedPlanetRef, setSelectedPlanetRef] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const controlsRef = useRef(); 

  const handlePlanetClick = (planetRef, name) => {
    setSelectedPlanetRef(planetRef);
    setSelectedName(name);
  };

  const resetView = () => {
    setSelectedPlanetRef(null);
    setSelectedName(null);
    if(controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.object.position.set(0, 60, 100);
        controlsRef.current.update();
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: 'white' }}>
        <h1 style={{ margin: 0 }}>Solar System</h1>
        <p style={{ opacity: 0.8 }}>
          {selectedName ? `Tracking: ${selectedName}` : "Click a planet (or Moon) to track."}
        </p>
        <button onClick={resetView} style={{ padding: '8px 16px', marginTop:'5px', cursor: 'pointer' }}>Reset View</button>
      </div>

      <Canvas camera={{ position: [0, 60, 100], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={2.5} distance={1000} decay={0} color="white" />
        <Stars count={5000} factor={4} />

        <OrbitControls 
          ref={controlsRef} 
          enableDamping={true} 
          dampingFactor={0.05} 
          enablePan={selectedName === null} 
          minDistance={3} 
          maxDistance={250}
        />

        <CameraTracker selectedPlanetRef={selectedPlanetRef} controlsRef={controlsRef} />

        <Suspense fallback={null}>
            <Sun onClick={resetView} />
            
            {/* initialAngle is in radians (0 to ~6.28). 
              Using varied values so planets are scattered around the sun.
            */}

            <TexturedPlanet 
                name="Mercury" distance={15} size={0.8} imgUrl="/mercury.jpg" 
                orbitSpeed={0.8} rotationSpeed={0.01} 
                initialAngle={0.5} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <TexturedPlanet 
                name="Venus" distance={22} size={1.5} imgUrl="/venus_atmosphere.jpg" 
                orbitSpeed={0.5} rotationSpeed={0.005} 
                initialAngle={2.2} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <EarthPlanet 
                name="Earth" distance={32} size={1.6} 
                orbitSpeed={0.3} rotationSpeed={0.02} 
                initialAngle={4.0} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <TexturedPlanet 
                name="Mars" distance={42} size={1.2} imgUrl="/mars.jpg" 
                orbitSpeed={0.24} rotationSpeed={0.018} 
                initialAngle={1.2} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <TexturedPlanet 
                name="Jupiter" distance={65} size={5} imgUrl="/jupiter.jpg" 
                orbitSpeed={0.13} rotationSpeed={0.04} 
                initialAngle={5.5} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <TexturedPlanet 
                name="Saturn" distance={90} size={4} imgUrl="/saturn.jpg" 
                orbitSpeed={0.09} rotationSpeed={0.038} 
                initialAngle={3.1} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <TexturedPlanet 
                name="Uranus" distance={110} size={3} imgUrl="/uranus.jpg" 
                orbitSpeed={0.06} rotationSpeed={0.03} 
                initialAngle={0.8} 
                onPlanetClick={handlePlanetClick} 
            />
            
            <TexturedPlanet 
                name="Neptune" distance={130} size={3} imgUrl="/neptune.jpg" 
                orbitSpeed={0.05} rotationSpeed={0.032} 
                initialAngle={2.8} 
                onPlanetClick={handlePlanetClick} 
            />
        </Suspense>

      </Canvas>
      <Loader />
    </div>
  );
};