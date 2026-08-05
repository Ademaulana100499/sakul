'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import { Item, BeverageShape, Style3D } from '../../types';
import { DrinkMesh3D } from '../3d/ItemInspector3DModal';

interface BeverageBuilderModalProps {
  initialItem?: Item | null; // null/undefined = New Mode; item = Edit Mode
  onSave: (itemData: Omit<Item, 'id'>) => void;
  onUpdate?: (itemId: string, updatedData: Partial<Item>) => void;
  onDelete?: (itemId: string) => void;
  onClose: () => void;
}

const SHAPE_OPTIONS: { value: BeverageShape; label: string; icon: string; desc: string }[] = [
  { value: 'bottle', label: 'Botol Standar / PET / Kaca', icon: '🧴', desc: 'Cocok untuk Air Mineral, Teh Botol, Isotonik & Vitamin Kaca' },
  { value: 'can', label: 'Kaleng Logam / Soda Can', icon: '🥫', desc: 'Cocok untuk Kopi Kaleng, Soda, Susu Bear Brand, Larutan' },
  { value: 'box', label: 'Kotak Tetra Pak', icon: '🧃', desc: 'Cocok untuk Susu Kotak Ultra Milk, Teh Kotak, Jus Buah' },
  { value: 'yakult', label: 'Botol Mungil Probiotik', icon: '🥛', desc: 'Cocok untuk Yakult, Minuman Fermentasi Mungil' },
];

const QUICK_COLORS = [
  { name: 'Merah Fanta', hex: '#ef4444' },
  { name: 'Biru Pocari', hex: '#3b82f6' },
  { name: 'Hijau Sprite', hex: '#10b981' },
  { name: 'Cokelat Teh / Kopi', hex: '#a16207' },
  { name: 'Kuning Vitamin C', hex: '#eab308' },
  { name: 'Ungu Grape', hex: '#a855f7' },
  { name: 'Putih Susu / Bening', hex: '#f8fafc' },
  { name: 'Hitam Espresso', hex: '#18181b' },
  { name: 'Emas Golda', hex: '#d97706' },
  { name: 'Silver Aluminium', hex: '#cbd5e1' },
];

export default function BeverageBuilderModal({ initialItem, onSave, onUpdate, onDelete, onClose }: BeverageBuilderModalProps) {
  const isEdit = !!initialItem;

  // Commercial States
  const [name, setName] = useState(initialItem?.name || '');
  const [price, setPrice] = useState<number>(initialItem?.price || 5000);
  const [stock, setStock] = useState<number>(initialItem?.stock || 24);
  const [category, setCategory] = useState<'Teh & Kopi' | 'Isotonik & Vitamin' | 'Susu' | 'Air & Lainnya'>(
    initialItem?.category || 'Teh & Kopi'
  );
  const [icon, setIcon] = useState(initialItem?.icon || '🥤');

  // 3D Visual Customization States
  const defaultStyle: Style3D = initialItem?.style3D || {
    shape: 'bottle',
    bodyColor: '#3b82f6',
    labelColor: '#1e3a8a',
    stripeColor: '#ffffff',
    capColor: '#2563eb',
    metal: 0.2,
    rough: 0.25,
    trans: 0.65,
    shortLabel: 'NEW',
    hpBoost: '⚡ +50 Stamina Booster',
    tagline: 'Minuman dingin menyegarkan racikan khusus Admin SAKUL!'
  };

  const [shape, setShape] = useState<BeverageShape>(defaultStyle.shape);
  const [bodyColor, setBodyColor] = useState(defaultStyle.bodyColor);
  const [labelColor, setLabelColor] = useState(defaultStyle.labelColor);
  const [stripeColor, setStripeColor] = useState(defaultStyle.stripeColor);
  const [capColor, setCapColor] = useState(defaultStyle.capColor || '#2563eb');
  const [isTransparent, setIsTransparent] = useState<boolean>(defaultStyle.trans > 0);
  const [isMetallic, setIsMetallic] = useState<boolean>(defaultStyle.metal >= 0.5 || shape === 'can');
  const [shortLabel, setShortLabel] = useState(defaultStyle.shortLabel || 'SAKUL');
  const [hpBoost, setHpBoost] = useState(defaultStyle.hpBoost || '⚡ +50 Stamina Booster');
  const [tagline, setTagline] = useState(defaultStyle.tagline || 'Minuman spesial penyejuk suasana kerja!');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Construct real-time dummy Item for Live 3D Preview WebGL Stage!
  const previewItem: Item = {
    id: initialItem?.id || 'preview-temp',
    name: name.trim() || 'Minuman Baru SAKUL',
    price: Number(price) || 5000,
    stock: Number(stock) || 0,
    category,
    icon,
    bgGradient: 'from-sky-500/20 via-blue-500/10 to-indigo-600/20 border-sky-400/30 text-sky-300',
    style3D: {
      shape,
      bodyColor,
      labelColor,
      stripeColor,
      capColor,
      metal: isMetallic ? 0.95 : 0.2,
      rough: isMetallic ? 0.15 : 0.25,
      trans: isTransparent && shape !== 'can' && shape !== 'box' ? 0.75 : 0,
      shortLabel,
      hpBoost,
      tagline
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('⚠️ Nama minuman wajib diisi!');
      return;
    }
    if (price <= 0) {
      setErrorMsg('⚠️ Harga minuman harus di atas Rp 0!');
      return;
    }

    const compiledStyle3D: Style3D = {
      shape,
      bodyColor,
      labelColor,
      stripeColor,
      capColor,
      metal: isMetallic ? 0.95 : 0.2,
      rough: isMetallic ? 0.15 : 0.25,
      trans: isTransparent && shape !== 'can' && shape !== 'box' ? 0.75 : 0,
      shortLabel,
      hpBoost,
      tagline
    };

    if (isEdit && initialItem && onUpdate) {
      onUpdate(initialItem.id, {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category,
        icon,
        style3D: compiledStyle3D
      });
    } else {
      onSave({
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category,
        icon,
        bgGradient: 'from-cyan-500/20 via-sky-400/10 to-blue-600/20 border-cyan-400/30 text-cyan-400',
        style3D: compiledStyle3D
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-white w-full max-w-6xl rounded-2xl border-2 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.25)] flex flex-col overflow-hidden max-h-[95vh]">
        
        {/* HEADER MODAL */}
        <div className="bg-zinc-950 px-5 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl animate-bounce">🎨</span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-amber-400 uppercase tracking-wide">
                {isEdit ? 'Edit Minuman & Spesifikasi 3D' : 'Studio Peracik Minuman 3D SAKUL'}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Atur bentuk, warna, harga, dan promosikan di atas rak kulkas kantor Anda secara live & dinamis!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-rose-600 text-slate-300 hover:text-white font-black flex items-center justify-center transition-colors shadow"
          >
            ✕
          </button>
        </div>

        {/* MAIN TWO-COLUMN WORKSPACE */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: LIVE 3D WEBGL ROTATING STUDIO (5 COLS) */}
          <div className="md:col-span-5 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between relative min-h-[300px] sm:min-h-[420px]">
            <div className="z-10 bg-black/60 backdrop-blur-md border border-amber-500/40 p-2.5 rounded-xl text-center shadow">
              <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase block animate-pulse">
                👁️ LIVE 3D ROTATING PREVIEW
              </span>
              <h3 className="font-black text-lg sm:text-2xl text-white truncate my-0.5">{previewItem.name}</h3>
              <div className="text-xs font-extrabold text-emerald-400">Rp {previewItem.price.toLocaleString('id-ID')} ({previewItem.stock} pcs)</div>
            </div>

            {/* LIVE 3D CANVAS */}
            <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
              <Canvas camera={{ position: [0, 0.1, 5.8], fov: 36 }}>
                <ambientLight intensity={2.5} />
                <directionalLight position={[4, 8, 6]} intensity={3.5} />
                <directionalLight position={[-5, -2, -4]} intensity={2.0} color="#38bdf8" />
                <directionalLight position={[0, -3, 3]} intensity={1.5} color="#ffffff" />
                <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.3}>
                  <group position={[0, -0.2, 0]}>
                    <DrinkMesh3D item={previewItem} isMini={false} />
                  </group>
                </Float>
                <ContactShadows position={[0, -1.25, 0]} opacity={0.7} scale={3.5} blur={1.5} far={3} color="#f59e0b" />
                <OrbitControls enableZoom={false} minDistance={4.0} maxDistance={8.0} makeDefault />
              </Canvas>
            </div>

            <div className="z-10 mt-auto pt-2 bg-zinc-900/80 backdrop-blur border border-zinc-700 p-2.5 rounded-xl text-[11px] text-slate-300 text-center shadow">
              💡 <strong className="text-cyan-300">Tips Admin:</strong> Klik & geser objek di atas untuk memutar botol 3D 360° secara langsung!
            </div>
          </div>

          {/* RIGHT COLUMN: FORM & COLOR PICKERS (7 COLS) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {errorMsg && (
              <div className="bg-rose-950 text-rose-200 border border-rose-500 p-3 rounded-xl font-bold animate-pulse">
                {errorMsg}
              </div>
            )}

            {/* 1. PEMILAH BENTUK WADAH (3D GEOMETRY SHAPE) */}
            <div className="space-y-2">
              <label className="font-black text-amber-400 text-xs sm:text-sm uppercase tracking-wide flex items-center space-x-1.5">
                <span>1. Pilih Bentuk Wadah (3D Shape Geometry)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SHAPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setShape(opt.value);
                      if (opt.value === 'can') {
                        setIsMetallic(true);
                        setIsTransparent(false);
                      } else if (opt.value === 'box' || opt.value === 'yakult') {
                        setIsMetallic(false);
                        setIsTransparent(false);
                      }
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                      shape === opt.value
                        ? 'bg-amber-500 text-slate-950 font-black border-white shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-102'
                        : 'bg-zinc-800/80 hover:bg-zinc-800 text-slate-300 border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{opt.icon}</span>
                    <span className="text-[11px] sm:text-xs font-bold leading-tight">{opt.label.split(' / ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. SPESIFIKASI BISNIS KULKAS (NAMA, HARGA, STOK, KATEGORI) */}
            <div className="bg-zinc-800/60 p-3.5 sm:p-4 rounded-xl border border-zinc-700 space-y-3">
              <label className="font-black text-cyan-400 text-xs sm:text-sm uppercase tracking-wide block">
                2. Spesifikasi Produk & Harga
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Nama Minuman *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Teh Botol Sosro Kaca 350ml"
                    className="w-full bg-zinc-950 text-white border border-zinc-600 px-3 py-2 rounded-lg font-extrabold focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Kategori Rak</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 text-white border border-zinc-600 px-3 py-2 rounded-lg font-bold focus:border-amber-400 outline-none"
                  >
                    <option value="Teh & Kopi">Teh & Kopi 🍵</option>
                    <option value="Isotonik & Vitamin">Isotonik & Vitamin ⚡</option>
                    <option value="Susu">Susu 🥛</option>
                    <option value="Air & Lainnya">Air Mineral & Lainnya 💧</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Harga Jual Pegawai (Rp) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="500"
                    step="500"
                    className="w-full bg-zinc-950 text-emerald-400 border border-zinc-600 px-3 py-2 rounded-lg font-black text-base focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Stok Rak Kulkas (Pcs) *</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      min="0"
                      className="w-full bg-zinc-950 text-white border border-zinc-600 px-2 sm:px-3 py-2 rounded-lg font-black text-base focus:border-amber-400 outline-none"
                      required
                    />
                    <button type="button" onClick={() => setStock(s => Number(s) + 1)} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-2 rounded-lg font-black text-xs sm:text-sm shrink-0 shadow cursor-pointer">+1</button>
                    <button type="button" onClick={() => setStock(s => Number(s) + 6)} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-2 rounded-lg font-black text-xs sm:text-sm shrink-0 shadow cursor-pointer">+6</button>
                    <button type="button" onClick={() => setStock(s => Number(s) + 12)} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-2 rounded-lg font-black text-xs sm:text-sm shrink-0 shadow cursor-pointer">+12</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. KUSTOMISASI PALET WARNA & MATERIAL 3D */}
            <div className="bg-zinc-800/60 p-3.5 sm:p-4 rounded-xl border border-zinc-700 space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-black text-emerald-400 text-xs sm:text-sm uppercase tracking-wide">
                  3. Kustomisasi Palet Warna 3D
                </label>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  {shape === 'bottle' && (
                    <label className="flex items-center space-x-1.5 cursor-pointer text-cyan-300">
                      <input
                        type="checkbox"
                        checked={isTransparent}
                        onChange={(e) => setIsTransparent(e.target.checked)}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      <span>Bening (Transparan)</span>
                    </label>
                  )}
                  <label className="flex items-center space-x-1.5 cursor-pointer text-yellow-300">
                    <input
                      type="checkbox"
                      checked={isMetallic}
                      onChange={(e) => setIsMetallic(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span>Kilau Logam (Metallic)</span>
                  </label>
                </div>
              </div>

              {/* QUICK COLOR PALETTE BUTTONS */}
              <div>
                <span className="text-[11px] text-slate-400 font-bold block mb-1.5">Pilih Warna Cepat (Preset Pasar Indonesia):</span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setBodyColor(c.hex);
                        if (c.hex === '#ef4444') { setLabelColor('#991b1b'); setStripeColor('#ffffff'); }
                        else if (c.hex === '#3b82f6') { setLabelColor('#1e40af'); setStripeColor('#ffffff'); }
                        else if (c.hex === '#10b981') { setLabelColor('#ffffff'); setStripeColor('#065f46'); }
                        else if (c.hex === '#eab308') { setLabelColor('#854d0e'); setStripeColor('#dc2626'); }
                        else if (c.hex === '#a16207') { setLabelColor('#f59e0b'); setStripeColor('#ef4444'); }
                      }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1.5 border border-zinc-600 bg-zinc-900 hover:scale-105 transition-transform"
                    >
                      <span className="w-3 h-3 rounded-full inline-block border border-white/50" style={{ backgroundColor: c.hex }}></span>
                      <span className="text-slate-200">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MANUAL HEX COLOR PICKERS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-zinc-700/60">
                <div className="flex flex-col items-center p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                  <span className="text-[10px] font-extrabold text-slate-300 mb-1">Warna Wadah / Cairan</span>
                  <input
                    type="color"
                    value={bodyColor}
                    onChange={(e) => setBodyColor(e.target.value)}
                    className="w-full h-8 cursor-pointer bg-transparent border-0 rounded"
                  />
                </div>
                <div className="flex flex-col items-center p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                  <span className="text-[10px] font-extrabold text-slate-300 mb-1">Warna Pita Label</span>
                  <input
                    type="color"
                    value={labelColor}
                    onChange={(e) => setLabelColor(e.target.value)}
                    className="w-full h-8 cursor-pointer bg-transparent border-0 rounded"
                  />
                </div>
                <div className="flex flex-col items-center p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                  <span className="text-[10px] font-extrabold text-slate-300 mb-1">Warna Garis Aksen</span>
                  <input
                    type="color"
                    value={stripeColor}
                    onChange={(e) => setStripeColor(e.target.value)}
                    className="w-full h-8 cursor-pointer bg-transparent border-0 rounded"
                  />
                </div>
                <div className="flex flex-col items-center p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                  <span className="text-[10px] font-extrabold text-slate-300 mb-1">Warna Tutup Botol</span>
                  <input
                    type="color"
                    value={capColor}
                    onChange={(e) => setCapColor(e.target.value)}
                    className="w-full h-8 cursor-pointer bg-transparent border-0 rounded"
                  />
                </div>
              </div>
            </div>

            {/* 4. MARKETING PROMO & GAME HUD TAGS */}
            <div className="bg-zinc-800/60 p-3.5 sm:p-4 rounded-xl border border-zinc-700 space-y-3">
              <label className="font-black text-amber-400 text-xs sm:text-sm uppercase tracking-wide block">
                4. Label Promosi & Efek Kesegaran
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">HP / Stamina Boost (Muncul pas dizoom)</label>
                  <input
                    type="text"
                    value={hpBoost}
                    onChange={(e) => setHpBoost(e.target.value)}
                    placeholder="⚡ +50 Stamina & Ion Booster"
                    className="w-full bg-zinc-950 text-amber-300 border border-zinc-600 px-3 py-1.5 rounded-lg font-extrabold focus:border-amber-400 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Emoji Icon (Pilih / Paste Emoji)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    maxLength={4}
                    className="w-full bg-zinc-950 text-white text-center border border-zinc-600 px-3 py-1.5 rounded-lg font-black focus:border-amber-400 outline-none text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Tagline Promosi Kulkas Kantor</label>
                  <textarea
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    rows={2}
                    placeholder="Tulis alasan kenapa pegawai wajib beli minuman segar ini!"
                    className="w-full bg-zinc-950 text-slate-200 border border-zinc-600 p-2.5 rounded-lg font-bold focus:border-amber-400 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              {isEdit && onDelete && initialItem ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Yakin ingin menghapus minuman "${initialItem.name}" dari katalog kulkas?`)) {
                      onDelete(initialItem.id);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl font-black bg-rose-950 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/80 hover:border-rose-400 transition-all flex items-center space-x-1.5 text-xs sm:text-sm uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>Hapus Minuman</span>
                </button>
              ) : <div className="hidden sm:block" />}

              <div className="flex items-center space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-slate-300 border border-zinc-600 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] transform active:scale-95 transition-all text-sm uppercase tracking-wide flex items-center space-x-2 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>{isEdit ? 'Simpan Perubahan Minuman' : 'Terbitkan Minuman Baru!'}</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
