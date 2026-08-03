'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';

export default function AdminDashboard() {
  const { items, users, transactions, updateStock, addItem } = useApp();
  const [activeTab, setActiveTab] = useState<'stock' | 'employees' | 'history'>('stock');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('5500');
  const [stock, setStock] = useState('15');
  const [category, setCategory] = useState<Item['category']>('Teh & Kopi');
  const [icon, setIcon] = useState('🥤');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addItem({
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      icon,
      bgGradient: 'from-sky-50 via-white to-cyan-50 border-sky-200 text-sky-800'
    });

    setName('');
    setPrice('5500');
    setStock('15');
    setShowAddModal(false);
  };

  const employeeUsers = users.filter(u => u.role === 'user');
  const totalStokBarang = items.reduce((acc, curr) => acc + curr.stock, 0);
  const totalSaldoDipakai = employeeUsers.reduce((acc, curr) => acc + (curr.initialBalance - curr.currentBalance), 0);

  return (
    <div className="space-y-8 pb-20 text-slate-900 font-sans">
      {/* Admin Hero Panel */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-cyan-950 border-2 border-sky-500/30 p-8 rounded-3xl shadow-2xl text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10">
          <span className="text-xs font-black uppercase text-amber-300 tracking-widest bg-amber-400/20 px-3.5 py-1.5 rounded-full border border-amber-300/40">
            👑 SUPER ADMIN TERMINAL SHOWCASE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
            Panel Kendali Stok Kulkas & Audit Saldo
          </h2>
          <p className="text-xs text-sky-200 mt-1 max-w-xl leading-relaxed font-medium">
            Atur stok minuman fisik di dalam showcase kulkas kantor. Perubahan stok di sini langsung menyinkronisasi model 3D di layar 14 pegawai.
          </p>
        </div>
        <div className="hidden md:flex text-7xl drop-shadow-xl z-10">
          🧊
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider">Total Stok Showcase</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStokBarang} <span className="text-xs font-bold text-slate-500">pcs</span></h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">{items.length} jenis minuman terdaftar</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-3xl shadow-sm">
            🥤
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider">Total Saldo Terpakai</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">Rp {totalSaldoDipakai.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Akumulasi jajan 14 pegawai</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-sm">
            💰
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider">Total Pegawai Kantor</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{employeeUsers.length} <span className="text-xs font-bold text-slate-500">Orang</span></h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Kuota gratis Rp 70.000 / bulan</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl shadow-sm">
            👥
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2.5 border-b-2 border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 shadow-sm ${
            activeTab === 'stock'
              ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-500/25 scale-105'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📦</span>
          <span>Kelola Stok Kulkas</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 shadow-sm ${
            activeTab === 'employees'
              ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-500/25 scale-105'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📊</span>
          <span>Tabel Audit Sisa Saldo 14 Pegawai</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 shadow-sm ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-500/25 scale-105'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📜</span>
          <span>Log Semua Transaksi Kulkas</span>
        </button>
      </div>

      {/* TAB 1: Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sky-50/80 p-5 rounded-2xl border border-sky-200 shadow-sm">
            <div>
              <h4 className="font-black text-base text-slate-900">Manajemen Isi Kulkas Showcase</h4>
              <p className="text-xs text-slate-600">Tekan (+) atau (-) untuk mengubah jumlah stok fisik di dalam kulkas showcase kantor Anda.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center space-x-1.5"
            >
              <span>➕ Tambah Minuman Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <div key={item.id} className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-md hover:border-sky-300 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-3xl shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-sky-600 tracking-wider block">{item.category}</span>
                    <h5 className="font-black text-slate-900 text-base mt-0.5">{item.name}</h5>
                    <div className="text-sm text-sky-800 font-extrabold mt-0.5">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-3 rounded-2xl min-w-28 shadow-inner">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">Stok Kulkas</span>
                  <div className="text-2xl font-black text-slate-900 my-1">{item.stock} <span className="text-xs text-slate-500 font-bold">pcs</span></div>
                  <div className="flex items-center space-x-2 w-full justify-center">
                    <button
                      onClick={() => updateStock(item.id, -1)}
                      disabled={item.stock === 0}
                      title="Kurangi 1"
                      className="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 disabled:opacity-30 border border-rose-300 font-black text-base transition-all flex items-center justify-center active:scale-95"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateStock(item.id, 1)}
                      title="Tambah 1"
                      className="w-8 h-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 font-black text-base transition-all flex items-center justify-center active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Employees Table */}
      {activeTab === 'employees' && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-200 bg-sky-50/50">
            <h4 className="font-black text-slate-900 text-lg">📊 Laporan Audit Sisa Saldo 14 Karyawan (Kuota Rp 70.000 / Bulan)</h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Data pemantauan real-time untuk audit penggunaan minuman di kantor.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white uppercase font-black border-b border-slate-800 tracking-wider">
                  <th className="py-4 px-5 w-12 text-center">No</th>
                  <th className="py-4 px-5">Nama Pegawai</th>
                  <th className="py-4 px-5">Saldo Awal</th>
                  <th className="py-4 px-5">Sisa Saldo</th>
                  <th className="py-4 px-5">Terpakai (Jajan)</th>
                  <th className="py-4 px-5 text-center">Status Jajan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-sm">
                {employeeUsers.map((emp, index) => {
                  const terpakai = emp.initialBalance - emp.currentBalance;
                  return (
                    <tr key={emp.id} className="hover:bg-sky-50/60 transition-colors">
                      <td className="py-4 px-5 text-center text-slate-500 font-black">{index + 1}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{emp.avatar}</span>
                          <span className="font-black text-slate-900">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600">
                        Rp {emp.initialBalance.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-black text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl shadow-inner inline-block">
                          Rp {emp.currentBalance.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-amber-700">
                        {terpakai > 0 ? `Rp ${terpakai.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase ${
                          terpakai > 0 
                            ? 'bg-emerald-100 border border-emerald-300 text-emerald-800' 
                            : 'bg-slate-100 border border-slate-200 text-slate-500'
                        }`}>
                          {terpakai > 0 ? 'Sudah Jajan 🛒' : 'Belum Jajan ❄️'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: All Transactions */}
      {activeTab === 'history' && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h4 className="font-black text-slate-900 text-lg">📜 Catatan Semua Pengambilan Minuman dari Showcase Kulkas</h4>
            <span className="text-xs bg-sky-100 text-sky-800 border border-sky-200 px-3.5 py-1.5 rounded-full font-black shadow-sm">
              Total {transactions.length} riwayat
            </span>
          </div>

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-2">
            {transactions.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:border-sky-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
                    {t.quantity}x
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-base">{t.itemName}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      <span className="text-sky-700 font-bold">👤 {t.userName}</span> • 🕒 {t.timestamp}
                    </div>
                  </div>
                </div>
                <div className="font-black bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-2xl text-sm shadow-inner">
                  - Rp {t.total.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-5 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900">➕ Tambah Minuman ke Showcase</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 font-black text-lg">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Nama Minuman / Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Coca Cola Can 250ml"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-sky-500 font-bold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-sky-500 font-bold shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Stok Awal (pcs)</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-sky-500 font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Item['category'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-sky-500 font-bold shadow-inner"
                  >
                    <option value="Teh & Kopi">Teh & Kopi</option>
                    <option value="Isotonik & Vitamin">Isotonik & Vitamin</option>
                    <option value="Susu">Susu</option>
                    <option value="Air & Lainnya">Air & Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Ikon Emoji</label>
                  <select
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold text-base focus:outline-none focus:border-sky-500 shadow-inner"
                  >
                    <option value="🥤">🥤 Minuman</option>
                    <option value="🧃">🧃 Kotak / Yakult</option>
                    <option value="🥛">🥛 Susu</option>
                    <option value="☕">☕ Kopi</option>
                    <option value="🍵">🍵 Teh</option>
                    <option value="🥥">🥥 Kelapa / Hydro</option>
                    <option value="🍊">🍊 Jeruk / Vitamin</option>
                    <option value="💧">💧 Air Mineral</option>
                    <option value="🐼">🐼 Cap Panda</option>
                    <option value="🥫">🥫 Kaleng</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 text-white font-black rounded-xl shadow-lg transition-all"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
