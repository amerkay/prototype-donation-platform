# Preview Click-to-Edit

Admin edit pages show a live preview panel alongside a config form. Clicking any editable element in the preview scrolls to and highlights the corresponding config field. This document explains how to wire up new preview elements.

## How It Works

```
Preview click on element with data-field="crowdfunding.title"
  → usePreviewEditable finds nearest ancestor with data-field attribute
  → canResolveHashTarget("crowdfunding.title") checks if the path exists in the form
  → activateHashTarget("crowdfunding.title") fires
    → Suffix matching resolves to full field tree path (e.g. config.sections.crowdfunding.title)
    → Auto-switches tabs/sub-tabs along the path
    → Expands collapsed accordions
    → Scrolls to and highlights the target field (ring flash animation)
```

No URL changes — `activateHashTarget` is a programmatic API that bypasses routing.

## Components

| Component            | Role                                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PreviewEditable`    | Wraps preview content. Intercepts hover (dashed outline + pencil button) and click events on `data-field` elements.                                                                                       |
| `usePreviewEditable` | Composable that handles DOM event listeners, field detection, and `activateHashTarget` calls.                                                                                                             |
| `useHashTarget`      | Form-builder composable. Provider (`provideHashTarget`) registers the form's field tree as the global target. Consumer (`useHashTarget`) detects when a field is targeted and provides highlight classes. |

## Adding Click-to-Edit to a New Preview

### 1. Define a TARGETS constant

Create a `TARGETS` object in the master form file (next to the `defineForm`). Values are **suffix paths** — the tail of the form field tree path, omitting the common prefix.

```typescript
// campaign-config-master.ts
const TAB_CROWDFUNDING = 'crowdfunding'

export const CAMPAIGN_FIELD_TARGETS = {
  crowdfunding: {
    title: `${TAB_CROWDFUNDING}.title`, // matches config.sections.crowdfunding.title
    goalAmount: `${TAB_CROWDFUNDING}.goalAmount` // matches config.sections.crowdfunding.goalAmount
  },
  matchedGiving: 'matchedGiving' // matches config.sections.matchedGiving (whole tab)
} as const
```

**Suffix matching**: The hash resolver finds the first field whose full path _ends with_ `.${target}`. So `crowdfunding.title` matches `config.sections.crowdfunding.title`. Use enough path segments to be unambiguous — single-segment names (`title`) match the first field with that name anywhere in the tree.

### 2. Add `data-field` attributes to the donor component

The same donor component renders in both the live preview and the real donor page. Add `data-field` attributes to editable elements:

```vue
<script setup lang="ts">
import { CAMPAIGN_FIELD_TARGETS as CT } from '~/features/campaigns/admin/forms/campaign-config-master'
</script>

<template>
  <h2 :data-field="CT.crowdfunding.title">{{ campaign.title }}</h2>
  <p :data-field="CT.crowdfunding.goalAmount">{{ formatted(campaign.goalAmount) }}</p>
</template>
```

**Comma-separated fallbacks**: Use `data-field="primary,fallback"` when a field may not exist in all form configurations. The first resolvable target wins.

### 3. Wrap the preview with `PreviewEditable`

In the admin preview component:

```vue
<script setup lang="ts">
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'

const props = defineProps<{ editable?: boolean }>()
</script>

<template>
  <PreviewEditable :enabled="editable">
    <MyDonorComponent />
  </PreviewEditable>
</template>
```

### 4. Mark preview FormRenderers as passive

If the preview contains its own `FormRenderer` instances (e.g., a donation form wizard inside the preview), they must NOT steal the global hash target activator from the admin config panel:

```vue
<script setup lang="ts">
import { provide } from 'vue'
import { HASH_TARGET_PASSIVE_KEY } from '~/features/_library/form-builder/composables/useHashTarget'

provide(HASH_TARGET_PASSIVE_KEY, true)
</script>
```

Without this, the preview's FormRenderer registers itself as the global activator, and clicks would try to resolve targets against the preview's field tree instead of the admin config form.

## Excluding Elements from Click-to-Edit

Add `data-preview-nav` to interactive elements that should NOT trigger field navigation (e.g., tab bars, pagination buttons inside the preview):

```vue
<div data-preview-nav>
  <Button @click="nextStep">Next</Button>
</div>
```

## How Suffix Matching Resolves Nested Tabs

When a form uses nested `tabsField` (tabs inside tabs), the target path automatically switches all ancestor tabs:

```
Target: "features.impactCart"
Full path: config.sections.donationForm.formTabs.features.impactCart

Resolution chain:
  1. tabsField "sections" → switches to "donationForm" tab
  2. tabsField "formTabs" → switches to "features" sub-tab
  3. fieldGroup "impactCart" → expands accordion, scrolls, highlights
```

Each `FormFieldTabs` component checks `isAncestorOfHashTarget` and reads `hashTargetChildSegment` to activate the correct tab. This works at any nesting depth.

## Field Visibility Checks

`canResolveHashTarget(target)` verifies two things before showing the hover outline:

1. The target path resolves to a field in the form tree
2. The field (and all ancestors) pass their `visibleWhen` checks

If a field is hidden by `visibleWhen`, clicking its preview element does nothing — no outline, no pencil button. This prevents dead clicks on fields that are conditionally hidden in the config form.

## Existing TARGETS References

| Constant                      | File                                                      | Used by                                                                                                |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `CAMPAIGN_FIELD_TARGETS`      | `campaigns/admin/forms/campaign-config-master.ts`         | `CrowdfundingPage.vue`, `CampaignActions.vue`, `CampaignProgress.vue`, `CharityInfoCard.vue`           |
| `DONATION_FORM_FIELD_TARGETS` | `donation-form/admin/forms/admin-donation-form-master.ts` | `DonationFormStep1.vue`, `DonationFormSingle.vue`, `DonationFormMultiple.vue`, `DonationFormStep3.vue` |
