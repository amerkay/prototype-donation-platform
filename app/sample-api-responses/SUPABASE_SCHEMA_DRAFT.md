# Supabase PostgreSQL Schema (Fully Normalized)

> **Design Principle:** Separate tables for all queryable/transactional data. JSONB only for complex configuration fields that vary by type. TEXT + CHECK constraints for status/type fields (not enums — easier to migrate). All tables use `gen_random_uuid()` (native PostgreSQL, no extension needed).

---

## Utility Functions

These shared functions are used across multiple tables and must be created first.

```sql
-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-set created_by / updated_by from auth context
CREATE OR REPLACE FUNCTION set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the authenticated user has at least the given role in an organization.
-- Role hierarchy: viewer < member < admin < owner
CREATE OR REPLACE FUNCTION has_role_in_org(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND organization_id = org_id
      AND (
        CASE required_role
          WHEN 'viewer' THEN role IN ('viewer', 'member', 'admin', 'owner')
          WHEN 'member' THEN role IN ('member', 'admin', 'owner')
          WHEN 'admin'  THEN role IN ('admin', 'owner')
          WHEN 'owner'  THEN role = 'owner'
        END
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

## Core Tables

### Organizations & Admin Profiles

```sql
-- ============================================
-- ORGANIZATIONS & ADMIN PROFILES
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Admin user profiles (linked to Supabase auth.users)
-- A trigger on auth.users INSERT auto-creates this row.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, organization_id, full_name, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'organization_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Currency Settings

```sql
-- ============================================
-- CURRENCY SETTINGS
-- ============================================
CREATE TABLE currency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  default_currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE TABLE supported_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_settings_id UUID NOT NULL REFERENCES currency_settings(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  multiplier DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(currency_settings_id, currency_code)
);

CREATE INDEX idx_supported_currencies_settings ON supported_currencies(currency_settings_id);
```

> **Exchange rates** are fetched at runtime from an external API (e.g., exchangerate-api.com). They are not stored in the database. The `supported_currencies.multiplier` field is an org-level display multiplier for preset amounts, not a live FX rate.

---

### Campaigns

```sql
-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'standard'
    CHECK (type IN ('standard', 'p2p', 'fundraiser')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  p2p_preset TEXT
    CHECK (p2p_preset IN ('birthday', 'tribute', 'challenge', 'wedding')),
  parent_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  -- parent_campaign_id: set only for type='fundraiser', points to the P2P template

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  -- soft delete: NULL = active, set = soft-deleted

  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type ON campaigns(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_parent ON campaigns(parent_campaign_id)
  WHERE parent_campaign_id IS NOT NULL;
CREATE INDEX idx_campaigns_deleted ON campaigns(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER campaigns_audit
  BEFORE INSERT OR UPDATE ON campaigns FOR EACH ROW
  EXECUTE FUNCTION set_audit_fields();

-- Campaign aggregated statistics (materialized from transactions via triggers)
CREATE TABLE campaign_stats (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  total_raised DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_donations INT NOT NULL DEFAULT 0,
  total_donors INT NOT NULL DEFAULT 0,
  average_donation DECIMAL(10,2) NOT NULL DEFAULT 0,
  top_donation DECIMAL(10,2) NOT NULL DEFAULT 0,
  days_remaining INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crowdfunding page settings
CREATE TABLE campaign_crowdfunding (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  cover_photo TEXT,
  -- cover_photo: path in Supabase Storage bucket 'campaign-assets'
  title TEXT,
  short_description TEXT,
  story TEXT,
  show_progress_bar BOOLEAN NOT NULL DEFAULT true,
  show_recent_donations BOOLEAN NOT NULL DEFAULT true,
  default_donations_view TEXT NOT NULL DEFAULT 'recent'
    CHECK (default_donations_view IN ('recent', 'top')),
  number_of_donations_to_show INT NOT NULL DEFAULT 5,
  goal_amount DECIMAL(12,2)
);

-- Peer-to-peer fundraising settings
CREATE TABLE campaign_peer_to_peer (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  allow_individuals BOOLEAN NOT NULL DEFAULT true,
  allow_teams BOOLEAN NOT NULL DEFAULT true,
  fundraiser_goal_default DECIMAL(10,2),
  custom_message TEXT
);

-- Charity information
CREATE TABLE campaign_charity (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  registration_number TEXT,
  website TEXT,
  description TEXT
);

-- Social sharing settings
CREATE TABLE campaign_social_sharing (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  facebook BOOLEAN NOT NULL DEFAULT true,
  twitter BOOLEAN NOT NULL DEFAULT true,
  linkedin BOOLEAN NOT NULL DEFAULT true,
  whatsapp BOOLEAN NOT NULL DEFAULT true,
  email BOOLEAN NOT NULL DEFAULT true,
  copy_link BOOLEAN NOT NULL DEFAULT true
);
```

### Campaign Transactional Data

```sql
-- ============================================
-- CAMPAIGN TRANSACTIONAL DATA
-- ============================================

-- Campaign fundraisers (individuals raising for a P2P campaign)
CREATE TABLE campaign_fundraisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  -- campaign_id: the fundraiser's own campaign (type='fundraiser')
  parent_campaign_id UUID NOT NULL REFERENCES campaigns(id),
  -- parent_campaign_id: the P2P template campaign this fundraiser belongs to
  donor_user_id UUID REFERENCES donor_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  goal DECIMAL(10,2),
  slug TEXT NOT NULL,
  story TEXT,
  cover_photo TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'removed')),
  raised_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  donation_count INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fundraisers_parent ON campaign_fundraisers(parent_campaign_id);
CREATE INDEX idx_fundraisers_donor ON campaign_fundraisers(donor_user_id)
  WHERE donor_user_id IS NOT NULL;
CREATE INDEX idx_fundraisers_raised ON campaign_fundraisers(raised_amount DESC);
CREATE INDEX idx_fundraisers_slug ON campaign_fundraisers(parent_campaign_id, slug);
```

> **Note:** `campaign_donations` is replaced by a VIEW over `transactions` (see below). Campaign donation previews and leaderboards query `transactions` directly, filtered by `campaign_id`.

```sql
-- Campaign donations view (lightweight CampaignDonation shape for crowdfunding pages)
CREATE VIEW campaign_donations_view AS
SELECT
  t.id,
  t.campaign_id,
  CASE WHEN t.is_anonymous THEN 'Anonymous' ELSE t.donor_name END AS donor_name,
  t.subtotal AS amount,
  t.currency,
  t.message,
  t.is_anonymous,
  t.created_at
FROM transactions t
WHERE t.status = 'succeeded';
```

---

### Donor Portal Tables

```sql
-- ============================================
-- DONOR PORTAL
-- ============================================

-- Donor user accounts (public-facing donors, not admin users)
-- Optionally linked to Supabase Auth for self-service portal access.
CREATE TABLE donor_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  -- NULL for guest donors, set when donor creates a portal account
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_donor_users_email ON donor_users(email);
CREATE INDEX idx_donor_users_auth ON donor_users(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE TRIGGER donor_users_updated_at
  BEFORE UPDATE ON donor_users FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Recurring subscriptions (Stripe Subscription / PayPal Billing Agreement)
-- Defined BEFORE transactions because transactions.subscription_id references this table.
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor TEXT NOT NULL
    CHECK (processor IN ('stripe', 'paypal')),
  processor_subscription_id TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  campaign_name TEXT NOT NULL,
  charity_name TEXT NOT NULL,
  donor_user_id UUID REFERENCES donor_users(id) ON DELETE SET NULL,

  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  frequency TEXT NOT NULL
    CHECK (frequency IN ('monthly', 'yearly')),

  payment_method_type TEXT NOT NULL
    CHECK (payment_method_type IN ('card', 'paypal', 'bank_transfer')),
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  payment_method_email TEXT,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_subscriptions_campaign ON subscriptions(campaign_id);
CREATE INDEX idx_subscriptions_donor ON subscriptions(donor_user_id)
  WHERE donor_user_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Subscription line items (supports multi-item Impact Cart subscriptions)
CREATE TABLE subscription_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_icon TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL
    CHECK (frequency IN ('monthly', 'yearly')),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_subscription_line_items_sub ON subscription_line_items(subscription_id);

-- All payment transactions (one-time and subscription billing)
-- Single source of truth for all donations across all campaigns.
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  -- denormalized from campaign for RLS; set on insert
  processor TEXT NOT NULL
    CHECK (processor IN ('stripe', 'paypal')),
  processor_transaction_id TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('one_time', 'subscription_payment')),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  campaign_name TEXT NOT NULL,
  charity_name TEXT NOT NULL,

  subtotal DECIMAL(10,2) NOT NULL,
  cover_costs_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',

  payment_method_type TEXT NOT NULL
    CHECK (payment_method_type IN ('card', 'paypal', 'bank_transfer')),
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  payment_method_email TEXT,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),

  donor_user_id UUID REFERENCES donor_users(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  gift_aid BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  receipt_url TEXT
);

CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_campaign ON transactions(campaign_id);
CREATE INDEX idx_transactions_donor_email ON transactions(donor_email);
CREATE INDEX idx_transactions_donor_user ON transactions(donor_user_id)
  WHERE donor_user_id IS NOT NULL;
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_amount ON transactions(total_amount DESC);
-- Composite index for campaign_donations_view
CREATE INDEX idx_transactions_campaign_donations
  ON transactions(campaign_id, status, created_at DESC)
  WHERE status = 'succeeded';

-- Transaction line items (supports Impact Cart multi-item checkouts)
CREATE TABLE transaction_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_icon TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL
    CHECK (frequency IN ('once', 'monthly', 'yearly')),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_transaction_line_items_txn ON transaction_line_items(transaction_id);

-- Transaction tributes (memorial / gift dedications)
CREATE TABLE transaction_tributes (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('gift', 'memorial')),
  honoree_name TEXT NOT NULL
);
```

---

### Products

```sql
-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  -- price: NULL if variable pricing, set if fixed
  min_price DECIMAL(10,2),
  -- min_price: minimum for variable pricing
  default_amount DECIMAL(10,2),
  -- default_amount: suggested default for variable pricing
  frequency TEXT NOT NULL
    CHECK (frequency IN ('once', 'monthly', 'yearly')),
  image TEXT,
  thumbnail TEXT,
  icon TEXT,
  is_shipping_required BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_products_org ON products(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_frequency ON products(frequency) WHERE deleted_at IS NULL;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER products_audit
  BEFORE INSERT OR UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION set_audit_fields();
```

---

### Campaign Forms

```sql
-- ============================================
-- CAMPAIGN FORMS
-- ============================================
CREATE TABLE campaign_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,

  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_campaign_forms_campaign ON campaign_forms(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaign_forms_default ON campaign_forms(campaign_id, is_default)
  WHERE is_default = true AND deleted_at IS NULL;

CREATE TRIGGER campaign_forms_updated_at
  BEFORE UPDATE ON campaign_forms FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER campaign_forms_audit
  BEFORE INSERT OR UPDATE ON campaign_forms FOR EACH ROW
  EXECUTE FUNCTION set_audit_fields();

-- Junction table: form <-> products (many-to-many)
CREATE TABLE form_products (
  form_id UUID NOT NULL REFERENCES campaign_forms(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (form_id, product_id)
);

CREATE INDEX idx_form_products_product ON form_products(product_id);
```

### Form Settings

```sql
-- ============================================
-- FORM SETTINGS
-- ============================================
CREATE TABLE form_settings (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  base_default_currency TEXT NOT NULL DEFAULT 'GBP'
);

-- Donation frequency configurations (one-time, monthly, yearly)
CREATE TABLE form_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES campaign_forms(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL
    CHECK (frequency IN ('once', 'monthly', 'yearly')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  label TEXT NOT NULL,
  enable_amount_descriptions BOOLEAN NOT NULL DEFAULT false,
  custom_amount_min DECIMAL(10,2),
  custom_amount_max DECIMAL(10,2),
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(form_id, frequency)
);

CREATE INDEX idx_form_frequencies_form ON form_frequencies(form_id);

-- Preset donation amounts for each frequency
CREATE TABLE form_preset_amounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_frequency_id UUID NOT NULL REFERENCES form_frequencies(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  short_text TEXT,
  image TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_form_preset_amounts_frequency ON form_preset_amounts(form_frequency_id);
```

### Form Features

```sql
-- ============================================
-- FORM FEATURES (one table per feature)
-- ============================================
CREATE TABLE form_feature_impact_boost (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  recurring_boost_message TEXT,
  increase_boost_message TEXT,
  enable_recurring_boost BOOLEAN NOT NULL DEFAULT false,
  enable_increase_boost BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE form_feature_impact_cart (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  initial_display INT NOT NULL DEFAULT 3
);

CREATE TABLE form_feature_product_selector (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  entity_singular TEXT,
  entity_plural TEXT,
  action_verb TEXT,
  action_noun TEXT
);

CREATE TABLE form_feature_cover_costs (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  heading TEXT,
  description TEXT,
  default_percentage INT NOT NULL DEFAULT 0
);

CREATE TABLE form_feature_gift_aid (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE form_feature_tribute (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  show_for_once_frequency BOOLEAN NOT NULL DEFAULT true,
  icon_gift TEXT NOT NULL DEFAULT '🎁',
  icon_memorial TEXT NOT NULL DEFAULT '🕊️',
  icon_tribute TEXT NOT NULL DEFAULT '💝',
  none_label TEXT NOT NULL DEFAULT 'No, thank you',
  gift_enabled BOOLEAN NOT NULL DEFAULT true,
  memorial_enabled BOOLEAN NOT NULL DEFAULT true,
  modal_title TEXT,
  modal_subtitle TEXT
);
```

### Lookups

```sql
-- ============================================
-- LOOKUP TABLES
-- ============================================
-- Tribute relationships (per-organization or global defaults)
CREATE TABLE tribute_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  -- NULL = system-wide default
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_tribute_relationships_org ON tribute_relationships(organization_id);
```

### Custom Fields

```sql
-- ============================================
-- CUSTOM FIELDS (with justified JSONB)
-- ============================================
CREATE TABLE form_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES campaign_forms(id) ON DELETE CASCADE,
  step TEXT NOT NULL
    CHECK (step IN ('step2', 'step3', 'hidden')),
  field_order INT NOT NULL DEFAULT 0,
  field_type TEXT NOT NULL
    CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'hidden')),
  field_id TEXT NOT NULL,
  -- internal identifier (e.g., "text_company_name")
  label TEXT NOT NULL,
  default_value TEXT,
  -- Advanced settings vary by field_type — JSONB justified:
  -- text: {optional, placeholder, maxLength}
  -- textarea: {optional, placeholder, rows}
  -- select: {optional, placeholder, options: [{value, label}]}
  -- checkbox: {optional, label}
  -- hidden: {defaultValue}
  advanced_settings JSONB,
  -- Visibility conditions — JSONB justified (recursive AND/OR logic):
  -- {visibleWhen: {conditions: [{field, operator, value}], match: 'all'|'any'}}
  visibility_conditions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_custom_fields_form ON form_custom_fields(form_id);
CREATE INDEX idx_form_custom_fields_step ON form_custom_fields(form_id, step);
```

---

## Trigger Functions

### Campaign Stats Materialization

```sql
-- ============================================
-- CAMPAIGN STATS TRIGGER
-- ============================================
-- Recomputes campaign_stats whenever a transaction is inserted, updated, or deleted.
-- Uses a full recompute (not incremental) for correctness on status changes and refunds.
CREATE OR REPLACE FUNCTION refresh_campaign_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_campaign_id UUID;
BEGIN
  -- Determine which campaign to refresh
  IF TG_OP = 'DELETE' THEN
    target_campaign_id := OLD.campaign_id;
  ELSE
    target_campaign_id := NEW.campaign_id;
  END IF;

  INSERT INTO campaign_stats (campaign_id, total_raised, total_donations, total_donors, average_donation, top_donation, updated_at)
  SELECT
    target_campaign_id,
    COALESCE(SUM(subtotal), 0),
    COUNT(*),
    COUNT(DISTINCT donor_email),
    COALESCE(AVG(subtotal), 0),
    COALESCE(MAX(subtotal), 0),
    now()
  FROM transactions
  WHERE campaign_id = target_campaign_id AND status = 'succeeded'
  ON CONFLICT (campaign_id) DO UPDATE SET
    total_raised     = EXCLUDED.total_raised,
    total_donations  = EXCLUDED.total_donations,
    total_donors     = EXCLUDED.total_donors,
    average_donation = EXCLUDED.average_donation,
    top_donation     = EXCLUDED.top_donation,
    updated_at       = now();

  -- Also refresh the old campaign if campaign_id changed on UPDATE
  IF TG_OP = 'UPDATE' AND OLD.campaign_id != NEW.campaign_id THEN
    INSERT INTO campaign_stats (campaign_id, total_raised, total_donations, total_donors, average_donation, top_donation, updated_at)
    SELECT
      OLD.campaign_id,
      COALESCE(SUM(subtotal), 0),
      COUNT(*),
      COUNT(DISTINCT donor_email),
      COALESCE(AVG(subtotal), 0),
      COALESCE(MAX(subtotal), 0),
      now()
    FROM transactions
    WHERE campaign_id = OLD.campaign_id AND status = 'succeeded'
    ON CONFLICT (campaign_id) DO UPDATE SET
      total_raised     = EXCLUDED.total_raised,
      total_donations  = EXCLUDED.total_donations,
      total_donors     = EXCLUDED.total_donors,
      average_donation = EXCLUDED.average_donation,
      top_donation     = EXCLUDED.top_donation,
      updated_at       = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_refresh_stats
  AFTER INSERT OR UPDATE OF status, subtotal, campaign_id OR DELETE
  ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION refresh_campaign_stats();
```

### Fundraiser Stats Materialization

```sql
-- ============================================
-- FUNDRAISER STATS TRIGGER
-- ============================================
-- Updates raised_amount / donation_count on campaign_fundraisers
-- when transactions change for their campaign.
CREATE OR REPLACE FUNCTION refresh_fundraiser_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_campaign_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_campaign_id := OLD.campaign_id;
  ELSE
    target_campaign_id := NEW.campaign_id;
  END IF;

  UPDATE campaign_fundraisers SET
    raised_amount = sub.total,
    donation_count = sub.cnt
  FROM (
    SELECT
      COALESCE(SUM(subtotal), 0) AS total,
      COUNT(*) AS cnt
    FROM transactions
    WHERE campaign_id = target_campaign_id AND status = 'succeeded'
  ) sub
  WHERE campaign_fundraisers.campaign_id = target_campaign_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_refresh_fundraiser
  AFTER INSERT OR UPDATE OF status, subtotal, campaign_id OR DELETE
  ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION refresh_fundraiser_stats();
```

---

## Row-Level Security (RLS) Policies

> **Critical:** RLS must be enabled on every table with user data. Supabase disables RLS by default — forgetting to enable it exposes all rows via the auto-generated API.

### Enable RLS on All Tables

```sql
-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_crowdfunding ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_peer_to_peer ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_charity ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_social_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_preset_amounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_feature_impact_boost ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_feature_impact_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_feature_product_selector ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_feature_cover_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_feature_gift_aid ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_feature_tribute ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribute_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_custom_fields ENABLE ROW LEVEL SECURITY;
```

### Policy Templates

```sql
-- ============================================
-- RLS POLICY TEMPLATES
-- ============================================

-- --- Organizations ---
-- Members can view their own organization
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Only owners can update organization
CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (has_role_in_org(id, 'owner'));

-- --- Profiles ---
-- Users can view profiles in their org
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles p WHERE p.id = auth.uid()));

-- Users can update their own profile
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- --- Campaigns (admin) ---
-- Org members can view non-deleted campaigns
CREATE POLICY "campaigns_select_admin" ON campaigns FOR SELECT
  USING (has_role_in_org(organization_id, 'viewer') AND deleted_at IS NULL);

-- Org admins can create/update campaigns
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT
  WITH CHECK (has_role_in_org(organization_id, 'admin'));

CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE
  USING (has_role_in_org(organization_id, 'admin'));

-- --- Campaigns (public / donor-facing) ---
-- Anyone can view active campaigns (for crowdfunding pages)
CREATE POLICY "campaigns_select_public" ON campaigns FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- --- Transactions ---
-- Org admins can view all transactions for their org
CREATE POLICY "transactions_select_admin" ON transactions FOR SELECT
  USING (has_role_in_org(organization_id, 'admin'));

-- Donors can view their own transactions
CREATE POLICY "transactions_select_donor" ON transactions FOR SELECT
  USING (
    donor_user_id IN (
      SELECT id FROM donor_users WHERE auth_user_id = auth.uid()
    )
  );

-- --- Donor Users ---
-- Donors can view/update their own profile
CREATE POLICY "donor_users_select_self" ON donor_users FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "donor_users_update_self" ON donor_users FOR UPDATE
  USING (auth_user_id = auth.uid());

-- --- Subscriptions ---
-- Donors can view their own subscriptions
CREATE POLICY "subscriptions_select_donor" ON subscriptions FOR SELECT
  USING (
    donor_user_id IN (
      SELECT id FROM donor_users WHERE auth_user_id = auth.uid()
    )
  );

-- --- Campaign Crowdfunding (public) ---
-- Anyone can view crowdfunding settings for active campaigns
CREATE POLICY "crowdfunding_select_public" ON campaign_crowdfunding FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE status = 'active' AND deleted_at IS NULL
    )
  );

-- --- Campaign Fundraisers (public) ---
-- Anyone can view active fundraisers
CREATE POLICY "fundraisers_select_public" ON campaign_fundraisers FOR SELECT
  USING (status = 'active');
```

> **Note:** These are starter policies. Extend them per table as needed. Campaign sub-tables (crowdfunding, charity, forms, etc.) should follow the same org-scoped admin pattern and public-read pattern shown above.

---

## Supabase Storage Buckets

```sql
-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Public bucket for campaign cover photos, product images, fundraiser photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-assets',
  'campaign-assets',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage RLS: org admins can upload/update/delete within their org folder
CREATE POLICY "campaign_assets_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'campaign-assets'
    AND has_role_in_org((storage.foldername(name))[1]::UUID, 'admin')
  );

CREATE POLICY "campaign_assets_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'campaign-assets'
    AND has_role_in_org((storage.foldername(name))[1]::UUID, 'admin')
  );

CREATE POLICY "campaign_assets_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'campaign-assets'
    AND has_role_in_org((storage.foldername(name))[1]::UUID, 'admin')
  );

-- Public read (bucket is public)
CREATE POLICY "campaign_assets_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-assets');
```

> **File path convention:** `{organization_id}/{campaign_id}/{filename}` — e.g., `a1b2c3/d4e5f6/cover.webp`

---

## JSONB Field Justification

| Column                  | Location             | Why JSONB?                                                                                                                                   |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `advanced_settings`     | `form_custom_fields` | Schema varies by field type (text has maxLength, textarea has rows, select has options array). Normalizing would require 5+ junction tables. |
| `visibility_conditions` | `form_custom_fields` | Recursive condition tree with AND/OR logic. Evaluated in application layer. Normalizing adds complexity without query benefit.               |

All other configuration uses separate columns for: direct SQL querying, Supabase RLS per table, real-time subscriptions, and DB-level type safety.

---

## Table Statistics

| Category             | Count  | Tables                                                                                                             |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Organizations & Auth | 4      | organizations, profiles, currency_settings, supported_currencies                                                   |
| Campaigns            | 6      | campaigns, campaign_stats, campaign_crowdfunding, campaign_peer_to_peer, campaign_charity, campaign_social_sharing |
| Campaign Data        | 1      | campaign_fundraisers                                                                                               |
| Donor Portal         | 8      | donor_users, subscriptions, subscription_line_items, transactions, transaction_line_items, transaction_tributes    |
| Products             | 1      | products                                                                                                           |
| Forms                | 2      | campaign_forms, form_products (junction)                                                                           |
| Form Settings        | 3      | form_settings, form_frequencies, form_preset_amounts                                                               |
| Form Features        | 6      | form*feature*\* (one per feature)                                                                                  |
| Lookups              | 1      | tribute_relationships                                                                                              |
| Custom Fields        | 1      | form_custom_fields                                                                                                 |
| **Total**            | **33** | + 1 view (`campaign_donations_view`) + 1 storage bucket                                                            |

---

## Key Design Decisions

### Supabase Auth Integration

Two separate user types with different auth patterns:

1. **Admin users** (`profiles`): `id` = `auth.users.id` (1:1). Auto-created via trigger on signup. Scoped to an organization with role-based access.
2. **Donor users** (`donor_users`): Separate `id` with optional `auth_user_id` link. Donors can exist without auth (guest checkout) and optionally create a portal account later. Uses `ON DELETE SET NULL` so deleting the auth account preserves donation history.

### Why `transactions` replaces `campaign_donations`

`transactions` is the single source of truth. The `campaign_donations_view` provides the lightweight shape needed for crowdfunding pages without data duplication.

### `campaign_stats` as Materialized Data

`campaign_stats` is refreshed via the `refresh_campaign_stats()` trigger on every transaction INSERT/UPDATE/DELETE. Uses `INSERT ... ON CONFLICT DO UPDATE` (upsert) for atomic recomputation.

### Soft Deletes

`deleted_at TIMESTAMPTZ` on `campaigns`, `products`, and `campaign_forms`. Partial indexes (`WHERE deleted_at IS NULL`) ensure soft-deleted rows don't slow down normal queries. RLS policies filter out deleted rows by default.

### TEXT + CHECK vs Enums

All status/type columns use `TEXT NOT NULL CHECK (value IN (...))` instead of PostgreSQL enums. Reasons:

- Easier to add/remove values (simple `ALTER TABLE ... DROP/ADD CONSTRAINT`)
- No need to drop and recreate enum types during migrations
- Supabase migration tooling works better with constraints
- Negligible storage difference for this data volume

### `organization_id` on `transactions`

Denormalized from `campaigns.organization_id` and set on insert. This allows RLS policies on `transactions` to scope by org without joining to `campaigns` on every row access — a significant performance optimization for the most queried table.

### Table Ordering (FK Dependencies)

`subscriptions` is defined before `transactions` because `transactions.subscription_id` references `subscriptions.id`. Similarly, `donor_users` is defined before both, and `products` before line item tables.

### Why Separate Tables (Not JSONB)

1. **Queryable data**: transactions, subscriptions, fundraisers, form frequencies, preset amounts — all need filtering, aggregation, sorting, pagination
2. **Transactional integrity**: Foreign keys enforce referential integrity
3. **Supabase benefits**: RLS per table, real-time subscriptions, auto-generated PostgREST endpoints
4. **Performance**: Direct indexed queries vs JSONB extraction operators

---

## Data Access Patterns

### Frontend Query Examples (PostgREST)

```typescript
// Get full campaign with all related data
const campaign = await supabase
  .from('campaigns')
  .select(
    `
    *,
    campaign_stats(*),
    campaign_crowdfunding(*),
    campaign_charity(*),
    campaign_peer_to_peer(*),
    campaign_social_sharing(*),
    campaign_fundraisers(*)
  `
  )
  .eq('id', campaignId)
  .is('deleted_at', null)
  .single()

// Get recent donations for a campaign (via the view)
const donations = await supabase
  .from('campaign_donations_view')
  .select('*')
  .eq('campaign_id', campaignId)
  .order('created_at', { ascending: false })
  .limit(10)

// Get form with all settings and features
const form = await supabase
  .from('campaign_forms')
  .select(
    `
    *,
    form_settings(*),
    form_frequencies(*, form_preset_amounts(*)),
    form_products(*, products:product_id(*)),
    form_feature_impact_boost(*),
    form_feature_impact_cart(*),
    form_feature_product_selector(*),
    form_feature_cover_costs(*),
    form_feature_gift_aid(*),
    form_feature_tribute(*),
    form_custom_fields(*)
  `
  )
  .eq('id', formId)
  .is('deleted_at', null)
  .single()

// Get donor's transaction history
const history = await supabase
  .from('transactions')
  .select(
    `
    *,
    transaction_line_items(*),
    transaction_tributes(*)
  `
  )
  .eq('donor_user_id', userId)
  .order('created_at', { ascending: false })

// Get donor's active subscriptions
const subs = await supabase
  .from('subscriptions')
  .select(
    `
    *,
    subscription_line_items(*)
  `
  )
  .eq('donor_user_id', userId)
  .eq('status', 'active')

// Get top fundraisers for a P2P campaign
const topFundraisers = await supabase
  .from('campaign_fundraisers')
  .select('*')
  .eq('parent_campaign_id', campaignId)
  .order('raised_amount', { ascending: false })
  .limit(10)
```

---

## Migration Path

1. **Phase 1 — Schema**: Run all CREATE TABLE / FUNCTION / TRIGGER statements via `supabase migration new`
2. **Phase 2 — RLS**: Enable RLS and create policies. Test with `anon` and authenticated keys (never `service_role`)
3. **Phase 3 — Storage**: Create bucket and storage policies
4. **Phase 4 — Seed**: Migrate sample-api-response data into Supabase seed files
5. **Phase 5 — Frontend**: Replace mock API imports with Supabase client queries
6. **Phase 6 — Cleanup**: Remove `app/sample-api-responses/` directory

---

## Future Enhancements

- **Full audit trail**: Enable `supa_audit` extension for change logging on key tables
- **Full-text search**: Add `tsvector` columns + GIN indexes on campaign names/descriptions
- **Materialized views**: Dashboard aggregations (donations by day/week/month)
- **Edge Functions**: Stripe/PayPal webhook handlers for transaction creation
- **Realtime**: Subscribe to `campaign_stats` changes for live crowdfunding page updates
- **UUIDv7**: Consider `pg_uuidv7` extension for time-ordered PKs on high-volume tables (transactions) for better B-tree locality
