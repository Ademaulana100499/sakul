-- Resolve any duplicate PINs before applying UNIQUE constraint
UPDATE public.users 
SET pin = '100499' 
WHERE role = 'user' AND pin = '123456';

-- Ensure PIN is UNIQUE across all users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pin_unique;
ALTER TABLE public.users ADD CONSTRAINT users_pin_unique UNIQUE (pin);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
