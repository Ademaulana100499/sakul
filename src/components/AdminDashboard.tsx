'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';

export default function AdminDashboard() {
  const { items, users, transactions, updateStock, addItem } = useApp();
  const [activeTab, setActiveTab] = useState<'stock' | 'employees' | 'history'>('stock');
  
  // State for Add Item Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('5000');
  const [stock, setStock] = useState('12');
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
      bgGradient: 'from-blue-500/20 via-slate-400/10 to-teal-600/20 border-cyan-400/30 text-cyan-300'
    });

    // Reset form
    setName('');
    setPrice('5000');
    setStock('12');
    setShowAddModal(false);
  };

  const employeeUsers = users.filter(u => u.role === 'user');
  const totalStokBarang = items.reduce((acc, curr) => acc + curr.stock, 0);
  const totalSaldoDipakai = employeeUsers.reduce((acc, curr) => acc + (curr.initialBalance - curr.currentBalance), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Total Stok Kulkas</span>
            <h3 className="text-3xl font-black text-white mt-1">{totalStokBarang} <span className="text-sm font-semibold text-slate-400">pcs minuman</span></h3>
            <p className="text-xs text-slate-400 mt-1">Terbagi dalam {items.length} varian barang</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-400">
            📦
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Total Saldo Terpakai</span>
            <h3 className="text-3xl font-black text-white mt-1">Rp {totalSaldoDipakai.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-slate-400 mt-1">Konsumsi jajan oleh 14 karyawan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl text-cyan-400">
            💰
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Jumlah Pegawai</span>
            <h3 className="text-3xl font-black text-white mt-1">{employeeUsers.length} <span className="text-sm font-semibold text-slate-400">Orang</span></h3>
            <p className="text-xs text-slate-400 mt-1">Masing-masing dapat Rp 70k</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl text-purple-400">
            👥
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 ${
            activeTab === 'stock'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>📦</span>
          <span>Kelola Stok Kulkas</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 ${
            activeTab === 'employees'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>📊</span>
          <span>Rekap Saldo 14 Karyawan</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>📜</span>
          <span>Semua Transaksi Kulkas</span>
        </button>
      </div>

      {/* Tab 1: Manage Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-slate-200">Manajemen Bahan Baku & Minuman</h4>
              <p className="text-xs text-slate-400">Gunakan tombol (+) atau (-) untuk menambah/mengurangi stok fisik di kulkas.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto flex items-center space-x-1.5"
            >
              <span>➕ Tambah Minuman Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-md hover:border-amber-500/40 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">{item.category}</span>
                    <h5 className="font-bold text-slate-100 text-sm">{item.name}</h5>
                    <div className="text-xs text-cyan-400 font-bold mt-0.5">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl min-w-24">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stok Saat Ini</span>
                  <div className="text-lg font-black text-white my-1">{item.stock}</div>
                  <div className="flex items-center space-x-1 w-full justify-center">
                    <button
                      onClick={() => updateStock(item.id, -1)}
                      disabled={item.stock === 0}
                      title="Kurangi 1"
                      className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 disabled:opacity-30 border border-rose-500/30 font-bold text-sm transition-colors flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateStock(item.id, 1)}
                      title="Tambah 1"
                      className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-sm transition-colors flex items-center justify-center"
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

      {/* Tab 2: Employee Balances (Exact representation of user's table) */}
      {activeTab === 'employees' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80">
            <h4 className="font-bold text-slate-100 text-base">Daftar Sisa Saldo Karyawan (Dari Kuota Rp 70.000)</h4>
            <p className="text-xs text-slate-400 mt-0.5">Memantau secara realtime sisa saldo yang sudah dipotong otomatis saat pegawai mengambil minuman.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Pegawai</th>
                  <th className="py-3.5 px-4">Saldo Awal</th>
                  <th className="py-3.5 px-4">Sisa Saldo</th>
                  <th className="py-3.5 px-4">Terpakai (Jajan)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {employeeUsers.map((emp, index) => {
                  const terpakai = emp.initialBalance - emp.currentBalance;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg">{emp.avatar}</span>
                          <span className="font-bold text-white text-sm">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        Rp {emp.initialBalance.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-cyan-400 text-sm">
                          Rp {emp.currentBalance.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        {terpakai > 0 ? `Rp ${terpakai.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          terpakai > 0 
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' 
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}>
                          {terpakai > 0 ? 'Sudah Jajan 🛒' : 'Belum Jajan'}
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

      {/* Tab 3: All Transaction History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-100 text-base">📜 Catatan Semua Pengambilan di Kulkas Kantor</h4>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold">
              Total {transactions.length} riwayat
            </span>
          </div>

          <div className="space-y-3 divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
            {transactions.map(t => (
              <div key={t.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-sm shadow-inner">
                    {t.quantity}x
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{t.itemName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <span className="text-amber-400 font-semibold">👤 {t.userName}</span>
                      <span>•</span>
                      <span>{t.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-400 text-sm">- Rp {t.total.toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-100">➕ Tambah Minuman Baru ke Kulkas</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Nama Minuman / Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Coca Cola Can 250ml"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Stok Awal (pcs)</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Item['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Teh & Kopi">Teh & Kopi</option>
                    <option value="Isotonik & Vitamin">Isotonik & Vitamin</option>
                    <option value="Susu">Susu</option>
                    <option value="Air & Lainnya">Air & Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Ikon Emoji</label>
                  <select
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold text-base focus:outline-none focus:border-cyan-500"
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

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
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
