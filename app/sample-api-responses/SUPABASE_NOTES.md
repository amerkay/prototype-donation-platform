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
