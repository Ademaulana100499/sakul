'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentUser, logout, resetToDefault } = useApp();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 transition-all">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-bold text-xl text-white">
            🧊
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 tracking-wide">
              SAKUL
            </h1>
            <p className="text-xs text-slate-400 font-medium">Saldo Kulkas Kantor</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-inner">
            <span className="text-lg">{currentUser.avatar}</span>
            <div className="flex flex-col text-right sm:text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</span>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${
                currentUser.role === 'superadmin' ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {currentUser.role === 'superadmin' ? '🔥 Super Admin' : '👤 Pegawai'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset semua saldo dan stok ke data awal (dummy default)?')) {
                resetToDefault();
              }
            }}
            title="Reset ke Data Awal"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors text-sm"
          >
            🔄
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-semibold text-xs transition-all shadow-sm"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
