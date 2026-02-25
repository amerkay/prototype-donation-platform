---
paths:
  - 'test/**'
---

## Non-negotiable principles (these catch bugs _and_ keep tests flexible)

- **MUST test the public contract only**: drive components via props, events, user interaction, and injected dependencies; assert rendered output, emitted events, navigation calls, and observable side effects. Never assert private state as your primary proof. ([v1.test-utils.vuejs.org][1])
- **MUST avoid white-box testing**: do not couple tests to component internals, method calls, ref names, or component structure. Refactors must not break tests unless behavior changes. ([v1.test-utils.vuejs.org][1])
- **MUST eliminate tautology**: never copy the production algorithm into the test. The test must validate outcomes from the outside, not re-derive them the same way. ([GitHub][2])
- **MUST avoid “it renders” / “exists” tests** unless they assert a meaningful user-visible invariant (e.g., critical text, disabled state, or error boundary behavior).
- **MUST prefer behavior-focused assertions**: “shows validation error when X”, “disables submit while saving”, “emits `update:modelValue` with Y”. These are the only names that scale.

## Nuxt 3 + Vitest: correct environment or your tests lie

- **MUST use `@nuxt/test-utils` as the default harness for Nuxt unit tests**; it is Nuxt’s intended testing path and matches how Nuxt itself is tested. ([Nuxt][3])
- **MUST use `mountSuspended`/`renderSuspended` for any component that relies on Nuxt runtime behavior** (auto-imports, plugins/injections, async `setup`, `useAsyncData`/`useLazyAsyncData`, etc.). Don’t fight the runtime—use the runtime. ([Nuxt][4])
- **MUST mock Nuxt auto-imported composables through Nuxt’s utilities** (e.g., `mockNuxtImport`) rather than ad-hoc module hacks that break with caching/resolution. ([GitHub][5])
- **MUST stub Nuxt components intentionally** (e.g., `NuxtLink`, `ClientOnly`) with minimal, behavior-accurate stubs; never “over-stub” and accidentally remove the behavior you claim to test. ([GitHub][6])

## Selectors and assertions: stable tests that still enforce UX quality

- **MUST query like a user**: prefer role/label/text/alt over CSS selectors or component names. User-centric queries create the most resilient tests. ([testing-library.com][7])
- **MUST treat `data-testid` as a last resort**: only use it when role/text/label/alt are genuinely unsuitable (dynamic text, non-semantic wrappers, etc.). ([testing-library.com][8])
- **MUST assert the smallest meaningful outcome**: avoid over-asserting DOM structure. Assert what matters (content/state/interaction result), not how it is arranged.

## Async correctness: zero flake policy

- **MUST await every interaction that can trigger updates** (clicks, input, route changes, async composables). If you don’t await, you are testing a race. ([Nuxt][4])
- **MUST make time deterministic**: use fake timers for timer-based logic and advance time explicitly; never sleep in tests. ([vitest.dev][9])
- **MUST reset timers and mocked time**: after using fake timers or `setSystemTime`, restore real timers/time in the test lifecycle. Vitest will not auto-reset these for you. ([vitest.dev][10])

## Mocks, spies, and isolation (Vitest): no cross-test pollution, ever

- **MUST restore/clear/reset mocks between tests**. A test suite that leaks mocks is untrustworthy. Use the appropriate level: clear calls vs reset implementations vs restore originals. ([vitest.dev][10])
- **MUST mock boundaries, not internals**: mock network, storage, feature flags, and external services; keep component logic real so tests can actually find regressions. ([GitHub][2])
- **MUST control module caching deliberately**: when you need a clean module graph (especially with `vi.mock` factories), reset modules explicitly; don’t assume “fresh imports”. ([vitest.dev][11])
- **MUST prefer spies for interaction verification and mocks for dependency replacement**—and never conflate the two. ([Epic Web Dev][12])

## Test design that actually uncovers bugs

- **MUST cover state edges**: loading, empty, error, permission/feature-flag paths, and boundary values. Most production bugs live here, not in the “happy path”. ([GitHub][2])
- **MUST keep each test single-purpose**: one reason to fail, one behavior proven. If a test asserts 10 things, it will rot. ([GitHub][2])
- **MUST factor complex logic out of components** (into composables/utils) and unit-test it directly; then keep component tests focused on wiring + UX behavior. ([v1.test-utils.vuejs.org][1])
- **MUST use parameterized tests for input matrices** (same behavior across many variants). This increases coverage without duplicating fragile setup.

## DX rules (fast to write, fast to read, easy to refactor)

- **MUST standardize a mount/render “factory”** per component/domain so tests read as scenarios, not bootstrapping scripts. ([Nuxt][4])
- **MUST centralize common Nuxt/Vue stubs and helpers** (router, i18n, UI kit stubs) so individual tests stay behavior-focused. ([GitHub][6])
- **MUST avoid chasing coverage metrics**: optimize for confidence and refactorability. Tests are a change detector for user-visible behavior, not a line-counter. ([testing-library.com][7])
