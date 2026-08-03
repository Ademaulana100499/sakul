'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onCloseDoor: () => void;
}

export default function Navbar({ onCloseDoor }: NavbarProps) {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            🧊
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center space-x-2">
              <span>SAKUL SHOWCASE</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-bold">2.0°C SUPER CHILLED</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] text-sky-700 font-extrabold capitalize">{currentUser.role === 'superadmin' ? '👑 Super Admin' : '👤 Karyawan (Rp 70rb)'}</span>
          </div>

          <button
            onClick={onCloseDoor}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-extrabold text-xs transition-all shadow-md flex items-center space-x-1.5"
          >
            <span>🚪</span>
            <span>Tutup Kulkas</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
