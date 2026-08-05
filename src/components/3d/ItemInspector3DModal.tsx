'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Item, User } from '../../types';

interface ItemInspectorProps {
  item: Item;
  currentUser: User | null;
  onClose: () => void;
  onTake: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface DrinkMeshProps {
  item: Item;
  isMini?: boolean;
}

/**
 * CORE 3D GEOMETRY ENGINE MATCHING REAL INDONESIAN BEVERAGE MARKET PRODUCTS
 * DESIGNED WITH SLENDER, REALISTIC BOTTLE PROPORTIONS (NOT OVERSIZED/WIDE)
 */
export function DrinkMesh3D({ item, isMini = false }: DrinkMeshProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isMini) {
        // Gentle breathing orientation on the shelf display, facing forward towards user
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      } else {
        // Continuous smooth rotation in 3D inspection theater
        meshRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  const name = item.name.toLowerCase();

  // Authentic Indonesian Real-Market Brand Colors & Material Styling
  let bodyColor = "#0284c7";
  let labelColor = "#1e40af"; // Label base
  let stripeColor = "#ffffff"; // Accent banner
  let capColor = "#1d4ed8";
  let metal = 0.2;
  let rough = 0.25;
  let trans = 0;

  // 1. POCARI SWEAT: Transparent icy blue bottle, bright cobalt label with sharp white banner, blue screw cap
  if (name.includes('pocari')) { 
    bodyColor = "#60a5fa"; labelColor = "#1e40af"; stripeColor = "#ffffff"; capColor = "#1d4ed8"; 
    metal = 0.3; rough = 0.15; trans = 0.65; 
  } 
  // 2. S-TEE: Ribbed bottle, dark amber jasmine tea fluid, bright yellow and crimson red label, bright yellow cap
  else if (name.includes('stee')) { 
    bodyColor = "#92400e"; labelColor = "#fbbf24"; stripeColor = "#dc2626"; capColor = "#facc15"; 
    metal = 0.2; rough = 0.15; trans = 0.55;
  } 
  // 3. PUCUK LESS SUGAR: Slender bottle, clear greenish tea color, white & dark forest green label, emerald green cap
  else if (name.includes('pucuk')) { 
    bodyColor = "#15803d"; labelColor = "#ffffff"; stripeColor = "#14532d"; capColor = "#10b981"; 
    metal = 0.2; rough = 0.15; trans = 0.6;
  } 
  // 4. CAP PANDA KALENG: Sleek aluminum soda can, brushed silver metal body & rims, dark charcoal panda banner
  else if (name.includes('panda')) { 
    bodyColor = "#cbd5e1"; labelColor = "#1e293b"; stripeColor = "#94a3b8"; 
    metal = 0.95; rough = 0.12; 
  } 
  // 5. GOLDA COFFEE: Compact bottle, creamy golden latte fluid, metallic gold and roast brown label, gold screw cap
  else if (name.includes('golda')) { 
    bodyColor = "#b45309"; labelColor = "#451a03"; stripeColor = "#f59e0b"; capColor = "#eab308"; 
    metal = 0.5; rough = 0.2; trans = 0.3;
  } 
  // 6. ABC KOPI SUSU & CHOCOMALT: Dark roasted coffee PET bottle, black and warm orange label, matte cocoa cap
  else if (name.includes('abc')) { 
    bodyColor = "#451a03"; labelColor = "#18181b"; stripeColor = "#ea580c"; capColor = "#27272a"; 
    metal = 0.4; rough = 0.3; trans = 0.2;
  } 
  // 7. YAKULT ALL VARIAN: Iconic waist profile, skin-milky cream tint bottle, red typography band, shiny silver foil lid
  else if (name.includes('yakult')) { 
    bodyColor = "#fee2e2"; labelColor = "#ef4444"; stripeColor = "#b91c1c"; capColor = "#cbd5e1"; 
    metal = 0.05; rough = 0.45; 
  } 
  // 8. YOU C 1000 KACA: Thick amber glass bottle, sparkling yellow-orange vitamin fluid, lemon yellow label, bright red metal cap
  else if (name.includes('kaca')) { 
    bodyColor = "#d97706"; labelColor = "#fef08a"; stripeColor = "#ea580c"; capColor = "#dc2626"; 
    metal = 0.35; rough = 0.08; trans = 0.75; 
  } 
  // 9. ULTRA MILK: Rectangular carton box, sky blue / azure carton, white dairy top fold, round white screw cap
  else if (name.includes('ultra')) { 
    bodyColor = "#0284c7"; labelColor = "#ffffff"; stripeColor = "#0369a1"; capColor = "#ffffff"; 
    metal = 0.05; rough = 0.5; 
  } 
  // 10. NESCAFE KALENG: Cardinal red aluminum soda can, espresso black center band, polished silver rims
  else if (name.includes('nescafe')) { 
    bodyColor = "#dc2626"; labelColor = "#09090b"; stripeColor = "#ef4444"; 
    metal = 0.95; rough = 0.15; 
  } 
  // 11. HYDRO COCO: Tropical emerald green & white container, forest green cap
  else if (name.includes('hydro')) { 
    bodyColor = "#059669"; labelColor = "#ffffff"; stripeColor = "#047857"; capColor = "#065f46"; 
    metal = 0.3; rough = 0.25; trans = 0.3;
  } 
  // 12. YOU C 1000 500ML: Tall sports PET bottle, glowing yellow lemon liquid, vibrant yellow & red sports cap
  else if (name.includes('500ml') || name.includes('you c')) { 
    bodyColor = "#facc15"; labelColor = "#fef08a"; stripeColor = "#dc2626"; capColor = "#ef4444"; 
    metal = 0.2; rough = 0.1; trans = 0.7;
  } 
  // 13. RON 88 AIR MINERAL: Crystal clear mineral water PET bottle, blue-white refraction, white and ocean-blue label wave strip, royal blue cap
  else if (name.includes('ron 88') || name.includes('air')) { 
    bodyColor = "#e0f2fe"; labelColor = "#0284c7"; stripeColor = "#ffffff"; capColor = "#1d4ed8"; 
    metal = 0.15; rough = 0.05; trans = 0.88; 
  }

  // Override with Admin custom dynamic style3D if present!
  if (item.style3D) {
    const s = item.style3D;
    bodyColor = s.bodyColor;
    labelColor = s.labelColor;
    stripeColor = s.stripeColor;
    if (s.capColor) capColor = s.capColor;
    metal = s.metal;
    rough = s.rough;
    trans = s.trans;
  }

  // Classify beverage form-factors (override with dynamic style3D shape if specified!)
  const isCan = item.style3D ? item.style3D.shape === 'can' : (name.includes('kaleng') || name.includes('nescafe') || name.includes('panda'));
  const isBox = item.style3D ? item.style3D.shape === 'box' : name.includes('ultra');
  const isYakult = item.style3D ? item.style3D.shape === 'yakult' : name.includes('yakult');

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {isCan ? (
        // SLENDER ALUMINUM CYLINDER SODA CAN (Nescafe & Cap Panda)
        <group>
          {/* Main Aluminum Can Cylinder Body */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.38, 1.35, 48]} />
            <meshStandardMaterial color={bodyColor} metalness={metal} roughness={rough} />
          </mesh>
          {/* Brand Label Center Band */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.384, 0.384, 0.85, 48]} />
            <meshStandardMaterial color={labelColor} metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Accent Stripe Band */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.388, 0.388, 0.22, 48]} />
            <meshStandardMaterial color={stripeColor} metalness={0.3} roughness={0.3} />
          </mesh>
          {/* Top Metallic Silver Bevel Rim & Pull-Tab */}
          <mesh position={[0, 0.69, 0]}>
            <cylinderGeometry args={[0.32, 0.38, 0.04, 48]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.715, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.015, 48]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Bottom Metallic Silver Rim */}
          <mesh position={[0, -0.69, 0]}>
            <cylinderGeometry args={[0.38, 0.32, 0.04, 48]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ) : isBox ? (
        // COMPACT TETRA PAK CARTON BOX WITH SLANTED TOP ROOF (Ultra Milk)
        <group>
          {/* Carton Box Cuboid */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.68, 1.25, 0.52]} />
            <meshStandardMaterial color={bodyColor} metalness={0.05} roughness={0.4} />
          </mesh>
          {/* White Dairy Brand Header Wrap */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.7, 0.68, 0.54]} />
            <meshStandardMaterial color={labelColor} roughness={0.5} />
          </mesh>
          {/* Accent Blue Dairy Wave Stripe */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.72, 0.16, 0.56]} />
            <meshStandardMaterial color={stripeColor} roughness={0.5} />
          </mesh>
          {/* Slanted Roof Trim */}
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[0.66, 0.08, 0.5]} />
            <meshStandardMaterial color={bodyColor} roughness={0.4} />
          </mesh>
          {/* Top Side Round Screw Cap */}
          <mesh position={[0.18, 0.72, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
            <meshStandardMaterial color={capColor} metalness={0.2} roughness={0.2} />
          </mesh>
        </group>
      ) : isYakult ? (
        // CHARMING YAKULT CURVED WAIST BOTTLE WITH SILVER FOIL SEAL
        <group position={[0, -0.1, 0]}>
          {/* Wider Circular Belly Base */}
          <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.35, 0.65, 48]} />
            <meshStandardMaterial color={bodyColor} roughness={0.4} />
          </mesh>
          {/* Tapered Middle Waist Indentation */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.26, 0.38, 0.25, 48]} />
            <meshStandardMaterial color={bodyColor} roughness={0.4} />
          </mesh>
          {/* Red Brand Typography Label Band */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.385, 0.36, 0.38, 48]} />
            <meshStandardMaterial color={labelColor} roughness={0.3} />
          </mesh>
          {/* Expanding Collar & Neck */}
          <mesh position={[0, 0.56, 0]}>
            <cylinderGeometry args={[0.31, 0.26, 0.18, 48]} />
            <meshStandardMaterial color={bodyColor} roughness={0.4} />
          </mesh>
          {/* Shiny Silver Aluminum Foil Lid Seal */}
          <mesh position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.02, 48]} />
            <meshStandardMaterial color={capColor} metalness={0.95} roughness={0.12} />
          </mesh>
        </group>
      ) : (
        // SLEEK & SLENDER REALISTIC PET / GLASS BOTTLE (Pocari, S-Tee, Pucuk, Golda, You-C, Ron 88)
        <group>
          {/* Main Bottle Body Cylinder (Sleek radius 0.42 instead of fat 0.8!) */}
          <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.42, 0.42, 1.45, 48]} />
            <meshPhysicalMaterial 
              color={bodyColor} 
              metalness={metal} 
              roughness={rough} 
              transparent={trans > 0}
              opacity={trans > 0 ? 0.88 : 1}
              transmission={trans}
              thickness={1.0}
            />
          </mesh>
          {/* Brand Waist Label Wrap Band */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.427, 0.427, 0.85, 48]} />
            <meshStandardMaterial color={labelColor} roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Center Accent Strip (e.g. White line in Pocari / Red in S-Tee) */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.432, 0.432, 0.3, 48]} />
            <meshStandardMaterial color={stripeColor} roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Tapered Bottle Shoulder & Neck */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.18, 0.42, 0.38, 48]} />
            <meshPhysicalMaterial color={bodyColor} metalness={metal} roughness={rough} transparent={trans > 0} opacity={0.9} />
          </mesh>
          {/* Screw Neck Collar */}
          <mesh position={[0, 0.93, 0]}>
            <cylinderGeometry args={[0.19, 0.18, 0.09, 32]} />
            <meshStandardMaterial color={bodyColor} roughness={0.3} />
          </mesh>
          {/* Authentic Ribbed Screw Cap */}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 32]} />
            <meshStandardMaterial color={capColor} metalness={0.25} roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * SHELF ITEM CSS — Zero-WebGL CSS-only visual replica of a drink on the shelf.
 * Matches shape (bottle/can/box/yakult) and colors from style3D.
 * Replaces ShelfItem3D on shelves to eliminate per-item WebGL contexts.
 */
export function ShelfItemCSS({ item }: { item: Item }) {
  const style = item.style3D;
  const shape = style?.shape ?? 'bottle';
  const body = style?.bodyColor ?? '#3b82f6';
  const label = style?.labelColor ?? '#1e3a8a';
  const cap = style?.capColor ?? '#2563eb';
  const stripe = style?.stripeColor ?? '#ffffff';
  const shortLabel = style?.shortLabel ?? item.icon ?? '🥤';
  const isTransparent = (style?.trans ?? 0) > 0;

  if (shape === 'can') {
    return (
      <div className="relative flex flex-col items-center justify-end" style={{ width: 28, height: 52 }}>
        {/* Lid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-full" style={{ width: 22, height: 7, background: `linear-gradient(to bottom, ${cap}, ${body})` }} />
        {/* Pull tab */}
        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 rounded-sm" style={{ width: 6, height: 3, background: '#c0c0c0' }} />
        {/* Body */}
        <div className="absolute rounded-sm overflow-hidden" style={{ width: 22, height: 42, top: 5, background: `linear-gradient(to right, ${body}cc, ${body}, ${body}cc)` }}>
          {/* Label band */}
          <div className="absolute inset-x-0" style={{ top: '25%', height: '50%', background: label, opacity: 0.85 }} />
          {/* Stripe */}
          <div className="absolute inset-x-0" style={{ top: '43%', height: '14%', background: stripe, opacity: 0.6 }} />
          {/* Shine */}
          <div className="absolute top-0 bottom-0" style={{ left: '65%', width: '18%', background: 'rgba(255,255,255,0.18)' }} />
          {/* Short label text */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 2 }}>
            {shortLabel.length <= 4 ? shortLabel : item.icon}
          </div>
        </div>
        {/* Bottom ring */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-full" style={{ width: 22, height: 5, background: `linear-gradient(to top, ${cap}aa, ${body})` }} />
      </div>
    );
  }

  if (shape === 'box') {
    return (
      <div className="relative flex flex-col items-center" style={{ width: 26, height: 50 }}>
        {/* Fold top */}
        <div className="rounded-t-sm" style={{ width: 22, height: 8, background: cap }} />
        {/* Body */}
        <div className="relative overflow-hidden" style={{ width: 22, height: 40, background: `linear-gradient(135deg, ${body}, ${label})` }}>
          <div className="absolute inset-x-0" style={{ top: '20%', height: '60%', background: label, opacity: 0.6 }} />
          <div className="absolute inset-x-0" style={{ top: '33%', height: '20%', background: stripe, opacity: 0.5 }} />
          <div className="absolute top-0 bottom-0" style={{ left: '60%', width: '20%', background: 'rgba(255,255,255,0.15)' }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 7, fontWeight: 900, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {shortLabel.length <= 4 ? shortLabel : item.icon}
          </div>
        </div>
        {/* Bottom */}
        <div className="rounded-b-sm" style={{ width: 22, height: 5, background: label }} />
      </div>
    );
  }

  if (shape === 'yakult') {
    return (
      <div className="relative flex flex-col items-center justify-end" style={{ width: 22, height: 46 }}>
        {/* Straw hole cap */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-full" style={{ width: 10, height: 8, background: cap }} />
        {/* Neck taper */}
        <div className="absolute" style={{ top: 6, left: '50%', transform: 'translateX(-50%)', width: 14, height: 6, background: `linear-gradient(to bottom, ${body}aa, ${body})`, borderRadius: '40% 40% 0 0' }} />
        {/* Bulgy body */}
        <div className="absolute overflow-hidden" style={{ top: 10, left: '50%', transform: 'translateX(-50%)', width: 18, height: 32, borderRadius: '45% 45% 30% 30%', background: `linear-gradient(160deg, ${body}ee, ${body}, ${label}aa)` }}>
          <div className="absolute top-0 bottom-0" style={{ left: '60%', width: '22%', background: 'rgba(255,255,255,0.22)' }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 6, fontWeight: 900, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {item.icon}
          </div>
        </div>
        {/* Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b" style={{ width: 16, height: 4, background: label }} />
      </div>
    );
  }

  // Default: bottle (bottle, glass, etc.)
  const trans = style?.trans ?? 0;
  const bodyBg = trans > 0
    ? `linear-gradient(160deg, ${body}99, ${body}dd, ${body}99)`
    : `linear-gradient(160deg, ${body}cc, ${body}, ${body}cc)`;

  return (
    <div className="relative flex flex-col items-center justify-end" style={{ width: 28, height: 56 }}>
      {/* Bottle cap */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-sm" style={{ width: 9, height: 5, background: cap }} />
      {/* Neck */}
      <div className="absolute" style={{ top: 4, left: '50%', transform: 'translateX(-50%)', width: 9, height: 10, background: body }} />
      {/* Collar */}
      <div className="absolute rounded-sm" style={{ top: 13, left: '50%', transform: 'translateX(-50%)', width: 14, height: 3, background: body }} />
      {/* Body */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 20,
          height: 36,
          borderRadius: '3px 3px 4px 4px',
          background: bodyBg,
          backdropFilter: trans > 0 ? 'blur(2px)' : undefined,
        }}
      >
        {/* Label band */}
        <div className="absolute inset-x-0" style={{ top: '20%', height: '55%', background: label, opacity: 0.75 }} />
        {/* Center stripe */}
        <div className="absolute inset-x-0" style={{ top: '40%', height: '15%', background: stripe, opacity: 0.55 }} />
        {/* Shine */}
        <div className="absolute top-0 bottom-0" style={{ left: '62%', width: '20%', background: 'rgba(255,255,255,0.2)' }} />
        {/* Short label text */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', zIndex: 2 }}>
          {shortLabel.length <= 4 ? shortLabel : item.icon}
        </div>
      </div>
      {/* Bottom base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b" style={{ width: 21, height: 3, background: cap }} />
    </div>
  );
}

/**
 * COMPASSIONATE MINI 3D SHELF DISPLAY COMPONENT (RENDERED INSIDE FRIDGE SHELVES)
 * Ensures 100% aesthetic match between shelf display and 3D zoom inspection!
 */
export function ShelfItem3D({ item }: { item: Item }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-12 h-16 bg-slate-400/20 rounded-lg animate-pulse" />;
  }

  return (
    <div className="w-13 h-[58px] sm:w-[58px] sm:h-[68px] relative flex items-center justify-center pointer-events-none shrink-0">
      <Canvas 
        camera={{ position: [0, 0.15, 3.8], fov: 36 }} 
        style={{ pointerEvents: 'none' }}
        frameloop="demand"
        gl={{ powerPreference: 'low-power', antialias: true }}
      >
        <ambientLight intensity={2.8} />
        <directionalLight position={[5, 8, 6]} intensity={3.5} />
        <directionalLight position={[-4, -2, -3]} intensity={1.8} color="#38bdf8" />
        <directionalLight position={[0, -3, 3]} intensity={1.5} color="#ffffff" />
        
        <group position={[0, -0.15, 0]}>
          <DrinkMesh3D item={item} isMini={true} />
        </group>
      </Canvas>
    </div>
  );
}

/**
 * TRIPLE-A GAMING 3D ITEM INSPECTION MODAL ("AMBIL INI ATAU GK DEH")
 */
export default function ItemInspector3DModal({ item, currentUser, onClose, onTake, onEdit, onDelete }: ItemInspectorProps) {
  const [mounted, setMounted] = useState(false);
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const canAfford = currentUser ? currentUser.currentBalance >= item.price : false;
  const hasStock = item.stock > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/92 backdrop-blur-xl flex flex-col justify-between items-center p-3 sm:p-8 select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* Ambient Radial Cyber Halo in Background */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.2)_0%,transparent_70%)] pointer-events-none animate-pulse"></div>

      {/* TOP FLOATING HUD (NO CARD BOX - PURE CLEAN 3D THEATER) */}
      <div className="z-20 flex flex-col items-center text-center mt-2 w-full max-w-2xl shrink-0">
        <div className="bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-2 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-bounce flex items-center space-x-2">
          <span>✋ SENTUH / GESER OBJEK UNTUK MEMUTAR 3D 360°</span>
        </div>
        
        <h2 className="text-xl sm:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_6px_15px_rgba(0,0,0,0.9)] mb-2">
          {item.name}
        </h2>

        <div className="inline-flex items-center bg-[#ffea00] border-2 border-amber-600 rounded-xl px-3 sm:px-5 py-1 sm:py-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] text-slate-950 transform -rotate-1 pointer-events-auto hover:scale-105 transition-transform mb-2">
          <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded mr-3 shadow-xs">
            ★ PROMO MINIMARKET ★
          </span>
          <span className="font-extrabold text-base sm:text-lg mr-1 text-red-700">Rp</span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight">{item.price.toLocaleString('id-ID')}</span>
        </div>

        {/* Dynamic Marketing Tagline & HP Boost Badge */}
        {item.style3D && (item.style3D.hpBoost || item.style3D.tagline) && (
          <div className="max-w-md bg-zinc-900/95 border border-amber-400 text-slate-200 p-2 rounded-xl text-xs shadow-lg transform translate-y-1 z-30 pointer-events-auto">
            {item.style3D.hpBoost && <div className="text-amber-300 font-black mb-0.5">{item.style3D.hpBoost}</div>}
            {item.style3D.tagline && <div className="text-[11px] italic text-slate-300">"{item.style3D.tagline}"</div>}
          </div>
        )}
      </div>

      {/* CENTER STAGE: MASSIVE TRUE 3D WEBGL ROTATABLE MESH */}
      <div className="absolute inset-0 w-full h-full z-10 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0.1, 6.8], fov: 32 }} frameloop="demand">
          <ambientLight intensity={2.5} />
          <directionalLight position={[5, 10, 7]} intensity={4.0} castShadow />
          <directionalLight position={[-6, -3, -4]} intensity={2.2} color="#38bdf8" />
          <directionalLight position={[0, -4, 4]} intensity={1.8} color="#ffffff" />
          <directionalLight position={[0, 5, -5]} intensity={1.5} color="#e2e8f0" />

          {/* Slightly lower Y position (-0.25) so cap doesn't touch the top yellow promo badge! */}
          <Float speed={2.2} rotationIntensity={0.2} floatIntensity={0.3}>
            <group position={[0, -0.25, 0]}>
              <DrinkMesh3D item={item} isMini={false} />
            </group>
          </Float>

          {/* Glowing Ground Reflection Shadow positioned safely below the bottle */}
          <ContactShadows position={[0, -1.35, 0]} opacity={0.75} scale={4.5} blur={1.8} far={3.5} color="#06b6d4" />
          
          {/* Allow user to rotate in 3D seamlessly with safe boundaries! */}
          <OrbitControls enableZoom={true} minDistance={5.0} maxDistance={10.0} makeDefault />
        </Canvas>
      </div>

      {/* BOTTOM FLOATING ACTION CONTROLLER: "AMBIL INI ATAU GK DEH" */}
      <div className="z-20 mb-2 sm:mb-6 flex flex-col items-center w-full max-w-xl pointer-events-auto shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full text-[9px] sm:text-sm font-bold text-slate-200 bg-slate-900/85 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-xl sm:rounded-full border border-slate-700 shadow-xl mb-2 sm:mb-3 space-y-0.5 sm:space-y-0">
          <span>📦 Stok Rak: <strong className="text-white font-black text-[11px] sm:text-base">{item.stock} pcs</strong></span>
          {isSuperAdmin ? (
            <span>👑 Mode Admin: <strong className="text-amber-400 font-black">Inspeksi & Kelola Produk</strong></span>
          ) : currentUser ? (
            <span>💰 Saldo Anda: <strong className={`font-black text-[11px] sm:text-base ${!canAfford ? 'text-rose-400 font-extrabold animate-pulse' : 'text-emerald-400'}`}>Rp {currentUser.currentBalance.toLocaleString('id-ID')} {!canAfford ? '(❌ Kurang)' : '(✅ Cukup)'}</strong></span>
          ) : null}
        </div>

        {isSuperAdmin ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 w-full px-1 sm:px-2">
            {/* 🔴 TOMBOL GAK DEH (CANCEL / RETURN TO SHELF) */}
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700 font-black py-2.5 sm:py-5 px-3 sm:px-6 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all duration-200 transform active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-3 text-sm sm:text-2xl uppercase tracking-wider group hover:scale-105 cursor-pointer"
            >
              <span className="text-xl sm:text-3xl group-hover:scale-125 transition-transform">🙅‍♂️</span>
              <span>Gk deh...</span>
            </button>

            {/* 🟡 TOMBOL EDIT / TAMBAH STOK */}
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-2 border-amber-200 font-black py-2.5 sm:py-5 px-3 sm:px-6 rounded-2xl shadow-[0_0_45px_rgba(245,158,11,0.65)] transition-all duration-200 transform active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-3 text-sm sm:text-2xl uppercase tracking-wider hover:scale-105 cursor-pointer"
            >
              <span className="text-xl sm:text-3xl">✏️</span>
              <span>Edit Minuman</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 w-full px-1 sm:px-2">
            {/* 🔴 TOMBOL GAK DEH (CANCEL / RETURN TO SHELF) */}
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-rose-600 text-slate-200 hover:text-white border-2 border-slate-700 hover:border-rose-400 font-black py-2.5 sm:py-5 px-3 sm:px-6 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all duration-200 transform active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-3 text-sm sm:text-2xl uppercase tracking-wider group hover:scale-105 cursor-pointer"
            >
              <span className="text-xl sm:text-3xl group-hover:scale-125 transition-transform">🙅‍♂️</span>
              <span>Gk deh...</span>
            </button>

            {/* 🟢 TOMBOL AMBIL INI! */}
            <button
              disabled={!hasStock || !canAfford}
              onClick={onTake}
              className={`font-black py-2.5 sm:py-5 px-3 sm:px-4 rounded-2xl shadow-2xl transition-all duration-200 transform active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-3 text-sm sm:text-2xl uppercase tracking-wider border-2 hover:scale-105 cursor-pointer ${
                !hasStock 
                  ? 'bg-rose-950 text-rose-300 border-rose-600 opacity-85 cursor-not-allowed'
                  : !canAfford
                  ? 'bg-amber-950 text-amber-300 border-amber-500 opacity-90 cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 border-emerald-200 shadow-[0_0_45px_rgba(16,185,129,0.75)]'
              }`}
            >
              <span className="text-xl sm:text-3xl">
                {!hasStock ? '❌' : !canAfford ? '🚫' : '🤤'}
              </span>
              <span>
                {!hasStock ? 'Stok Habis' : !canAfford ? 'Saldo Kurang' : 'Ambil Ini!'}
              </span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
