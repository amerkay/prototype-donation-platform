# Compliance & Immutable Records Decisions

Reference doc for all compliance, data integrity, and regulatory decisions. See also `SUPABASE_SCHEMA_DRAFT.md` (schema) and `SUPABASE_NOTES.md` (migration TODOs).

---

## Immutable Records Strategy

**Principle: "Store the artifact, not the ingredients."**

- Generate receipt and certificate PDFs at donation time, store on Supabase Storage (S3-compatible)
- `receipt_pdf_url` on `transactions`, `certificate_pdf_url` on `transaction_line_items`
- The PDF freezes charity identity, product details, branding, and legal text at the moment of donation
- No need to snapshot charity name/address/reg# or product description/image in the DB — the PDF is the snapshot

### DB Snapshot Fields (for live queries, portal, admin views)

These fields ARE snapshotted at write time because they're needed outside of PDFs:

| Field                            | Table                                           | Why                               |
| -------------------------------- | ----------------------------------------------- | --------------------------------- |
| `campaign_name`                  | transactions, subscriptions                     | Portal display, admin lists       |
| `charity_name`                   | transactions, subscriptions                     | Portal display                    |
| `donor_name`, `donor_email`      | transactions                                    | Admin lists, search, GDPR subject |
| `product_title`                  | transaction_line_items, subscription_line_items | Portal, admin detail views        |
| `unit_price`                     | transaction_line_items, subscription_line_items | Financial accuracy                |
| `exchange_rate`, `base_currency` | transactions                                    | Multi-currency aggregation        |
| `custom_fields` (JSONB)          | transactions                                    | Self-contained captured values    |

### NOT Snapshotted in DB (covered by PDF)

- Charity address, reg number, phone, email, website
- Product description, image, certificate title/text
- Charity logo/branding
- Gift Aid declaration wording
- Terms & conditions text

---

## Refund Model

- Refunds are **negative transactions** with `type = 'refund'` and `refund_of_transaction_id` FK pointing to the original
- Support **full and partial** refunds (partial = lower amount referencing same original)
- Cover costs: no special treatment — just part of the refund amount
- Gift Aid reversal: `gift_aid_reversed` boolean + `gift_aid_amount_reversed` on refund transactions
- Original transaction is **never modified** — its `status` may update to `'refunded'` but all fields stay intact

---

## HMRC Gift Aid Compliance (UK)

### Declarations

- `gift_aid_declarations` table records each donor's Gift Aid declaration
- Required fields: donor name, home address (JSONB), declaration date
- One declaration can cover all future donations (`covers_to = NULL`)
- Declarations can be cancelled (`is_active = false`, `cancelled_at` set)
- `gift_aid_declaration_id` FK on transactions links each donation to its declaration

### Amounts

- `gift_aid_amount` on transactions stores the calculated Gift Aid value (currently 25% in UK)
- `donor_address` JSONB on transactions snapshots the donor's home address at donation time

### Retention

- Gift Aid records must be retained **6 years** after the last donation covered by the declaration
- Transactions must **never be hard-deleted**

### Future: Claims Tracking

- Consider `gift_aid_claims` + `gift_aid_claim_items` tables for HMRC batch submission
- Tracks which transactions were included in which HMRC claim to prevent double-claiming
- Not required for MVP

---

## GDPR Compliance

### Legal Bases (Article 6)

| Processing activity       | Legal basis             | Notes                              |
| ------------------------- | ----------------------- | ---------------------------------- |
| Donation transaction data | `contractual_necessity` | Donor requested payment processing |
| Gift Aid records          | `legal_obligation`      | HMRC requires retention            |
| Marketing emails          | `consent`               | Explicit opt-in required           |

Stored as `legal_basis` field on `transactions` and `consent_records`.

### Consent Records

- `consent_records` table logs **every** consent event (opt-in AND opt-out)
- Fields: donor, purpose, granted boolean, legal_basis, source form ID, exact wording shown, timestamp, IP
- Purpose values: `'marketing_email'`, extensible for future purposes
- Admin-configurable: whether email opt-in is pre-checked for returning donors

### Anonymization (Right to Erasure — Article 17)

On donor erasure request:

1. Set `donor_users.anonymized_at` timestamp
2. Update `transactions.donor_name` → `'[Redacted]'`, `donor_email` → `'[Redacted]'`
3. Set `transactions.anonymized_at` timestamp
4. **Delete** stored receipt/certificate PDFs from Storage
5. Keep all financial data intact (amounts, dates, Gift Aid status) — permitted under Article 17(3)(b) "compliance with a legal obligation"

### Data Portability (Article 20)

- Donor portal "Download My Data" feature — exports JSON of all personal data
- Production: `/api/donor-data-export` endpoint querying all donor-related tables, rate-limited
- Prototype: client-side assembly from sample data

---

## CCPA Compliance (California)

- Platform does **not** sell, rent, or trade personal information
- Terms of use page includes explicit "We do not sell personal information" statement
- No "Do Not Sell" toggle needed since no data sales occur
- No additional schema changes required

---

## Subscription Renewals

- Each renewal creates a new `transaction` + `transaction_line_items`
- Renewal line items copy `product_title` from `subscription_line_items` (the original signup snapshot), NOT from the live `products` table
- Subscription row (`subscriptions` table) reflects **current state only** — history is via transactions
- No separate subscription audit log table needed

---

## International Tax Receipts

- Receipt templates are per-currency via charity settings (`organization_charity_currencies`)
- GBP donations use UK charity identity (name, reg#, address), USD uses US entity, etc.
- The `currency` field on transactions implicitly identifies which charity entity was used
- No separate `tax_receipt_type` field needed — currency + stored PDF captures everything
