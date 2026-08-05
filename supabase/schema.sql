-- ==============================================================================
-- SAKUL (SALDO KULKAS) - SUPABASE DATABASE SCHEMA (CLEAN START / NO DUMMY)
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('superadmin', 'user')),
  initial_balance NUMERIC NOT NULL DEFAULT 70000,
  current_balance NUMERIC NOT NULL DEFAULT 70000,
  avatar TEXT NOT NULL DEFAULT '😊',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ITEMS (BEVERAGES & SNACKS) TABLE
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('Teh & Kopi', 'Isotonik & Vitamin', 'Susu', 'Air & Lainnya')),
  icon TEXT NOT NULL DEFAULT '🥤',
  bg_gradient TEXT,
  style_3d JSONB, -- Stores 3D rendering properties: { shape, bodyColor, labelColor, stripeColor, capColor, metal, rough, trans, shortLabel, hpBoost, tagline }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRANSACTIONS (AUDIT & REKAP LOG) TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  item_id TEXT REFERENCES public.items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY & POLICIES (Public Anon Read/Write for Kiosk App)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public full access on users" ON public.users;
DROP POLICY IF EXISTS "Allow public full access on items" ON public.items;
DROP POLICY IF EXISTS "Allow public full access on transactions" ON public.transactions;

CREATE POLICY "Allow public full access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access on items" ON public.items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- ==============================================================================
-- ONLY ESSENTIAL ADMIN ACCOUNT (NO DUMMY PRODUCTS OR DUMMY USERS)
-- ==============================================================================
INSERT INTO public.users (id, name, email, role, initial_balance, current_balance, avatar) VALUES
('admin-1', 'Super Admin Kulkas', 'admin@sakul.id', 'superadmin', 0, 0, '👨‍💼')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;
