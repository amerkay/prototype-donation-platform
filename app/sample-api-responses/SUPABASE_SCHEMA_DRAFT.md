# Supabase PostgreSQL Schema (Consolidated)

> **Design Principle:** JSONB for configuration that varies by type or is admin-only; separate tables for queryable/transactional data. TEXT + CHECK constraints for status/type fields (not enums — easier to migrate). All tables use `gen_random_uuid()` (native PostgreSQL, no extension needed). 21 tables, down from 35 — achieved by merging campaign sub-tables and form config into JSONB columns, and consolidating org settings into 4 RLS-boundary-aligned tables.

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
-- Role hierarchy: member < admin < owner (linear chain)
-- Developer branch: developer inherits member but NOT admin.
--   developer-specific access (API/webhooks) is checked with has_role_in_org(org, 'developer').
--   admin and owner also pass the 'developer' check (they can do everything).
CREATE OR REPLACE FUNCTION has_role_in_org(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND organization_id = org_id
      AND (
        CASE required_role
          WHEN 'member'    THEN role IN ('member', 'developer', 'admin', 'owner')
          WHEN 'developer' THEN role IN ('developer', 'admin', 'owner')
          WHEN 'admin'     THEN role IN ('admin', 'owner')
          WHEN 'owner'     THEN role = 'owner'
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
    CHECK (role IN ('owner', 'admin', 'developer', 'member')),
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

### Organization Settings (4 Tables by RLS Boundary)

```sql
-- ============================================
-- ORGANIZATION SETTINGS (4 tables by RLS boundary)
-- ============================================

-- General config, branding, social sharing — admin+ can read/write
CREATE TABLE org_config (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- General settings
  general JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { siteName, siteUrl, timezone, dateFormat, defaultLanguage }

  -- Branding settings
  branding JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { primaryColor, secondaryColor, logoUrl, faviconUrl, fontFamily, customCss }

  -- Social sharing settings (org-level platform availability)
  social_sharing JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled, facebook, twitter, linkedin, whatsapp, email, copyLink }

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER org_config_updated_at
  BEFORE UPDATE ON org_config FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Charity identity + currency config — admin+ can read/write
CREATE TABLE org_identity (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- Charity slug (used in donor-facing URLs)
  charity_slug TEXT NOT NULL,

  -- Currency configuration
  currency JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {
  --   defaultCurrency: "GBP",
  --   supportedCurrencies: [
  --     { code: "GBP", multiplier: 1.0, sortOrder: 0 },
  --     { code: "USD", multiplier: 1.25, sortOrder: 1 }
  --   ]
  -- }

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER org_identity_updated_at
  BEFORE UPDATE ON org_identity FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- API keys, webhooks — developer+ can read/write
CREATE TABLE org_integrations (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- API key management
  api_keys JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- [{ id, name, key (hashed), prefix, scopes, createdAt, lastUsedAt, expiresAt }]

  -- Webhook configuration
  webhooks JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- [{ id, url, events, secret (hashed), enabled, createdAt }]

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER org_integrations_updated_at
  BEFORE UPDATE ON org_integrations FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Payment processor config, billing — owner only
CREATE TABLE org_financial (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

  -- Payment processor settings (Stripe Connect, PayPal Connect)
  payments JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {
  --   stripe: { accountId, connected, liveMode, capabilities },
  --   paypal: { merchantId, connected, liveMode },
  --   enabledMethods: ["card", "paypal", "bank_transfer"]
  -- }

  -- Billing / plan info
  billing JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { plan, status, currentPeriodEnd, seats, usage }

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER org_financial_updated_at
  BEFORE UPDATE ON org_financial FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Per-currency charity details (one row per org+currency, all equal status)
CREATE TABLE organization_charity_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  registration_number TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  reply_to_email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  postcode TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  email_sender_id UUID,
  email_sender_name TEXT NOT NULL DEFAULT '',
  email_sender_address TEXT NOT NULL DEFAULT '',
  email_signature TEXT NOT NULL DEFAULT '',
  UNIQUE(organization_id, currency_code)
);

CREATE INDEX idx_org_charity_currencies_org ON organization_charity_currencies(organization_id);
```

> **Exchange rates** are fetched at runtime from an external API (e.g., exchangerate-api.com). They are not stored in the database. The `supportedCurrencies[].multiplier` field in `org_identity.currency` is an org-level display multiplier for preset amounts, not a live FX rate.

---

### Campaigns

```sql
-- ============================================
-- CAMPAIGNS (with merged sub-table JSONB columns)
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

  -- Crowdfunding page settings (was campaign_crowdfunding table)
  crowdfunding JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {
  --   enabled, coverPhoto, title, shortDescription, story,
  --   showProgressBar, showRecentDonations, defaultDonationsView,
  --   numberOfDonationsToShow, goalAmount, endDate
  -- }

  -- Peer-to-peer fundraising settings (was campaign_peer_to_peer table)
  peer_to_peer JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {
  --   enabled, allowIndividuals, allowTeams,
  --   fundraiserGoalDefault, customMessage
  -- }

  -- Charity information override (was campaign_charity table)
  charity JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { name, registrationNumber, website, description }

  -- Social sharing settings override (was campaign_social_sharing table)
  social_sharing JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled, facebook, twitter, linkedin, whatsapp, email, copyLink }

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

---

### Campaign Forms

```sql
-- ============================================
-- CAMPAIGN FORMS (with merged config JSONB columns)
-- ============================================
CREATE TABLE campaign_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Queryable columns (extracted from config for filtering/indexing)
  form_type TEXT NOT NULL DEFAULT 'donation'
    CHECK (form_type IN ('donation', 'registration', 'stall-booking', 'dog-show-entries')),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  base_default_currency TEXT NOT NULL DEFAULT 'GBP',
  enabled_currencies TEXT[] NOT NULL DEFAULT ARRAY['GBP'],

  -- Donation amounts config (was form_frequencies + form_preset_amounts tables)
  donation_amounts JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {
  --   frequencies: [
  --     {
  --       frequency: "once"|"monthly"|"yearly",
  --       enabled: true, label: "One-time",
  --       enableAmountDescriptions: false,
  --       customAmountMin: null, customAmountMax: null,
  --       sortOrder: 0,
  --       presetAmounts: [
  --         { amount: 25, shortText: "Feed a child", image: null, sortOrder: 0 }
  --       ]
  --     }
  --   ]
  -- }

  -- Impact cart settings (was form_feature_impact_cart table)
  impact_cart JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled, initialDisplay }

  -- Product selector settings (was form_feature_product_selector table)
  product_selector JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled, icon, entitySingular, entityPlural, actionVerb, actionNoun }

  -- Impact boost settings (was form_feature_impact_boost table)
  impact_boost JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled, enableRecurringBoost, recurringBoostMessage, enableIncreaseBoost, increaseBoostMessage }

  -- Cover costs settings (was form_feature_cover_costs table)
  cover_costs JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled, heading, description, defaultPercentage }

  -- Gift aid settings (was form_feature_gift_aid table)
  gift_aid JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- { enabled }

  -- Tribute settings (was form_feature_tribute table)
  tribute JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- {
  --   enabled, showForOnceFrequency,
  --   iconGift, iconMemorial, iconTribute,
  --   noneLabel, giftEnabled, memorialEnabled,
  --   modalTitle, modalSubtitle
  -- }

  -- Custom fields config (was form_custom_fields table)
  custom_fields JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- [
  --   {
  --     id: "text_company_name", fieldType: "text"|"textarea"|"select"|"checkbox"|"hidden",
  --     step: "step2"|"step3"|"hidden", fieldOrder: 0,
  --     label: "Company Name", defaultValue: null,
  --     advancedSettings: { optional, placeholder, maxLength, ... },
  --     visibilityConditions: { conditions: [...], match: "all"|"any" }
  --   }
  -- ]

  -- Entry fields config (for registration/stall-booking/dog-show forms)
  entry_fields JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- Form-type-specific entry configuration

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_campaign_forms_campaign ON campaign_forms(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaign_forms_default ON campaign_forms(campaign_id, is_default)
  WHERE is_default = true AND deleted_at IS NULL;
CREATE INDEX idx_campaign_forms_type ON campaign_forms(form_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaign_forms_currency ON campaign_forms(base_default_currency) WHERE deleted_at IS NULL;
-- GIN index for enabled_currencies array containment queries
CREATE INDEX idx_campaign_forms_currencies ON campaign_forms USING GIN (enabled_currencies)
  WHERE deleted_at IS NULL;

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
  -- name: internal admin label (breadcrumbs, sidebar, admin cards)
  title TEXT NOT NULL,
  -- title: donor-facing display title
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
  certificate_title TEXT,
  -- certificate_title: short title shown on certificates (overrides product title)
  certificate_text TEXT,
  -- certificate_text: description shown next to product image on certificates

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

### Donor Portal Tables

```sql
-- ============================================
-- DONOR PORTAL
-- ============================================

-- Donor user accounts (public-facing donors, not admin users)
-- Global model: NO organization_id. RLS via subquery on transactions.
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
  product_title TEXT NOT NULL,
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
  -- denormalized from campaign for RLS; set by trigger on insert
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

  -- Denormalized custom field values (set by application on insert)
  custom_fields JSONB,
  -- { "text_company_name": "Acme Inc", "select_category": "corporate" }

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
-- GIN index for custom fields filtering
CREATE INDEX idx_transactions_custom_fields ON transactions USING GIN (custom_fields)
  WHERE custom_fields IS NOT NULL;

-- Transaction line items (supports Impact Cart multi-item checkouts)
CREATE TABLE transaction_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
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

---

## Views

### Campaign Donations View

```sql
-- ============================================
-- VIEWS
-- ============================================

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

### Donors Summary View

```sql
-- Donors summary view (aggregated donor data for admin lists)
-- Regular VIEW (not materialized) — acceptable for admin dashboard queries.
-- Uses subquery on transactions for per-org scoping.
CREATE VIEW donors_summary_view AS
SELECT
  du.id,
  du.name,
  du.email,
  du.avatar_url,
  du.auth_user_id,
  du.created_at,
  t.organization_id,
  COUNT(t.id) AS total_donations,
  COALESCE(SUM(t.total_amount), 0) AS total_amount,
  MAX(t.created_at) AS last_donation_at,
  MIN(t.created_at) AS first_donation_at,
  COUNT(DISTINCT t.campaign_id) AS campaigns_supported,
  COUNT(DISTINCT t.currency) AS currencies_used,
  BOOL_OR(t.gift_aid) AS has_gift_aid,
  (
    SELECT COUNT(*) FROM subscriptions s
    WHERE s.donor_user_id = du.id AND s.status = 'active'
  ) AS active_subscriptions
FROM donor_users du
JOIN transactions t ON t.donor_user_id = du.id AND t.status = 'succeeded'
GROUP BY du.id, du.name, du.email, du.avatar_url, du.auth_user_id, du.created_at, t.organization_id;
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

### Transaction Denormalization Trigger

```sql
-- ============================================
-- TRANSACTION DENORMALIZATION TRIGGER
-- ============================================
-- Auto-sets organization_id from campaigns on transaction insert.
-- Ensures RLS can scope transactions by org without a join.
CREATE OR REPLACE FUNCTION denormalize_transaction_org()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM campaigns WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_denormalize_org
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION denormalize_transaction_org();
```

### Currency Auto-Population Trigger

```sql
-- ============================================
-- CURRENCY AUTO-POPULATION TRIGGER
-- ============================================
-- When org_identity.currency changes, auto-create/remove
-- organization_charity_currencies rows to match supportedCurrencies.
CREATE OR REPLACE FUNCTION sync_charity_currency_rows()
RETURNS TRIGGER AS $$
DECLARE
  currency_item JSONB;
  currency_code TEXT;
  supported_codes TEXT[];
BEGIN
  -- Extract supported currency codes from JSONB
  SELECT ARRAY(
    SELECT item->>'code'
    FROM jsonb_array_elements(NEW.currency->'supportedCurrencies') AS item
  ) INTO supported_codes;

  -- Insert missing currency rows
  FOR currency_item IN SELECT * FROM jsonb_array_elements(NEW.currency->'supportedCurrencies')
  LOOP
    currency_code := currency_item->>'code';
    INSERT INTO organization_charity_currencies (organization_id, currency_code)
    VALUES (NEW.organization_id, currency_code)
    ON CONFLICT (organization_id, currency_code) DO NOTHING;
  END LOOP;

  -- Remove currency rows no longer in supported list
  DELETE FROM organization_charity_currencies
  WHERE organization_id = NEW.organization_id
    AND currency_code != ALL(supported_codes);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_identity_sync_currencies
  AFTER INSERT OR UPDATE OF currency ON org_identity
  FOR EACH ROW
  EXECUTE FUNCTION sync_charity_currency_rows();
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
ALTER TABLE org_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_financial ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_charity_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribute_relationships ENABLE ROW LEVEL SECURITY;
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

-- --- Org Config (admin+) ---
CREATE POLICY "org_config_select" ON org_config FOR SELECT
  USING (has_role_in_org(organization_id, 'member'));

CREATE POLICY "org_config_upsert" ON org_config FOR ALL
  USING (has_role_in_org(organization_id, 'admin'));

-- --- Org Identity (admin+) ---
CREATE POLICY "org_identity_select" ON org_identity FOR SELECT
  USING (has_role_in_org(organization_id, 'member'));

CREATE POLICY "org_identity_upsert" ON org_identity FOR ALL
  USING (has_role_in_org(organization_id, 'admin'));

-- --- Org Integrations (developer+) ---
CREATE POLICY "org_integrations_select" ON org_integrations FOR SELECT
  USING (has_role_in_org(organization_id, 'developer'));

CREATE POLICY "org_integrations_upsert" ON org_integrations FOR ALL
  USING (has_role_in_org(organization_id, 'developer'));

-- --- Org Financial (owner only) ---
CREATE POLICY "org_financial_select" ON org_financial FOR SELECT
  USING (has_role_in_org(organization_id, 'owner'));

CREATE POLICY "org_financial_upsert" ON org_financial FOR ALL
  USING (has_role_in_org(organization_id, 'owner'));

-- --- Organization Charity Currencies (admin+) ---
CREATE POLICY "charity_currencies_select" ON organization_charity_currencies FOR SELECT
  USING (has_role_in_org(organization_id, 'member'));

CREATE POLICY "charity_currencies_modify" ON organization_charity_currencies FOR ALL
  USING (has_role_in_org(organization_id, 'admin'));

-- --- Campaigns (admin) ---
-- Org members can view non-deleted campaigns
CREATE POLICY "campaigns_select_admin" ON campaigns FOR SELECT
  USING (has_role_in_org(organization_id, 'member') AND deleted_at IS NULL);

-- Org admins can create/update campaigns
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT
  WITH CHECK (has_role_in_org(organization_id, 'admin'));

CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE
  USING (has_role_in_org(organization_id, 'admin'));

-- --- Campaigns (public / donor-facing) ---
-- Anyone can view active campaigns (for crowdfunding pages)
CREATE POLICY "campaigns_select_public" ON campaigns FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- --- Campaign Stats (public for active, admin for all) ---
CREATE POLICY "campaign_stats_select" ON campaign_stats FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE status = 'active' AND deleted_at IS NULL
    )
    OR campaign_id IN (
      SELECT id FROM campaigns WHERE has_role_in_org(organization_id, 'member')
    )
  );

-- --- Campaign Forms (admin + public read for active campaigns) ---
CREATE POLICY "forms_select_admin" ON campaign_forms FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE has_role_in_org(organization_id, 'member')
    ) AND deleted_at IS NULL
  );

CREATE POLICY "forms_select_public" ON campaign_forms FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE status = 'active' AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

CREATE POLICY "forms_modify" ON campaign_forms FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE has_role_in_org(organization_id, 'admin')
    )
  );

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
-- Global model: donors can view/update their own profile
CREATE POLICY "donor_users_select_self" ON donor_users FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "donor_users_update_self" ON donor_users FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Admins can view donors who have transacted with their org
CREATE POLICY "donor_users_select_admin" ON donor_users FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT donor_user_id FROM transactions
      WHERE has_role_in_org(organization_id, 'admin')
        AND donor_user_id IS NOT NULL
    )
  );

-- --- Subscriptions ---
-- Donors can view their own subscriptions
CREATE POLICY "subscriptions_select_donor" ON subscriptions FOR SELECT
  USING (
    donor_user_id IN (
      SELECT id FROM donor_users WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can view subscriptions for campaigns in their org
CREATE POLICY "subscriptions_select_admin" ON subscriptions FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE has_role_in_org(organization_id, 'admin')
    )
  );

-- --- Campaign Fundraisers (public) ---
-- Anyone can view active fundraisers
CREATE POLICY "fundraisers_select_public" ON campaign_fundraisers FOR SELECT
  USING (status = 'active');

-- --- Products ---
CREATE POLICY "products_select" ON products FOR SELECT
  USING (has_role_in_org(organization_id, 'member') AND deleted_at IS NULL);

CREATE POLICY "products_modify" ON products FOR ALL
  USING (has_role_in_org(organization_id, 'admin'));

-- --- Tribute Relationships ---
CREATE POLICY "tribute_relationships_select" ON tribute_relationships FOR SELECT
  USING (
    organization_id IS NULL
    OR has_role_in_org(organization_id, 'member')
  );
```

> **Note:** These are starter policies. Production deployment should add INSERT/UPDATE-specific policies for service_role webhook handlers (Stripe/PayPal) that create transactions and subscriptions.

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

| Column             | Location           | Why JSONB?                                                                                          |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------- |
| `general`          | `org_config`       | Flat key-value settings that change together. No cross-table joins needed. Admin-only config.       |
| `branding`         | `org_config`       | Theme/styling blob consumed as a unit. Never queried individually in SQL.                           |
| `social_sharing`   | `org_config`       | Boolean flags consumed as a unit. Simple on/off toggles for social platforms.                       |
| `currency`         | `org_identity`     | Nested structure with array of supported currencies + multipliers. Queried as a whole on page load. |
| `api_keys`         | `org_integrations` | Variable-length array of key objects. Developer-only, never SQL-filtered.                           |
| `webhooks`         | `org_integrations` | Variable-length array of webhook configs. Developer-only, never SQL-filtered.                       |
| `payments`         | `org_financial`    | Nested processor configs (Stripe/PayPal) with varying shapes. Owner-only.                           |
| `billing`          | `org_financial`    | Plan/usage blob consumed as a unit. Owner-only.                                                     |
| `crowdfunding`     | `campaigns`        | Page layout config read as a unit. Never filtered in SQL (always loaded with campaign).             |
| `peer_to_peer`     | `campaigns`        | P2P config blob. Only relevant for type='p2p'. Loaded with campaign, never queried individually.    |
| `charity`          | `campaigns`        | Campaign-level charity override. Small flat object, always loaded with campaign.                    |
| `social_sharing`   | `campaigns`        | Per-campaign social override. Boolean flags consumed as a unit.                                     |
| `donation_amounts` | `campaign_forms`   | Nested frequencies → preset amounts hierarchy. Complex tree structure that would require 2+ tables. |
| `impact_cart`      | `campaign_forms`   | Simple feature toggle + 1 setting. Not worth a separate table.                                      |
| `product_selector` | `campaign_forms`   | Feature config with 5 text fields. Loaded with form, never queried individually.                    |
| `impact_boost`     | `campaign_forms`   | Feature config with 4 fields. Loaded with form, never queried individually.                         |
| `cover_costs`      | `campaign_forms`   | Feature config with 3 fields. Loaded with form, never queried individually.                         |
| `gift_aid`         | `campaign_forms`   | Single boolean toggle. JSONB for consistency with other feature configs.                            |
| `tribute`          | `campaign_forms`   | Feature config with 10+ fields including icons. Loaded with form, never queried individually.       |
| `custom_fields`    | `campaign_forms`   | Variable-length array with recursive visibility conditions. Schema varies by field type.            |
| `entry_fields`     | `campaign_forms`   | Form-type-specific config varying by form_type. Polymorphic structure.                              |
| `custom_fields`    | `transactions`     | Denormalized snapshot of custom field values at transaction time. Filtered via GIN index.           |

**Queryable columns kept outside JSONB:** `form_type`, `title`, `subtitle`, `base_default_currency`, `enabled_currencies` on `campaign_forms`; `type`, `status`, `slug` on `campaigns`. These are used in WHERE clauses, indexes, and RLS policies.

---

## Table Statistics

| Category             | Count  | Tables                                                                                                          |
| -------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| Organizations & Auth | 2      | organizations, profiles                                                                                         |
| Org Settings         | 5      | org_config, org_identity, org_integrations, org_financial, organization_charity_currencies                      |
| Campaigns            | 3      | campaigns, campaign_stats, campaign_fundraisers                                                                 |
| Forms                | 2      | campaign_forms, form_products (junction)                                                                        |
| Products             | 1      | products                                                                                                        |
| Donor Portal         | 6      | donor_users, subscriptions, subscription_line_items, transactions, transaction_line_items, transaction_tributes |
| Lookups              | 1      | tribute_relationships                                                                                           |
| **Total**            | **20** | + 2 views (`campaign_donations_view`, `donors_summary_view`) + 1 storage bucket                                 |

---

## Key Design Decisions

### Role Hierarchy: owner > admin > developer > member

Four roles with a branching hierarchy:

- **member**: Base read access to org data (campaigns, forms, products)
- **developer**: Inherits all member permissions + API keys and webhook access. Does NOT inherit admin write permissions.
- **admin**: Full read/write on campaigns, forms, products, settings (except financial)
- **owner**: Everything including financial settings, org deletion, role management

The `has_role_in_org()` function handles this: `'member'` check passes for all four roles; `'developer'` check passes for developer, admin, owner; `'admin'` check passes for admin, owner; `'owner'` check passes only for owner.

### Consolidated Settings (4 Tables by RLS Boundary)

Instead of 1 table per setting domain, settings are grouped by who can access them:

1. **org_config** (admin+): General, branding, social sharing — safe for all team members to see
2. **org_identity** (admin+): Charity identity + currency — used in donor-facing pages
3. **org_integrations** (developer+): API keys, webhooks — sensitive but needed for integrations
4. **org_financial** (owner only): Payment processors, billing — most sensitive

This means a single RLS policy per table instead of per-setting-type.

### Supabase Auth Integration

Two separate user types with different auth patterns:

1. **Admin users** (`profiles`): `id` = `auth.users.id` (1:1). Auto-created via trigger on signup. Scoped to an organization with role-based access.
2. **Donor users** (`donor_users`): Separate `id` with optional `auth_user_id` link. **Global model** — no `organization_id`. A donor who gives to multiple charities has one `donor_users` row. RLS scopes admin visibility via subquery on `transactions.organization_id`. Donors can exist without auth (guest checkout) and optionally create a portal account later. Uses `ON DELETE SET NULL` so deleting the auth account preserves donation history.

### Campaign Sub-Tables Merged to JSONB

The 4 campaign sub-tables (`campaign_crowdfunding`, `campaign_peer_to_peer`, `campaign_charity`, `campaign_social_sharing`) are now JSONB columns on `campaigns`. Rationale:

- Always loaded together with the campaign (1:1 relationship)
- Never independently queried in WHERE clauses
- Reduces join count from 5 to 1 for campaign detail queries
- Campaign type/status (the queryable fields) remain as indexed columns

### Form Config Merged to JSONB

The 10 form config tables (`form_settings`, `form_frequencies`, `form_preset_amounts`, 6x `form_feature_*`, `form_custom_fields`) are now JSONB columns on `campaign_forms`. Rationale:

- Form config is always loaded as a complete unit (one API call)
- Queryable columns (`form_type`, `title`, `base_default_currency`, `enabled_currencies`) are kept as real columns with indexes
- Saves 10 JOINs per form load, 10 RLS policies, 10 trigger definitions
- `enabled_currencies` uses `TEXT[]` with GIN index for array containment queries (currency guard checks)

### Why `transactions` Replaces `campaign_donations`

`transactions` is the single source of truth. The `campaign_donations_view` provides the lightweight shape needed for crowdfunding pages without data duplication.

### `campaign_stats` as Materialized Data

`campaign_stats` is refreshed via the `refresh_campaign_stats()` trigger on every transaction INSERT/UPDATE/DELETE. Uses `INSERT ... ON CONFLICT DO UPDATE` (upsert) for atomic recomputation.

### `donors_summary_view` as Regular View

A regular VIEW (not materialized) that aggregates donor data per organization. Acceptable for admin dashboard queries where slight latency is fine. Avoids the complexity of refresh scheduling for materialized views.

### Soft Deletes

`deleted_at TIMESTAMPTZ` on `campaigns`, `products`, and `campaign_forms`. Partial indexes (`WHERE deleted_at IS NULL`) ensure soft-deleted rows don't slow down normal queries. RLS policies filter out deleted rows by default.

### TEXT + CHECK vs Enums

All status/type columns use `TEXT NOT NULL CHECK (value IN (...))` instead of PostgreSQL enums. Reasons:

- Easier to add/remove values (simple `ALTER TABLE ... DROP/ADD CONSTRAINT`)
- No need to drop and recreate enum types during migrations
- Supabase migration tooling works better with constraints
- Negligible storage difference for this data volume

### `organization_id` on `transactions`

Denormalized from `campaigns.organization_id` and auto-set by trigger on insert. This allows RLS policies on `transactions` to scope by org without joining to `campaigns` on every row access — a significant performance optimization for the most queried table.

### Table Ordering (FK Dependencies)

`products` is defined before `campaign_forms` (for `form_products`). `donor_users` is defined before `subscriptions` and `transactions`. `subscriptions` is defined before `transactions` (for `subscription_id` FK).

---

## Data Access Patterns

### Frontend Query Examples (PostgREST)

```typescript
// Get full campaign with stats (JSONB columns are auto-included)
const campaign = await supabase
  .from('campaigns')
  .select(
    `
    *,
    campaign_stats(*)
  `
  )
  .eq('id', campaignId)
  .is('deleted_at', null)
  .single()

// Access JSONB directly: campaign.crowdfunding.enabled, campaign.peer_to_peer.allowTeams, etc.

// Get recent donations for a campaign (via the view)
const donations = await supabase
  .from('campaign_donations_view')
  .select('*')
  .eq('campaign_id', campaignId)
  .order('created_at', { ascending: false })
  .limit(10)

// Get form with products (all config is JSONB on the form row)
const form = await supabase
  .from('campaign_forms')
  .select(
    `
    *,
    form_products(*, products:product_id(*))
  `
  )
  .eq('id', formId)
  .is('deleted_at', null)
  .single()

// Access JSONB directly: form.donation_amounts.frequencies, form.impact_cart.enabled, etc.

// Get all org settings in parallel (4 queries, each respects RLS)
const [config, identity, integrations, financial] = await Promise.all([
  supabase.from('org_config').select('*').eq('organization_id', orgId).single(),
  supabase.from('org_identity').select('*').eq('organization_id', orgId).single(),
  supabase.from('org_integrations').select('*').eq('organization_id', orgId).single(),
  supabase.from('org_financial').select('*').eq('organization_id', orgId).single()
])
// developer role: integrations succeeds, financial returns empty (RLS blocks)
// member role: config and identity succeed, integrations and financial return empty

// Get charity currency overrides
const currencies = await supabase
  .from('organization_charity_currencies')
  .select('*')
  .eq('organization_id', orgId)
  .order('currency_code')

// Find forms using a specific currency (for currency removal guard)
const formsUsingCurrency = await supabase
  .from('campaign_forms')
  .select('id, name, enabled_currencies, base_default_currency')
  .contains('enabled_currencies', ['USD'])
  .is('deleted_at', null)

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

// Admin: get donors summary for their org
const donors = await supabase
  .from('donors_summary_view')
  .select('*')
  .eq('organization_id', orgId)
  .order('total_amount', { ascending: false })
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
- **Materialized views**: Dashboard aggregations (donations by day/week/month) — consider materializing `donors_summary_view` if performance becomes an issue
- **Edge Functions**: Stripe/PayPal webhook handlers for transaction creation
- **Realtime**: Subscribe to `campaign_stats` changes for live crowdfunding page updates
- **UUIDv7**: Consider `pg_uuidv7` extension for time-ordered PKs on high-volume tables (transactions) for better B-tree locality
- **Team settings**: `profiles` table could gain `team_id` FK for team management within orgs
- **Multi-org donors**: `donors_summary_view` already supports per-org aggregation; consider a donor portal that shows cross-org history
