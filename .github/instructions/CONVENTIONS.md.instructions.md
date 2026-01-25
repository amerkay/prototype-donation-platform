---
applyTo: '**'
---

# Coding Conventions

## Project Overview

Multi-step donation platform with single/recurring donations, multi-item cart system, dynamic pricing sliders and mobile-first progressive disclosure.

## Architecture

**Vertical Slice Architecture**: Organize by WHO uses it, not what it displays.

```
app/features/[feature-name]/
  ├── admin/         # Used BY admin (config panels, preview tools)
  │   ├── components/
  │   └── forms/
  ├── donor/         # Used BY donors (forms, wizards, donor state)
  │   ├── components/
  │   ├── composables/
  │   └── stores/    # Donor-centric state
  └── shared/        # Only when BOTH import it (80%+ rule)
      ├── types.ts
      ├── composables/
      └── stores/    # Truly shared config
```

**Rules**: If 80%+ usage is one side, move it there. Stores follow their primary consumer. Preview components belong to whoever uses the preview.

**Type Organization**:

- Config types (`*Settings` interfaces) → `admin/types.ts` (used by admin forms & config store)
- Runtime types (data models, state shapes) → `donor/types.ts` or `admin/types.ts` based on primary consumer
- Truly shared types (used ~50/50 by both) → `shared/types.ts`
- Utilities/composables/stores → move to consumer side (`donor/` or `admin/`)

## Code Standards

**Components**: Use `<script setup lang="ts">`. Order: imports, constants, props/emits, state, computed, methods. No `any` types. PascalCase components, camelCase variables, UPPER_SNAKE_CASE constants.

**Styling**: Never concatenate classes. Use `cn()` from `@/lib/utils`. Explicit conditionals for dynamic classes.

**State**: Local `ref()`/`computed()` in components. Composables for shared state. No prop mutations—emit events.

**Validation**: vee-validate + Zod. Schema per field type.

**shadcn-vue**: `pnpm dlx shadcn-vue@latest add [component]`. Do not edit `app/components/ui/` unless necessary.

## Testing

```bash
# Run all tests (no watch)
pnpm test:run

# Run specific project
pnpm test:nuxt      # Nuxt runtime tests
pnpm test:unit      # Unit tests
pnpm test:e2e       # E2E tests

# Run for specific test
pnpm test:nuxt --run test/nuxt/features/form-builder/fields/FormFieldArray.nuxt.spec.ts -t "preserves deeply nested field values"
```

Tests mirror source structure in `test/nuxt/`. Example: `app/features/form-builder/fields/FormFieldText.vue` → `test/nuxt/features/form-builder/fields/FormFieldText.nuxt.spec.ts`

## LLM Rules

YOU MUST ALWAYS FOLLOW THESE COMMANDMENTS:

1. **THINK → PLAN → WORK**: MUST identify root causes, explore 5+ approaches, choose the most minimal elegant solution
2. **FOLLOW EXISTING PATTERNS**: MUST study similar files in codebase first. Match established conventions exactly
3. **PREFER SHORTER CODE**: MUST prioritize readability and maintainability. Less code is better code
4. **DRY PRINCIPLE**: MUST extract repeated logic. One responsibility per component. Never repeat code
5. **MINIMAL EDITS**: MUST make the least changes to solve the problem. Remove all obsolete code immediately
6. **FEATURE-BASED**: MUST place all feature code in `app/features/[feature-name]/`. Never violate architecture
7. **TYPE SAFETY**: MUST use strict TypeScript. NEVER use `any` types. Mirror API structures exactly
8. **SELF-CONTAINED LOGIC**: MUST prefer isolated, clear implementations. Avoid complex dependencies
9. **USE shadcn-vue**: MUST use existing components or request missing ones. Do not reinvent UI
10. **SHORT SUMMARIES**: MUST provide brief updates. End with minimal conventional commit message
11. **WRITE TESTS TO UNCOVER BUGS**: Always ask your self, do the tests make sense? Remember, we need to always avoid success on buggy unexpect abnormal behaviour, and we do not want to blindly test current behaviour. If something fails and it makes not sense to change the test, stop and tell me, don't just change the test for buggy behaviour.
12. DO NOT RUN `pnpm dev`, you do not have browser access.
13. Defer fixing formatting issues till you are almost done with the implementation as you can do them in one go using `pnpm format:fix; pnpm lint:fix; pnpm typecheck` to fix lint errors rather than fix them one by one.
14. **`app/features/form-builder` and `app/features/custom-fields` CAN NEVER have donation platform related logic**. They MUST be treated as independant units that can be reused for any project.
15. YOU MUST ALWAYS start by investigating codebase for similar patterns or related files to the task at hand.
