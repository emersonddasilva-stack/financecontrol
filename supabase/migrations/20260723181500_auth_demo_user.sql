-- Auth: Demo user seed for testing
-- Migration: 20260723181500_auth_demo_user

DO $$
DECLARE
  demo_uuid UUID := gen_random_uuid();
BEGIN
  -- Insert demo user into auth.users (trigger will create user_profiles row)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    demo_uuid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo@financecontrol.app',
    crypt('demo1234', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Usuário Demo'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  )
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Demo user seed failed: %', SQLERRM;
END $$;
