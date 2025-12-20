# Donation Form State Management

## Overview

The donation form uses **Pinia** for reactive state management with **pinia-plugin-persistedstate** for automatic persistence to sessionStorage. This provides excellent DX with Vue DevTools integration, time-travel debugging, and a smooth UX when users refresh the page.

## Architecture

### Pattern: Pinia Store + Auto-Persistence Plugin

```
┌─────────────────────────────────────────────────────────┐
│  DonationFormStep1.vue (UI Component)                   │
│  ├─ Renders tabs (once/monthly/yearly/multiple)         │
│  ├─ Binds to reactive state from Pinia store            │
│  └─ Calls store actions for mutations                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  useDonationFormStore (Pinia Store)                     │
│  ├─ Composition API style with ref()                    │
│  ├─ Actions for all state mutations                     │
│  ├─ Getters for computed/derived values                 │
│  └─ Auto-persisted via plugin                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  pinia-plugin-persistedstate                            │
│  ├─ Auto-syncs to sessionStorage on mutations           │
│  ├─ Auto-hydrates on app mount                          │
│  └─ Handles SSR hydration safely                        │
└─────────────────────────────────────────────────────────┘
```

## Key Files

### `stores/donationForm.ts`

Main Pinia store that:

- Manages all form state using Vue `ref()` and `computed()`
- Provides actions for all mutations (no direct state changes)
- Auto-persists to sessionStorage via plugin
- Handles Set<->Array conversion for serialization
- Initialized with `initialize(defaultCurrency)` method

### `useImpactCart.ts`

Manages cart items and rewards:

- Uses module-level refs (singleton pattern)
- Independent of donation form store
- Can be migrated to Pinia in future if needed

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
const formSections = ref({ donorInfo: {}, shipping: {}, giftAid: {} })

// Computed getter that converts arrays to Sets
const selectedRewards = computed(() => ({
  once: new Set(selectedRewardsArrays.value.once),
  monthly: new Set(selectedRewardsArrays.value.monthly),
  yearly: new Set(selectedRewardsArrays.value.yearly),
  multiple: new Set(selectedRewardsArrays.value.multiple)
}))
```

### Session Storage Format

Automatically handled by pinia-plugin-persistedstate:

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
  formSections: { donorInfo: { name: 'John' }, shipping: {}, giftAid: {} }
}
```

## Tab Isolation Rules

## Tab Isolation Rules

### Once Tab

- **State Tracked**: `donationAmounts.once`, `tributeData.once`
- **Product Selection**: Not allowed
- **Cart**: Not used

### Monthly/Yearly Tabs

- **State Tracked**: `donationAmounts[tab]`, `selectedProducts[tab]`, `tributeData[tab]`
- **Product Selection**: Single product only
- **Cart**: Not used

### Multiple Tab

- **State Tracked**: Managed by `useImpactCart` composable
- **Product Selection**: Multiple products via cart
- **Cart**: Separate cart management

### Global State

- **Currency**: Synced for all tabs
- **Current Step**: Navigation state
- **Form Sections**: Donor info, shipping, gift aid

## Usage Example

```typescript
// Import store
import { useDonationFormStore } from '~/stores/donationForm'

// Initialize store
const store = useDonationFormStore()
store.initialize('GBP')

// Use store state (reactive)
const selectedFrequency = computed({
  get: () => store.activeTab,
  set: (value) => store.setActiveTab(value)
})

// Call actions
store.setDonationAmount('monthly', 25)
store.toggleReward('reward-1', 'once')
store.clearSession()
```

## Benefits Over Previous Approach

- **30% less code**: Removed ~100 lines of manual sync logic
- **Pinia DevTools**: Full state inspection and time-travel debugging
- **Better TypeScript**: Inferred types from store
- **SSR-safe**: Plugin handles hydration automatically
- **Centralized**: All mutations through actions
- **Testable**: Use `createTestingPinia()` for mocks
