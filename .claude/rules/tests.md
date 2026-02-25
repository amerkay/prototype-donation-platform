---
paths:
  - 'test/**'
---

## Nuxt 3 + Vitest Testing

- Use `@nuxt/test-utils` with `mountSuspended`/`renderSuspended` for Nuxt runtime (auto-imports, plugins, async setup)
- Mock Nuxt auto-imports via `mockNuxtImport`, not ad-hoc module hacks
- Stub `NuxtLink`/`ClientOnly` with minimal, behavior-accurate stubs — never over-stub
- Await every interaction that triggers updates (clicks, input, route changes, async composables)
- Use fake timers for timer-based logic, advance explicitly; restore in test lifecycle
- Restore/clear/reset mocks between tests — leaked mocks make suites untrustworthy
- Standardize a mount/render factory per component/domain so tests read as scenarios
- Centralize common Nuxt/Vue stubs and helpers (router, i18n, UI kit) so tests stay behavior-focused
- Cover state edges: loading, empty, error, permission/feature-flag paths, boundary values
