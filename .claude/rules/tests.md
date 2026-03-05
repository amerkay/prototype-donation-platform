---
paths:
  - 'test/**'
---

# Nuxt 3 + Vitest Testing

## To write a component test

1. Use `@nuxt/test-utils` with `mountSuspended`/`renderSuspended` for Nuxt runtime (auto-imports, plugins, async setup)
2. Create a mount/render factory per component so tests read as scenarios
3. Centralize common stubs (router, i18n, UI kit) so tests stay behavior-focused
4. `BaseDialogOrDrawer` uses teleport — stub it in tests to render slots inline (content is invisible to `wrapper.text()`)

## To mock Nuxt auto-imports

1. Use `mockNuxtImport` — never ad-hoc module hacks
2. Stub `NuxtLink`/`ClientOnly` with minimal, behavior-accurate stubs — never over-stub

## To handle async and timers

1. Await every interaction that triggers updates (clicks, input, route changes, async composables)
2. Use fake timers for timer-based logic, advance explicitly; restore in test lifecycle

## To keep tests reliable

1. Restore/clear/reset mocks between tests — leaked mocks make suites untrustworthy
2. Cover state edges: loading, empty, error, permission/feature-flag paths, boundary values
3. If a test fails on sensible assertions, STOP and report — don't change the test to match broken behavior
4. **MUST avoid white-box testing**: do not couple tests to component internals, method calls, ref names, or component structure. Refactors must not break tests unless behavior changes

## Bug-fix tests — MANDATORY checklist

1. **Use real stores for data integrity tests** — mock stores can't reproduce shared-reference bugs. If testing that `store.initialize()` deep-clones, use the actual Pinia store, not a hand-rolled mock
2. **Test the actual failure mode** — reproduce the exact user scenario (e.g., `Object.assign` mutation, then check source is uncorrupted). Don't test abstractions of the bug
3. **Mutation-test every bug fix** — after writing the test, temporarily revert the fix and confirm the test FAILS. If it passes without the fix, the test is useless. Fix the test before restoring the fix
4. **Target nested data in reference tests** — shallow spread protects top-level properties. To catch missing deep clones, test nested mutations (e.g., `array.push()`, nested object property changes), not top-level `Object.assign`
5. **Each test must cover a unique code path** — before writing a new test, verify it exercises code not already covered. Remove tests that duplicate existing coverage

## Store tests — patterns

1. **Reference isolation**: initialize store from source → mutate store's nested data → assert source is unchanged
2. **Frequency/constraint enforcement**: initialize with `campaignType` → assert constraints applied (e.g., `monthly.enabled === false` for P2P)
3. **Re-initialization guard**: pre-initialize store → call initialize again with same ID → assert store was NOT re-initialized (preserves live edits)
