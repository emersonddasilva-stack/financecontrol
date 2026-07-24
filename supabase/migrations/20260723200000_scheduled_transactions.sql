-- Scheduled Transactions: future launches with recurrence and projections
-- Migration: 20260723200000_scheduled_transactions

-- ============================================================
-- 1. TYPES
-- ============================================================
DROP TYPE IF EXISTS public.scheduled_recurrence CASCADE;
CREATE TYPE public.scheduled_recurrence AS ENUM ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly');

-- ============================================================
-- 2. TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scheduled_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  transaction_type public.transaction_type NOT NULL DEFAULT 'expense',
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  recurrence public.scheduled_recurrence NOT NULL DEFAULT 'none',
  end_date DATE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_user_id ON public.scheduled_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_date ON public.scheduled_transactions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_active ON public.scheduled_transactions(is_active);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_scheduled_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================
ALTER TABLE public.scheduled_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "users_manage_own_scheduled_transactions" ON public.scheduled_transactions;
CREATE POLICY "users_manage_own_scheduled_transactions"
ON public.scheduled_transactions FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS set_scheduled_transactions_updated_at ON public.scheduled_transactions;
CREATE TRIGGER set_scheduled_transactions_updated_at
  BEFORE UPDATE ON public.scheduled_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_scheduled_updated_at();
