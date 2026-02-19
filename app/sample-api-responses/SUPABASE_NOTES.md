# Supabase Implementation Notes

Pending schema changes and triggers needed before migrating to Supabase.

---

## Quantity Remaining Trigger

The `form_feature_impact_cart` table needs a `quantity_remaining` JSONB column (or a sibling `form_product_quantity` junction table) to track per-product remaining stock.

A trigger on the `transactions` table (or `transaction_line_items`) must decrement `quantity_remaining` for each product when a transaction succeeds:

```sql
-- Decrement quantity_remaining when a transaction succeeds
CREATE OR REPLACE FUNCTION decrement_quantity_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND (TG_OP = 'INSERT' OR OLD.status != 'succeeded') THEN
    UPDATE form_feature_impact_cart ic
    SET quantity_remaining = (
      SELECT jsonb_object_agg(
        key,
        GREATEST(0, (value::int) - COALESCE((
          SELECT SUM(li.quantity)
          FROM transaction_line_items li
          WHERE li.transaction_id = NEW.id AND li.product_id = key
        ), 0))
      )
      FROM jsonb_each_text(ic.quantity_remaining)
    )
    FROM campaign_forms cf
    WHERE cf.campaign_id = NEW.campaign_id
      AND ic.form_id = cf.id
      AND ic.quantity_remaining IS NOT NULL;
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
  -- 0 = sold out, positive = remaining stock
  PRIMARY KEY (form_id, product_id)
);
```

With a trigger that decrements `quantity_remaining` per line item on successful transactions. This approach is cleaner for concurrent writes (row-level locking vs JSONB mutation).

---

## Data Layer Migration

### Sample data → Supabase queries

Replace static imports with async Supabase fetches. Each file below imports from `sample-api-responses/` and needs a Supabase equivalent:

| Consumer                                                            | Current import                        | Supabase replacement                                                              |
| ------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| `features/_admin/composables/useEntityDataService.ts`               | `transactions`, `subscriptions`       | Central async fetch; remove `setTimeout` simulation; lookup maps stay as computed |
| `features/donations/admin/composables/useDonations.ts`              | `transactions`                        | `supabase.from('transactions').select('*, line_items(*)')` with date range        |
| `features/donors/admin/composables/useDonors.ts`                    | `transactions`                        | Aggregate query or RPC: `GROUP BY donor_id` with totals                           |
| `features/subscriptions/admin/composables/useAdminSubscriptions.ts` | `transactions`, `subscriptions`       | Join `subscriptions` with donor info from `transactions`                          |
| `features/campaigns/shared/stores/forms.ts`                         | `api-sample-response-forms.ts`        | `supabase.from('campaign_forms').select(...)`                                     |
| `features/campaigns/shared/stores/campaignConfig.ts`                | `api-sample-response-campaigns.ts`    | `supabase.from('campaigns').select(...)`                                          |
| `features/donor-portal/composables/useDonorPortal.ts`               | `api-sample-response-transactions.ts` | RLS-filtered query for authenticated donor                                        |

### Server-side filtering architecture

All filtering moves server-side — client-side predicate evaluation won't scale past ~1k records.

| Decision               | Choice                                                                     | Rationale                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Predicate translation  | Single `buildSupabaseFilter(query, conditions, schema)` in `_admin/utils/` | One fn maps `FilterConditionValues` → `.eq()`/`.gte()`/`.in()`/`.contains()` chains; RPC fallback for complex predicates  |
| Cross-entity filters   | Subqueries in RPC (`EXISTS`/`IN`)                                          | Always-fresh, no materialized view staleness; e.g., "donors whose transactions have source=website"                       |
| Pagination             | Cursor-based (keyset)                                                      | `WHERE created_at < :cursor ORDER BY created_at DESC LIMIT 50` — consistent at any depth                                  |
| UI coupling            | `useFilterState` keeps UI, adds `mode: 'server'`                           | Emits `FilterConditionValues` JSON instead of client predicate; zero UI changes, `_library/` untouched                    |
| Custom field discovery | Lazy query on filter sheet open, session-cached                            | `SELECT DISTINCT jsonb_object_keys(custom_fields) FROM transactions` + values per key                                     |
| List data integration  | New `useServerList(table, options)` composable                             | Replaces `useDonations`/`useDonors`/`useAdminSubscriptions`; owns fetch + pagination + refetch; `AdminListPage` unchanged |
| Search                 | Server `ilike` with 300ms client debounce                                  | `OR(name.ilike.%q%, email.ilike.%q%)` pushed to Supabase; replaces `useQuickFind` client-side filtering                   |

### Data flow after migration

```
AdminListPage (unchanged)
  └→ useServerList(table, { filters, dateRange, search, cursor })
       ├→ buildSupabaseFilter() — simple fields: .eq/.gte/.in/.contains
       ├→ RPC fallback — cross-entity subqueries, JSONB deep filters
       ├→ date range — .gte('created_at', from).lte('created_at', to)
       ├→ search — .or('name.ilike.%q%,email.ilike.%q%')
       └→ pagination — .order('created_at', { ascending: false }).limit(50)
```

### Schema notes

- `transactions.custom_fields` → JSONB column; key discovery via `SELECT DISTINCT jsonb_object_keys(custom_fields)`
- `transaction_line_items` → separate table (currently nested `lineItems[]` array)
- Donor aggregation (currently in `useEntityDataService` + `useDonors`) → RPC with `GROUP BY donor_id`

### Files replaced or retired

| Current file                                                | Migration action                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `_admin/composables/useEntityDataService.ts`                | Retired — cross-entity lookup maps replaced by server subqueries                            |
| `donations/admin/composables/useDonations.ts`               | Replaced by `useServerList('transactions', ...)`                                            |
| `donors/admin/composables/useDonors.ts`                     | Replaced by `useServerList('donors_view', ...)` (RPC aggregation)                           |
| `subscriptions/admin/composables/useAdminSubscriptions.ts`  | Replaced by `useServerList('subscriptions', ...)` with donor join                           |
| `_admin/composables/useQuickFind.ts`                        | Retired — search pushed to `useServerList` server query                                     |
| `_admin/utils/buildCustomFieldSchema.ts`                    | Kept — schema discovery query replaces transaction scan, same output shape                  |
| `donations/admin/composables/useDonationFilters.ts`         | Kept — schema + `useFilterState` unchanged; remove `buildCustomEvaluators` (server handles) |
| `donors/admin/composables/useDonorFilters.ts`               | Kept — same; cross-entity evaluators retired                                                |
| `subscriptions/admin/composables/useSubscriptionFilters.ts` | Kept — same                                                                                 |

---

## TODOs / Notes not to forget

- [ ] Per-user `interfaceConfig` table: sorting, table/card mode, filter presets — persists across devices
- [ ] `useFilterState` `mode: 'server'` option — emit `FilterConditionValues` JSON, skip client predicate
- [ ] `useServerList` composable — generic fetch + pagination + refetch, accepts filters/date/search/cursor
- [ ] `buildSupabaseFilter` utility — translate `FilterConditionValues` → Supabase query chains + RPC fallback
- [ ] Custom field schema discovery endpoint — lazy fetch on filter sheet open, session-cached
