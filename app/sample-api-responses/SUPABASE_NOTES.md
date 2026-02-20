# Supabase Implementation Notes

Pending schema changes and triggers needed before migrating to Supabase. Schema is now **20 tables** (down from 35) after consolidating settings into 4 org tables, campaign sub-data into JSONB on `campaigns`, and form config into JSONB columns on `campaign_forms`.

---

## Schema Consolidation Summary

### Settings → 4 grouped org tables

| Old tables (6)                                              | New table          | Strategy                                                                                                       |
| ----------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `currency_settings`, `supported_currencies`                 | `org_config`       | `default_currency TEXT`, `supported_currencies JSONB` (array of `{code, multiplier, sort}`)                    |
| `organization_charity`, `organization_charity_currencies`   | `org_identity`     | `slug TEXT`, `currency_overrides JSONB` (keyed by currency code, each with name/reg#/phone/email/address/etc.) |
| _(new — API keys, webhooks, payment processor connections)_ | `org_integrations` | `api_keys JSONB`, `webhooks JSONB`, `stripe_connect JSONB`, `paypal_connect JSONB`                             |
| _(new — billing plan, payment settings)_                    | `org_financial`    | `billing JSONB`, `payment_settings JSONB`                                                                      |

### Campaign sub-data → JSONB on `campaigns`

| Old tables (4)            | New location               | Column type |
| ------------------------- | -------------------------- | ----------- |
| `campaign_crowdfunding`   | `campaigns.crowdfunding`   | JSONB       |
| `campaign_peer_to_peer`   | `campaigns.peer_to_peer`   | JSONB       |
| `campaign_charity`        | `campaigns.charity`        | JSONB       |
| `campaign_social_sharing` | `campaigns.social_sharing` | JSONB       |

### Form config → JSONB columns on `campaign_forms`

| Old tables (9)                             | New location                      | Column type |
| ------------------------------------------ | --------------------------------- | ----------- |
| `form_settings`                            | `campaign_forms.settings`         | JSONB       |
| `form_frequencies` + `form_preset_amounts` | `campaign_forms.frequencies`      | JSONB       |
| `form_feature_impact_boost`                | `campaign_forms.impact_boost`     | JSONB       |
| `form_feature_impact_cart`                 | `campaign_forms.impact_cart`      | JSONB       |
| `form_feature_product_selector`            | `campaign_forms.product_selector` | JSONB       |
| `form_feature_cover_costs`                 | `campaign_forms.cover_costs`      | JSONB       |
| `form_feature_gift_aid`                    | `campaign_forms.gift_aid`         | JSONB       |
| `form_feature_tribute`                     | `campaign_forms.tribute`          | JSONB       |

### Final table count: 20

| Category             | Count  | Tables                                                                                                                      |
| -------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| Organizations & Auth | 2      | `organizations`, `profiles`                                                                                                 |
| Org Settings         | 5      | `org_config`, `org_identity`, `org_integrations`, `org_financial`, `organization_charity_currencies`                        |
| Campaigns            | 3      | `campaigns` (with JSONB sub-data), `campaign_stats`, `campaign_fundraisers`                                                 |
| Donor Portal         | 6      | `donor_users`, `subscriptions`, `subscription_line_items`, `transactions`, `transaction_line_items`, `transaction_tributes` |
| Products             | 1      | `products`                                                                                                                  |
| Forms                | 2      | `campaign_forms` (with JSONB config incl. custom fields), `form_products`                                                   |
| Lookups              | 1      | `tribute_relationships`                                                                                                     |
| **Total**            | **20** | + 2 views (`campaign_donations_view`, `donors_summary_view`) + 1 storage bucket                                             |

---

## Role Hierarchy & Permissions

Roles: **owner > admin > developer > member**

`has_role_in_org()` implements strict hierarchy — `developer` inherits `member` but does **NOT** inherit `admin`.

```
owner    → admin + payments, billing, delete org, transfer ownership
admin    → member + export, settings (general/branding/social/charity/currency), team management
developer→ member + API keys, webhooks (does NOT inherit admin)
member   → dashboard, reports, view/edit campaigns/forms/products/templates
```

### Permissions matrix

| Capability                                              | member | developer | admin | owner |
| ------------------------------------------------------- | :----: | :-------: | :---: | :---: |
| Dashboard & reports                                     |   Y    |     Y     |   Y   |   Y   |
| View/edit campaigns, forms, products, templates         |   Y    |     Y     |   Y   |   Y   |
| API keys & webhooks                                     |        |     Y     |       |   Y   |
| Export data                                             |        |           |   Y   |   Y   |
| Settings (general, branding, social, charity, currency) |        |           |   Y   |   Y   |
| Team management                                         |        |           |   Y   |   Y   |
| Payment settings (Stripe/PayPal connect)                |        |           |       |   Y   |
| Billing & plan management                               |        |           |       |   Y   |
| Delete organization                                     |        |           |       |   Y   |
| Transfer ownership                                      |        |           |       |   Y   |

### `has_role_in_org()` implementation

```sql
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
          WHEN 'developer' THEN role IN ('developer', 'owner')
          WHEN 'admin'     THEN role IN ('admin', 'owner')
          WHEN 'owner'     THEN role = 'owner'
        END
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

> **Note:** `developer` inherits `member` (any developer check passes for members too since developer is in the member list), but developer does NOT appear in the `admin` case. This means developers cannot access settings or team management — they only get API/webhook access on top of member capabilities.

---

## Currency Auto-Population Trigger

Replaces the client-side `ensureCurrencyEntries()` pattern. When a currency is added to `org_config.supported_currencies`, a trigger auto-populates a default row in `org_identity.currency_overrides`.

```sql
CREATE OR REPLACE FUNCTION auto_populate_currency_overrides()
RETURNS TRIGGER AS $$
DECLARE
  new_codes TEXT[];
  old_codes TEXT[];
  code TEXT;
  current_overrides JSONB;
BEGIN
  -- Extract currency codes from new and old supported_currencies JSONB arrays
  SELECT array_agg(elem->>'code') INTO new_codes
  FROM jsonb_array_elements(NEW.supported_currencies) AS elem;

  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(elem->>'code') INTO old_codes
    FROM jsonb_array_elements(OLD.supported_currencies) AS elem;
  ELSE
    old_codes := ARRAY[]::TEXT[];
  END IF;

  -- For each newly added currency, ensure an override entry exists in org_identity
  FOREACH code IN ARRAY new_codes LOOP
    IF code != ALL(COALESCE(old_codes, ARRAY[]::TEXT[])) THEN
      SELECT currency_overrides INTO current_overrides
      FROM org_identity WHERE organization_id = NEW.organization_id;

      IF current_overrides IS NULL OR NOT current_overrides ? code THEN
        UPDATE org_identity
        SET currency_overrides = COALESCE(currency_overrides, '{}'::JSONB)
          || jsonb_build_object(code, '{}'::JSONB)
        WHERE organization_id = NEW.organization_id;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_config_currency_sync
  AFTER INSERT OR UPDATE OF supported_currencies ON org_config
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_currency_overrides();
```

> This eliminates the need for `ensureCurrencyEntries()` in the client-side charity settings store. Currency overrides are guaranteed to exist server-side whenever a currency is added to the supported list.

---

## Quantity Remaining Trigger

The `campaign_forms.impact_cart` JSONB column includes a `quantityRemaining` map (keyed by product ID). A trigger on `transactions` decrements stock when a transaction succeeds:

```sql
CREATE OR REPLACE FUNCTION decrement_quantity_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND (TG_OP = 'INSERT' OR OLD.status != 'succeeded') THEN
    UPDATE campaign_forms cf
    SET impact_cart = jsonb_set(
      cf.impact_cart,
      '{quantityRemaining}',
      (
        SELECT jsonb_object_agg(
          key,
          GREATEST(0, (value::int) - COALESCE((
            SELECT SUM(li.quantity)
            FROM transaction_line_items li
            WHERE li.transaction_id = NEW.id AND li.product_id = key
          ), 0))
        )
        FROM jsonb_each_text(cf.impact_cart->'quantityRemaining')
      )
    )
    WHERE cf.campaign_id = NEW.campaign_id
      AND cf.impact_cart->'quantityRemaining' IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Alternative (normalized):** Add a `form_product_quantity` table:

```sql
CREATE TABLE form_product_quantity (
  form_id UUID NOT NULL REFERENCES campaign_forms(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_remaining INT NOT NULL DEFAULT 0,
  PRIMARY KEY (form_id, product_id)
);
```

With row-level locking for concurrent writes. This approach is cleaner but adds a 22nd table.

---

## Store Boilerplate: `defineSettingsStore`

A `defineSettingsStore` helper eliminates ~250 LOC across the 4 org settings stores (`org_config`, `org_identity`, `org_integrations`, `org_financial`). Each store currently duplicates:

- `$hydrate()` / `initialize()` with Supabase fetch
- `save()` with optimistic update + error rollback
- `toSnapshot()` / `markDirty()` / `isDirty` for `useAdminEdit` integration
- `reset()` to discard unsaved changes

The helper provides all of this with a single call:

```typescript
// Example: org_config store (currency + general settings)
export const useOrgConfigStore = defineSettingsStore('org_config', {
  table: 'org_config',
  defaults: {
    default_currency: 'GBP',
    supported_currencies: []
    // ...general settings
  }
})
```

This pattern mirrors the existing `useEditableState` composable used by entity stores (products, templates) but is tailored for singleton org-level settings rows.

---

## Data Layer Migration

### Sample data → Supabase queries

| Consumer                                                            | Current import                        | Supabase replacement                                                              |
| ------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| `features/_admin/composables/useEntityDataService.ts`               | `transactions`, `subscriptions`       | Central async fetch; remove `setTimeout` simulation; lookup maps stay as computed |
| `features/donations/admin/composables/useDonations.ts`              | `transactions`                        | `supabase.from('transactions').select('*, line_items(*)')` with date range        |
| `features/donors/admin/composables/useDonors.ts`                    | `transactions`                        | Aggregate query or RPC: `GROUP BY donor_id` with totals                           |
| `features/subscriptions/admin/composables/useAdminSubscriptions.ts` | `transactions`, `subscriptions`       | Join `subscriptions` with donor info from `transactions`                          |
| `features/campaigns/shared/stores/forms.ts`                         | `api-sample-response-forms.ts`        | `supabase.from('campaign_forms').select(...)` — all form config in JSONB columns  |
| `features/campaigns/shared/stores/campaignConfig.ts`                | `api-sample-response-campaigns.ts`    | `supabase.from('campaigns').select(...)` — sub-data in JSONB columns              |
| `features/donor-portal/composables/useDonorPortal.ts`               | `api-sample-response-transactions.ts` | RLS-filtered query for authenticated donor                                        |

### Server-side filtering architecture

All filtering moves server-side. With the consolidated schema, form config lives in JSONB columns on `campaign_forms` instead of separate feature tables. Filters that previously joined `form_feature_*` tables now use JSONB operators (`->`, `->>`, `@>`) directly on `campaign_forms`.

| Decision               | Choice                                                                     | Rationale                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Predicate translation  | Single `buildSupabaseFilter(query, conditions, schema)` in `_admin/utils/` | One fn maps `FilterConditionValues` → `.eq()`/`.gte()`/`.in()`/`.contains()` chains; JSONB operators for form config fields |
| Cross-entity filters   | Subqueries in RPC (`EXISTS`/`IN`)                                          | Always-fresh, no materialized view staleness; e.g., "donors whose transactions have source=website"                         |
| JSONB field filters    | `->>` for scalar, `@>` for containment                                     | `campaign_forms.impact_cart->>'enabled'` or `campaigns.crowdfunding @> '{"enabled": true}'`                                 |
| Pagination             | Cursor-based (keyset)                                                      | `WHERE created_at < :cursor ORDER BY created_at DESC LIMIT 50` — consistent at any depth                                    |
| UI coupling            | `useFilterState` keeps UI, adds `mode: 'server'`                           | Emits `FilterConditionValues` JSON instead of client predicate; zero UI changes, `_library/` untouched                      |
| Custom field discovery | Lazy query on filter sheet open, session-cached                            | `SELECT DISTINCT jsonb_object_keys(custom_fields) FROM transactions` + values per key                                       |
| List data integration  | New `useServerList(table, options)` composable                             | Replaces `useDonations`/`useDonors`/`useAdminSubscriptions`; owns fetch + pagination + refetch; `AdminListPage` unchanged   |
| Search                 | Server `ilike` with 300ms client debounce                                  | `OR(name.ilike.%q%, email.ilike.%q%)` pushed to Supabase; replaces `useQuickFind` client-side filtering                     |

### Data flow after migration

```
AdminListPage (unchanged)
  └→ useServerList(table, { filters, dateRange, search, cursor })
       ├→ buildSupabaseFilter() — simple fields: .eq/.gte/.in/.contains; JSONB: ->>/`@>`
       ├→ RPC fallback — cross-entity subqueries, JSONB deep filters
       ├→ date range — .gte('created_at', from).lte('created_at', to)
       ├→ search — .or('name.ilike.%q%,email.ilike.%q%')
       └→ pagination — .order('created_at', { ascending: false }).limit(50)
```

### Schema notes

- `transactions.custom_fields` → JSONB column; key discovery via `SELECT DISTINCT jsonb_object_keys(custom_fields)`
- `transaction_line_items` → separate table (currently nested `lineItems[]` array)
- Donor aggregation (currently in `useEntityDataService` + `useDonors`) → RPC with `GROUP BY donor_id`
- Form config (frequencies, presets, features) → JSONB columns on `campaign_forms`, no separate tables
- Campaign sub-data (crowdfunding, p2p, charity, social) → JSONB columns on `campaigns`, no separate tables
- Org settings → 4 grouped tables (`org_config`, `org_identity`, `org_integrations`, `org_financial`) instead of 6 separate tables

### Files replaced or retired

| Current file                                                | Migration action                                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `_admin/composables/useEntityDataService.ts`                | Retired — cross-entity lookup maps replaced by server subqueries                                          |
| `donations/admin/composables/useDonations.ts`               | Replaced by `useServerList('transactions', ...)`                                                          |
| `donors/admin/composables/useDonors.ts`                     | Replaced by `useServerList('donors_view', ...)` (RPC aggregation)                                         |
| `subscriptions/admin/composables/useAdminSubscriptions.ts`  | Replaced by `useServerList('subscriptions', ...)` with donor join                                         |
| `_admin/composables/useQuickFind.ts`                        | Retired — search pushed to `useServerList` server query                                                   |
| `_admin/utils/buildCustomFieldSchema.ts`                    | Kept — schema discovery query replaces transaction scan, same output shape                                |
| `donations/admin/composables/useDonationFilters.ts`         | Kept — schema + `useFilterState` unchanged; remove `buildCustomEvaluators` (server handles)               |
| `donors/admin/composables/useDonorFilters.ts`               | Kept — same; cross-entity evaluators retired                                                              |
| `subscriptions/admin/composables/useSubscriptionFilters.ts` | Kept — same                                                                                               |
| `settings/admin/stores/charitySettings.ts`                  | Replaced by `defineSettingsStore('org_identity', ...)` — `ensureCurrencyEntries` removed (server trigger) |
| `settings/admin/stores/currencySettings.ts`                 | Replaced by `defineSettingsStore('org_config', ...)`                                                      |
| `settings/admin/stores/generalSettings.ts`                  | Merged into `defineSettingsStore('org_config', ...)`                                                      |
| `settings/admin/stores/brandingSettings.ts`                 | Merged into `defineSettingsStore('org_config', ...)`                                                      |
| `settings/admin/stores/paymentSettings.ts`                  | Replaced by `defineSettingsStore('org_financial', ...)`                                                   |
| `settings/admin/stores/billingSettings.ts`                  | Merged into `defineSettingsStore('org_financial', ...)`                                                   |
| `settings/admin/stores/apiSettings.ts`                      | Replaced by `defineSettingsStore('org_integrations', ...)`                                                |
| `settings/admin/stores/teamSettings.ts`                     | Kept — team is profiles table, not a settings row                                                         |
| `settings/admin/stores/socialSharingSettings.ts`            | Merged into `defineSettingsStore('org_config', ...)`                                                      |

---

## TODOs / Notes not to forget

- [ ] Currency auto-population trigger replaces client-side `ensureCurrencyEntries` (see trigger above)
- [ ] Currency removal guard: server-side check that no forms reference a currency (`enabledCurrencies`/`baseDefaultCurrency` in `campaign_forms.settings` JSONB) before allowing removal from `org_config.supported_currencies`
- [ ] Per-user `interfaceConfig` table: sorting, table/card mode, filter presets — persists across devices
- [ ] `useFilterState` `mode: 'server'` option — emit `FilterConditionValues` JSON, skip client predicate
- [ ] `useServerList` composable — generic fetch + pagination + refetch, accepts filters/date/search/cursor
- [ ] `buildSupabaseFilter` utility — translate `FilterConditionValues` → Supabase query chains (including JSONB operators for form/campaign config) + RPC fallback
- [ ] Custom field schema discovery endpoint — lazy fetch on filter sheet open, session-cached
- [ ] `defineSettingsStore` helper — eliminates ~250 LOC across 4 org settings stores
- [ ] Update `has_role_in_org()` for new 4-role hierarchy (owner > admin > developer > member; developer does NOT inherit admin)
- [ ] RLS policies need updating for consolidated tables (4 org tables replace 6, JSONB columns replace sub-tables)
