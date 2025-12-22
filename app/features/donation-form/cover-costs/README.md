# Cover Costs Feature - Dynamic Percentage/Amount Implementation

## Overview

The cover costs feature dynamically switches between percentage-based and fixed amount modes based on the donation amount.

## Behavior

- **Donations ≥ 10 GBP equivalent**: Percentage slider (0-30%)
- **Donations < 10 GBP equivalent**: Fixed amount slider (0-5 in local currency)

## Implementation

### Components

1. **`CoverCostsField.vue`** - Smart wrapper component
   - Calculates threshold in current currency
   - Determines which mode to use
   - Renders appropriate form section
   - Handles value initialization and mode switching

2. **`cover-costs-percent-field.ts`** - Percentage mode form definition
   - Slider showing 0-30% range
   - Display: "X% covered costs"

3. **`cover-costs-amount-field.ts`** - Fixed amount mode form definition
   - Slider showing 0-5 in local currency
   - Display: "£X.XX covered costs"

### Data Storage

Both modes store their values in the `giftAid` form section:

- **Percentage mode**: `coverFeesPercentage` (number, 0-30)
- **Fixed amount mode**: `coverFeesAmount` (number, 0-5)

When switching modes, the inactive field is set to `undefined`.

### Default Values

- **Percentage mode**: Uses `config.defaultPercentage` (e.g., 10%)
- **Fixed amount mode**: Calculates as `2 × defaultPercentage × donationAmount`, capped at 5

### Display

`OrderSummary.vue` handles both modes:

- Shows percentage if `coverFeesPercentage` is set
- Shows fixed amount if `coverFeesAmount` is set
- Formats appropriately: "including X% covered costs" or "including £X.XX covered costs"

## Constants

- `THRESHOLD_AMOUNT_GBP = 10` - Threshold in base currency (GBP)
- Located in `CoverCostsField.vue`

## Usage

The feature is integrated in `DonationFormStep3.vue`:

```vue
<CoverCostsField
  v-if="formConfig.features.coverCosts.enabled"
  v-model="coverCostsData"
  :config="formConfig.features.coverCosts"
  :donation-amount="currentDonationAmount"
  :currency="store.selectedCurrency"
/>
```

## Configuration

Controlled via `FormConfig`:

```typescript
features: {
  coverCosts: {
    enabled: true,
    defaultPercentage: 10,
    heading: 'Send 100% to the Cause',
    description: 'By covering operational costs...'
  }
}
```
