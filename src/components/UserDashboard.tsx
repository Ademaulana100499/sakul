'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BeverageShowcase3D from './3d/BeverageShowcase3D';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDashboard() {
  const { currentUser, items, transactions, takeItem } = useApp();
  const [selectedItemId, setSelectedItemId] = useState<string>('item-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [spinTrigger, setSpinTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!currentUser) return null;

  const selectedItem = items.find(i => i.id === selectedItemId) || items[0];
  const categories = ['Semua', 'Teh & Kopi', 'Isotonik & Vitamin', 'Susu', 'Air & Lainnya'];
  const filteredItems = selectedCategory === 'Semua' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const userTransactions = transactions.filter(t => t.userId === currentUser.id);
  const percentRemaining = Math.max(0, Math.min(100, Math.round((currentUser.currentBalance / currentUser.initialBalance) * 100)));

  const handleTakeItem = (itemId: string) => {
    const res = takeItem(itemId);
    setToastMessage({
      text: res.message,
      type: res.success ? 'success' : 'error'
    });
    if (res.success) {
      setSpinTrigger(Date.now());
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-10 pb-20 text-slate-900 font-sans">
      {/* Toast Alert Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50 max-w-md"
          >
            <div className={`p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl border-2 flex items-center space-x-4 ${
              toastMessage.type === 'success'
                ? 'bg-white/95 border-emerald-500 text-slate-900 shadow-emerald-500/20'
                : 'bg-white/95 border-rose-500 text-slate-900 shadow-rose-500/20'
            }`}>
              <span className="text-3xl">{toastMessage.type === 'success' ? '❄️' : '⚠️'}</span>
              <div className="text-xs font-black leading-relaxed">{toastMessage.text}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION: Digital ATM Saldo Card + 3D Beverage Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT 5 COLS: ATM Digital Saldo Kulkas */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-white border-2 border-white shadow-[0_15px_40px_rgba(14,116,144,0.12)] p-7 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-400/20 via-cyan-300/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-6 z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                <span>💳 DOMPET SALDO SAKUL</span>
              </div>
              <span className="text-3xl">{currentUser.avatar}</span>
            </div>

            <div>
              <p className="text-sky-700 text-xs uppercase font-extrabold tracking-wider">Sisa Saldo Jajan Kulkas</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <motion.h2 
                  key={currentUser.currentBalance}
                  initial={{ scale: 1.08, color: '#0284c7' }}
                  animate={{ scale: 1, color: '#0f172a' }}
                  className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight"
                >
                  Rp {currentUser.currentBalance.toLocaleString('id-ID')}
                </motion.h2>
                <span className="text-sm font-bold text-slate-500">/ Rp {currentUser.initialBalance.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2.5 bg-sky-50/70 p-4.5 rounded-2xl border border-sky-100 shadow-inner">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Kapasitas Saldo Bulanan</span>
                <span className={percentRemaining < 30 ? 'text-rose-600 font-black' : 'text-sky-700 font-extrabold'}>{percentRemaining}% Tersisa</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    percentRemaining > 50 
                      ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600' 
                      : percentRemaining > 25 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-r from-rose-500 to-red-600'
                  }`}
                  style={{ width: `${percentRemaining}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium pt-0.5">
                💡 Pilih minuman di bawah ini untuk menginspeksi di Studio 3D atau ambil langsung dari kulkas fisik!
              </p>
            </div>
          </div>

          <div className="z-10 mt-6 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-500 flex justify-between items-center">
            <span>Pegawai: <strong className="text-slate-800">{currentUser.name}</strong></span>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black">2.0°C SEGAR & DINGIN</span>
          </div>
        </div>

        {/* RIGHT 7 COLS: 3D Beverage Showcase Podium */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-0.5">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>🧊 Studio 3D Interaktif Minuman</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Putar model 3D di bawah ini untuk mengecek sebelum Anda mengambilnya.</p>
            </div>
            <span className="text-xs text-sky-800 bg-sky-100 border border-sky-300 px-3 py-1 rounded-full font-black shadow-sm">
              Terpilih: {selectedItem.name}
            </span>
          </div>

          {/* 3D Canvas Showcase */}
          <div className="flex-1">
            <BeverageShowcase3D item={selectedItem} triggerSpin={spinTrigger} />
          </div>

          {/* Action button for currently selected item on podium */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTakeItem(selectedItem.id)}
            disabled={selectedItem.stock <= 0 || currentUser.currentBalance < selectedItem.price}
            className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center space-x-2.5 border-2 ${
              selectedItem.stock <= 0
                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                : currentUser.currentBalance < selectedItem.price
                ? 'bg-rose-100 border-rose-300 text-rose-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-white/40 shadow-sky-500/25 font-black'
            }`}
          >
            {selectedItem.stock <= 0 ? (
              <span>STOK KULKAS KOSONG (0 pcs) 🚫</span>
            ) : currentUser.currentBalance < selectedItem.price ? (
              <span>SALDO ANDA TIDAK CUKUP ⚠️</span>
            ) : (
              <>
                <span className="text-lg animate-bounce">⚡</span>
                <span className="font-black tracking-wide">
                  AMBIL 1 {selectedItem.name.toUpperCase()} DARI KULKAS (POTONG Rp {selectedItem.price.toLocaleString('id-ID')})
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* CATALOG SECTION: Clean Modern Grid */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Katalog Isi Kulkas Showcase ({filteredItems.length} Varian Minuman)
            </h3>
            <p className="text-xs text-slate-500 font-medium">Klik kartu minuman untuk menampilkannya ke atas Podium 3D atau ambil langsung.</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-105'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const isSelected = item.id === selectedItemId;
            const hasStock = item.stock > 0;
            const canAfford = currentUser.currentBalance >= item.price;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`group cursor-pointer relative overflow-hidden rounded-3xl p-5 border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-50 to-white border-sky-400 shadow-[0_15px_30px_rgba(14,116,144,0.18)] ring-2 ring-sky-300'
                    : 'bg-white border-slate-200/80 hover:border-sky-300 shadow-md hover:shadow-lg'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-sm ${
                      hasStock ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {hasStock ? `❄️ ${item.stock} pcs` : 'HABIS ❌'}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-black text-sky-600 block tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5 line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-2 flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-500">Harga:</span>
                    <span className="text-sky-700 font-extrabold">Rp {item.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold">
                  <span className={isSelected ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}>
                    {isSelected ? '❄️ Terpilih di 3D' : '👆 Lihat model 3D'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                      handleTakeItem(item.id);
                    }}
                    disabled={!hasStock || !canAfford}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-extrabold shadow transition-all disabled:opacity-30"
                  >
                    + Ambil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <span>🕒 Riwayat Pengambilan Minuman dari Showcase Kulkas</span>
          </h3>
          <span className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-black">
            {userTransactions.length} transaksi
          </span>
        </div>

        {userTransactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-bold italic border border-dashed border-slate-200 rounded-2xl">
            ❄️ Belum ada minuman yang Anda ambil dari kulkas hari ini. Ketuk tombol Ambil di atas!
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {userTransactions.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs hover:border-sky-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    {t.quantity}x
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{t.itemName}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">🕒 {t.timestamp} • Kulkas Kantor</div>
                  </div>
                </div>
                <div className="font-black bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl text-sm shadow-inner">
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
