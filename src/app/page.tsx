'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import SmartFridgeApp from '../components/SmartFridgeApp';

export default function Home() {
  return (
    <AppProvider>
      <SmartFridgeApp />
    </AppProvider>
  );
}
