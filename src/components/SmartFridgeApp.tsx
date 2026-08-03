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
        <div className="flex-1 w-full bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px)] bg-[size:4.5rem_100%] bg-stone-100/95 relative z-20 flex items-center justify-between px-6 md:px-12 lg:px-20 xl:px-32 pt-4">
          
          {/* Ceiling Warm Ambient Halo Lighting */}
          <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18)_0%,transparent_70%)] pointer-events-none"></div>
          
          {/* TOP WALL DECORATIONS: CLOCK & BOXED TEAM PHOTO FRAME (HANGING HIGH ON WALL) */}
          <div className="absolute top-4 inset-x-0 flex items-start justify-center space-x-12 xl:space-x-[520px] 2xl:space-x-[640px] pointer-events-none opacity-95 hidden md:flex">
            
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
          <div className="hidden lg:flex flex-col items-center w-[290px] xl:w-[330px] self-end mb-12 z-30 transform -rotate-1 origin-bottom-right ml-2 xl:ml-8 space-y-4">
            
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
              <div className="w-56 h-60 sm:h-64 rounded-2xl border-[10px] border-stone-800 bg-gradient-to-b from-sky-400 via-amber-300 to-orange-400 shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden relative flex flex-col justify-end p-2.5">
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

            {/* Light Oak Timber Pantry Bar Table Under Window */}
            <div className="relative w-full">
              <div className="bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 h-16 w-full rounded-t-xl border-t-4 border-amber-300 shadow-[0_15px_30px_rgba(0,0,0,0.25)] flex items-end justify-between px-5 pb-2">
                <div className="flex items-center space-x-2.5 mb-0.5">
                  <span className="text-3xl filter drop-shadow animate-bounce" title="Mesin Espresso">☕</span>
                  <span className="text-2xl filter drop-shadow" title="Stoples Camilan">🍪</span>
                  <span className="text-3xl filter drop-shadow" title="Biskuit">🥨</span>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-900/90 text-emerald-300 border border-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase font-mono shadow block">
                    📶 WiFi: Office_Fast5G
                  </span>
                </div>
              </div>
              <div className="h-8 bg-stone-800 w-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-stone-950"></div>
            </div>
            
            {/* Monstera Floor Plant */}
            <div className="absolute -right-8 sm:-right-10 -bottom-14 sm:-bottom-16 translate-y-2 text-7xl sm:text-8xl filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.35)] opacity-95 pointer-events-none z-50">
              🪴
            </div>
          </div>

          {/* =========================================================================================
              RIGHT SIDE: ANALOG WALL CLOCK & WOODEN CORKBOARD (GIVES WIDE CLEARANCE FROM REFRIGERATOR!)
              ========================================================================================= */}
          <div className="hidden lg:flex flex-col items-center self-center mt-0 sm:mt-2 z-0 transform rotate-1 origin-bottom-left ml-auto mr-0 xl:mr-0 translate-x-10 sm:translate-x-12 xl:translate-x-14 space-y-4">
            
            {/* REALISTIC 3D ROUND ANALOG WALL CLOCK (SET TO 17:00 QUITTING TIME) */}
            <div className="flex flex-col items-end self-end -mt-8 sm:-mt-12 -translate-y-4 sm:-translate-y-5 mr-6 sm:mr-8 xl:mr-10 translate-x-4 sm:translate-x-6 shrink-0">
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
            <div className="w-[310px] xl:w-[360px] bg-amber-900/90 rounded-2xl p-2.5 shadow-[0_25px_65px_rgba(0,0,0,0.3)] border-[8px] border-amber-950 text-stone-900 font-sans transform -rotate-1 relative shrink-0 mt-6 sm:mt-8 xl:mt-10">
              <div className="bg-[#cd9a5b] bg-[radial-gradient(#b88647_1px,transparent_1px)] [background-size:10px_10px] rounded-lg p-2.5 shadow-inner flex flex-col space-y-2">
                
                <div className="bg-stone-900 text-amber-300 font-black px-2 py-1 rounded text-[9px] uppercase tracking-widest text-center shadow-md border border-amber-400/50 flex items-center justify-center space-x-1">
                  <span>📌 PAPAN CURHAT & CATATAN PEGAWAI</span>
                  <span className="animate-bounce">🥤</span>
                </div>

                {/* Grid of colorful wholesome & entertaining workplace sticky notes */}
                <div className="grid grid-cols-2 gap-2 text-[8.5px] sm:text-[9px] font-black leading-tight">
                  
                  {/* Sticky 1 */}
                  <div className="bg-amber-200 p-2.5 rounded shadow-md border-b-2 border-r-2 border-amber-400 transform -rotate-2 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px]">📌</span>
                    <p className="italic text-amber-950">"Kerja ikhlas, cair lekas, revisian tuntas, hatiku bebas! ✨😎"</p>
                  </div>

                  {/* Sticky 2 */}
                  <div className="bg-emerald-200 p-2.5 rounded shadow-md border-b-2 border-r-2 border-emerald-400 transform rotate-2 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px]">📌</span>
                    <p className="italic text-emerald-950">"Pengen resign... tapi pas ngeliat keranjang Shopee, langsung nggak jadi 🛒🥲."</p>
                  </div>

                  {/* Sticky 3 */}
                  <div className="bg-rose-200 p-2.5 rounded shadow-md border-b-2 border-r-2 border-rose-400 transform rotate-1 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px]">📌</span>
                    <p className="italic text-rose-950">"Jam 08.00 semangat, jam 12.00 pudar, jam 15.00 mampir bengong 🫠☕."</p>
                  </div>

                  {/* Sticky 4 */}
                  <div className="bg-cyan-200 p-2.5 rounded shadow-md border-b-2 border-r-2 border-cyan-400 transform -rotate-1 text-stone-900 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px]">📌</span>
                    <p className="italic text-cyan-950">"Capek gapapa, yang penting cicilan paylater lunas tepat pada waktunya 💪🥹."</p>
                  </div>

                  {/* Sticky 5 */}
                  <div className="bg-purple-200 p-2.5 rounded shadow-md border-b-2 border-r-2 border-purple-400 transform rotate-2 text-stone-900 col-span-2 relative flex items-center justify-center text-center">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px]">📌</span>
                    <p className="italic text-purple-950">"Mental boleh gemetar, tapi performa wajib gahar! Ingat: Capek kerja itu cuma sementara, tapi miskin & banyak cicilan itu SANGAT BERBAHAYA! 🗿💀🔥"</p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Lower Floor: Bright Light Oak Scandinavian Wood Flooring */}
        <div className="h-[22%] sm:h-[25%] w-full bg-[repeating-linear-gradient(90deg,#d6d3d1,#d6d3d1_110px,#c7c2be_110px,#c7c2be_112px)] bg-stone-300 relative shadow-[inset_0_15px_40px_rgba(0,0,0,0.2)] border-t-4 border-stone-400">
          {/* Baseboard Plinth Molding separating Wall and Floor */}
          <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400 border-b border-stone-500 shadow-md"></div>
          {/* Floor Reflection Light from Fridge */}
          <div className="absolute top-5 inset-x-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6)_0%,transparent_65%)]"></div>
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
              
              <span className="absolute right-full mr-3 bg-zinc-900/95 border border-zinc-700 text-slate-200 font-bold text-[8px] px-2 py-1 rounded shadow-xl uppercase whitespace-nowrap animate-bounce pointer-events-none hidden sm:flex items-center space-x-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isDoorUnlocked ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
                <span>Ini namanya gagang pintu kulkas</span>
                <span className="text-cyan-400 font-black text-xs leading-none">➔</span>
              </span>
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
