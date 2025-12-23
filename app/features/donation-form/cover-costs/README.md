# Cover Costs Feature - Dynamic Percentage/Amount Implementation

## Overview

The cover costs feature dynamically switches between percentage-based and fixed amount modes based on the donation amount. **All logic is centralized in this feature folder** through the `useCoverCostsManager()` composable.

## Architecture

### Centralized Logic Pattern

All cover costs logic is contained within this feature folder. Other components access cover costs values through the composable API - no scattered calculations or mode switching logic elsewhere.

#### Store Schema

The donation store contains a simple normalized state:

```ts
{
  coverCosts: {
    type: 'percentage' | 'amount',
    value: number
  } | null
}
```

#### Composable API

**`useCoverCostsManager()`** - Single source of truth for all cover costs logic

```ts
const {
  // Computed values
  donationAmount, // Current donation amount
  thresholdInCurrentCurrency, // Threshold for mode switching
  shouldUsePercentageMode, // Whether to use percentage or fixed amount
  coverCostsType, // 'percentage' | 'amount' | null
  coverCostsValue, // Raw value (percentage or amount)
  coverCostsAmount, // Calculated amount in currency

  // Actions
  setCoverCostsPercentage, // Set as percentage
  setCoverCostsAmount, // Set as fixed amount
  clearCoverCosts // Clear cover costs
} = useCoverCostsManager()
```

## Behavior

- **Donations ≥ 10 GBP equivalent**: Percentage slider (0-30%)
- **Donations < 10 GBP equivalent**: Fixed amount slider (0-5 in local currency)

## Implementation

### Components

1. **`CoverCostsField.vue`** - Smart wrapper component
   - Uses `useCoverCostsManager()` for all logic
   - Renders appropriate form section based on mode
   - Handles value initialization on mount
   - No complex props - just config

2. **`cover-costs-percent-field.ts`** - Percentage mode form definition
   - Slider showing 0-30% range
   - Display: "X% covered costs"

3. **`cover-costs-amount-field.ts`** - Fixed amount mode form definition
   - Slider showing 0-5 in local currency
   - Display: "£X.XX covered costs"

### Data Storage

Centralized in store as normalized state:

- `{ type: 'percentage', value: 10 }` - 10% mode
- `{ type: 'amount', value: 2.5 }` - £2.50 fixed amount mode
- `null` - No cover costs selected

### Default Values

- **Percentage mode**: Uses `config.defaultPercentage` (e.g., 10%)
- **Fixed amount mode**: Calculates as `2 × defaultPercentage × donationAmount`, capped at 5

### Usage in Other Components

**OrderSummary.vue** - Display cover costs

```ts
const { coverCostsAmount, coverCostsType, coverCostsValue } = useCoverCostsManager()

// Use coverCostsAmount.value for calculations
// Use coverCostsType.value to determine display format
```

**DonationFormStep3.vue** - Render field

```vue
<CoverCostsField :config="formConfig.features.coverCosts" />
```

## Benefits

1. ✅ Single source of truth - All logic in feature folder
2. ✅ Clean store schema - Simple normalized state
3. ✅ Type-safe API - Full TypeScript support
4. ✅ Easy to test - Pure composable functions
5. ✅ Minimal coupling - Components only depend on composable
6. ✅ Maintainable - Changes isolated to feature folder

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
