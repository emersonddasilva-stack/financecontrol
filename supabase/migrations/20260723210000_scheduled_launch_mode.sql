-- Add launch_mode and postpone tracking to scheduled_transactions
-- Migration: 20260723210000_scheduled_launch_mode

-- ============================================================
-- 1. TYPES
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheduled_launch_mode') THEN
    CREATE TYPE public.scheduled_launch_mode AS ENUM ('auto', 'ask');
  END IF;
END$$;

-- ============================================================
-- 2. ALTER TABLE
-- ============================================================
ALTER TABLE public.scheduled_transactions
  ADD COLUMN IF NOT EXISTS launch_mode public.scheduled_launch_mode NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS postponed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS postponed_until TIMESTAMPTZ DEFAULT NULL;
