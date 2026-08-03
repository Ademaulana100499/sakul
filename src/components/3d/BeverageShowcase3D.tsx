'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Item } from '../../types';

interface BeverageProps {
  item: Item;
  triggerSpin: number;
}

function DrinkMesh3D({ item, triggerSpin }: BeverageProps) {
  const meshRef = useRef<THREE.Group>(null);
  const prevSpinRef = useRef<number>(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (triggerSpin > 0 && triggerSpin !== prevSpinRef.current) {
      prevSpinRef.current = triggerSpin;
      setAnimating(true);
    }
  }, [triggerSpin]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      if (animating) {
        meshRef.current.rotation.x -= delta * 15;
        meshRef.current.rotation.y += delta * 12;
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.6, delta * 8);
        if (Math.abs(meshRef.current.rotation.x) >= Math.PI * 2) {
          meshRef.current.rotation.x = 0;
          meshRef.current.position.y = 0;
          setAnimating(false);
        }
      } else {
        meshRef.current.rotation.y += delta * 0.8;
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, delta * 5);
      }
    }
  });

  const isCan = item.name.includes('Kaleng') || item.name.includes('Nescafe') || item.name.includes('Hydro') || item.name.includes('Cap Panda') || item.name.includes('ABC') || item.name.includes('Golda');
  const isBox = item.name.includes('Ultra Milk') || item.name.includes('Yakult');
  
  let primaryColor = "#0284c7";
  let metal = 0.5;
  let rough = 0.2;
  let trans = 0;

  if (item.name.includes('Pocari')) { primaryColor = "#0284c7"; metal = 0.4; }
  else if (item.name.includes('STee')) { primaryColor = "#d97706"; metal = 0.2; }
  else if (item.name.includes('Pucuk')) { primaryColor = "#10b981"; metal = 0.2; }
  else if (item.name.includes('Cap Panda')) { primaryColor = "#64748b"; metal = 0.9; rough = 0.15; }
  else if (item.name.includes('Golda') || item.name.includes('ABC')) { primaryColor = "#b45309"; metal = 0.7; rough = 0.2; }
  else if (item.name.includes('Yakult')) { primaryColor = "#ef4444"; metal = 0.1; rough = 0.4; }
  else if (item.name.includes('You C')) { primaryColor = "#f59e0b"; trans = item.name.includes('Kaca') ? 0.7 : 0.2; }
  else if (item.name.includes('Ultra Milk')) { primaryColor = "#06b6d4"; metal = 0.05; rough = 0.5; }
  else if (item.name.includes('Nescafe')) { primaryColor = "#dc2626"; metal = 0.9; rough = 0.15; }
  else if (item.name.includes('Hydro Coco')) { primaryColor = "#0d9488"; metal = 0.8; rough = 0.2; }
  else if (item.name.includes('Ron 88')) { primaryColor = "#38bdf8"; trans = 0.85; rough = 0.05; }

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {isCan ? (
        <group>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.75, 0.75, 2.3, 32]} />
            <meshStandardMaterial color={primaryColor} metalness={metal} roughness={rough} />
          </mesh>
          <mesh position={[0, 1.16, 0]}>
            <cylinderGeometry args={[0.66, 0.75, 0.05, 32]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -1.16, 0]}>
            <cylinderGeometry args={[0.75, 0.66, 0.05, 32]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ) : isBox ? (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.3, 2.1, 1.3]} />
            <meshStandardMaterial color={primaryColor} metalness={metal} roughness={rough} />
          </mesh>
          <mesh position={[0, 1.06, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.02, 32]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.78, 0.78, 2.3, 32]} />
            <meshPhysicalMaterial 
              color={primaryColor} 
              metalness={metal} 
              roughness={rough} 
              transparent={trans > 0}
              opacity={trans > 0 ? 0.88 : 1}
              transmission={trans}
            />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.38, 0.78, 0.6, 32]} />
            <meshPhysicalMaterial color={primaryColor} metalness={metal} roughness={rough} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.25, 32]} />
            <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function BeverageShowcase3D({ item, triggerSpin }: BeverageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-white/70 backdrop-blur-md rounded-3xl text-sky-800 font-extrabold text-xs">
        ❄️ Memuat Podium 3D Minuman...
      </div>
    );
  }

  return (
    <div className="w-full h-80 md:h-96 relative rounded-3xl overflow-hidden bg-gradient-to-t from-sky-100 via-white to-cyan-50 border-2 border-white/90 shadow-[0_15px_35px_rgba(14,116,144,0.15)] flex flex-col justify-between p-5">
      {/* HUD Info Label */}
      <div className="flex justify-between items-center z-10">
        <span className="px-3.5 py-1 rounded-full bg-sky-900 text-white text-xs font-extrabold shadow">
          ❄️ PODIUM SHOWCASE 3D
        </span>
        <span className="text-[11px] font-bold text-sky-800 bg-white/80 px-3 py-1 rounded-full border border-sky-200">
          ✋ Putar 360° dengan sentuhan
        </span>
      </div>

      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0.5, 5.5], fov: 45 }}>
          <ambientLight intensity={2.5} />
          <directionalLight position={[5, 10, 7]} intensity={3.5} castShadow />
          <directionalLight position={[-4, -2, -3]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[0, -3, 3]} intensity={1.0} color="#ffffff" />

          <Float speed={2} rotationIntensity={0.25} floatIntensity={0.4}>
            <DrinkMesh3D item={item} triggerSpin={triggerSpin} />
          </Float>

          {/* Bright Ice Blue Metallic Podium Base */}
          <mesh position={[0, -1.8, 0]} receiveShadow>
            <cylinderGeometry args={[1.5, 1.8, 0.25, 64]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, -1.66, 0]}>
            <cylinderGeometry args={[1.52, 1.52, 0.05, 64]} />
            <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.2} />
          </mesh>

          <ContactShadows position={[0, -1.65, 0]} opacity={0.6} scale={4} blur={1.5} far={3} color="#0284c7" />

          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/3.5} maxPolarAngle={Math.PI/1.6} />
        </Canvas>
      </div>

      {/* Bottom overlay title inside canvas */}
      <div className="z-10 mt-auto bg-white/90 backdrop-blur-md border border-sky-200 p-4 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <span className="text-[10px] font-black uppercase text-sky-600 block">{item.category}</span>
          <h4 className="text-lg font-black text-slate-900">{item.name}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold block">Stok Showcase:</span>
          <span className="text-sm font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">{item.stock} pcs</span>
        </div>
      </div>
    </div>
  );
}
