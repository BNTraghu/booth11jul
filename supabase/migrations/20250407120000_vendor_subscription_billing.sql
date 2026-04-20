-- Vendor subscription plans and billing tables (DB-backed Plans & Billing page)

CREATE TABLE IF NOT EXISTS public.vendor_subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  monthly_price_inr integer NOT NULL DEFAULT 0 CHECK (monthly_price_inr >= 0),
  trial_days integer NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  rank_order integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.vendor_subscription_plans IS 'Master vendor subscription plans shown in Billing UI.';

CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.vendor_subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  start_date date NOT NULL DEFAULT current_date,
  end_date date,
  auto_renew boolean NOT NULL DEFAULT true,
  trial_ends_at timestamptz,
  monthly_price_inr integer NOT NULL DEFAULT 0 CHECK (monthly_price_inr >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_org ON public.vendor_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_plan ON public.vendor_subscriptions(plan_id);

CREATE TABLE IF NOT EXISTS public.vendor_billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.vendor_subscriptions(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  plan_id uuid REFERENCES public.vendor_subscription_plans(id) ON DELETE SET NULL,
  amount_inr integer NOT NULL DEFAULT 0 CHECK (amount_inr >= 0),
  issue_date date NOT NULL DEFAULT current_date,
  due_date date,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_vendor_billing_invoices_org ON public.vendor_billing_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_billing_invoices_plan ON public.vendor_billing_invoices(plan_id);

ALTER TABLE public.vendor_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_billing_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendor_subscription_plans_select" ON public.vendor_subscription_plans;
CREATE POLICY "vendor_subscription_plans_select"
  ON public.vendor_subscription_plans FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "vendor_subscription_plans_mutate_super_admin" ON public.vendor_subscription_plans;
CREATE POLICY "vendor_subscription_plans_mutate_super_admin"
  ON public.vendor_subscription_plans FOR ALL TO authenticated
  USING (COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin')
  WITH CHECK (COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin');

DROP POLICY IF EXISTS "vendor_subscriptions_select" ON public.vendor_subscriptions;
CREATE POLICY "vendor_subscriptions_select"
  ON public.vendor_subscriptions FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  );

DROP POLICY IF EXISTS "vendor_subscriptions_insert_update_delete" ON public.vendor_subscriptions;
CREATE POLICY "vendor_subscriptions_insert_update_delete"
  ON public.vendor_subscriptions FOR ALL TO authenticated
  USING (COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin')
  WITH CHECK (COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin');

DROP POLICY IF EXISTS "vendor_billing_invoices_select" ON public.vendor_billing_invoices;
CREATE POLICY "vendor_billing_invoices_select"
  ON public.vendor_billing_invoices FOR SELECT TO authenticated
  USING (
    organization_id = (SELECT u.organization_id FROM public.users u WHERE u.id = auth.uid())
    OR COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin'
  );

DROP POLICY IF EXISTS "vendor_billing_invoices_insert_update_delete" ON public.vendor_billing_invoices;
CREATE POLICY "vendor_billing_invoices_insert_update_delete"
  ON public.vendor_billing_invoices FOR ALL TO authenticated
  USING (COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin')
  WITH CHECK (COALESCE((SELECT u.role FROM public.users u WHERE u.id = auth.uid()), '') = 'super_admin');

-- Seed plans requested in product discussion:
-- 1) Free for 3 months
-- 2) Professional INR 299/month
-- 3) Premium INR 599/month
INSERT INTO public.vendor_subscription_plans
  (code, name, description, monthly_price_inr, trial_days, is_active, is_popular, rank_order, features, limits)
VALUES
  (
    'free',
    'Free',
    'Get started free for 3 months.',
    0,
    90,
    true,
    false,
    1,
    '["Event management basics","Exhibitor onboarding","Standard support"]'::jsonb,
    '{
      "areas": {
        "core": "Admin portal access for 1 organization",
        "events": "Up to 3 active events",
        "storage": "500 MB media storage",
        "users": "Up to 3 team users",
        "registrations": "Basic exhibitor registrations and approvals",
        "sponsors_ads": "Not included"
      },
      "promotional_video_ads": false,
      "max_active_campaigns": 0
    }'::jsonb
  ),
  (
    'professional',
    'Professional',
    'Best for growing teams with promotional campaigns.',
    299,
    0,
    true,
    true,
    2,
    '["Everything in Free","Promotional videos & advertisements","Priority support"]'::jsonb,
    '{
      "areas": {
        "core": "Everything in Free",
        "events": "Up to 15 active events",
        "storage": "5 GB media storage",
        "users": "Up to 10 team users",
        "registrations": "Advanced registration workflow",
        "sponsors_ads": "Includes promotional videos and ads"
      },
      "promotional_video_ads": true,
      "max_active_campaigns": 3
    }'::jsonb
  ),
  (
    'premium',
    'Premium',
    'Advanced plan with higher limits and campaign scale.',
    599,
    0,
    true,
    false,
    3,
    '["Everything in Professional","Higher ad limits","Advanced reporting"]'::jsonb,
    '{
      "areas": {
        "core": "Everything in Professional",
        "events": "Unlimited active events",
        "storage": "25 GB media storage",
        "users": "Unlimited team users",
        "registrations": "Priority registration operations",
        "sponsors_ads": "Full promotional videos and ads with higher limits"
      },
      "promotional_video_ads": true,
      "max_active_campaigns": 10
    }'::jsonb
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price_inr = EXCLUDED.monthly_price_inr,
  trial_days = EXCLUDED.trial_days,
  is_active = EXCLUDED.is_active,
  is_popular = EXCLUDED.is_popular,
  rank_order = EXCLUDED.rank_order,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  updated_at = now();
