'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const { users, login } = useApp();
  const [selectedOtherId, setSelectedOtherId] = useState<string>('');
  const [showOtherEmployees, setShowOtherEmployees] = useState(false);

  const adminUser = users.find(u => u.role === 'superadmin');
  const defaultUser1 = users.find(u => u.id === 'user-1'); // Ade
  const otherUsers = users.filter(u => u.role === 'user' && u.id !== 'user-1');

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-blue-600 shadow-2xl shadow-cyan-500/30 mb-2 transform transition hover:scale-105 duration-300">
            <span className="text-4xl">🧊</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-slate-400 bg-clip-text text-transparent">
            SAKUL
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Sistem Manajemen Saldo Kulkas & Stok Minuman Kantor
          </p>
        </div>

        {/* Login Cards */}
        <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-slate-200">Pilih Akses Dummy Login</h2>
            <p className="text-xs text-slate-400">
              Pilih peran Anda di bawah untuk simulasi frontend tanpa password:
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Super Admin Quick Login */}
            {adminUser && (
              <button
                onClick={() => login(adminUser.id)}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/30 border border-amber-500/30 p-4 text-left transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-amber-500/20"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    👑
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Super Admin</span>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">Kelola Stok</span>
                    </div>
                    <h3 className="text-white font-bold text-base group-hover:text-amber-200 transition-colors">
                      {adminUser.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Input stok kulkas, kelola barang & rekap saldo
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* User 1 (Ade) Quick Login */}
            {defaultUser1 && (
              <button
                onClick={() => login(defaultUser1.id)}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-teal-500/20 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/30 border border-cyan-500/30 p-4 text-left transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl shadow-md shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                    🧃
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">User 1 (Pegawai)</span>
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-medium">
                        Rp {defaultUser1.currentBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-base group-hover:text-cyan-200 transition-colors">
                      {defaultUser1.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Ambil minuman kulkas & cek sisa saldo jajan
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Toggle for other 13 employees */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowOtherEmployees(!showOtherEmployees)}
              className="w-full text-center text-xs text-slate-400 hover:text-cyan-300 font-medium transition-colors py-2 flex items-center justify-center space-x-1"
            >
              <span>{showOtherEmployees ? ' ▲ Tutup Daftar Pegawai Lainnya' : '▼ Coba Login Sebagai Pegawai Lainnya (Ahdi, Putra, dll)'}</span>
            </button>

            {showOtherEmployees && (
              <div className="mt-3 space-y-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs text-slate-300 font-medium block">
                  Pilih Pegawai Kantor Lainnya:
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedOtherId}
                    onChange={(e) => setSelectedOtherId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Nama Pegawai --</option>
                    {otherUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Sisa Saldo: Rp {u.currentBalance.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedOtherId}
                    onClick={() => {
                      if (selectedOtherId) login(selectedOtherId);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-50 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs rounded-lg text-white shadow-md transition-all"
                  >
                    Masuk
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 font-medium">
          💡 Saldo bulanan default sebesar <span className="text-slate-400 font-bold">Rp 70.000 / orang</span>. Data tersimpan di localStorage.
        </div>
      </div>
    </div>
  );
}
