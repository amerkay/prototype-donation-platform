---
applyTo: '**'
---

# Coding Conventions

## Project Overview

Multi-step donation platform with single/recurring donations, multi-item cart system, dynamic pricing sliders, conditional free gifts with upsell messaging, and mobile-first progressive disclosure.

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3.5+)
- **Styling**: Tailwind CSS 4.x
- **UI**: shadcn-nuxt (Reka UI)
- **Validation**: Vee-validate + Zod
- **Utilities**: VueUse, class-variance-authority, tailwind-merge

## File Organization

**Feature-Based Architecture**: Organize code by business domain, not technical layer. Each feature is self-contained with its own components, composables, types, and utilities.

```
app/
├── components/          # Shared UI components only
│   ├── ui/              # shadcn components
│   └── [Global].vue     # Layout components (AppHeader, AppFooter, etc.)
├── composables/         # System-wide composables only (useAuth, useApi, etc.)
├── features/            # Feature modules (business domains)
│   └── [feature-name]/
│       ├── components/  # Feature-specific components
│       ├── composables/ # Feature-specific composables
│       ├── types.ts     # Feature-specific types/interfaces
│       └── utils.ts     # Feature-specific utilities
├── lib/                 # Global utilities and shared types
│   ├── utils.ts         # General utility functions
│   └── common/
│       └── types.ts     # Shared types across features
├── pages/               # File-based routing
└── plugins/
```

**Examples**:

- `app/features/donation-form/` - All donation form logic, components, types
- `app/features/impact-cart/` - Cart functionality with impact cart components
- `app/features/form-builder/` - Form builder system with fields, config types
- `app/components/` - Only `Button`, `Card`, `BaseDialogOrDrawer`, etc.
- `app/composables/` - Only `useAuth`, `useApi`, `useCurrency`, etc.
- `app/stores/` - Pinia stores like `donationForm`, `impactCart`

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
<style scoped>
/* Prefer Tailwind */
</style>
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
:class="{ 'grid-cols-1': items.length === 1, 'grid-cols-2': items.length === 2, }"
```

## Patterns

**Progressive Disclosure**: No modals/sidebars on mobile - use inline expansion, tabs, sticky elements

**Forms**: Extract reusable components, use vee-validate + Zod, emit events (no prop mutation)

**Complex Controls**: Extract to dedicated components with clear props/emits

**State**: Local `ref()`/`computed()` in components, composables for shared state

**Performance**: Use computed for derived state, unique stable keys in lists

## Code Quality

- Extract repeated logic to composables/components
- One component = one responsibility
- No `any` types
- Comments only for complex business logic
- Remove console logs before committing

## shadcn-nuxt

Install: `pnpm dlx shadcn-vue@latest add [component]`  
Location: `app/components/ui/[component]/`  
Customize directly in component files

## LLM Instructions that YOU MUST ALWAYS FOLLOW:

THESE ARE COMMANDMENTS. YOU MUST ALWAYS FOLLOW THEM WHEN RESPONDING TO MY PROMPTS!

- YOU MUST ALWAYS think, then create a detailed plan, then work. For example, if we're fixing a bug, think of 7 possible root causes of a bug, pick the most probable then apply the absolute minimum edits to fix the issue. Another example: If we're building a feature, find similar files to learn existing patterns, think 5 methods to build that feature, then pick the most maintainable, elegant, DRY, reusable, best-practices method.
- YOU MUST use shadcn-vue components or ask me to install missing ones.
- You MUST always choose the most elegant minimal edits to the code. Don't write a lot of code if you don't need to.
- You MUST always prioritize DRY coding and reusable functions and components, never repeat code.
- YOU MUST remove obsolete code that has been replaced with new code. Less code is better.
- At the end of a task, your summary of the work done must be short.
- IMPORTANT! YOU MUST ALWAYS, at the end of a task, you MUST reply with an absolute minimal short conventional commit about ALL the work done during the chat session, entire session.
- Whenever possible, do not edit the shadcn files in @/components/ui. Only if needed.
- YOU MUST write modular vue3 code using components and composables without overcomplicating things.
- ALWAYS prefer self container logic. You must rewrite confusing logic to be as self-contained as possible.
- You MUST define TypeScript interfaces that exactly mirror API response structures and pass config objects directly to components using typed sections (e.g., FormConfig['features']['rewards']) rather than restructuring or mapping data in parent components.
- YOU MUST follow Feature-Based Architecture: place all feature-specific code (components, composables, types, utils) in `app/features/[feature-name]/`. Only truly shared/reusable UI components belong in `app/components/`, and only system-wide composables belong in `app/composables/`.
