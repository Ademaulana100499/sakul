'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

interface FridgeProps {
  isOpen: boolean;
}

function ShowcaseFridgeMesh({ isOpen }: FridgeProps) {
  const doorRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (doorRef.current) {
      const targetAngle = isOpen ? -Math.PI * 0.78 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        targetAngle,
        delta * 5
      );
    }
  });

  return (
    <group position={[0, -0.4, 0]} scale={[1.15, 1.15, 1.15]}>
      {/* 1. MAIN CABINET BODY (Bright Clean Platinum Silver / Powder Coated Metal) */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 4.8, 2.6]} />
        <meshStandardMaterial 
          color="#f1f5f9" 
          metalness={0.4} 
          roughness={0.2} 
        />
      </mesh>

      {/* 2. TOP LIGHTBOX CANOPY (Neon Sign Box above showcase fridges) */}
      <mesh position={[0, 2.65, 0.05]}>
        <boxGeometry args={[2.85, 0.65, 2.5]} />
        <meshStandardMaterial 
          color="#38bdf8" 
          emissive="#0284c7"
          emissiveIntensity={0.8} 
          roughness={0.1}
        />
      </mesh>
      {/* White front text/panel for canopy */}
      <mesh position={[0, 2.65, 1.31]}>
        <boxGeometry args={[2.7, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={1.2} 
        />
      </mesh>

      {/* 3. FRIDGE INTERIOR HOLLOW CABINET (Bright pure white inner surfaces) */}
      <mesh position={[0, -0.1, 0.1]}>
        <boxGeometry args={[2.65, 4.5, 2.35]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.5} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. ALWAYS-ON INTERIOR COOL LED LIGHTING */}
      <pointLight position={[0, 1.8, 0.3]} color="#cffafe" distance={8} intensity={12} />
      <pointLight position={[0, -0.5, 0.3]} color="#ffffff" distance={6} intensity={8} />

      {/* 5. TEMPERED GLASS SHELVES (Crystal Clear glass racks) */}
      {/* Top Shelf */}
      <mesh position={[0, 1.0, 0.15]}>
        <boxGeometry args={[2.55, 0.05, 2.2]} />
        <meshPhysicalMaterial 
          color="#a5f3fc" 
          transparent 
          opacity={0.7} 
          roughness={0.05} 
          transmission={0.95} 
          thickness={0.2} 
        />
      </mesh>
      {/* Middle Shelf */}
      <mesh position={[0, -0.4, 0.15]}>
        <boxGeometry args={[2.55, 0.05, 2.2]} />
        <meshPhysicalMaterial 
          color="#a5f3fc" 
          transparent 
          opacity={0.7} 
          roughness={0.05} 
          transmission={0.95} 
          thickness={0.2} 
        />
      </mesh>
      {/* Bottom Shelf */}
      <mesh position={[0, -1.8, 0.15]}>
        <boxGeometry args={[2.55, 0.05, 2.2]} />
        <meshPhysicalMaterial 
          color="#a5f3fc" 
          transparent 
          opacity={0.7} 
          roughness={0.05} 
          transmission={0.95} 
          thickness={0.2} 
        />
      </mesh>

      {/* 6. REALISTIC BEVERAGES INSIDE FRIDGE SHELVES */}
      <group position={[0, 0, 0]}>
        {/* Top shelf: Soda Cans & Sports Drinks */}
        <mesh position={[-0.8, 1.45, 0.3]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.85, 32]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[-0.2, 1.45, 0.3]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.85, 32]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0.4, 1.45, 0.3]} castShadow>
          <cylinderGeometry args={[0.23, 0.23, 0.85, 32]} />
          <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0.95, 1.45, 0.3]} castShadow>
          <cylinderGeometry args={[0.23, 0.23, 0.85, 32]} />
          <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.2} />
        </mesh>

        {/* Middle shelf: Milk Boxes, Yakult, Coffee */}
        <mesh position={[-0.85, 0.05, 0.3]} castShadow>
          <boxGeometry args={[0.45, 0.85, 0.45]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.3} />
        </mesh>
        <mesh position={[-0.25, 0.05, 0.3]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.7, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        <mesh position={[0.25, 0.05, 0.3]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.7, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        <mesh position={[0.85, 0.05, 0.3]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.8, 32]} />
          <meshStandardMaterial color="#dc2626" metalness={0.85} roughness={0.15} />
        </mesh>

        {/* Bottom shelf: Tall Mineral Water bottles */}
        <mesh position={[-0.7, -1.35, 0.3]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.95, 32]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} transmission={0.9} roughness={0.05} />
        </mesh>
        <mesh position={[0.0, -1.35, 0.3]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.95, 32]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} transmission={0.9} roughness={0.05} />
        </mesh>
        <mesh position={[0.7, -1.35, 0.3]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.95, 32]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} transmission={0.9} roughness={0.05} />
        </mesh>
      </group>

      {/* 7. SWINGING TRANSPARENT GLASS DOOR GROUP (Pivoting on Left Hinge) */}
      <group ref={doorRef} position={[-1.45, -0.1, 1.32]}>
        
        {/* Aluminium Door Frame - Top border */}
        <mesh position={[1.45, 2.3, 0]}>
          <boxGeometry args={[2.9, 0.2, 0.1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Aluminium Door Frame - Bottom border */}
        <mesh position={[1.45, -2.3, 0]}>
          <boxGeometry args={[2.9, 0.2, 0.1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Aluminium Door Frame - Left vertical post */}
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.2, 4.8, 0.1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Aluminium Door Frame - Right vertical post */}
        <mesh position={[2.8, 0, 0]}>
          <boxGeometry args={[0.2, 4.8, 0.1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* CENTER TRANSPARENT TEMPERED GLASS DOOR PANEL */}
        <mesh position={[1.45, 0, -0.01]}>
          <boxGeometry args={[2.5, 4.4, 0.04]} />
          <meshPhysicalMaterial 
            color="#e0f2fe" 
            transparent 
            opacity={0.35} 
            transmission={0.95} 
            roughness={0.05} 
            reflectivity={0.9} 
            clearcoat={1.0}
          />
        </mesh>

        {/* Long Modern Stainless Steel Door Handle on Right side */}
        <mesh position={[2.82, 0, 0.12]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Digital Thermometer reading badge at top border of door */}
        <mesh position={[1.45, 2.3, 0.06]}>
          <boxGeometry args={[0.6, 0.14, 0.02]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* 8. HEAVY DUTY COOLER FEET */}
      <mesh position={[-1.25, -2.6, 1.1]}>
        <cylinderGeometry args={[0.12, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[1.25, -2.6, 1.1]}>
        <cylinderGeometry args={[0.12, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-1.25, -2.6, -1.1]}>
        <cylinderGeometry args={[0.12, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[1.25, -2.6, -1.1]}>
        <cylinderGeometry args={[0.12, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function FridgeScene3D({ isOpen }: FridgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[520px] flex items-center justify-center bg-white/60 backdrop-blur-md rounded-3xl text-sky-800 font-extrabold text-sm border-2 border-sky-200">
        ❄️ Mendinginkan & Menyiapkan Showcase Kulkas 3D...
      </div>
    );
  }

  return (
    <div className="w-full h-[560px] md:h-[640px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100 via-white to-cyan-50 shadow-[0_25px_60px_rgba(14,116,144,0.18)] border-2 border-white/90">
      {/* HUD overlay prompt */}
      <div className="absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-sky-200 text-sky-800 text-xs font-bold shadow-md pointer-events-none flex items-center space-x-1.5">
        <span className="text-sm">🔄</span>
        <span>Studio Showcase 3D: Putar Kulkas 360° Dengan Sentuh / Geser Mouse</span>
      </div>

      <Canvas camera={{ position: [0, 0.3, 7.8], fov: 45 }} shadows>
        {/* Bright daylight & cool showroom lighting */}
        <ambientLight intensity={2.2} />
        <directionalLight 
          position={[6, 12, 8]} 
          intensity={3.5} 
          castShadow 
        />
        <directionalLight position={[-6, 2, -4]} intensity={1.5} color="#38bdf8" />
        <directionalLight position={[0, -5, 5]} intensity={0.8} color="#ffffff" />

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
          <ShowcaseFridgeMesh isOpen={isOpen} />
        </Float>

        <ContactShadows 
          position={[0, -3.4, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2} 
          far={5} 
          color="#0284c7"
        />

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7} 
          minPolarAngle={Math.PI / 3}
          autoRotate={!isOpen}
          autoRotateSpeed={1.0}
        />
      </Canvas>
    </div>
  );
}
