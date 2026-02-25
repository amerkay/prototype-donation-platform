# Supabase Implementation Notes

Actionable migration notes: triggers, RLS, role hierarchy, data layer architecture, and TODOs. Schema DDL is in `SUPABASE_SCHEMA_DRAFT.md` (22 tables). Compliance decisions are in `COMPLIANCE_DECISIONS.md`.

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
          WHEN 'developer' THEN role IN ('developer', 'admin', 'owner')
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

---

## Compliance & Immutable Records

See `COMPLIANCE_DECISIONS.md` for all compliance decisions (PDFs, GDPR, refunds, consent, data retention, legal basis).

### Gift Aid Drift — Critical Webhook Pattern

Subscription renewals MUST call `get_active_gift_aid_declaration(donor_user_id, org_id)` at payment time. **NEVER** inherit `gift_aid` status from the subscription record or the original signup transaction.

**The drift scenario:**

```
Jan 2024  Donor starts £15/month subscription, declares Gift Aid
Feb 2024  Renewal → gift_aid = true ✓ (webhook checks active declaration)
Mar 2024  Donor cancels declaration (is_active = false, cancelled_at set)
Apr 2024  Renewal comes in
          WRONG: webhook copies gift_aid from subscription context → gift_aid = true ✗
          RIGHT: webhook calls get_active_gift_aid_declaration() → returns false → gift_aid = false ✓
```

**Webhook handler rules:**

- If function returns `false`: set `gift_aid = false`, leave `gift_aid_declaration_id = NULL`, no `gift_aid_amount`
- If function returns `true`: look up the active declaration, set `gift_aid_declaration_id`, compute `gift_aid_amount = subtotal * 0.25`, snapshot `donor_address` from the declaration

**Donor-facing cancellation:** Donors contact the charity to cancel Gift Aid. Admin sets `is_active = false` + `cancelled_at` on the declaration. No self-service portal action (My Data page shows declarations as display-only).

<!-- TODO-SUPABASE: Stripe webhook must call get_active_gift_aid_declaration() on every subscription.invoice.payment_succeeded event -->

---

## Campaign Status & Completion

### Campaign Status Model

- `draft` — initial state, not yet published (standard campaigns only; P2P templates also use draft)
- `active` — live, accepting donations
- `completed` — naturally ended (end date reached), terminal state
- `ended` — manually ended by owner/admin, terminal state
- `is_archived` — orthogonal boolean flag for standard campaigns only (not P2P templates)

### Fundraiser Status Model

Same as campaigns minus `draft`, plus:

### Terminal States

Both `completed` and `ended` are terminal — cannot transition back to active. Enforce via CHECK constraint or API validation. Terminal states disable editing.

### Completion Triggers

- **End date reached**: Cron job / pg_cron checks `campaigns.crowdfunding->>'endDate'` daily, sets matching campaigns/fundraisers to `completed`
- **Manual "End" action**: Donor or admin clicks "End Campaign" / "End Fundraiser" → sets to `ended` (displayed as "Ended")
- **Goal met does NOT auto-complete** — campaigns stay active to collect more

### Parent Campaign Gating

- When parent P2P template status is `completed` or `ended`, all child fundraisers are locked (editing disabled)
- Enforced at app level (not DB constraint) — parent status checked on page load and status change attempts
- `campaign_fundraisers.parent_campaign_id` FK already exists for the join

### RLS Update

- `fundraisers_select_public` policy: `status IN ('active', 'completed', 'ended')` — ended pages should still be viewable

---

## Campaign Currency Immutability

`crowdfunding.currency` is set once at campaign creation and never changed. This is enforced at three levels:

1. **Client store guard** — `campaignConfig.ts` setter ignores writes when `store.id` exists
2. **Admin form** — currency combobox hidden for existing campaigns; replaced with read-only `alertField`
3. **DB (future)** — `campaigns.crowdfunding->>'currency'` should be enforced immutable via trigger or application-layer check on UPDATE

Transactions store `campaign_currency` and `campaign_exchange_rate` at creation time. Stats are aggregated in campaign currency via `total_amount * campaign_exchange_rate`. Cross-currency fundraiser aggregation is a known TODO (sums without conversion).

---

## TODOs / Notes not to forget

- [ ] Campaign currency immutability: add server-side guard on UPDATE to prevent `crowdfunding->>'currency'` changes after initial INSERT
- [ ] Cross-currency fundraiser aggregation: `useFundraisers` sums `raisedAmount` without conversion when fundraisers use different currencies
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
- [ ] PDF generation on donation success (receipt + certificate) — store in `donor-documents` bucket, save URLs on transaction/line items
- [ ] GDPR anonymization endpoint — redact PII, delete PDFs, keep financial data
- [ ] Gift Aid declaration creation in donation form submission flow
- [ ] Consent record creation on email opt-in/out during donation
- [ ] Data export endpoint (`/api/donor-data-export`) for GDPR data portability
- [ ] Gift Aid HMRC claims tracking (future consideration): `gift_aid_claims` + `gift_aid_claim_items` tables
- [ ] Stripe webhook (`subscription.invoice.payment_succeeded`) must call `get_active_gift_aid_declaration()` — never inherit Gift Aid from subscription record (see "Gift Aid Drift" section above)
