# Donation Form State Management

## Overview

The donation form uses a hybrid approach combining **Nuxt `useState`** for reactive in-memory state with **sessionStorage** for persistence across page reloads. This ensures excellent DX with Vue DevTools integration while providing a smooth UX when users refresh the page.

## Architecture

### Pattern: Nuxt useState + Session Storage Sync

```
┌─────────────────────────────────────────────────────────┐
│  DonationFormStep1.vue (UI Component)                   │
│  ├─ Renders tabs (once/monthly/yearly/multiple)         │
│  ├─ Binds to reactive state from composables             │
│  └─ Triggers sync on user interactions                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  useDonationFormState (State Manager)                   │
│  ├─ useState: Reactive, SSR-safe, DevTools-visible      │
│  ├─ Watches: Debounced sync (500ms) on state changes    │
│  ├─ Tab Isolation: Only active tab data is synced       │
│  └─ Session Sync: Periodic write to sessionStorage      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  sessionStorage: 'donation-form:session'                │
│  ├─ Persists across page refreshes                      │
│  ├─ Cleared on tab close                                │
│  └─ Contains only active tab's state + global data      │
└─────────────────────────────────────────────────────────┘
```

## Key Files

### `useDonationFormState.ts`

Main state management composable that:

- Creates Nuxt `useState` refs for all form data
- Watches state changes and syncs to sessionStorage (debounced)
- Provides restore/clear methods for session management
- Only syncs the **currently active tab's data**

### `useImpactCart.ts`

Manages cart items and rewards:

- Uses module-level refs (singleton pattern)
- Consumed by `useDonationFormState` for snapshot serialization
- Not modified - existing composable works as-is

## State Structure

### In-Memory State (Nuxt useState)

```typescript
// Reactive state - available in Vue DevTools
const activeTab = useState('donation-form:active-tab', () => 'once')
const selectedCurrency = useState('donation-form:currency', () => 'GBP')
const donationAmounts = useState('donation-form:amounts', () => ({
  once: 0,
  monthly: 0,
  yearly: 0
}))
const selectedProducts = useState('donation-form:products', () => ({
  monthly: null,
  yearly: null
}))
const tributeData = useState('donation-form:tribute', () => ({
  once: undefined,
  monthly: undefined,
  yearly: undefined
}))
```

### Session Storage Format

```typescript
interface DonationFormSession {
  activeTab: 'once' | 'monthly' | 'yearly' | 'multiple'
  currency: string
  donationAmounts: { once: number; monthly: number; yearly: number }
  selectedProducts: { monthly: Product | null; yearly: Product | null }
  tributeData: { once?: TributeData; monthly?: TributeData; yearly?: TributeData }
  multipleCartSnapshot: CartItem[] // Only when activeTab === 'multiple'
  selectedRewardsSnapshot: string[] // Global rewards
  lastSyncedAt: number // Timestamp for debugging
}
```

## Tab Isolation Rules

### Once Tab

- **State Tracked**: `donationAmounts.once`, `tributeData.once`
- **Product Selection**: Not allowed (no selectedProduct for 'once')
- **Cart**: Not used

### Monthly/Yearly Tabs

- **State Tracked**: `donationAmounts[tab]`, `selectedProducts[tab]`, `tributeData[tab]`
- **Product Selection**: Single product only (stored in selectedProducts)
- **Cart**: Not used

### Multiple Tab

- **State Tracked**: `multipleCart` (from useImpactCart)
- **Product Selection**: Multiple products via cart
- **Cart**: Full cart state synced to session

### Global State

- **Currency**: Synced for all tabs
- **Rewards**: Synced regardless of active tab

## Sync Behavior

### When Does Sync Happen?

1. **Debounced Sync (500ms)**: Any state change in watched refs
2. **Immediate Sync**: Tab switch, cart modifications in multiple tab
3. **Manual Sync**: Cart item add/remove/edit in multiple tab

### What Gets Synced?

```typescript
// Active tab: 'once' → Only once data
{ activeTab: 'once', donationAmounts: { once: 25 }, ... }

// Active tab: 'monthly' → Only monthly data
{ activeTab: 'monthly', donationAmounts: { monthly: 10 },
  selectedProducts: { monthly: {...} }, ... }

// Active tab: 'multiple' → Full cart
{ activeTab: 'multiple', multipleCartSnapshot: [...], ... }
```

## Usage Example

### In DonationFormStep1.vue

```typescript
// 1. Import composable
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useImpactCart } from '~/features/donation-form/impact-cart/useImpactCart'

// 2. Initialize state
const {
  activeTab: selectedFrequency,
  selectedCurrency,
  donationAmounts,
  setupSync,
  restoreFromSession,
  clearSession
} = useDonationFormState('GBP')

const { multipleCart, selectedRewards } = useImpactCart()

// 3. Setup sync watchers
setupSync(
  () => multipleCart.value,
  () => selectedRewards.value
)

// 4. Restore session on mount
onMounted(() => {
  const restored = restoreFromSession()
  if (restored) {
    // Hydrate cart from session
    restored.multipleCart.forEach(item => addToCart(item, ...))
    restored.selectedRewards.forEach(id => selectedRewards.value.add(id))
  }
})

// 5. Clear session on successful submission
const handleSubmit = async () => {
  await submitDonation()
  clearSession() // Clear after success
}
```

## Testing the Implementation

### Manual Test Cases

1. **Page Refresh Test**
   - Fill out donation form (any tab)
   - Refresh page (F5)
   - ✅ State should be restored

2. **Tab Switch Test**
   - Switch between tabs
   - Refresh page
   - ✅ Should restore to last active tab

3. **Cart Persistence Test**
   - Add items to Multiple tab
   - Refresh page
   - ✅ Cart items should be restored

4. **Session Expiry Test**
   - Fill out form
   - Close tab
   - Open new tab
   - ✅ Session should be empty (sessionStorage cleared)

5. **Currency Switch Test**
   - Change currency
   - Refresh page
   - ✅ Currency selection should be restored

### DevTools Inspection

1. Open Vue DevTools → **Pinia/Setup** tab
2. Look for `useState` keys:
   - `donation-form:active-tab`
   - `donation-form:currency`
   - `donation-form:amounts`
   - `donation-form:products`
   - `donation-form:tribute`

3. Open Browser DevTools → **Application** → **Session Storage**
4. Look for key: `donation-form:session`
5. Verify JSON structure matches current state

## Performance Considerations

### Debounce Strategy

- **500ms debounce** on state changes prevents excessive writes
- **Immediate sync** on tab switches ensures critical state is saved
- **Deep watch** on objects catches nested property changes

### Memory Usage

- **sessionStorage limit**: ~5-10MB (plenty for donation form)
- **Typical session size**: <10KB for average cart

### SSR Compatibility

- All sync operations guarded with `if (import.meta.server) return`
- `useState` is SSR-safe by default
- Session restore only runs client-side in `onMounted`

## Future Enhancements

### Possible Additions

1. **Session Expiry**: Add timestamp check, clear old sessions (>24h)
2. **Conflict Resolution**: Handle multiple tabs editing same form
3. **Analytics Integration**: Track session restore rate
4. **Draft Saving**: Add explicit "Save Draft" button
5. **localStorage Fallback**: Use localStorage if sessionStorage unavailable

### Migration to Pinia (if needed)

If the project later adopts Pinia, the migration is straightforward:

1. Create `useDonationFormStore()` with same interface
2. Replace `useState` with `ref` inside store
3. Add Pinia persistence plugin for session sync
4. Update imports in components

Current pattern is already Pinia-like, making migration easy.

## Troubleshooting

### State not restoring?

- Check sessionStorage in DevTools (Application tab)
- Verify `restoreFromSession()` is called in `onMounted`
- Check console for serialization errors

### Sync not happening?

- Verify `setupSync()` is called after composable initialization
- Check debounce timing (increase if needed)
- Watch Network tab for sessionStorage writes

### Cart items duplicating?

- Ensure `clearCart()` is called before restoring
- Check `addedAt` timestamps for uniqueness

### Session persisting after submission?

- Verify `clearSession()` is called on successful form submit
- Check for error handling that might skip cleanup

## Best Practices

1. **Always call `setupSync()`** after initializing composables
2. **Always call `clearSession()`** after successful submission
3. **Use `triggerSync()`** for immediate saves (e.g., before navigation)
4. **Test with DevTools open** to verify state sync
5. **Handle restore failures gracefully** (corrupted session data)

## Summary

This implementation provides:

- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Minimal**: Reuses existing composables, no major refactor
- ✅ **Robust**: Handles edge cases (tab close, page refresh, errors)
- ✅ **DX**: Full DevTools support, TypeScript-safe
- ✅ **UX**: Seamless restore on refresh, no data loss
