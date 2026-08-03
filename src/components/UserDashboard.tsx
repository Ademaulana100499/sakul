'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function UserDashboard() {
  const { currentUser, items, transactions, takeItem } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!currentUser) return null;

  const categories = ['Semua', 'Teh & Kopi', 'Isotonik & Vitamin', 'Susu', 'Air & Lainnya'];

  const filteredItems = selectedCategory === 'Semua' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  // Calculate user's recent transactions
  const userTransactions = transactions.filter(t => t.userId === currentUser.id);

  const handleTakeItem = (itemId: string) => {
    const res = takeItem(itemId);
    setToastMessage({
      text: res.message,
      type: res.success ? 'success' : 'error'
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Balance progress calculation
  const percentRemaining = Math.max(0, Math.min(100, Math.round((currentUser.currentBalance / currentUser.initialBalance) * 100)));

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center space-x-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-900/40'
          }`}>
            <span className="text-2xl">{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
            <div className="text-xs font-semibold leading-relaxed">{toastMessage.text}</div>
          </div>
        </div>
      )}

      {/* Hero Balance Card (Digital Wallet Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 p-7 border border-cyan-500/30 shadow-2xl shadow-cyan-950/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full">
              <span>💳 Kartu Saldo Kulkas</span>
              <span>•</span>
              <span>{currentUser.name}</span>
            </div>
            <p className="text-slate-400 text-xs uppercase font-medium tracking-wider">Sisa Saldo Anda Saat Ini</p>
            <div className="flex items-baseline space-x-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Rp {currentUser.currentBalance.toLocaleString('id-ID')}
              </h2>
              <span className="text-sm text-slate-400 font-medium">/ Rp {currentUser.initialBalance.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="w-full md:w-64 bg-slate-900/80 border border-slate-750 p-4 rounded-2xl shadow-inner space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Kapasitas Saldo</span>
              <span className={percentRemaining < 30 ? 'text-rose-400 font-extrabold' : 'text-cyan-400'}>{percentRemaining}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  percentRemaining > 60 
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400' 
                    : percentRemaining > 25 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
                    : 'bg-gradient-to-r from-rose-500 to-red-600'
                }`}
                style={{ width: `${percentRemaining}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              *Klik barang di bawah untuk mengambil dari kulkas.
            </p>
          </div>
        </div>
      </div>

      {/* Beverage Catalog Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <span>🥤 Daftar Minuman di Kulkas</span>
            </h3>
            <p className="text-xs text-slate-400">Pilih minuman yang ingin Anda ambil sekarang dari kulkas kantor.</p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const canAfford = currentUser.currentBalance >= item.price;
            const hasStock = item.stock > 0;

            return (
              <div 
                key={item.id}
                className={`group relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-b ${item.bgGradient} bg-slate-900/70 shadow-lg hover:shadow-2xl backdrop-blur-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                      hasStock 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      {hasStock ? `Stok: ${item.stock} pcs` : 'HABIS ❌'}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors mt-0.5 line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-lg font-black text-cyan-300 mt-2">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>

                <button
                  onClick={() => handleTakeItem(item.id)}
                  disabled={!hasStock || !canAfford}
                  className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 ${
                    !hasStock
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : !canAfford
                      ? 'bg-rose-950/60 text-rose-300 cursor-not-allowed border border-rose-800'
                      : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:shadow-cyan-500/30 active:scale-95'
                  }`}
                >
                  {!hasStock ? (
                    <span>Stok Kulkas Kosong</span>
                  ) : !canAfford ? (
                    <span>Saldo Tidak Cukup</span>
                  ) : (
                    <>
                      <span>⚡ Ambil 1 Sekarang</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">+</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>🕒 Riwayat Pengambilan Anda</span>
          </h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-semibold">
            {userTransactions.length} transaksi
          </span>
        </div>

        {userTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            Belum ada barang yang Anda ambil dari kulkas hari ini.
          </div>
        ) : (
          <div className="space-y-2.5 divide-y divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
            {userTransactions.map(t => (
              <div key={t.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
                    {t.quantity}x
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{t.itemName}</div>
                    <div className="text-[10px] text-slate-500">{t.timestamp}</div>
                  </div>
                </div>
                <div className="font-bold text-rose-400">
                  - Rp {t.total.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
