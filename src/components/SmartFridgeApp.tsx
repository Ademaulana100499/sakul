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

  if (!isClient) return null;

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

  // INTELLIGENT 3D HAND POSTURE LOGIC BASED ON USER INTERACTION CONTEXT
  const getHandCursorDetails = () => {
    if (showAuthPrompt || isHoveringButton) {
      // Pushing buttons on HUD screen or UI controls -> Index finger pressing!
      return {
        icon: '👆',
        text: 'TEKAN',
        color: 'bg-cyan-400 text-zinc-950 border-cyan-300',
        transform: 'translate(-40%, -20%) scale(1.1)'
      };
    }
    if (isHoveringHandle && !isDoorOpen) {
      if (isDoorUnlocked) {
        // Handle is green -> Tight Grasping Fist ready to pull!
        return {
          icon: '✊',
          text: '🟢 TARIK GAGANG',
          color: 'bg-emerald-400 text-zinc-950 border-emerald-300 animate-bounce',
          transform: 'translate(-50%, -50%) scale(1.25) rotate(-12deg)'
        };
      } else {
        // Handle is red -> Reaching out to tap handle for credentials!
        return {
          icon: '🫴',
          text: '🔴 TARIK GAGANG',
          color: 'bg-rose-500 text-white border-rose-300',
          transform: 'translate(-50%, -50%) scale(1.15)'
        };
      }
    }
    if (isDoorOpen) {
      // Inside fridge picking ice cold drink cans -> Grabbing downward hand
      return {
        icon: '👇',
        text: 'AMBIL MINUMAN',
        color: 'bg-zinc-900 text-cyan-300 border-zinc-700',
        transform: 'translate(-50%, -30%) scale(1.1)'
      };
    }
    // Idle relaxed open palm flying around the showcase
    return {
      icon: '🖐️',
      text: '',
      color: '',
      transform: 'translate(-60%, -60%)'
    };
  };

  const cursorState = getHandCursorDetails();

  // STEP 1 & STEP 3 (2-STAGE MECHANICS):
  const handleHandleClick = () => {
    if (isDoorOpen) return;

    if (!isDoorUnlocked) {
      setShowAuthPrompt(true);
      return;
    }

    setIsHandPulling(true);
    setToastMessage({
      text: '✊ Tangan menarik daun pintu kaca pembuka...',
      type: 'info'
    });

    setTimeout(() => {
      setIsDoorOpen(true);
      setToastMessage({
        text: '🚪 Pintu Kulkas Terbuka Lebar! Silakan pilih minuman Anda.',
        type: 'success'
      });
      setTimeout(() => {
        setIsHandPulling(false);
        setToastMessage(null);
      }, 1100);
    }, 450);
  };

  // STEP 2: Credential Verified -> TURN SINGLE LED DOT FROM RED TO GREEN!
  const handleVerifyCredential = (userId: string) => {
    login(userId);
    setShowAuthPrompt(false);
    setIsDoorUnlocked(true); // Switch LED point from RED to GREEN!

    const u = users.find(user => user.id === userId);
    setToastMessage({
      text: `⚡ Verifikasi (${u?.name || 'User'}) OK! Titik LED berganti Hijau. Klik gagang pintu sekali lagi untuk menarik buka!`,
      type: 'success'
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCloseAndLock = () => {
    setIsDoorOpen(false);
    setIsDoorUnlocked(false);
    setTimeout(() => {
      logout();
      setToastMessage({
        text: '🔒 Pintu Ditutup. Titik LED Kunci Magnetis Kembali Merah (Locked).',
        type: 'info'
      });
      setTimeout(() => setToastMessage(null), 2500);
    }, 400);
  };

  const handleItemClick = (itemId: string) => {
    if (!isDoorOpen || !currentUser) {
      if (!isDoorUnlocked) {
        setShowAuthPrompt(true);
      } else {
        setToastMessage({ text: '🟢 Titik LED sudah Hijau! Klik gagang pintu kanan untuk menarik bukaan pintu kaca terlebih dahulu.', type: 'info' });
        setTimeout(() => setToastMessage(null), 2500);
      }
      return;
    }

    if (currentUser.role === 'superadmin') {
      updateStock(itemId, 1);
      setToastMessage({ text: '📦 (+1 pcs) Stok rak bertambah.', type: 'success' });
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    const res = takeItem(itemId);
    setToastMessage({
      text: res.message,
      type: res.success ? 'success' : 'error'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 p-2 sm:p-4 flex items-center justify-center font-sans select-none overflow-hidden relative cursor-none">
      
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

      {/* Dark Game Studio Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black pointer-events-none z-0"></div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-4 z-50 max-w-[360px] pointer-events-none"
          >
            <div className={`py-2 px-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center space-x-2.5 ${
              toastMessage.type === 'success'
                ? 'bg-zinc-900 border-zinc-600 text-slate-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/95 border-rose-400 text-rose-200'
                : 'bg-zinc-900 border-zinc-700 text-cyan-300'
            }`}>
              <span className="text-base">
                {toastMessage.type === 'success' ? '🟢' : toastMessage.type === 'error' ? '🔴' : '⚡'}
              </span>
              <div className="text-[11px] font-extrabold leading-tight">{toastMessage.text}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================================
          MASTER MOBILE-DEDICATED 3D COMMERCIAL COOLER (FIXED MAX-W-[380PX])
          ========================================================================================= */}
      <div className="w-full max-w-[370px] sm:max-w-[380px] h-[770px] sm:h-[820px] max-h-[96vh] rounded-[26px] bg-zinc-950 border-[12px] sm:border-[14px] border-zinc-900 shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col z-10 mx-auto group">
        
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
            <div className="bg-zinc-950 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] font-black shrink-0 border border-zinc-700">
              02.0°C
            </div>
          </div>
        </div>

        {/* =========================================================================================
            2. MIDDLE INTERIOR CHAMBER WRAPPER (WHERE THE GLASS DOOR & SHELVES LIVE!)
            ========================================================================================= */}
        <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 [perspective:1400px]">
          
          <main className="flex-1 relative bg-gradient-to-b from-slate-100 via-white to-slate-200 px-2.5 py-2 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 shadow-[inset_0_0_45px_rgba(0,0,0,0.2)]">
            
            <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-white to-transparent shadow-[0_4px_20px_#ffffff] pointer-events-none z-0"></div>

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
            6. GAME WORLD SECURITY HUD PROMPT (NO BACKDROP / NO SCREEN DARKENING! JUST THE CARD!)
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
              {/* Game HUD Dialog Card */}
              <div className="pointer-events-auto w-full max-w-[310px] bg-slate-950/95 border-2 border-cyan-400 rounded-2xl p-4 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(34,211,238,0.35)] text-white space-y-3 relative backdrop-blur-2xl">
                
                <button 
                  onClick={() => setShowAuthPrompt(false)}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ BATAL
                </button>

                <div className="flex items-center space-x-2 text-cyan-400 border-b border-zinc-800 pb-2">
                  <span className="text-xl">🛡️</span>
                  <div className="pr-4">
                    <div className="text-[9px] font-mono font-black tracking-widest uppercase">SAKUL SECURITY HUD</div>
                    <div className="text-xs font-black text-white">VERIFIKASI AKSES BUKA PINTU</div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">
                  Gagang dipegang! Pilih akun kredensial Anda untuk mengubah titik LED magnetik dari <strong className="text-rose-400">🔴 Merah (Locked)</strong> menjadi <strong className="text-emerald-400">🟢 Hijau (Ready)</strong>:
                </p>

                <div className="space-y-2 pt-1">
                  {user1 && (
                    <button
                      onClick={() => handleVerifyCredential(user1.id)}
                      onMouseEnter={() => setIsHoveringButton(true)}
                      onMouseLeave={() => setIsHoveringButton(false)}
                      className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 hover:bg-slate-800 border border-cyan-400 flex items-center justify-between transition-all shadow-lg active:scale-95 group"
                    >
                      <div className="text-left truncate pr-2">
                        <div className="text-[8px] uppercase font-black text-cyan-400">User 1 • Pegawai</div>
                        <div className="text-xs font-black text-white truncate">{user1.name}</div>
                      </div>
                      <div className="text-right shrink-0 flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] inline-block"></span>
                        <span className="text-[10px] font-black bg-zinc-900 border border-zinc-700 text-white px-2 py-1 rounded font-mono">
                          AKSES 🟢
                        </span>
                      </div>
                    </button>
                  )}

                  {adminUser && (
                    <button
                      onClick={() => handleVerifyCredential(adminUser.id)}
                      onMouseEnter={() => setIsHoveringButton(true)}
                      onMouseLeave={() => setIsHoveringButton(false)}
                      className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-400 flex items-center justify-between transition-all active:scale-95 text-left"
                    >
                      <div>
                        <div className="text-[8px] uppercase font-black text-amber-400">👑 Super Admin</div>
                        <div className="text-[11px] font-black text-white">{adminUser.name}</div>
                      </div>
                      <span className="text-[9px] font-black bg-zinc-900 border border-amber-400 text-amber-300 px-2 py-0.5 rounded shadow font-mono flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>AKSES 🟢</span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="pt-1.5 border-t border-zinc-800">
                  <button
                    onClick={() => setShowEmployeeModal(!showEmployeeModal)}
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                    className="w-full text-center text-[10px] font-black text-cyan-400 hover:text-cyan-300 py-0.5"
                  >
                    <span>{showEmployeeModal ? '▲ Tutup Daftar' : '👥 ▼ Buka Sebagai Pegawai Lainnya'}</span>
                  </button>

                  {showEmployeeModal && (
                    <div className="mt-1.5 p-1 bg-black rounded-xl border border-zinc-800 max-h-32 overflow-y-auto">
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleVerifyCredential(e.target.value);
                        }}
                        onMouseEnter={() => setIsHoveringButton(true)}
                        onMouseLeave={() => setIsHoveringButton(false)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold rounded p-1.5 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="">-- Rekan Kantor (14 Pegawai) --</option>
                        {otherUsers.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} (Sisa Rp {u.currentBalance.toLocaleString('id-ID')})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
    </div>
  );
}
