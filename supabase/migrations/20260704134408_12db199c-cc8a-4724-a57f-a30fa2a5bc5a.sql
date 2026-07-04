
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS note TEXT;
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role);
