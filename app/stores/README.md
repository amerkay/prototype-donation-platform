# Donation Form State Management

## Overview

The donation form uses **Pinia** for reactive state management with manual persistence to sessionStorage. This provides excellent DX with Vue DevTools integration, time-travel debugging, and a smooth UX when users refresh the page.

## Architecture

### Pattern: Pinia Stores + Manual Persistence Plugin

```
┌─────────────────────────────────────────────────────────────┐
│  DonationFormStep1.vue (UI Component)                   │
│  ├─ Renders tabs (once/monthly/yearly/multiple)         │
│  ├─ Binds to reactive state from Pinia stores           │
│  └─ Calls store actions for mutations                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  useDonationFormStore & useImpactCartStore (Pinia)      │
│  ├─ Composition API style with ref()                    │
│  ├─ Actions for all state mutations                     │
│  ├─ Getters for computed/derived values                 │
│  └─ Manual $persist() and $hydrate() methods            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  pinia-persistedstate.client.ts (Custom Plugin)         │
│  ├─ Calls $hydrate() on app mount for all stores        │
│  ├─ Subscribes to changes and calls $persist()          │
│  └─ Handles SSR hydration safely                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

### `stores/donationForm.ts`

Main Pinia store that:

- Manages all form state using Vue `ref()` and `computed()`
- Provides actions for all mutations (no direct state changes)
- Persists to sessionStorage via manual $persist() method
- Handles Set<->Array conversion for serialization
- Initialized with `initialize(defaultCurrency)` method

### `stores/impactCart.ts`

Impact cart Pinia store that:

- Manages cart state for once/monthly/multiple frequencies
- Provides computed totals (oneTimeTotal, monthlyTotal, yearlyTotal, recurringTotal)
- Provides actions for cart operations (add, remove, update)
- Persists to sessionStorage via manual $persist() method
- Auto-hydrates on page refresh

## Key Files

### `stores/donationForm.ts`

Main Pinia store that:

- Manages all form state using Vue `ref()` and `computed()`
- Provides actions for all mutations (no direct state changes)
- Persists to sessionStorage via manual $persist() method
- Handles Set<->Array conversion for serialization
- Initialized with `initialize(defaultCurrency)` method

### `stores/impactCart.ts`

Impact cart Pinia store that:

- Manages cart state for once/monthly/multiple frequencies
- Provides computed totals (oneTimeTotal, monthlyTotal, yearlyTotal, recurringTotal)
- Provides actions for cart operations (add, remove, update)
- Persists to sessionStorage via manual $persist() method
- Auto-hydrates on page refresh

## State Structure

### Store State (Pinia refs)

```typescript
// Reactive state - available in Vue DevTools + Pinia DevTools
const currentStep = ref(1)
const activeTab = ref<Frequency>('once')
const selectedCurrency = ref('USD')
const donationAmounts = ref({ once: 0, monthly: 0, yearly: 0 })
const selectedProducts = ref({ monthly: null, yearly: null })
const tributeData = ref({ once: undefined, monthly: undefined, yearly: undefined })
const selectedRewardsArrays = ref({ once: [], monthly: [], yearly: [], multiple: [] })
const formSections = ref({ donorInfo: {}, shipping: {}, giftAid: {}, preferences: {} })

// Computed getter that converts arrays to Sets
const selectedRewards = computed(() => ({
  once: new Set(selectedRewardsArrays.value.once),
  monthly: new Set(selectedRewardsArrays.value.monthly),
  yearly: new Set(selectedRewardsArrays.value.yearly),
  multiple: new Set(selectedRewardsArrays.value.multiple)
}))
```

### Session Storage Format

Automatically handled by the custom persistence plugin:

```typescript
// sessionStorage key: 'donation-form'
{
  currentStep: 1,
  activeTab: 'once',
  selectedCurrency: 'GBP',
  donationAmounts: { once: 25, monthly: 0, yearly: 0 },
  selectedProducts: { monthly: null, yearly: null },
  tributeData: { once: undefined, monthly: undefined, yearly: undefined },
  selectedRewardsArrays: { once: ['reward-1'], monthly: [], yearly: [], multiple: [] },
  formSections: { donorInfo: { name: 'John' }, shipping: {}, giftAid: {}, preferences: {} }
}

// sessionStorage key: 'impact-cart'
{
  onceCart: [],
  monthlyCart: [],
  multipleCart: [
    { id: 'product-1', price: 25, quantity: 1, addedAt: 1234567890, ... }
  ]
}
```

## Tab Isolation Rules

### Once Tab

- **State Tracked**: `donationAmounts.once`, `tributeData.once`
- **Product Selection**: Not allowed
- **Cart**: Managed by `impactCart.onceCart`

### Monthly/Yearly Tabs

- **State Tracked**: `donationAmounts[tab]`, `selectedProducts[tab]`, `tributeData[tab]`
- **Product Selection**: Single product only
- **Cart**: Managed by `impactCart.monthlyCart`

### Multiple Tab

- **State Tracked**: Managed by `useImpactCartStore`
- **Product Selection**: Multiple products via cart
- **Cart**: Managed by `impactCart.multipleCart`

### Global State

- **Currency**: Synced for all tabs
- **Current Step**: Navigation state
- **Form Sections**: Donor info, shipping, gift aid, preferences

## Usage Example

```typescript
// Import stores
import { useDonationFormStore } from '~/stores/donationForm'
import { useImpactCartStore } from '~/stores/impactCart'

// Initialize donation form store
const store = useDonationFormStore()
store.initialize('GBP')

// Initialize impact cart store
const cartStore = useImpactCartStore()

// Use store state (reactive)
const selectedFrequency = computed({
  get: () => store.activeTab,
  set: (value) => store.setActiveTab(value)
})

// Call donation form actions
store.setDonationAmount('monthly', 25)
store.toggleReward('reward-1', 'once')
store.clearSession()

// Call impact cart actions
cartStore.addToCart(product, 25, 'multiple', 1)
cartStore.updateCartItemPrice('product-1', 1234567890, 30, 'multiple')
cartStore.removeFromCart('product-1', 1234567890, 'multiple')

// Access cart totals
const total = cartStore.recurringTotal
const monthlyTotal = cartStore.monthlyTotal
```

## Benefits of Pinia Store Pattern

- **Centralized state**: All state mutations through actions
- **Pinia DevTools**: Full state inspection and time-travel debugging
- **Better TypeScript**: Inferred types from store definitions
- **SSR-safe**: Plugin handles hydration automatically via $hydrate()
- **Testable**: Use `createTestingPinia()` for unit tests
- **Less code**: ~30% reduction compared to composable pattern
- **Reactive**: All state changes trigger component re-renders
- **Persistent**: Auto-saves to sessionStorage on any change
