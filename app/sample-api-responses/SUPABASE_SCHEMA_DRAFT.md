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

-- Campaign aggregated statistics (computed or updated via triggers)
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
-- Recent donations (aggregated for preview/leaderboard)
CREATE TABLE campaign_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  form_id UUID REFERENCES campaign_forms(id),
  donor_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_donations_campaign ON campaign_donations(campaign_id);
CREATE INDEX idx_campaign_donations_created ON campaign_donations(created_at DESC);
CREATE INDEX idx_campaign_donations_amount ON campaign_donations(amount DESC);

-- Campaign fundraisers (individuals/teams/organizations raising for campaign)
CREATE TABLE campaign_fundraisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  -- type: individual | team | organization
  raised_amount DECIMAL(12,2) DEFAULT 0,
  donation_count INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_fundraisers_campaign ON campaign_fundraisers(campaign_id);
CREATE INDEX idx_campaign_fundraisers_raised ON campaign_fundraisers(raised_amount DESC);
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
| Campaign Data            | 2      | campaign_donations, campaign_fundraisers                                                                           |
| Products                 | 1      | products                                                                                                           |
| Forms                    | 2      | campaign_forms, form_products (junction)                                                                           |
| Form Settings            | 3      | form_settings, form_frequencies, form_preset_amounts                                                               |
| Form Features            | 6      | form*feature*\* (one per feature)                                                                                  |
| Lookups                  | 1      | tribute_relationships                                                                                              |
| Custom Fields            | 1      | form_custom_fields                                                                                                 |
| **Total**                | **25** |                                                                                                                    |

---

## Key Design Decisions

### ✅ Why Separate Tables (Not JSONB)

1. **Queryable data**: `campaign_donations`, `campaign_fundraisers`, `form_frequencies`, `form_preset_amounts`
   - Need to filter by amount, date, frequency
   - Need to aggregate (SUM, COUNT, AVG)
   - Need sorting and pagination

2. **Transactional integrity**: Foreign keys enforce referential integrity across entities

3. **Supabase benefits**:
   - Row-level security (RLS) policies per table
   - Real-time subscriptions on specific tables
   - PostgREST auto-generated endpoints
   - No middleware transformation needed

4. **Performance**: Direct indexed queries vs. JSONB extraction operators

### ✅ Why JSONB for Custom Fields

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
    campaign_donations(*),
    campaign_fundraisers(*)
  `
  )
  .eq('id', campaignId)
  .single()

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

// Get top donors with aggregation
const topDonors = await supabase
  .from('campaign_fundraisers')
  .select('*')
  .eq('campaign_id', campaignId)
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

- **Computed stats**: Use database triggers to update `campaign_stats` when donations/fundraisers change
- **Audit logging**: Add `created_by`, `updated_by` columns to key tables
- **Soft deletes**: Add `deleted_at` TIMESTAMPTZ for campaigns/forms instead of hard delete
- **Search**: Add full-text search indexes on campaign names, descriptions
- **Analytics**: Create materialized views for dashboard aggregations
