---
applyTo: '**'
---

# Coding Conventions

## Project Overview

Multi-step donation platform with single/recurring donations, multi-item cart system, dynamic pricing sliders, conditional free gifts with upsell messaging, and mobile-first progressive disclosure.

## LLM Instructions that YOU MUST ALWAYS FOLLOW:

- YOU MUST use shadcn-vue components or ask me to install missing ones.
- You MUST always choose the most elegant minimal edits to the code. Don't write a lot of code if you don't need to.
- You MUST always prioritize DRY coding and reusable functions and components, never repeat code.
- YOU MUST remove obsolete code that has been replaced with new code. Less code is better.
- At the end of a task, your summary of the work done must be short.
- At the end of a task, you must reply with an absolute minimal short conventional commit about all the work done during the session above.

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3.5+)
- **Styling**: Tailwind CSS 4.x
- **UI**: shadcn-nuxt (Reka UI)
- **Validation**: Vee-validate + Zod
- **Utilities**: VueUse, class-variance-authority, tailwind-merge


## File Organization
```
app/
├── components/
│   ├── ui/              # shadcn components
│   ├── [feature]/       # Feature components
│   └── [Global].vue     # Layout components
├── pages/               # File-based routing
└── plugins/
```

## Component Structure

Use Composition API with `<script setup lang="ts">`:
```vue
<script setup lang="ts">
// 1. Imports
// 2. Constants & Interfaces
// 3. Props & Emits
// 4. State (ref, reactive)
// 5. Computed
// 6. Methods
</script>

<template><!-- Single root --></template>
<style scoped>/* Prefer Tailwind */</style>
```

**TypeScript**: Strict typing, no `any`
- Define interfaces for data structures
- Type emits: `defineEmits<{ 'update:modelValue': [value: T] }>()`

**Naming**: PascalCase components, camelCase variables/composables, UPPER_SNAKE_CASE constants

## Styling

**Tailwind**:
- Never concatenate classes dynamically
- Use explicit conditionals for dynamic grids
- Merge classes with `cn()` from `@/lib/utils`
- Use `class-variance-authority` for complex variants

**Dynamic Grid Example**:
```vue
:class="{
  'grid-cols-1': items.length === 1,
  'grid-cols-2': items.length === 2,
}"
```

## Patterns

**Progressive Disclosure**: No modals/sidebars on mobile - use inline expansion, tabs, sticky elements

**Forms**: Extract reusable components, use vee-validate + Zod, emit events (no prop mutation)

**Complex Controls**: Extract to dedicated components with clear props/emits

**State**: Local `ref()`/`computed()` in components, composables for shared state

**Performance**: Use computed for derived state, unique stable keys in lists

## Business Logic

**Cart System**: Separate carts per frequency, track items with `id` + `addedAt` for uniqueness, support editing recurring amounts

**Pricing**: Logarithmic sliders (5-100 by 5, 100-500 by 50, 500-1000 by 100), store custom prices separately

**Bonus Items**: Mark with `isBonusItem` + `bonusThreshold`, filter from product list, show as checkboxes when eligible or upsell messages when not

## Code Quality
- Extract repeated logic to composables/components
- One component = one responsibility
- No `any` types
- Comments only for complex business logic
- Remove console logs before committing

## shadcn-nuxt
Install: `pnpm dlx shadcn-nuxt@latest add [component]`  
Location: `app/components/ui/[component]/`  
Customize directly in component files
