'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartFridgeApp() {
  const { currentUser, users, items, transactions, login, logout, takeItem, updateStock, isClient } = useApp();
  
  // 3D Game interaction & 2-Stage Lock states
  const [isDoorUnlocked, setIsDoorUnlocked] = useState(false); // Stage 1: GREEN DOT (Unlocked), RED DOT (Locked)
  const [isDoorOpen, setIsDoorOpen] = useState(false);         // Stage 2: Physically Swung Open
  const [showAuthPrompt, setShowAuthPrompt] = useState(false); // Game HUD prompt when grabbing locked handle
  const [isHandPulling, setIsHandPulling] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);   // Quest Step 1: PIN correct, need to find "Orang Ganteng"
  const [isGantengFound, setIsGantengFound] = useState(false); // Quest Step 2: Found "Orang Ganteng", unlock fridge!
  const [openTimeRemaining, setOpenTimeRemaining] = useState(60); // 60 seconds (1 minute max open time)
  
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAdminTab, setShowAdminTab] = useState<'stock' | 'rekap' | 'history'>('stock');

  // Global Fullscreen Custom Hand Cursor Tracking & Hover States
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  // Track global window mouse coordinates so hand replaces system cursor everywhere
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Employee picker states
  const adminUser = users.find(u => u.role === 'superadmin');
  const user1 = users.find(u => u.id === 'user-1');
  const otherUsers = users.filter(u => u.role === 'user' && u.id !== 'user-1');
  const employeeUsers = users.filter(u => u.role === 'user');
  const userTransactions = currentUser ? transactions.filter(t => t.userId === currentUser.id) : [];

  const shelves = [
    { name: 'Rak 1: Teh, Kopi & Susu', items: items.slice(0, 5) },
    { name: 'Rak 2: Vitamin & Isotonik', items: items.slice(5, 9) },
    { name: 'Rak 3: Air Mineral & Soda', items: items.slice(9) },
  ];

  const getBeverageStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('pocari')) return { bg: 'from-blue-500 via-sky-400 to-blue-600', label: 'Pocari' };
    if (n.includes('stee')) return { bg: 'from-amber-600 via-yellow-500 to-amber-700', label: 'S-TEE' };
    if (n.includes('pucuk')) return { bg: 'from-emerald-600 via-green-500 to-teal-700', label: 'Pucuk' };
    if (n.includes('panda')) return { bg: 'from-slate-700 via-zinc-500 to-slate-800', label: 'Bird Nest' };
    if (n.includes('golda')) return { bg: 'from-yellow-700 via-amber-600 to-yellow-800', label: 'Golda' };
    if (n.includes('abc')) return { bg: 'from-amber-800 via-amber-700 to-stone-900', label: 'ABC Kopi' };
    if (n.includes('yakult')) return { bg: 'from-red-500 via-rose-400 to-red-600', label: 'Yakult' };
    if (n.includes('kaca')) return { bg: 'from-yellow-400 via-amber-300 to-yellow-500', label: 'YOU-C' };
    if (n.includes('ultra')) return { bg: 'from-sky-600 via-blue-500 to-indigo-700', label: 'Ultra Milk' };
    if (n.includes('nescafe')) return { bg: 'from-red-600 via-red-500 to-rose-800', label: 'Nescafe' };
    if (n.includes('hydro')) return { bg: 'from-emerald-500 via-teal-400 to-green-600', label: 'Hydro' };
    if (n.includes('500ml')) return { bg: 'from-yellow-500 via-amber-400 to-yellow-600', label: 'YOU-C 500' };
    return { bg: 'from-cyan-400 via-blue-300 to-sky-500', label: 'Ron 88' };
  };

  // INTELLIGENT 3D HAND POSTURE LOGIC
  const getHandCursorDetails = () => {
    if (showAuthPrompt || isHoveringButton) {
      return {
        icon: '👆',
        text: 'TEKAN',
        color: 'bg-cyan-400 text-zinc-950 border-cyan-300',
        transform: 'translate(-40%, -20%) scale(1.1)'
      };
    }
    if (isHoveringHandle && !isDoorOpen) {
      if (isDoorUnlocked) {
        return {
          icon: '✊',
          text: '🟢 TARIK GAGANG',
          color: 'bg-emerald-400 text-zinc-950 border-emerald-300 animate-bounce',
          transform: 'translate(-50%, -50%) scale(1.25) rotate(-12deg)'
        };
      } else {
        return {
          icon: '🫴',
          text: '🔴 TARIK GAGANG',
          color: 'bg-rose-500 text-white border-rose-300',
          transform: 'translate(-50%, -50%) scale(1.15)'
        };
      }
    }
    if (isDoorOpen) {
      return {
        icon: '👇',
        text: 'AMBIL MINUMAN',
        color: 'bg-zinc-900 text-cyan-300 border-zinc-700',
        transform: 'translate(-50%, -30%) scale(1.1)'
      };
    }
    return {
      icon: '🖐️',
      text: '',
      color: '',
      transform: 'translate(-60%, -60%)'
    };
  };

  const cursorState = getHandCursorDetails();

  const handleHandleClick = () => {
    if (isDoorOpen) return;

    if (!isDoorUnlocked) {
      if (isPinVerified && !isGantengFound) {
        setToastMessage({
          text: '⚠️ GEMBOK TERTAHAN! PIN memang sudah benar, tapi kamu BELUM MENEMUKAN SI ORANG GANTENG yang ngintip di ruangan ini! Cari dulu! 👀',
          type: 'error'
        });
        return;
      }
      setShowAuthPrompt(true);
      return;
    }

    setIsHandPulling(true);

    setTimeout(() => {
      setIsDoorOpen(true);
      setTimeout(() => {
        setIsHandPulling(false);
      }, 1100);
    }, 450);
  };

  const handleVerifyCredential = (userId: string) => {
    login(userId);
    setShowAuthPrompt(false);
    setEnteredPin('');
    setIsPinVerified(true);
    setIsDoorUnlocked(false); 

    const u = users.find(user => user.id === userId);
    setToastMessage({
      text: `⚡ Verifikasi (${u?.name || 'User'}) OK! TAPI TUNGGU: Sebelum kulkas kebuka, CARI DULU ORANG GANTENG yang lagi ngintip di ruangan ini! 👀✨`,
      type: 'info'
    });
  };

  const validatePinCode = (pin: string) => {
    if (pin === '100499') {
      const ade = users.find(u => u.id === 'user-1' || u.name.toLowerCase().includes('ade')) || users[0];
      if (ade) {
        login(ade.id);
        setShowAuthPrompt(false);
        setEnteredPin('');
        setPinError(false);
        setIsPinVerified(true);
        setIsDoorUnlocked(false);
        setToastMessage({
          text: `🔥 ANJAY KODE SAKTI BENER! TAPI TUNGGU: Sebelum kulkas bisa dibuka, CARI & TEMUKAN DULU "ORANG GANTENG" yang lagi ngintip rahasia di ruangan ini! 👀✨`,
          type: 'info'
        });
        return;
      }
    } else if (pin === '123456') {
      const admin = users.find(u => u.role === 'superadmin') || users[1];
      if (admin) {
        login(admin.id);
        setShowAuthPrompt(false);
        setEnteredPin('');
        setPinError(false);
        setIsPinVerified(true);
        setIsDoorUnlocked(false);
        setToastMessage({
          text: `👑 KODE VVIP BENAR! TAPI TUNGGU: Sebelum kulkas terbuka, CARI & TEMUKAN DULU "ORANG GANTENG" yang lagi ngintip di ruangan ini! 👀🤫`,
          type: 'info'
        });
        return;
      }
    }

    // Wrong pin!
    setPinError(true);
    setToastMessage({
      text: '❌ KODE SALAH BOSKU! Alarm kulkas menjerit: "WOOOYY BUKAN KULKAS MOYANG LU! JANGAN ASAL TEBAK PIN!"',
      type: 'error'
    });
    setTimeout(() => {
      setEnteredPin('');
      setPinError(false);
    }, 1200);
  };

  const handleFindGanteng = () => {
    if (isPinVerified && !isGantengFound) {
      setIsGantengFound(true);
      setIsDoorUnlocked(true);
      setToastMessage({
        text: '🎉 HORE! Si Orang Ganteng ketangkap basah! ("Yahh ketauannn 🤪"). 🟢 Gembok Kulkas resmi TERBUKA! Silakan tarik gagang pintu sekarang!',
        type: 'success'
      });
    }
  };

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 6 && !pinError) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin.length === 6) {
        setTimeout(() => validatePinCode(nextPin), 250);
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const handlePinReset = () => {
    setEnteredPin('');
    setPinError(false);
  };

  // Listen to physical keyboard when auth keypad is open
  useEffect(() => {
    if (!showAuthPrompt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handlePinDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handlePinReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthPrompt, enteredPin, pinError]);

  // 1-Minute Open Door Timer (Compressor Safety & Electricity Saving Alarm)
  useEffect(() => {
    if (!isDoorOpen) {
      setOpenTimeRemaining(60);
      return;
    }

    const timer = setInterval(() => {
      setOpenTimeRemaining((prev) => {
        if (prev === 16) {
          setToastMessage({
            text: '⚠️ ALARM DARURAT: Sisa 15 detik! Cepetan ambil minum & tutup pintu kulkasnya! Kalau dibuka kelamaan kompresor bisa jebol mampus & boros listrik! ⚡🥶',
            type: 'error'
          });
        }

        if (prev <= 1) {
          clearInterval(timer);
          setIsDoorOpen(false);
          setIsDoorUnlocked(false);
          setIsPinVerified(false);
          setIsGantengFound(false);
          logout();
          setToastMessage({
            text: '🚨 BLAM! Pintu kulkas NGEREM DEPAR KETUTUP & TERKUNCI OTOMATIS! Waktu buka habis (1 menit)! "WOOYY JANGAN BUKAIN KULKAS LAMA-LAMA BUANG ANGIN FREON MAMPUS! BAYAR NO REKENING LISTRIK SANA!" 😤⚡',
            type: 'error'
          });
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDoorOpen, logout]);

  const handleCloseAndLock = () => {
    setIsDoorOpen(false);
    setIsDoorUnlocked(false);
    setIsPinVerified(false);
    setIsGantengFound(false);
    setTimeout(() => {
      logout();
      setToastMessage({
        text: '🔒 Pintu Kulkas Ditutup & Terkunci.',
        type: 'info'
      });
    }, 400);
  };

  const handleItemClick = (itemId: string) => {
    if (!isDoorOpen || !currentUser) {
      if (!isDoorUnlocked) {
        setShowAuthPrompt(true);
      } else {
        setToastMessage({ text: '🟢 Titik LED sudah Hijau! Klik gagang pintu kanan untuk menarik bukaan pintu kaca terlebih dahulu.', type: 'info' });
      }
      return;
    }

    if (currentUser.role === 'superadmin') {
      updateStock(itemId, 1);
      setToastMessage({ text: '📦 (+1 pcs) Stok rak bertambah.', type: 'success' });
      return;
    }

    const res = takeItem(itemId);
    setToastMessage({
      text: res.message,
      type: res.success ? 'success' : 'error'
    });
  };

  if (!isClient) return null;

  return (
    <div className="h-screen w-screen bg-stone-100 p-2 sm:p-4 flex items-center justify-center font-sans select-none overflow-hidden relative cursor-none">
      
      {/* ABSOLUTE GLOBAL CURSOR OVERRIDE - DESTROYS SYSTEM CURSOR ON EVERY BUTTON, INPUT & ELEMENT 100% */}
      <style dangerouslySetInnerHTML={{
        __html: `
          *, *::before, *::after, button, [role="button"], a, input, select, textarea, div, span, table, tr, td, th {
            cursor: none !important;
          }
        `
      }} />

      {/* INTELLIGENT GLOBAL FLOATING 3D HAND CURSOR IN GAME WORLD (DYNAMIC POSTURES!) */}
      <div 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px`,
          transform: cursorState.transform
        }}
        className="pointer-events-none fixed z-[9999] transition-transform duration-100 hidden sm:flex flex-col items-center justify-center drop-shadow-[0_14px_22px_rgba(0,0,0,0.9)]"
      >
        <span className="text-4xl filter select-none pointer-events-none block">
          {cursorState.icon}
        </span>
        {cursorState.text && (
          <span className={`text-[8px] border px-1.5 py-0.5 rounded-md font-black mt-1 shadow-2xl uppercase whitespace-nowrap tracking-wider pointer-events-none ${cursorState.color}`}>
            {cursorState.text}
          </span>
        )}
      </div>

      {/* =========================================================================================
          DESKTOP BRIGHT WARM JAPANDI TECH OFFICE PANTRY & LOUNGE SIMULATION BACKGROUND
          ========================================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50/30 to-stone-200 flex flex-col justify-between">
        
        {/* Upper Wall: Warm Soft Beige & Timber Slats with Spotlights */}
        <div className="flex-1 w-full bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px)] bg-[size:4.5rem_100%] bg-stone-100/95 relative z-20 flex justify-center">
          
          {/* Ceiling Warm Ambient Halo Lighting */}
          <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18)_0%,transparent_70%)] pointer-events-none"></div>
          
          {/* STAGED STUDIO VIEWPORT WRAPPER: Clamps wall decorations to max-w-[1360px] so layout never breaks on giant widescreen monitors! */}
          <div className="w-full max-w-[1360px] h-full flex items-center justify-between px-4 sm:px-8 xl:px-12 pt-4 relative">
            
            {/* TOP WALL DECORATIONS: CLOCK & BOXED TEAM PHOTO FRAME (HANGING HIGH ON WALL) */}
            <div className="absolute top-4 inset-x-0 flex items-start justify-center space-x-12 xl:space-x-[520px] pointer-events-none opacity-95 hidden md:flex">
              
              {/* Invisible spacer to keep right-side photo frame alignment intact */}
            <div className="w-40 invisible pointer-events-none"></div>

            {/* Boxed Brown Wooden Framed Team Photo (Pure Photo Frame without Text) */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 bg-amber-900 rounded-2xl p-2 shadow-[0_20px_45px_rgba(0,0,0,0.3)] border-[8px] border-amber-950 transform rotate-3 flex flex-col items-center justify-center pointer-events-auto">
              <div className="w-full h-full rounded-lg bg-stone-100 p-1.5 shadow-inner border border-amber-950/40 overflow-hidden relative">
                <img 
                  src="/team.jpeg" 
                  alt="Team SAKUL 2026" 
                  className="w-full h-full object-cover object-center rounded transform hover:scale-105 transition-transform duration-500 shadow" 
                />
              </div>
            </div>
          </div>

          {/* =========================================================================================
              LEFT SIDE: CURTAINED SUNSET WINDOW OVER COFFEE BAR & MONSTERA PLANT (MOVED TO LEFT!)
              ========================================================================================= */}
          <div className="hidden lg:flex flex-col items-center w-[290px] xl:w-[330px] self-center -mt-16 sm:-mt-20 relative z-30 transform -rotate-1 origin-bottom-right ml-2 xl:ml-8 space-y-4">
            
            {/* 4-PANE FRENCH SUNSET WINDOW WITH CURTAIN ROD AND FABRIC DRAPES (NOW ON LEFT WALL!) */}
            <div className="relative shrink-0 -mt-8">
              {/* Full Width Dark Wooden Window Architrave Backdrop (Eliminates wall holes/gaps on left & right sides) */}
              <div className="absolute -left-7 -right-7 -top-2 -bottom-2 bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 rounded-2xl shadow-xl -z-10 border-2 border-stone-800"></div>

              {/* Top Curtain Rod */}
              <div className="absolute -top-5 -left-8 -right-8 h-3.5 bg-stone-900 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-40 border border-stone-700 flex items-center justify-between px-1">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow"></div>
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow"></div>
              </div>

              {/* Left & Right Curtain Drapes */}
              <div className="absolute -left-6 top-0 bottom-0 w-10 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-800 rounded-bl-xl shadow-[15px_0_25px_rgba(0,0,0,0.4)] z-30 pointer-events-none border-l-4 border-amber-950 flex flex-col justify-center">
                <div className="h-3.5 w-full bg-amber-400/80 shadow-lg mt-10 rounded-r-full border-y border-amber-600"></div>
              </div>
              <div className="absolute -right-6 top-0 bottom-0 w-10 bg-gradient-to-l from-amber-950 via-amber-900 to-amber-800 rounded-br-xl shadow-[-15px_0_25px_rgba(0,0,0,0.4)] z-30 pointer-events-none border-r-4 border-amber-950 flex flex-col justify-center">
                <div className="h-3.5 w-full bg-amber-400/80 shadow-lg mt-10 rounded-l-full border-y border-amber-600"></div>
              </div>

              {/* Window Box */}
              <div className="w-64 h-[365px] sm:h-[380px] rounded-2xl border-[10px] border-stone-800 bg-gradient-to-b from-sky-400 via-amber-300 to-orange-400 shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden relative flex flex-col justify-end p-2.5">
                <div className="absolute top-3 right-3 text-3xl filter drop-shadow-[0_0_20px_#ffffff] animate-pulse z-10">☀️</div>
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

                {/* Hilarious Ade Face Peeking from Outside the Window Glass! (Behind z-20 wooden divider grids) */}
                <div 
                  onMouseEnter={handleFindGanteng}
                  onClick={handleFindGanteng}
                  className={`absolute -bottom-[75px] sm:-bottom-[80px] -right-[70px] sm:-right-[78px] w-28 sm:w-32 group/ade transition-all duration-500 ease-out ${
                    isGantengFound 
                      ? '-translate-x-[62px] sm:-translate-x-[70px] -translate-y-[18px] !z-30 scale-105 pointer-events-auto' 
                      : isPinVerified
                      ? 'z-[15] pointer-events-auto cursor-pointer transform hover:scale-105 hover:-translate-x-[62px] sm:hover:-translate-x-[70px] hover:-translate-y-[18px] hover:z-30'
                      : 'z-[15] pointer-events-none'
                  }`}
                  title={isPinVerified ? "Klik / Hover Si Ganteng untuk membuka gembok kulkas!" : "Orang ganteng mengawasi rahasia... 👀"}
                >
                  <img 
                    src="/ade.png" 
                    alt="Ade Peeking Outside Window in Sunset" 
                    className={`w-full h-auto object-contain opacity-[0.88] filter drop-shadow-[0_12px_20px_rgba(120,53,15,0.65)] brightness-[0.78] contrast-[1.18] saturate-[1.85] sepia-[.45] hue-rotate-[-15deg] transition-all duration-500 transform ${
                      isGantengFound ? '-rotate-[25deg]' : '-rotate-[35deg] group-hover/ade:-rotate-[25deg]'
                    }`}
                  />
                  <div className={`absolute -top-2 left-0 right-0 transition-opacity bg-slate-950/95 text-amber-300 text-[10px] sm:text-[10.5px] font-black py-1.5 px-2 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-center pointer-events-none border-[1.5px] border-amber-400 font-mono tracking-tight ${
                    isGantengFound ? 'opacity-100 animate-bounce' : isPinVerified ? 'opacity-0 group-hover/ade:opacity-100' : 'opacity-0'
                  }`}>
                    Yahh ketauannn 🤪
                  </div>
                </div>

                <div className="absolute inset-x-0 top-1/2 -mt-1.5 h-3 bg-stone-800 z-20 pointer-events-none shadow-md border-y border-stone-700"></div>
                <div className="absolute inset-y-0 left-1/2 -ml-1.5 w-3 bg-stone-800 z-20 pointer-events-none shadow-md border-x border-stone-700"></div>
                
                <div className="absolute top-2.5 left-2 z-30 font-black text-stone-900 text-xs flex items-center space-x-1.5 bg-white/95 py-1 px-2 rounded-xl backdrop-blur-md shadow-xl border border-stone-300 max-w-[140px] pointer-events-none">
                  <span className="text-sm shrink-0">🌅</span>
                  <div className="truncate">
                    <div className="text-[6px] text-stone-600 uppercase font-mono tracking-wider font-extrabold leading-none">EXTERIOR VIEW</div>
                    <div className="text-[9.5px] text-stone-950 uppercase font-black tracking-tight leading-none mt-0.5 truncate">Jakarta Sunset</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOOR DECORATION 1: SCANDINAVIAN TIMBER SIDE TABLE WITH BLOOMING FLOWER VASE (MEJA VAS BUNGA) */}
            <div className="absolute left-0 sm:left-2 -bottom-40 sm:-bottom-48 translate-y-6 sm:translate-y-8 z-40 flex flex-col items-center select-none group/vase pointer-events-auto">
              {/* Blooming Floral Arrangement Bouquet */}
              <div className="text-4xl sm:text-5xl filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.3)] z-30 -mb-2 transform group-hover/vase:scale-110 group-hover/vase:-translate-y-1 transition-transform duration-300 cursor-pointer" title="Vas Bunga Cantik Penghias Pantry 🌸">
                💐
              </div>
              {/* Glossy Ceramic Flower Vase */}
              <div className="w-9 sm:w-10 h-11 sm:h-12 bg-gradient-to-b from-stone-100 via-white to-stone-300 rounded-b-2xl rounded-t-lg border-2 border-stone-400 shadow-[0_8px_15px_rgba(0,0,0,0.35)] relative z-20 overflow-hidden flex items-center justify-center">
                <div className="absolute top-2 left-1 w-2 h-6 bg-white/60 rounded-full blur-[1px]"></div>
                <div className="w-full h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 absolute top-1.5 opacity-90 border-y border-amber-700"></div>
              </div>
              
              {/* Solid Oak Round Tabletop */}
              <div className="w-24 sm:w-28 h-5 sm:h-6 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded-xl border-2 border-stone-800 shadow-[0_12px_22px_rgba(0,0,0,0.45)] z-10 -mt-1 relative flex items-center justify-center">
                <div className="w-4 h-1 bg-white/20 rounded-full"></div>
              </div>

              {/* Angled Scandi Wooden Legs */}
              <div className="flex justify-between w-16 sm:w-20 -mt-1 relative z-0">
                <div className="w-3 sm:w-3.5 h-24 sm:h-28 bg-gradient-to-b from-amber-950 via-amber-900 to-stone-900 transform rotate-12 rounded-b-lg border-x border-stone-800 shadow-md"></div>
                <div className="w-3 sm:w-3.5 h-24 sm:h-28 bg-gradient-to-b from-amber-950 via-amber-900 to-stone-950 transform -rotate-12 rounded-b-lg border-x border-stone-800 shadow-md"></div>
              </div>

              {/* Floor Shadow Beneath Table */}
              <div className="w-24 sm:w-28 h-3.5 bg-black/40 rounded-full blur-sm -mt-1.5 z-0"></div>
            </div>

            {/* FLOOR DECORATION 2: MONSTERA FLOOR PLANT (ADJUSTED TO REST PERFECTLY ON WOOD FLOOR!) */}
            <div className="absolute -right-2 sm:-right-6 -bottom-40 sm:-bottom-48 translate-y-8 text-7xl sm:text-8xl filter drop-shadow-[0_15px_18px_rgba(0,0,0,0.4)] opacity-95 pointer-events-none z-50 transform hover:scale-105 transition-transform">
              🪴
            </div>
          </div>

          {/* =========================================================================================
              RIGHT SIDE: ANALOG WALL CLOCK & WOODEN CORKBOARD (GIVES WIDE CLEARANCE FROM REFRIGERATOR!)
              ========================================================================================= */}
          <div className="hidden lg:flex flex-col items-center self-center relative mt-0 sm:mt-2 z-30 transform rotate-1 origin-bottom-left ml-auto mr-0 xl:mr-0 translate-x-10 sm:translate-x-12 xl:translate-x-14 space-y-4">
            
            {/* REALISTIC 3D ROUND ANALOG WALL CLOCK (SET TO 17:00 QUITTING TIME) */}
            <div className="flex flex-col items-end self-end -mt-10 sm:-mt-14 -translate-y-8 sm:-translate-y-10 xl:-translate-y-12 mr-6 sm:mr-8 xl:mr-10 translate-x-4 sm:translate-x-6 shrink-0">
              {/* Outer clock frame & face */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 xl:w-36 xl:h-36 rounded-full bg-slate-950 border-[6px] sm:border-[8px] border-stone-800 shadow-[0_15px_35px_rgba(0,0,0,0.5)] p-1 relative flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-[#f8f6f0] shadow-[inset_0_4px_12px_rgba(0,0,0,0.25)] border border-stone-300 relative flex items-center justify-center font-serif text-stone-900 font-black">
                  {/* Dial numbers */}
                  <span className="absolute top-1 text-xs sm:text-sm">12</span>
                  <span className="absolute bottom-1 text-xs sm:text-sm">6</span>
                  <span className="absolute left-2 text-xs sm:text-sm">9</span>
                  <span className="absolute right-2 text-xs sm:text-sm">3</span>
                  
                  {/* Brand mark inside face */}
                  <span className="absolute top-[20px] sm:top-[22px] xl:top-[25px] text-[7.5px] sm:text-[8.5px] xl:text-[9.5px] font-sans tracking-tight text-red-700 uppercase font-black leading-tight text-center z-0">Waktu Kritis<br/>Pulang</span>

                  {/* Clock Hands showing 17:00 (5 PM) */}
                  <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1.5 sm:w-2 h-8 sm:h-10 xl:h-11 bg-stone-950 rounded-t-full origin-bottom z-10 shadow-sm"></div>
                  <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-2 sm:w-2.5 h-6 sm:h-7 xl:h-8 bg-amber-800 rounded-t-full origin-bottom rotate-[150deg] z-20 shadow-sm"></div>
                  
                  {/* Animated spinning red second hand with quartz tick-tick steps */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20" style={{ animation: 'spin 15s steps(60, end) infinite' }}>
                    <div className="w-0.5 sm:w-1 h-[44%] bg-rose-600 rounded-t-full -translate-y-1/2 shadow-xs"></div>
                  </div>
                  
                  {/* Center cap dot */}
                  <div className="w-3 h-3 rounded-full bg-amber-600 border-[1.5px] border-stone-900 shadow z-30"></div>
                </div>
              </div>
            </div>

            {/* THE WOODEN CORKBOARD OF WHOLESOME EMPLOYEE VIBE NOTES */}
            <div className="w-[275px] xl:w-[315px] bg-amber-900/90 rounded-2xl p-2 shadow-[0_25px_65px_rgba(0,0,0,0.3)] border-[6px] border-amber-950 text-stone-900 font-sans transform -rotate-1 relative shrink-0 mt-2 sm:mt-3 xl:mt-4 -translate-x-4 sm:-translate-x-5 -translate-y-6 sm:-translate-y-8">
              <div className="bg-[#cd9a5b] bg-[radial-gradient(#b88647_1px,transparent_1px)] [background-size:10px_10px] rounded-lg p-2 shadow-inner flex flex-col space-y-1.5">
                
                <div className="bg-stone-900 text-amber-300 font-black px-2 py-1 rounded text-[8px] sm:text-[8.5px] uppercase tracking-widest text-center shadow-md border border-amber-400/50 flex items-center justify-center space-x-1">
                  <span>📌 PAPAN CURHAT PEGAWAI</span>
                  <span className="animate-bounce">🥤</span>
                </div>

                {/* Grid of colorful wholesome & entertaining workplace sticky notes */}
                <div className="grid grid-cols-2 gap-1.5 text-[7.5px] sm:text-[8px] font-black leading-tight">
                  
                  {/* Sticky 1 */}
                  <div className="bg-amber-200 p-2 rounded shadow-md border-b-2 border-r-2 border-amber-400 transform -rotate-2 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">📌</span>
                    <p className="italic text-amber-950">"Kerja ikhlas, cair lekas, revisian tuntas, hatiku bebas! ✨😎"</p>
                  </div>

                  {/* Sticky 2 */}
                  <div className="bg-emerald-200 p-2 rounded shadow-md border-b-2 border-r-2 border-emerald-400 transform rotate-2 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">📌</span>
                    <p className="italic text-emerald-950">"Pengen resign... tapi pas ngeliat keranjang Shopee, langsung nggak jadi 🛒🥲."</p>
                  </div>

                  {/* Sticky 3 */}
                  <div className="bg-rose-200 p-2 rounded shadow-md border-b-2 border-r-2 border-rose-400 transform rotate-1 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">📌</span>
                    <p className="italic text-rose-950">"Jam 08.00 semangat, jam 12.00 pudar, jam 15.00 mampir bengong 🫠☕."</p>
                  </div>

                  {/* Sticky 4 */}
                  <div className="bg-cyan-200 p-2 rounded shadow-md border-b-2 border-r-2 border-cyan-400 transform -rotate-1 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">📌</span>
                    <p className="italic text-cyan-950">"Capek gapapa, yang penting cicilan paylater lunas tepat pada waktunya 💪🥹."</p>
                  </div>

                  {/* Sticky 5 */}
                  <div className="bg-purple-200 p-2 rounded shadow-md border-b-2 border-r-2 border-purple-400 transform rotate-2 text-stone-900 col-span-2 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">📌</span>
                    <p className="italic text-purple-950">"Mental boleh gemetar, tapi performa wajib gahar! Ingat: Capek kerja itu cuma sementara, tapi miskin & banyak cicilan itu SANGAT BERBAHAYA! 🗿💀🔥"</p>
                  </div>

                </div>

              </div>
            </div>

            {/* INTERACTIVE SOLID OFFICE PEDAL TRASH BIN (ABSOLUTE POSITIONED TO KEEP CLOCK & CORKBOARD AT ORIGINAL HEIGHT!) */}
            <div 
              className="absolute -left-14 sm:-left-24 xl:-left-28 -bottom-32 sm:-bottom-36 translate-y-6 sm:translate-y-8 z-50 transform -rotate-2 pointer-events-auto cursor-pointer group/bin select-none" 
              title="Arahkan kursor / hover untuk membuka tutup tempat sampah!"
            >
              <div className="relative flex flex-col items-center w-24 sm:w-28 xl:w-[122px]">
                
                {/* 1. HINGED LID (Flips open on hover!) */}
                <div className="w-[102px] sm:w-[118px] xl:w-[128px] h-8 sm:h-9 bg-gradient-to-b from-stone-300 via-stone-400 to-stone-600 rounded-t-2xl border-4 border-stone-700 shadow-[0_8px_15px_rgba(0,0,0,0.4)] z-30 flex flex-col items-center justify-start relative transform origin-bottom-left transition-all duration-500 ease-out group-hover/bin:-rotate-[65deg] group-hover/bin:-translate-y-7 group-hover/bin:-translate-x-3.5 group-hover/bin:shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                  {/* Handle on Lid */}
                  <div className="w-10 h-2.5 bg-gradient-to-r from-stone-500 via-stone-300 to-stone-500 rounded-full border border-stone-600 shadow-sm mt-1"></div>
                  {/* Shiny rim light */}
                  <div className="absolute top-3.5 inset-x-3 h-0.5 bg-white/40 rounded-full"></div>
                </div>

                {/* SURPRISE ARIF POP-UP OUT OF TRASH BIN WHEN HOVERED! 🗿🤣 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-12 sm:translate-y-16 w-32 sm:w-36 xl:w-[160px] z-[15] opacity-0 scale-[0.7] pointer-events-none transition-all duration-500 delay-75 ease-out group-hover/bin:opacity-100 group-hover/bin:-translate-y-[44px] sm:group-hover/bin:-translate-y-[50px] xl:group-hover/bin:-translate-y-[58px] group-hover/bin:scale-105 group-hover/bin:rotate-[2deg] flex flex-col items-center justify-end">
                  {/* Fun Surprise Speech Bubble */}
                  <div className="bg-amber-300 text-stone-950 font-mono font-black text-[8.5px] sm:text-[9.5px] xl:text-[10.5px] px-2.5 py-0.5 rounded-full shadow-lg border-[1.5px] border-stone-900 -mb-2 z-30 whitespace-nowrap transform -rotate-6 animate-bounce">
                    Wakwaw! 🤪
                  </div>
                  {/* Arif Character Illustration Cutout Poking Head Out */}
                  <img 
                    src="/arif.png" 
                    alt="Arif Surprise Pop" 
                    className="w-full h-auto max-h-36 sm:max-h-40 xl:max-h-44 object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)] shrink-0" 
                  />
                </div>

                {/* 2. OPEN INNER BIN HOLE (Clean empty interior without paper balls!) */}
                <div className="w-24 sm:w-28 xl:w-[122px] h-6 sm:h-7 bg-stone-950 rounded-t-lg border-x-4 border-t-[3px] border-stone-700 shadow-[inset_0_4px_12px_rgba(0,0,0,0.95)] z-10 -mt-2"></div>

                {/* 3. SOLID SMOOTH BIN BODY (No mesh/holes!) */}
                <div className="w-24 sm:w-28 xl:w-[122px] h-28 sm:h-32 xl:h-36 bg-gradient-to-b from-stone-400 via-stone-500 to-stone-700 rounded-b-2xl border-x-4 border-b-4 border-stone-700 shadow-[0_22px_48px_rgba(0,0,0,0.48)] relative flex flex-col items-center justify-between p-3 z-20 overflow-hidden">
                  
                  {/* Sleek metallic reflection highlights on solid surface */}
                  <div className="absolute top-0 bottom-0 left-2 w-3 bg-gradient-to-b from-white/30 to-transparent blur-[1px] pointer-events-none"></div>
                  <div className="absolute top-0 bottom-0 right-3 w-2 bg-gradient-to-b from-black/20 to-transparent blur-[1px] pointer-events-none"></div>

                  {/* Clean Office Waste Emblem */}
                  <div className="mt-1.5 sm:mt-2 flex flex-col items-center z-10">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-800 border-2 border-stone-600 shadow-inner flex items-center justify-center text-sm sm:text-base text-stone-200">
                      🗑️
                    </div>
                    <div className="bg-stone-900 text-amber-300 font-mono font-black text-[7.5px] sm:text-[8px] xl:text-[8.5px] px-2 py-0.5 rounded shadow-inner border border-amber-400/50 mt-1.5 tracking-tighter text-center uppercase whitespace-nowrap">
                      BUANG MASA LALU
                    </div>
                  </div>

                  {/* 4. FOOT PEDAL (Presses down when hovered!) */}
                  <div className="w-10 sm:w-12 h-3 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 rounded-t border-t-2 border-x border-stone-600 shadow-lg mt-auto mb-0 transform transition-transform duration-200 group-hover/bin:translate-y-[2.5px] group-hover/bin:brightness-75"></div>
                </div>

                {/* Floor Shadow beneath Bin */}
                <div className="w-24 sm:w-28 xl:w-[122px] h-4 bg-black/45 rounded-full blur-sm -mt-1.5 z-0 group-hover/bin:scale-105 transition-transform duration-300"></div>
              </div>
              </div>
            </div>

          </div>
        </div>

        {/* Lower Floor: Bright Light Oak Scandinavian Wood Flooring */}
        <div className="h-[22%] sm:h-[25%] w-full bg-[repeating-linear-gradient(90deg,#d6d3d1,#d6d3d1_110px,#c7c2be_110px,#c7c2be_112px)] bg-stone-300 relative shadow-[inset_0_15px_40px_rgba(0,0,0,0.2)] border-t-4 border-stone-400 flex justify-center">
          {/* Baseboard Plinth Molding separating Wall and Floor */}
          <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400 border-b border-stone-500 shadow-md"></div>
          {/* Floor Reflection Light from Fridge */}
          <div className="absolute top-5 inset-x-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6)_0%,transparent_65%)]"></div>

          {/* STAGED STUDIO FLOOR VIEWPORT: Clamps cat movement area to match kitchen scene width on widescreen monitors! */}
          <div className="w-full max-w-[1360px] h-full relative">
            {/* INTERACTIVE ANIMATED OFFICE PET CAT ON THE WOODEN FLOOR! 🐱🐾 */}
            <OfficePetCat />
          </div>
        </div>
      </div>

      {/* Toast Notification (Dead Center of Screen for Arcade Game HUD Feel) */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pointer-events-none">
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.65, opacity: 0 }}
              transition={{ type: 'spring', damping: 16, stiffness: 280 }}
              className={`max-w-[480px] w-auto py-4 px-5 rounded-3xl backdrop-blur-2xl border-[3px] flex flex-col space-y-3 text-left pointer-events-auto shadow-2xl ${
                toastMessage.type === 'success'
                  ? 'bg-zinc-950 border-emerald-400 text-emerald-200 shadow-emerald-500/20'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-rose-500/20'
                  : 'bg-zinc-950 border-amber-400 text-amber-200 shadow-amber-500/20'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-3xl sm:text-4xl shrink-0 filter drop-shadow animate-pulse">
                  {toastMessage.type === 'success' ? '🎉' : toastMessage.type === 'error' ? '🚨' : '⚡'}
                </span>
                <div className="text-xs sm:text-[13.5px] font-black leading-snug text-white tracking-tight flex-1">{toastMessage.text}</div>
              </div>
              <div className="flex justify-end pt-1 border-t border-white/10">
                <button
                  onClick={() => setToastMessage(null)}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className={`px-5 py-1.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 border flex items-center space-x-1.5 cursor-pointer ${
                    toastMessage.type === 'success'
                      ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300 border-emerald-200 shadow-emerald-500/30'
                      : toastMessage.type === 'error'
                      ? 'bg-rose-500 text-white hover:bg-rose-400 border-rose-300 shadow-rose-600/30'
                      : 'bg-amber-400 text-zinc-950 hover:bg-amber-300 border-amber-200 shadow-amber-500/30'
                  }`}
                >
                  <span>OK</span>
                  <span>👍</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================================
          MASTER MOBILE-DEDICATED 3D COMMERCIAL COOLER (FIXED MAX-W-[380PX]) - STANDS OUT IN BRIGHT ROOM!
          ========================================================================================= */}
      <div className="w-full max-w-[370px] sm:max-w-[380px] h-[770px] sm:h-[820px] max-h-[96vh] rounded-[26px] bg-zinc-950 border-[12px] sm:border-[14px] border-zinc-900 shadow-[0_35px_90px_rgba(0,0,0,0.65),0_0_60px_rgba(251,191,36,0.12)] relative overflow-hidden flex flex-col z-10 mx-auto group">
        
        {/* 1. TOP WHITE ILLUMINATED LIGHTBOX SIGN (ALWAYS STATIC & UNCOVERED BY DOOR!) */}
        <div className="bg-zinc-950 p-2 shrink-0 border-b-[6px] border-zinc-900 z-40">
          <div className="bg-white rounded-lg py-2 px-3 shadow-[0_0_30px_rgba(255,255,255,0.95)] border border-slate-300 flex items-center justify-between text-zinc-900">
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="text-xl animate-pulse">🥤</span>
              <div className="truncate">
                <h1 className="text-xs font-black tracking-tight text-zinc-950 uppercase leading-none truncate">
                  SAKUL (Saldo Kulkas)
                </h1>
                <p className="text-[8px] font-extrabold text-zinc-600 uppercase tracking-wider truncate mt-0.5">
                  SALDO RP 70.000 / PEGAWAI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              {isDoorOpen && (
                <div className={`px-2 py-0.5 rounded font-mono text-[9px] font-black border flex items-center space-x-1 shadow-md ${
                  openTimeRemaining <= 15
                    ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                    : 'bg-amber-950 text-amber-300 border-amber-400'
                }`}>
                  <span>⏳ BUKA:</span>
                  <span className="text-white text-[10px]">{openTimeRemaining}d</span>
                </div>
              )}
              <div className="bg-zinc-950 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] font-black shrink-0 border border-zinc-700">
                02.0°C
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================================
            2. MIDDLE INTERIOR CHAMBER WRAPPER (WHERE THE GLASS DOOR & SHELVES LIVE!)
            ========================================================================================= */}
        <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 [perspective:1400px]">
          
          <main className="flex-1 relative bg-gradient-to-b from-slate-100 via-white to-slate-200 px-2.5 py-2 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 shadow-[inset_0_0_45px_rgba(0,0,0,0.2)]">
            
            <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-white to-transparent shadow-[0_4px_20px_#ffffff] pointer-events-none z-0"></div>

            {isDoorOpen && (
              <div className={`mb-2 px-2 py-1 rounded-lg border flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-black shrink-0 relative z-20 shadow ${
                openTimeRemaining <= 15 ? 'bg-rose-600 text-white border-rose-400 animate-bounce' : 'bg-amber-100 text-amber-950 border-amber-400'
              }`}>
                <span className="flex items-center space-x-1.5 truncate">
                  <span>{openTimeRemaining <= 15 ? '🚨' : '⚠️'}</span>
                  <span className="truncate">Bahaya buka kulkas kelamaan (max 1 menit), kompresor cepat jebol!</span>
                </span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-black/90 text-amber-300 text-[10px] font-black shrink-0 ml-1 shadow-inner">
                  Sisa: {openTimeRemaining} dtk
                </span>
              </div>
            )}

            {/* TOP USER / ADMIN CONTROL STATUS INSIDE THE FRIDGE */}
            {currentUser?.role === 'superadmin' && isDoorOpen ? (
              <div className="flex-1 flex flex-col space-y-2 relative z-10 overflow-hidden text-[10px]">
                <div className="bg-zinc-950 text-white p-2 rounded-lg border border-amber-400 shadow flex items-center justify-between shrink-0">
                  <span className="font-black text-amber-400 truncate">👑 Admin: {currentUser.name} (+1 Stok)</span>
                  <button 
                    onClick={handleCloseAndLock}
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-black text-[9px] shrink-0 shadow"
                  >
                    TUTUP & KUNCI
                  </button>
                </div>

                <div className="flex space-x-1 border-b border-slate-300 pb-1 shrink-0">
                  <button onClick={() => setShowAdminTab('stock')} onMouseEnter={() => setIsHoveringButton(true)} onMouseLeave={() => setIsHoveringButton(false)} className={`flex-1 py-1 rounded font-black ${showAdminTab === 'stock' ? 'bg-amber-400 text-zinc-950' : 'bg-slate-200 text-slate-700'}`}>📦 Stok</button>
                  <button onClick={() => setShowAdminTab('rekap')} onMouseEnter={() => setIsHoveringButton(true)} onMouseLeave={() => setIsHoveringButton(false)} className={`flex-1 py-1 rounded font-black ${showAdminTab === 'rekap' ? 'bg-amber-400 text-zinc-950' : 'bg-slate-200 text-slate-700'}`}>📊 Rekap 14</button>
                  <button onClick={() => setShowAdminTab('history')} onMouseEnter={() => setIsHoveringButton(true)} onMouseLeave={() => setIsHoveringButton(false)} className={`flex-1 py-1 rounded font-black ${showAdminTab === 'history' ? 'bg-amber-400 text-zinc-950' : 'bg-slate-200 text-slate-700'}`}>📜 Log</button>
                </div>

                {showAdminTab === 'rekap' && (
                  <div className="flex-1 bg-white border border-slate-300 rounded overflow-y-auto p-1.5 text-[9px]">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-zinc-950 text-white"><th className="p-1">No</th><th className="p-1">Nama</th><th className="p-1">Sisa</th><th className="p-1">Status</th></tr></thead>
                      <tbody className="divide-y font-bold text-slate-800">
                        {employeeUsers.map((emp, idx) => {
                          const terpakai = emp.initialBalance - emp.currentBalance;
                          return (<tr key={emp.id}>
                            <td className="p-1 text-slate-500">{idx+1}</td>
                            <td className="p-1 font-black truncate max-w-[90px]">{emp.avatar} {emp.name}</td>
                            <td className="p-1 text-sky-700">Rp {emp.currentBalance/1000}k</td>
                            <td className="p-1"><span className={`px-1 py-0.5 rounded text-[7px] ${terpakai > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{terpakai>0?'Jajan':'Belum'}</span></td>
                          </tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {showAdminTab === 'history' && (
                  <div className="flex-1 bg-white border border-slate-300 rounded p-1.5 overflow-y-auto space-y-1 text-[9px]">
                    <strong className="block text-slate-900">📜 Riwayat Transaksi</strong>
                    {transactions.map(t => (
                      <div key={t.id} className="p-1 bg-slate-50 border rounded flex justify-between">
                        <span>{t.quantity}x {t.itemName} ({t.userName})</span>
                        <span className="font-black text-rose-600">-Rp {t.total/1000}k</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 mb-1 flex items-center justify-between gap-1.5 bg-zinc-900 text-white px-2 py-1.5 rounded-lg border border-zinc-700 shadow shrink-0">
                {currentUser && isDoorOpen ? (
                  <div className="flex items-center justify-between w-full gap-1.5 overflow-hidden">
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                      <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-600 text-white font-black text-xs flex items-center justify-center shrink-0">{currentUser.avatar}</div>
                      <div className="truncate">
                        <span className="text-[7px] text-emerald-400 font-black uppercase flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                          <span>SIAP AMBIL</span>
                        </span>
                        <h2 className="text-[10px] font-black text-white truncate">{currentUser.name}</h2>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-black/80 px-2 py-0.5 rounded border border-zinc-700 shrink-0">
                      <div className="text-right text-[8px]">
                        <div className="text-cyan-400 font-bold">Saldo:</div>
                        <div className="text-[10px] font-black text-white leading-none">Rp {currentUser.currentBalance.toLocaleString('id-ID')}</div>
                      </div>
                      <button onClick={handleCloseAndLock} onMouseEnter={() => setIsHoveringButton(true)} onMouseLeave={() => setIsHoveringButton(false)} className="px-1.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-black text-[8px] shrink-0 shadow">TUTUP & KUNCI</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between text-slate-200 px-1 text-[9px]">
                    <span className="font-black flex items-center space-x-1"><span className="animate-pulse text-emerald-400">⚡</span><span>CHILLER ACTIVE (13 VARIAN MINUMAN)</span></span>
                    <span className="text-[7px] text-emerald-700 font-black bg-emerald-100 px-1.5 py-0.5 rounded">STOK SIAP</span>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================================
                3. VIBRANT COLORFUL CANS & BOTTLES RESTING ON WHITE WIRE GRATES
                ========================================================================================= */}
            <div className="flex-1 flex flex-col justify-between space-y-2 relative z-10 min-h-0 py-1 overflow-y-auto">
              {shelves.map((shelf, sIdx) => (
                <div key={sIdx} className="w-full">
                  <div className="flex items-end justify-center space-x-1.5 px-0.5 pb-1">
                    {shelf.items.map(item => {
                      const hasStock = item.stock > 0;
                      const canAfford = currentUser ? currentUser.currentBalance >= item.price : false;
                      const style = getBeverageStyle(item.name);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`group flex flex-col items-center flex-1 max-w-[76px] transition-transform ${isDoorOpen ? 'active:scale-95 hover:-translate-y-1' : ''}`}
                        >
                          <span className={`text-[7px] font-black px-1 py-0.2 rounded mb-0.5 shadow-sm ${
                            hasStock ? 'bg-zinc-900 text-white' : 'bg-rose-600 text-white font-bold'
                          }`}>
                            {hasStock ? `${item.stock}pcs` : '0 ❌'}
                          </span>

                          <div className={`w-11 h-15 sm:w-12 sm:h-16 rounded-lg bg-gradient-to-t ${style.bg} text-white border border-white/40 shadow-md flex flex-col items-center justify-between p-1 relative overflow-hidden group-hover:ring-1 group-hover:ring-cyan-400 transition-all w-full`}>
                            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>
                            <span className="text-xl sm:text-2xl filter drop-shadow z-10 mt-0.5">{item.icon}</span>
                            
                            <div className="w-full bg-black/70 rounded py-0.5 px-0.5 z-10 text-center mt-1">
                              <span className="text-[7px] font-black tracking-tight uppercase block leading-none text-white truncate">
                                {style.label}
                              </span>
                            </div>
                          </div>

                          <div className="mt-0.5 w-full bg-white border border-slate-400 rounded px-0.5 py-0.5 text-center shadow-xs">
                            <div className="text-[8px] font-black text-zinc-900 leading-none">
                              Rp {item.price / 1000}k
                            </div>
                            <div className="text-[6px] font-black text-slate-500 mt-0.5 uppercase tracking-tighter truncate">
                              {isDoorOpen ? (currentUser?.role === 'superadmin' ? '+1 STOK' : canAfford ? 'AMBIL' : '❌ SALDO') : 'LOCKED'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AUTHENTIC WHITE WIRE GRILLE REFRIGERATOR RACK */}
                  <div className="relative w-full">
                    <div className="h-3 bg-[repeating-linear-gradient(90deg,#cbd5e1,#cbd5e1_2px,transparent_2px,transparent_8px)] bg-white border-y border-slate-300 shadow-[0_6px_12px_rgba(0,0,0,0.2)] rounded-sm flex items-center justify-center">
                      <div className="bg-white/95 px-2 py-0.2 rounded text-[7px] font-black tracking-wider text-slate-700 uppercase border border-slate-300 shadow-inner">
                        {shelf.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom quick banner */}
            {currentUser && isDoorOpen && userTransactions.length > 0 && (
              <div className="mt-1 bg-zinc-900 text-white px-2 py-1 rounded border border-zinc-800 shadow flex items-center space-x-1 text-[8px] shrink-0 overflow-x-auto">
                <span className="font-black text-cyan-300 shrink-0">🕒 Pengambilan Anda:</span>
                <div className="flex items-center space-x-1">
                  {userTransactions.slice(-2).map(t => (
                    <span key={t.id} className="bg-zinc-800 px-1.5 py-0.5 rounded font-black text-white text-[7px] shrink-0">
                      {t.quantity}x {t.itemName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* =========================================================================================
              THE TRUE 3D DEWY FROSTED GLASS DOOR (UNDERSTATED PREMIUM DESIGN WITH SINGLE LED DOT)
              ========================================================================================= */}
          <motion.div
            initial={false}
            animate={{
              rotateY: isDoorOpen ? -112 : 0,
              opacity: isDoorOpen ? 0.08 : 1,
              pointerEvents: isDoorOpen ? 'none' : 'auto',
            }}
            transition={{ duration: 0.85, type: 'spring', damping: 16, stiffness: 60 }}
            style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            className="absolute inset-0 z-30 flex flex-col justify-between p-3 bg-white/[0.08] backdrop-blur-[2.5px] border-[12px] sm:border-[14px] border-zinc-900 shadow-[inset_0_0_50px_rgba(255,255,255,0.45),inset_0_0_20px_rgba(186,230,253,0.35)] rounded-none select-none pointer-events-auto"
          >
            {/* Frosted Dewy Condensation Mist */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(255,255,255,0.18)_100%)] bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none"></div>

            {/* TOP UNDERSTATED STATUS BADGE WITH SINGLE RED/GREEN LED DOT */}
            <div className="relative z-40 self-start bg-zinc-950/90 text-zinc-300 px-3 py-1 rounded-full border border-zinc-800 flex items-center space-x-2 shadow-lg pointer-events-none">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isDoorUnlocked 
                  ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-ping' 
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
              }`}></span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-200">
                {isDoorUnlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>

            {/* RIGHT VERTICAL REFRIGERATOR HANDLE */}
            <div 
              onClick={handleHandleClick}
              onMouseEnter={() => setIsHoveringHandle(true)}
              onMouseLeave={() => setIsHoveringHandle(false)}
              className="absolute right-1 top-1/4 bottom-1/3 w-6 sm:w-7 rounded-full bg-gradient-to-r from-zinc-700 via-zinc-200 to-zinc-800 shadow-[ -6px_0_15px_rgba(0,0,0,0.8)] border border-zinc-600 transition-transform duration-200 z-40 flex flex-col items-center justify-center group/handle hover:scale-105 hover:border-zinc-400"
            >
              <span className={`w-1.5 h-1.5 rounded-full mb-2 shrink-0 ${
                isDoorUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
              }`}></span>
              
              <div className="w-1 h-16 bg-zinc-400 rounded-full opacity-60"></div>
            </div>
          </motion.div>

        </div>


        {/* =========================================================================================
            4. BOTTOM MATTE BLACK VENTILATED COMPRESSOR GRILLE (4 LOUVER LINES & TECH SPECS)
            ========================================================================================= */}
        <footer className="bg-zinc-950 border-t-[6px] border-zinc-900 px-4 py-2.5 shrink-0 flex flex-col justify-between shadow-inner z-40">
          <div className="space-y-1 mb-1.5">
            <div className="h-1 w-full bg-zinc-900 rounded-full shadow-inner border-t border-black"></div>
            <div className="h-1 w-full bg-zinc-900 rounded-full shadow-inner border-t border-black"></div>
            <div className="h-1 w-full bg-zinc-900 rounded-full shadow-inner border-t border-black"></div>
            <div className="h-1 w-full bg-zinc-900 rounded-full shadow-inner border-t border-black"></div>
          </div>
          <div className="flex items-center justify-between text-zinc-500 font-sans text-[8px] font-extrabold">
            <span>❄️ COMPRESSOR: 2.0°C AUTO</span>
            <span className="text-emerald-500">14 PEGAWAI ONLINE</span>
          </div>
        </footer>


        {/* =========================================================================================
            6. GAME WORLD SECURITY KEYPAD VAULT (6-DIGIT PIN CODE LOCK)
            ========================================================================================= */}
        <AnimatePresence>
          {showAuthPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 18 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-3 pointer-events-none"
            >
              {/* Game HUD Digital Vault Keypad Card (Super Compact, Hilarious, No Cheat Sheet) */}
              <div className="pointer-events-auto w-full max-w-[250px] bg-slate-950/95 border-2 border-cyan-400 rounded-3xl p-3.5 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(34,211,238,0.4)] text-white space-y-2 relative backdrop-blur-2xl text-center">
                
                <button 
                  onClick={() => { setShowAuthPrompt(false); setEnteredPin(''); }}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-[11px] font-black bg-zinc-900 border border-zinc-700 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                  title="Tutup"
                >
                  ✕
                </button>

                <div className="text-center pt-0.5 px-1 border-b border-zinc-800/80 pb-2">
                  <div className="text-[9px] font-mono font-black tracking-widest text-cyan-400 uppercase">🛡️ ANTI-MALING CAMILAN</div>
                  <div className="text-[13px] font-black text-white leading-tight mt-0.5 tracking-tight">KULKAS DIGEMBOK DUKUN!</div>
                </div>

                <p className="text-[10px] text-zinc-300 font-extrabold leading-tight px-1 italic pt-0.5">
                  "Ketik 6 digit PIN tanggal lahirmu! Jangan cuma inget deadline & utang pinjol!"
                </p>

                {/* 6-Digit Phosphor Display Screen */}
                <div className={`py-2 px-1.5 rounded-2xl border font-mono flex items-center justify-center shadow-inner transition-all ${
                  pinError 
                    ? 'bg-rose-950/90 border-rose-500 animate-bounce text-rose-200 shadow-[0_0_15px_#f43f5e]' 
                    : 'bg-zinc-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                }`}>
                  <div className="flex items-center space-x-1.5 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const char = enteredPin[idx];
                      return (
                        <div key={idx} className={`w-7 h-9 rounded-xl flex items-center justify-center text-base font-black border transition-all ${
                          char ? 'bg-cyan-900/80 border-cyan-300 text-white shadow-[0_0_8px_#22d3ee] scale-105' : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                        }`}>
                          {char ? '★' : '•'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Numeric Keypad Grid (Super Compact & Punchy) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === 'C') handlePinReset();
                        else if (btn === '⌫') handlePinDelete();
                        else handlePinDigit(btn);
                      }}
                      onMouseEnter={() => setIsHoveringButton(true)}
                      onMouseLeave={() => setIsHoveringButton(false)}
                      className={`h-10 rounded-xl font-mono font-black text-base transition-all active:scale-90 shadow-md flex items-center justify-center border ${
                        btn === 'C'
                          ? 'bg-rose-900/90 hover:bg-rose-800 border-rose-500 text-rose-200 text-xs'
                          : btn === '⌫'
                          ? 'bg-amber-800/90 hover:bg-amber-700 border-amber-500 text-amber-200 text-xs'
                          : 'bg-slate-900 hover:bg-slate-800 border-zinc-700 text-cyan-300 hover:border-cyan-400'
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* =========================================================================================
            7. THE INTERACTIVE "HAND PULLING DOOR" 3D ANIMATION
            ========================================================================================= */}
        <AnimatePresence>
          {isHandPulling && (
            <motion.div
              initial={{ x: 120, y: 30, scale: 0.8, opacity: 0 }}
              animate={{ 
                x: isDoorOpen ? -130 : 45, 
                y: 0, 
                scale: 1.15, 
                rotate: isDoorOpen ? -25 : -5,
                opacity: 1 
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.65, type: 'spring', damping: 15 }}
              className="absolute right-4 top-1/3 z-50 pointer-events-none flex flex-col items-center"
            >
              <div className="relative">
                <span className="text-7xl filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] animate-pulse block transform rotate-12">
                  🫴
                </span>
                <span className="absolute -top-2 -left-2 text-3xl animate-bounce">⚡</span>
              </div>
              <div className="mt-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-0.5 rounded-full text-[9px] font-black shadow-2xl tracking-wider uppercase whitespace-nowrap animate-pulse">
                {isDoorOpen ? 'Menarik Pintu Terbuka... 🚪' : 'Menggapai Gagang Pintu... ✋'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* =========================================================================================
          8. MOBILE-ONLY ORANG GANTENG PEEKING FROM BOTTOM RIGHT CORNER OF SCREEN!
          ========================================================================================= */}
      <div 
        onMouseEnter={handleFindGanteng}
        onClick={handleFindGanteng}
        className={`lg:hidden fixed -bottom-[65px] -right-[74px] w-28 sm:w-32 group/ade transition-all duration-500 ease-out ${
          isGantengFound 
            ? '-translate-x-[36px] -translate-y-[22px] z-50 pointer-events-auto' 
            : isPinVerified
            ? 'z-40 pointer-events-auto cursor-pointer transform hover:-translate-x-[36px] hover:-translate-y-[22px] active:-translate-x-[36px] active:-translate-y-[22px]'
            : 'z-40 pointer-events-none'
        }`}
        title={isPinVerified ? "Klik / Tap Si Ganteng untuk membuka gembok kulkas!" : "Orang ganteng mengawasi dari pojok bawah... 👀"}
      >
        <img 
          src="/ade.png" 
          alt="Ade Peeking Mobile Bottom Corner" 
          className={`w-full h-auto object-contain opacity-[0.9] filter drop-shadow-[-6px_0_15px_rgba(0,0,0,0.65)] transition-all duration-500 transform ${
            isGantengFound ? '-rotate-[30deg]' : '-rotate-[40deg] group-hover/ade:-rotate-[30deg]'
          }`}
        />
        <div className={`absolute -top-3 right-[24px] w-[135px] transition-opacity bg-slate-950/95 text-amber-300 text-[9.5px] font-black py-1 px-1.5 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.8)] text-center pointer-events-none border border-amber-400 font-mono tracking-tight ${
          isGantengFound ? 'opacity-100 animate-bounce' : isPinVerified ? 'opacity-0 group-hover/ade:opacity-100' : 'opacity-0'
        }`}>
          Yahh ketauannn 🤪
        </div>
      </div>

    </div>
  );
}

{/* =========================================================================================
    INTERACTIVE VIRTUAL OFFICE PET CAT (PATROLS FLOOR, LICKS PAW & FUR, NAPS & MEOWS!) 🐱🐾
    ========================================================================================= */}
function OfficePetCat() {
  // Cat life cycle states: 'walk-right' -> 'lick-right' -> 'walk-left' -> 'lick-left' -> 'sleep'
  const [catState, setCatState] = useState<'walk-right' | 'lick-right' | 'walk-left' | 'lick-left' | 'sleep'>('walk-right');
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    // Automatic timed progression cycle for cat behaviors
    let timer: NodeJS.Timeout;
    if (catState === 'walk-right') {
      timer = setTimeout(() => setCatState('lick-right'), 8000);
    } else if (catState === 'lick-right') {
      timer = setTimeout(() => setCatState('walk-left'), 5500);
    } else if (catState === 'walk-left') {
      timer = setTimeout(() => setCatState('lick-left'), 8000);
    } else if (catState === 'lick-left') {
      timer = setTimeout(() => setCatState('sleep'), 4500);
    } else if (catState === 'sleep') {
      timer = setTimeout(() => setCatState('walk-right'), 5000);
    }
    return () => clearTimeout(timer);
  }, [catState]);

  // Determine target horizontal position percentage and animation orientation
  const isRight = catState === 'walk-right' || catState === 'lick-right';
  const isWalking = catState === 'walk-right' || catState === 'walk-left';
  const isLicking = catState === 'lick-right' || catState === 'lick-left';
  const isSleeping = catState === 'sleep';
  
  const targetLeft = (catState === 'walk-right' || catState === 'lick-right') ? '74%' : '14%';

  return (
    <motion.div
      className="absolute top-1 sm:top-2 z-[55] flex flex-col items-center pointer-events-auto select-none group/cat cursor-pointer"
      initial={{ left: '14%' }}
      animate={{ left: targetLeft }}
      transition={{ 
        left: { duration: isWalking ? 8 : 0.5, ease: isWalking ? 'linear' : 'easeOut' }
      }}
      onMouseEnter={() => setIsInteracted(true)}
      onMouseLeave={() => setIsInteracted(false)}
      onClick={() => setIsInteracted(prev => !prev)}
      title="Kucing Dapur Kantor (Klik atau elus untuk memberi salam! 🐟)"
    >
      {/* ACTION & DIALOG SPEECH BUBBLE (NEVER MIRRORED OR FLIPPED!) */}
      <div className="mb-0.5 z-40 transition-all duration-300 transform group-hover/cat:scale-105">
        {isInteracted ? (
          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-mono font-black text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full shadow-lg border-[1.5px] border-stone-900 whitespace-nowrap animate-bounce flex items-center space-x-1">
            <span>Meoww~! Minta ikan di kulkas dong Suhu!</span>
            <span>🐟💕</span>
          </div>
        ) : isLicking ? (
          <div className="bg-stone-900 text-amber-300 font-mono font-black text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full shadow-md border border-stone-700 whitespace-nowrap flex items-center space-x-1">
            <span className="animate-pulse">✨ *jilat-jilat paw & bulu*</span>
            <span>👅🐾</span>
          </div>
        ) : isSleeping ? (
          <div className="bg-sky-950/90 text-sky-200 font-mono font-black text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full shadow-md border border-sky-700 whitespace-nowrap">
            😴 Zzz... ngantuk pulass 💤
          </div>
        ) : (
          <div className="bg-stone-900/80 text-stone-200 font-mono font-semibold text-[8px] sm:text-[8.5px] px-2 py-0.5 rounded-full shadow border border-stone-700 whitespace-nowrap opacity-80 group-hover/cat:opacity-100 transition-opacity">
            🐾 *jalan patroli dapur...*
          </div>
        )}
      </div>

      {/* CAT CHARACTER CONTAINER (Flipped horizontally ONLY when walking right! Never flip seated/resting states) */}
      <div className={`relative flex flex-col items-center transform transition-transform duration-300 ${isRight && isWalking && !isInteracted ? '-scale-x-100' : 'scale-x-100'}`}>
        
        {/* INTERACTIVE STATE: JOYFUL HEART-EYES JUMPING CAT */}
        {isInteracted && (
          <motion.div 
            className="text-6xl sm:text-7xl xl:text-8xl filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"
            animate={{ y: [0, -12, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            😻<span className="absolute -top-3 -right-2 text-2xl sm:text-3xl animate-ping">💖</span>
          </motion.div>
        )}

        {/* WALKING TROT STATE */}
        {!isInteracted && isWalking && (
          <motion.div 
            className="text-6xl sm:text-7xl xl:text-8xl filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] z-20"
            animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
          >
            🐈
          </motion.div>
        )}

        {/* GROOMING & LICKING STATE (Seated Kitty 🐱 cleaning its paw 🐾 with animated tongue 👅!) */}
        {!isInteracted && isLicking && (
          <div className="relative text-6xl sm:text-7xl xl:text-8xl filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] z-20 flex items-center justify-center translate-y-1">
            <span>🐱</span>
            {/* 1. Animated Licking Tongue & Sparkles rendered FIRST and adjusted to center-align near paw */}
            <motion.div 
              className="absolute left-[18px] sm:left-[25px] xl:left-[30px] top-[50px] sm:top-[62px] xl:top-[74px] z-10 text-2xl sm:text-3xl xl:text-4xl drop-shadow pointer-events-none flex items-center space-x-0.5"
              animate={{ 
                x: [0, -4, 0],
                y: [0, 4, 0],
                rotate: [-10, 20, -10] 
              }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span>👅</span><span className="text-sm sm:text-base">✨</span>
            </motion.div>
            {/* 2. Raised Paw rendered AFTER tongue with z-50 so it ALWAYS sits visibly IN FRONT of the tongue! */}
            <div className="text-3xl sm:text-4xl xl:text-5xl absolute bottom-0.5 left-3 sm:left-4 transform rotate-[25deg] z-50 drop-shadow-lg pointer-events-none">🐾</div>
          </div>
        )}

        {/* SLEEPING STATE (Purring sleeping kitty 😽 resting sideways on floor with Zzz above its forehead!) */}
        {!isInteracted && isSleeping && (
          <div className="relative flex flex-col items-center justify-center translate-y-2">
            {/* Floating Dreaming Zzz animated icon rising straight up from its head (not tail/butt!) */}
            <motion.div 
              className="absolute -top-5 -left-1 text-3xl sm:text-4xl filter drop-shadow z-30 pointer-events-none"
              animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7], rotate: [-10, 10, -10] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              💤
            </motion.div>
            <motion.div 
              className="text-6xl sm:text-7xl xl:text-8xl filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] z-20 transform rotate-[55deg]"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              😽
            </motion.div>
          </div>
        )}

        {/* DYNAMIC REALISTIC FLOOR SHADOW BENEATH CAT */}
        <motion.div 
          className="w-20 sm:w-24 xl:w-28 h-3.5 sm:h-4 bg-black/45 rounded-full blur-[2px] mt-1 z-0"
          animate={isWalking ? { scale: [1, 0.8, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, repeat: Infinity }}
        ></motion.div>

      </div>
    </motion.div>
  );
}
