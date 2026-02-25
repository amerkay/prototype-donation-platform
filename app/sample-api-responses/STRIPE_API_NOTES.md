# Stripe API — Server-Side Security Notes

> **Critical**: The frontend gates (hidden buttons, disabled states) are UX-only.
> Every refund and subscription action MUST be re-verified server-side.
> HTTP requests can be crafted without touching the UI at all.

---

## Refund Endpoint (`POST /api/refunds`)

### 1. Authenticate the donor

- Verify the JWT/session belongs to the requesting donor
- Look up `transactions.donor_id` — must match the authenticated user
- Reject immediately if ownership check fails (403)

### 2. Verify transaction state

- `transactions.status` must be `succeeded`
- `transactions.type` must be `one_time` or `subscription_payment` (not `refund`)
- No existing refund: `SELECT 1 FROM transactions WHERE type='refund' AND refund_of_transaction_id = $txn_id` must return empty
- Reject if already refunded (409 Conflict)

### 3. Re-evaluate eligibility gate (from `donor_portal_settings`)

Load `donor_portal_settings.refund` for the org and evaluate server-side:

```
if !refund.enabled → 403

# Refund window: transaction must be within window_days of payment
if NOW() - transactions.created_at > refund.window_days * INTERVAL '1 day' → 403

if refund.min_duration_months > 0 AND transaction.type = 'subscription_payment':
  subscription_age_months = FLOOR((NOW() - subscriptions.created_at) / 30 days)
  if subscription_age_months < refund.min_duration_months → 403

if refund.min_donor_value_last_year > 0:
  donor_value = SUM(transactions.total_amount * exchange_rate)
                WHERE donor_id = $donor_id
                AND status = 'succeeded'
                AND created_at >= NOW() - INTERVAL '12 months'
                AND organization_id = $org_id
  if donor_value < refund.min_donor_value_last_year → 403
```

Note: `min_duration_months` check is skipped for `one_time` transactions (no subscription age).

### 5. Issue the refund via Stripe

- Call `stripe.refunds.create({ payment_intent: transactions.processor_transaction_id })`
- On success: insert negative `transactions` record (`type='refund'`, `refund_of_transaction_id`)
- Update original `transactions.status = 'refunded'`
- If `also_cancel=true` in request body: verify `canCancel` eligibility separately before cancelling subscription

---

## Subscription Actions (`POST /api/subscriptions/:id/pause|cancel|change-amount`)

### Authentication & ownership

- Verify JWT donor owns `subscriptions.donor_id`

### Re-evaluate eligibility gate

Same pattern as refund above, using the relevant `donor_portal_settings` key:

- `pause` → `donor_portal_settings.pause_subscription`
- `cancel` → `donor_portal_settings.cancel_subscription`
- `change_amount` → `donor_portal_settings.change_amount`

### Change Amount — additional checks

- New amount must be `>= forms.config.donation_amounts.frequencies[subscription.frequency].custom_amount.min`
  - Look up: `subscriptions.campaign_id` → `campaigns.forms` → `isDefault=true` → config
- New amount must differ from current `subscriptions.amount`
- Call `stripe.subscriptions.update({ items: [{ price: ... }] })` or create a new price object

### Cancel — Stripe API

- Call `stripe.subscriptions.cancel(subscriptions.processor_subscription_id)`
- Update `subscriptions.status = 'cancelled'`, clear `next_billing_date`

### Pause — Stripe API

- Stripe does not natively "pause" — implement via `stripe.subscriptions.update({ pause_collection: { behavior: 'void' } })`
- Update `subscriptions.status = 'paused'`

---

## General Security Rules

| Rule                                                  | Reason                                       |
| ----------------------------------------------------- | -------------------------------------------- |
| Never trust `eligibility` flags from the request body | They are computed client-side                |
| Always re-fetch `donor_portal_settings` from DB       | Admin may have changed them after page load  |
| Idempotency keys on Stripe calls                      | Prevent duplicate charges on network retries |
| Rate-limit refund/cancel endpoints per donor          | Prevent abuse                                |
| Log all eligibility failures with reason              | Audit trail for suspicious activity          |
