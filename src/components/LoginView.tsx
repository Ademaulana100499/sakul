'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import FridgeScene3D from './3d/FridgeModel3D';
import { motion } from 'framer-motion';

interface LoginViewProps {
  onOpenDoor: (userId: string) => void;
  isOpening: boolean;
}

export default function LoginView({ onOpenDoor, isOpening }: LoginViewProps) {
  const { users } = useApp();
  const [selectedOtherId, setSelectedOtherId] = useState<string>('');
  const [showOtherEmployees, setShowOtherEmployees] = useState(false);

  const adminUser = users.find(u => u.role === 'superadmin');
  const employeeUsers = users.filter(u => u.role === 'user');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-slate-100 to-cyan-100 text-slate-900 flex items-center justify-center p-3 sm:p-4 lg:p-10 font-sans relative overflow-hidden">
      {/* Cool ambient frost highlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
        
        {/* LEFT COLUMN: Bright Glass Crystal Portal */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-7">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-600/10 border border-sky-400/40 text-sky-800 text-xs font-extrabold tracking-wide shadow-sm">
              <span>🧊 SHOWCASE KULKAS MINUMAN KANTOR</span>
              <span>•</span>
              <span className="text-emerald-700">3D LIVE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              SAKUL <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">SHOWCASE</span>
            </h1>
            <p className="text-slate-600 text-sm font-medium max-w-md leading-relaxed">
              Selamat datang di kulkas minuman kantor! Ambil minuman berpendingin 2.0°C segar dengan saldo akun Anda.
            </p>
          </div>

          {/* Clean Crystal Acrylic Portal Panel */}
          <div className="bg-white/85 border-2 border-white backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(14,116,144,0.15)] space-y-4 sm:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600"></div>

            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Pilih Identitas Anda</h2>
              <p className="text-xs text-slate-500 font-medium">Tekan akun di bawah untuk membuka pintu showcase kaca 3D:</p>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Super Admin Key */}
              {adminUser && (
                <motion.button
                  whileHover={{ scale: 1.015, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenDoor(adminUser.id)}
                  disabled={isOpening}
                  className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-white to-amber-50 hover:from-amber-500/20 border-2 border-amber-300/80 p-4 text-left transition-all shadow-md hover:shadow-lg group disabled:opacity-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md text-white group-hover:scale-110 transition-transform">
                      👑
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700 text-xs font-black uppercase tracking-wider">Super Admin Kulkas</span>
                        <span className="text-[10px] bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">PENGELOLA STOK</span>
                      </div>
                      <h3 className="text-slate-900 font-black text-base mt-0.5">{adminUser.name}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">Kelola stok minuman, rak kulkas & data pegawai</p>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* First Employee quick button if exists */}
              {employeeUsers[0] && (
                <motion.button
                  whileHover={{ scale: 1.015, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenDoor(employeeUsers[0].id)}
                  disabled={isOpening}
                  className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500/10 via-white to-cyan-50 hover:from-sky-500/20 border-2 border-sky-300/80 p-4 text-left transition-all shadow-md hover:shadow-lg group disabled:opacity-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-2xl shadow-md text-white group-hover:scale-110 transition-transform">
                      {employeeUsers[0].avatar || '🥤'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sky-700 text-xs font-black uppercase tracking-wider">Pegawai Terdaftar</span>
                        <span className="text-xs bg-sky-600 text-white px-3 py-0.5 rounded-full font-black shadow-sm">
                          Rp {employeeUsers[0].currentBalance.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-black text-base mt-0.5">{employeeUsers[0].name}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">Buka kulkas showcase untuk ambil minuman</p>
                    </div>
                  </div>
                </motion.button>
              )}
            </div>

            {/* Other Employees selection */}
            {employeeUsers.length > 1 && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowOtherEmployees(!showOtherEmployees)}
                  className="w-full text-center text-xs font-bold text-sky-700 hover:text-sky-900 py-2 transition-colors flex items-center justify-center space-x-1.5 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200"
                >
                  <span>{showOtherEmployees ? '▲ Tutup Daftar Pegawai' : `▼ Login Sebagai Pegawai Lain (${employeeUsers.length} Terdaftar)`}</span>
                </button>

                {showOtherEmployees && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                    <label className="text-xs text-slate-700 font-black block">Pilih Nama Pegawai:</label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <select
                        value={selectedOtherId}
                        onChange={(e) => setSelectedOtherId(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-sky-500 shadow-inner"
                      >
                        <option value="">-- Pilih Pegawai --</option>
                        {employeeUsers.slice(1).map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — Sisa Saldo: Rp {u.currentBalance.toLocaleString('id-ID')}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!selectedOtherId || isOpening}
                        onClick={() => {
                          if (selectedOtherId) onOpenDoor(selectedOtherId);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 font-extrabold text-xs text-white rounded-xl shadow-md transition-all disabled:opacity-40 shrink-0"
                      >
                        Buka Kulkas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
              <span>💡 Saldo otomatis terkelola per pegawai</span>
              <span className="text-emerald-700 font-black">2.0°C SUPER CHILLED</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real WebGL 3D Showcase Refrigerator */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full relative">
            <FridgeScene3D isOpen={isOpening} />
          </div>
        </div>

      </div>
    </div>
  );
}
