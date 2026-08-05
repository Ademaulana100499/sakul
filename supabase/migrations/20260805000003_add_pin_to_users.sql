-- Add PIN column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '123456';

-- Ensure superadmin has PIN 123456
UPDATE public.users SET pin = '123456' WHERE role = 'superadmin' AND (pin IS NULL OR pin = '');

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
