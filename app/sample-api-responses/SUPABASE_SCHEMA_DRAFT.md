# Supabase PostgreSQL Schema (Fully Normalized)

> **Design Principle:** Separate tables for all queryable/transactional data. JSONB only for complex configuration fields that vary by type.

## Core Tables

### Organizations & Settings

```sql
-- ============================================
-- ORGANIZATIONS & SETTINGS
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE currency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  default_currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE TABLE supported_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_settings_id UUID NOT NULL REFERENCES currency_settings(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  multiplier DECIMAL(10,4) DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  UNIQUE(currency_settings_id, currency_code)
);

CREATE INDEX idx_supported_currencies_settings ON supported_currencies(currency_settings_id);
```

### Campaigns

```sql
-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  -- status: draft | active | paused | completed | archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Campaign aggregated statistics (materialized from transactions via triggers/functions)
-- In the mock data layer, these are computed by computeCampaignStats() from the transactions table.
CREATE TABLE campaign_stats (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  total_raised DECIMAL(12,2) DEFAULT 0,
  total_donations INT DEFAULT 0,
  total_donors INT DEFAULT 0,
  average_donation DECIMAL(10,2) DEFAULT 0,
  top_donation DECIMAL(10,2) DEFAULT 0,
  days_remaining INT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crowdfunding page settings
CREATE TABLE campaign_crowdfunding (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  cover_photo TEXT,
  title TEXT,
  short_description TEXT,
  story TEXT,
  show_progress_bar BOOLEAN DEFAULT true,
  show_recent_donations BOOLEAN DEFAULT true,
  default_donations_view TEXT DEFAULT 'recent',
  -- default_donations_view: recent | top
  number_of_donations_to_show INT DEFAULT 5,
  goal_amount DECIMAL(12,2)
);

-- Peer-to-peer fundraising settings
CREATE TABLE campaign_peer_to_peer (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  allow_individuals BOOLEAN DEFAULT true,
  allow_teams BOOLEAN DEFAULT true,
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
  enabled BOOLEAN DEFAULT true,
  facebook BOOLEAN DEFAULT true,
  twitter BOOLEAN DEFAULT true,
  linkedin BOOLEAN DEFAULT true,
  whatsapp BOOLEAN DEFAULT true,
  email BOOLEAN DEFAULT true,
  copy_link BOOLEAN DEFAULT true
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
  donor_user_id UUID REFERENCES donor_users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  goal DECIMAL(10,2),
  slug TEXT NOT NULL,
  story TEXT,
  cover_photo TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  -- status: active | paused | removed
  raised_amount DECIMAL(12,2) DEFAULT 0,
  donation_count INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_fundraisers_parent ON campaign_fundraisers(parent_campaign_id);
CREATE INDEX idx_campaign_fundraisers_donor ON campaign_fundraisers(donor_user_id);
CREATE INDEX idx_campaign_fundraisers_raised ON campaign_fundraisers(raised_amount DESC);
```

> **Note:** `campaign_donations` from the previous schema is replaced by a VIEW over
> the `transactions` table (see Donor Portal Tables below). Campaign donation previews
> and leaderboards query `transactions` directly, filtered by `campaign_id`.

```sql
-- Campaign donations view (replaces the old campaign_donations table)
-- Provides the lightweight CampaignDonation shape for crowdfunding pages.
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

CREATE INDEX idx_transactions_campaign_donations
  ON transactions(campaign_id, status, created_at DESC);
```

### Donor Portal Tables

```sql
-- ============================================
-- DONOR PORTAL
-- ============================================

-- Donor user accounts (public-facing donors, not admin users)
CREATE TABLE donor_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  -- links to Supabase auth.users if using Supabase Auth
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_donor_users_email ON donor_users(email);

-- All payment transactions (one-time and subscription billing)
-- This is the single source of truth for all donations across all campaigns.
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor TEXT NOT NULL,
  -- processor: stripe | paypal
  processor_transaction_id TEXT NOT NULL,
  type TEXT NOT NULL,
  -- type: one_time | subscription_payment
  subscription_id UUID REFERENCES subscriptions(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  campaign_name TEXT NOT NULL,

  subtotal DECIMAL(10,2) NOT NULL,
  cover_costs_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',

  payment_method_type TEXT NOT NULL,
  -- payment_method_type: card | paypal | bank_transfer
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  payment_method_email TEXT,

  status TEXT NOT NULL DEFAULT 'pending',
  -- status: succeeded | pending | failed | refunded

  donor_user_id UUID REFERENCES donor_users(id),
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  gift_aid BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  receipt_url TEXT
);

CREATE INDEX idx_transactions_campaign ON transactions(campaign_id);
CREATE INDEX idx_transactions_donor ON transactions(donor_email);
CREATE INDEX idx_transactions_donor_user ON transactions(donor_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_amount ON transactions(total_amount DESC);

-- Transaction line items (supports Impact Cart multi-item checkouts)
CREATE TABLE transaction_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_icon TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL,
  -- frequency: once | monthly | yearly
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_transaction_line_items_txn ON transaction_line_items(transaction_id);

-- Transaction tributes (memorial / gift dedications)
CREATE TABLE transaction_tributes (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  -- type: gift | memorial
  honoree_name TEXT NOT NULL
);

-- Recurring subscriptions (Stripe Subscription / PayPal Billing Agreement)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor TEXT NOT NULL,
  -- processor: stripe | paypal
  processor_subscription_id TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  campaign_name TEXT NOT NULL,
  donor_user_id UUID REFERENCES donor_users(id),

  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  frequency TEXT NOT NULL,
  -- frequency: monthly | yearly

  payment_method_type TEXT NOT NULL,
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  payment_method_email TEXT,

  status TEXT NOT NULL DEFAULT 'active',
  -- status: active | paused | cancelled | past_due

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  total_paid DECIMAL(12,2) DEFAULT 0,
  payment_count INT DEFAULT 0
);

CREATE INDEX idx_subscriptions_campaign ON subscriptions(campaign_id);
CREATE INDEX idx_subscriptions_donor ON subscriptions(donor_user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Subscription line items (supports multi-item Impact Cart subscriptions)
CREATE TABLE subscription_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_icon TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL,
  -- frequency: monthly | yearly
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_subscription_line_items_sub ON subscription_line_items(subscription_id);
```

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
  -- price: NULL if variable pricing, set if fixed price
  min_price DECIMAL(10,2),
  -- min_price: minimum for variable pricing
  default_amount DECIMAL(10,2),
  -- default_amount: suggested default for variable pricing
  frequency TEXT NOT NULL,
  -- frequency: once | monthly | yearly
  image TEXT,
  thumbnail TEXT,
  icon TEXT,
  is_shipping_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_frequency ON products(frequency);
```

### Campaign Forms

```sql
-- ============================================
-- CAMPAIGN FORMS
-- ============================================
CREATE TABLE campaign_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_forms_campaign ON campaign_forms(campaign_id);
CREATE INDEX idx_campaign_forms_default ON campaign_forms(campaign_id, is_default);

-- Junction table: form → products (many-to-many)
CREATE TABLE form_products (
  form_id UUID NOT NULL REFERENCES campaign_forms(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
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
  frequency TEXT NOT NULL,
  -- frequency: once | monthly | yearly
  enabled BOOLEAN DEFAULT true,
  label TEXT NOT NULL,
  enable_amount_descriptions BOOLEAN DEFAULT false,
  custom_amount_min DECIMAL(10,2),
  custom_amount_max DECIMAL(10,2),
  sort_order INT DEFAULT 0,
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
  sort_order INT DEFAULT 0
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
  enabled BOOLEAN DEFAULT false,
  recurring_boost_message TEXT,
  increase_boost_message TEXT,
  enable_recurring_boost BOOLEAN DEFAULT false,
  enable_increase_boost BOOLEAN DEFAULT false
);

CREATE TABLE form_feature_impact_cart (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  initial_display INT DEFAULT 3
);

CREATE TABLE form_feature_product_selector (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  icon TEXT,
  entity_singular TEXT,
  entity_plural TEXT,
  action_verb TEXT,
  action_noun TEXT
);

CREATE TABLE form_feature_cover_costs (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  heading TEXT,
  description TEXT,
  default_percentage INT DEFAULT 0
);

CREATE TABLE form_feature_gift_aid (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false
);

CREATE TABLE form_feature_tribute (
  form_id UUID PRIMARY KEY REFERENCES campaign_forms(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  show_for_once_frequency BOOLEAN DEFAULT true,
  icon_gift TEXT DEFAULT '🎁',
  icon_memorial TEXT DEFAULT '🕊️',
  icon_tribute TEXT DEFAULT '💝',
  none_label TEXT DEFAULT 'No, thank you',
  gift_enabled BOOLEAN DEFAULT true,
  memorial_enabled BOOLEAN DEFAULT true,
  modal_title TEXT,
  modal_subtitle TEXT
);
```

### Lookups

```sql
-- ============================================
-- LOOKUP TABLES
-- ============================================
-- Tribute relationships (shared per organization or global)
CREATE TABLE tribute_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  -- if organization_id is NULL, it's a system-wide default
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0
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
  step TEXT NOT NULL,
  -- step: step2 | step3 | hidden
  field_order INT DEFAULT 0,
  field_type TEXT NOT NULL,
  -- field_type: text | textarea | select | checkbox | hidden
  field_id TEXT NOT NULL,
  -- internal identifier (e.g., "text_company_name")
  label TEXT NOT NULL,
  default_value TEXT,
  -- Advanced settings (varies by field type):
  -- text: {optional, placeholder, maxLength}
  -- textarea: {optional, placeholder, rows}
  -- select: {optional, placeholder, options: [{value, label}]}
  -- checkbox: {optional, label}
  -- hidden: {defaultValue}
  advanced_settings JSONB,
  -- Visibility conditions (recursive AND/OR logic):
  -- {visibleWhen: {conditions: [{field, operator, value}], match: 'all'|'any'}}
  visibility_conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_form_custom_fields_form ON form_custom_fields(form_id);
CREATE INDEX idx_form_custom_fields_step ON form_custom_fields(form_id, step);
```

---

## JSONB Field Justification

| Column                  | Location             | Why JSONB?                                                                                                                                   |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `advanced_settings`     | `form_custom_fields` | Schema varies by field type (text has maxLength, textarea has rows, select has options array). Normalizing would require 5+ junction tables. |
| `visibility_conditions` | `form_custom_fields` | Recursive condition tree with AND/OR logic. Can be evaluated in application layer. Normalizing adds complexity without query benefit.        |

**Note:** All other configuration is stored in separate columns for:

- Direct SQL querying (`WHERE enabled = true`)
- Supabase RLS policies per table
- Real-time subscriptions
- Type safety at DB level

---

## Table Statistics

| Category                 | Count  | Tables                                                                                                             |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Organizations & Settings | 3      | organizations, currency_settings, supported_currencies                                                             |
| Campaigns                | 6      | campaigns, campaign_stats, campaign_crowdfunding, campaign_peer_to_peer, campaign_charity, campaign_social_sharing |
| Campaign Data            | 1      | campaign_fundraisers                                                                                               |
| Donor Portal             | 7      | donor_users, transactions, transaction_line_items, transaction_tributes, subscriptions, subscription_line_items     |
| Products                 | 1      | products                                                                                                           |
| Forms                    | 2      | campaign_forms, form_products (junction)                                                                           |
| Form Settings            | 3      | form_settings, form_frequencies, form_preset_amounts                                                               |
| Form Features            | 6      | form_feature_* (one per feature)                                                                                   |
| Lookups                  | 1      | tribute_relationships                                                                                              |
| Custom Fields            | 1      | form_custom_fields                                                                                                 |
| Views                    | 1      | campaign_donations_view                                                                                            |
| **Total**                | **31** | (+ 1 view)                                                                                                         |

---

## Key Design Decisions

### Why `transactions` replaces `campaign_donations`

The old schema had a separate `campaign_donations` table for crowdfunding page previews. This created duplication — the same donation existed in both `campaign_donations` and the donor's transaction history.

Now `transactions` is the single source of truth. The `campaign_donations_view` provides the lightweight shape needed for crowdfunding pages without data duplication.

### `campaign_stats` as materialized data

`campaign_stats` is populated via database triggers that fire on `transactions` INSERT/UPDATE. In the mock data layer, `computeCampaignStats()` simulates this by aggregating from the transactions array at module load time.

### Why Separate Tables (Not JSONB)

1. **Queryable data**: `transactions`, `subscriptions`, `campaign_fundraisers`, `form_frequencies`, `form_preset_amounts`
   - Need to filter by amount, date, frequency, status
   - Need to aggregate (SUM, COUNT, AVG)
   - Need sorting and pagination

2. **Transactional integrity**: Foreign keys enforce referential integrity across entities

3. **Supabase benefits**:
   - Row-level security (RLS) policies per table
   - Real-time subscriptions on specific tables
   - PostgREST auto-generated endpoints
   - No middleware transformation needed

4. **Performance**: Direct indexed queries vs. JSONB extraction operators

### Why JSONB for Custom Fields

1. **Flexible schema**: Field types and their settings vary
   - Text: `{placeholder, maxLength, optional}`
   - Textarea: `{placeholder, rows, optional}`
   - Select: `{options: [{value, label}], optional}`

2. **Rarely queried independently**: Custom fields are read as config blob, not filtered in queries

3. **Recursive logic**: Visibility conditions have AND/OR nesting that's easier to evaluate in application

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
    campaign_fundraisers(*)
  `
  )
  .eq('id', campaignId)
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
    form_frequencies(
      *,
      form_preset_amounts(*)
    ),
    form_products(*),
    form_feature_impact_boost(*),
    form_feature_tribute(*)
  `
  )
  .eq('id', formId)
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

1. **Phase 1**: Create all table structures
2. **Phase 2**: Write PostgREST query helpers for common patterns
3. **Phase 3**: Update frontend API responses to call Supabase directly
4. **Phase 4**: Remove sample-api-responses files as they're no longer needed
5. **Phase 5**: Set up RLS policies for multi-tenant access control

---

## Future Enhancements

- **Computed stats**: Use database triggers to update `campaign_stats` when transactions change
- **Audit logging**: Add `created_by`, `updated_by` columns to key tables
- **Soft deletes**: Add `deleted_at` TIMESTAMPTZ for campaigns/forms instead of hard delete
- **Search**: Add full-text search indexes on campaign names, descriptions
- **Analytics**: Create materialized views for dashboard aggregations
- **Donor portal auth**: Integrate `donor_users` with Supabase Auth for self-service portal
