-- ============================================================
-- Optimus-Transfert — Database Schema
-- Execute in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE currency AS ENUM ('USD', 'CDF');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('merchant', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_transaction_type AS ENUM ('payment_in', 'commission_out', 'withdrawal_out', 'refund_out', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_link_status AS ENUM ('active', 'expired', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  role        user_role NOT NULL DEFAULT 'merchant',
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================
-- BUSINESSES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.businesses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  logo_url          TEXT,
  email             TEXT,
  phone             TEXT,
  address           TEXT,
  city              TEXT,
  country           TEXT NOT NULL DEFAULT 'République Démocratique du Congo',
  default_currency  currency NOT NULL DEFAULT 'USD',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_merchant_id ON public.businesses(merchant_id);

-- ============================================================
-- WALLETS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  currency        currency NOT NULL,
  available       NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending         NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_received  NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_wallets_merchant_id ON public.wallets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON public.wallets(currency);

-- ============================================================
-- WALLET_TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id     UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type          wallet_transaction_type NOT NULL,
  amount        NUMERIC(14,2) NOT NULL,
  currency      currency NOT NULL,
  reference     TEXT,
  description   TEXT,
  payment_id    UUID,
  withdrawal_id UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON public.customers(merchant_id);

-- ============================================================
-- PAYMENT_LINKS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  reference   TEXT NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  description TEXT NOT NULL,
  amount      NUMERIC(14,2) NOT NULL,
  currency    currency NOT NULL,
  status      payment_link_status NOT NULL DEFAULT 'active',
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_merchant_id ON public.payment_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_reference ON public.payment_links(reference);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON public.payment_links(status);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id       UUID NOT NULL REFERENCES public.payment_links(id) ON DELETE CASCADE,
  merchant_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id           UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount                NUMERIC(14,2) NOT NULL,
  currency              currency NOT NULL,
  commission_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
  commission_rate       NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  status                payment_status NOT NULL DEFAULT 'pending',
  provider              TEXT NOT NULL DEFAULT 'flexpay',
  provider_reference    TEXT,
  provider_transaction_id TEXT,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON public.payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_link_id ON public.payments(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- ============================================================
-- COMMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id  UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount      NUMERIC(14,2) NOT NULL,
  currency    currency NOT NULL,
  rate        NUMERIC(5,4) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commissions_payment_id ON public.commissions(payment_id);

-- ============================================================
-- WITHDRAWALS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id    UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount       NUMERIC(14,2) NOT NULL,
  currency     currency NOT NULL,
  status       withdrawal_status NOT NULL DEFAULT 'pending',
  reference    TEXT,
  processed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_merchant_id ON public.withdrawals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- ============================================================
-- WITHDRAWAL_ACCOUNTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.withdrawal_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_name      TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  swift_code     TEXT,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_accounts_merchant_id ON public.withdrawal_accounts(merchant_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================================
-- SETTINGS (platform-wide key/value)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default commission rate
INSERT INTO public.settings (key, value)
VALUES ('commission_rate', '0.10')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- AUDIT_LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$ BEGIN
  CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER payment_links_updated_at BEFORE UPDATE ON public.payment_links FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER withdrawal_accounts_updated_at BEFORE UPDATE ON public.withdrawal_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'merchant'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- AUTO-CREATE WALLETS (USD + CDF) ON BUSINESS CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (merchant_id, currency)
  VALUES (NEW.merchant_id, 'USD')
  ON CONFLICT (merchant_id, currency) DO NOTHING;

  INSERT INTO public.wallets (merchant_id, currency)
  VALUES (NEW.merchant_id, 'CDF')
  ON CONFLICT (merchant_id, currency) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
  CREATE TRIGGER on_business_created
    AFTER INSERT ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ---- PROFILES ----
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ---- BUSINESSES ----
CREATE POLICY "Merchants can view own business" ON public.businesses
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

CREATE POLICY "Merchants can create own business" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own business" ON public.businesses
  FOR UPDATE USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete own business" ON public.businesses
  FOR DELETE USING (auth.uid() = merchant_id);

-- ---- WALLETS ----
CREATE POLICY "Merchants can view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

-- ---- WALLET_TRANSACTIONS ----
CREATE POLICY "Merchants can view own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (
    auth.uid() = (SELECT merchant_id FROM public.wallets WHERE id = wallet_id)
    OR public.is_admin()
  );

-- ---- PAYMENT_LINKS ----
CREATE POLICY "Merchants can view own payment links" ON public.payment_links
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

CREATE POLICY "Merchants can create own payment links" ON public.payment_links
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own payment links" ON public.payment_links
  FOR UPDATE USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete own payment links" ON public.payment_links
  FOR DELETE USING (auth.uid() = merchant_id);

-- Public can view active payment links by reference (for payment page)
CREATE POLICY "Public can view active payment links" ON public.payment_links
  FOR SELECT USING (status = 'active');

-- ---- PAYMENTS ----
CREATE POLICY "Merchants can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

-- ---- CUSTOMERS ----
CREATE POLICY "Merchants can view own customers" ON public.customers
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

CREATE POLICY "Merchants can create own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete own customers" ON public.customers
  FOR DELETE USING (auth.uid() = merchant_id);

-- ---- WITHDRAWALS ----
CREATE POLICY "Merchants can view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

CREATE POLICY "Merchants can create own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- ---- WITHDRAWAL_ACCOUNTS ----
CREATE POLICY "Merchants can view own withdrawal accounts" ON public.withdrawal_accounts
  FOR SELECT USING (auth.uid() = merchant_id OR public.is_admin());

CREATE POLICY "Merchants can create own withdrawal accounts" ON public.withdrawal_accounts
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own withdrawal accounts" ON public.withdrawal_accounts
  FOR UPDATE USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete own withdrawal accounts" ON public.withdrawal_accounts
  FOR DELETE USING (auth.uid() = merchant_id);

-- ---- COMMISSIONS ----
CREATE POLICY "Merchants can view own commissions" ON public.commissions
  FOR SELECT USING (
    auth.uid() = (SELECT merchant_id FROM public.payments WHERE id = payment_id)
    OR public.is_admin()
  );

-- ---- NOTIFICATIONS ----
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- SETTINGS ----
CREATE POLICY "Anyone can view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON public.settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- AUDIT_LOGS ----
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: merchants can upload/read their own logos
CREATE POLICY "Anyone can read business logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-logos');

CREATE POLICY "Authenticated users can upload business logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
