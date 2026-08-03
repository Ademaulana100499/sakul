'use client';

import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import LoginView from '../components/LoginView';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';

function MainContent() {
  const { currentUser, isClient } = useApp();

  // Prevent hydration mismatch while loading localStorage
  if (!isClient) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold tracking-wider uppercase">Memuat Saldo Kulkas...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {currentUser.role === 'superadmin' ? <AdminDashboard /> : <UserDashboard />}
      </main>
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-[11px] text-slate-500 font-medium">
        © 2026 SAKUL (Saldo Kulkas Pintar Kantor) • Kuota Saldo Rp 70.000 / Karyawan
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
