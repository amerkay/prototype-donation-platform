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
