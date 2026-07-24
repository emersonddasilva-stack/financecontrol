-- Finance Core: transactions, categories, accounts, budgets
-- Migration: 20260723180000_finance_core

-- ============================================================
-- 1. TYPES
-- ============================================================
DROP TYPE IF EXISTS public.transaction_type CASCADE;
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

DROP TYPE IF EXISTS public.account_type CASCADE;
CREATE TYPE public.account_type AS ENUM ('corrente', 'credito', 'poupanca', 'digital', 'investimento');

DROP TYPE IF EXISTS public.transaction_status CASCADE;
CREATE TYPE public.transaction_status AS ENUM ('confirmed', 'pending', 'reconciled');

DROP TYPE IF EXISTS public.recurrence_frequency CASCADE;
CREATE TYPE public.recurrence_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'yearly');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User profiles (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  transaction_type public.transaction_type NOT NULL DEFAULT 'expense',
  emoji TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#64748b',
  budget_amount NUMERIC(12,2) DEFAULT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  account_type public.account_type NOT NULL DEFAULT 'corrente',
  initial_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  transaction_type public.transaction_type NOT NULL DEFAULT 'expense',
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'PIX',
  tags TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_frequency public.recurrence_frequency DEFAULT NULL,
  transaction_status public.transaction_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
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
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- categories
DROP POLICY IF EXISTS "users_manage_own_categories" ON public.categories;
CREATE POLICY "users_manage_own_categories"
ON public.categories FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- accounts
DROP POLICY IF EXISTS "users_manage_own_accounts" ON public.accounts;
CREATE POLICY "users_manage_own_accounts"
ON public.accounts FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- transactions
DROP POLICY IF EXISTS "users_manage_own_transactions" ON public.transactions;
CREATE POLICY "users_manage_own_transactions"
ON public.transactions FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_accounts_updated_at ON public.accounts;
CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 8. SEED DATA (for existing auth users if any)
-- ============================================================
DO $$
DECLARE
  existing_user_id UUID;
  cat_moradia UUID := gen_random_uuid();
  cat_alimentacao UUID := gen_random_uuid();
  cat_transporte UUID := gen_random_uuid();
  cat_saude UUID := gen_random_uuid();
  cat_lazer UUID := gen_random_uuid();
  cat_educacao UUID := gen_random_uuid();
  cat_vestuario UUID := gen_random_uuid();
  cat_assinaturas UUID := gen_random_uuid();
  cat_salario UUID := gen_random_uuid();
  cat_freelance UUID := gen_random_uuid();
  acc_itau UUID := gen_random_uuid();
  acc_nubank UUID := gen_random_uuid();
  acc_poupanca UUID := gen_random_uuid();
  acc_inter UUID := gen_random_uuid();
BEGIN
  -- Only seed if user_profiles table has a user
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
      -- Seed categories
      INSERT INTO public.categories (id, user_id, name, transaction_type, emoji, color, budget_amount) VALUES
        (cat_moradia,     existing_user_id, 'Moradia',      'expense', '🏠', '#1e3a5f', 2200),
        (cat_alimentacao, existing_user_id, 'Alimentação',  'expense', '🍔', '#f59e0b', 600),
        (cat_transporte,  existing_user_id, 'Transporte',   'expense', '🚗', '#0284c7', 700),
        (cat_saude,       existing_user_id, 'Saúde',        'expense', '💊', '#16a34a', 500),
        (cat_lazer,       existing_user_id, 'Lazer',        'expense', '🎬', '#dc2626', 350),
        (cat_educacao,    existing_user_id, 'Educação',     'expense', '📚', '#7c3aed', 400),
        (cat_vestuario,   existing_user_id, 'Vestuário',    'expense', '👕', '#be185d', 300),
        (cat_assinaturas, existing_user_id, 'Assinaturas',  'expense', '📱', '#64748b', 150),
        (cat_salario,     existing_user_id, 'Salário',      'income',  '💼', '#16a34a', NULL),
        (cat_freelance,   existing_user_id, 'Freelance',    'income',  '💻', '#0284c7', NULL)
      ON CONFLICT (id) DO NOTHING;

      -- Seed accounts
      INSERT INTO public.accounts (id, user_id, name, institution, account_type, initial_balance, current_balance, is_active) VALUES
        (acc_itau,    existing_user_id, 'Conta Corrente Itaú', 'Banco Itaú',       'corrente',     5000,  3241.55, true),
        (acc_nubank,  existing_user_id, 'Cartão Nubank',       'Nubank',           'credito',      0,    -1847.15, true),
        (acc_poupanca,existing_user_id, 'Poupança Caixa',      'Caixa Econômica',  'poupanca',     8000, 12340.80, true),
        (acc_inter,   existing_user_id, 'Conta Inter',         'Banco Inter',      'digital',      1000,  2150.00, true)
      ON CONFLICT (id) DO NOTHING;

      -- Seed transactions
      INSERT INTO public.transactions (user_id, category_id, account_id, transaction_type, amount, description, transaction_date, payment_method, transaction_status) VALUES
        (existing_user_id, cat_salario,     acc_itau,    'income',  7500,   'Salário Mensal',                 CURRENT_DATE,     'TED',    'confirmed'),
        (existing_user_id, cat_alimentacao, acc_nubank,  'expense', 287.45, 'Supermercado Pão de Açúcar',     CURRENT_DATE,     'Débito', 'confirmed'),
        (existing_user_id, cat_moradia,     acc_itau,    'expense', 2200,   'Aluguel Apartamento',            CURRENT_DATE - 1, 'Boleto', 'reconciled'),
        (existing_user_id, cat_freelance,   acc_itau,    'income',  1250,   'Freelance Design UI',            CURRENT_DATE - 1, 'PIX',    'confirmed'),
        (existing_user_id, cat_transporte,  acc_nubank,  'expense', 180.60, 'Posto de Gasolina Shell',        CURRENT_DATE - 2, 'Crédito','confirmed'),
        (existing_user_id, cat_lazer,       acc_nubank,  'expense', 44.90,  'Netflix Assinatura',             CURRENT_DATE - 2, 'Débito Automático', 'confirmed'),
        (existing_user_id, cat_saude,       acc_itau,    'expense', 280,    'Consulta Médica Dr. Alves',      CURRENT_DATE - 3, 'PIX',    'pending'),
        (existing_user_id, cat_educacao,    acc_nubank,  'expense', 89.90,  'Curso Udemy — React Avançado',   CURRENT_DATE - 4, 'Crédito','confirmed')
      ON CONFLICT (id) DO NOTHING;
    ELSE
      RAISE NOTICE 'No users found in user_profiles. Seed data skipped.';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data failed: %', SQLERRM;
END $$;
