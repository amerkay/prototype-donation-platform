---
applyTo: 'test/nuxt/**'
---

1. TL;DR: Nuxt app testing via @nuxt/test-utils; unit (Vitest+Nuxt runtime), e2e (Vitest/Jest/Cucumber/Playwright).

2. Setup:

* Test paths: MUST `test/nuxt/` mirroring `app/` structure; suffix `.nuxt.spec.ts`.
* Install (example): `@nuxt/test-utils vitest @vue/test-utils happy-dom playwright-core`.
* Optional module: `@nuxt/test-utils/module` in `nuxt.config`.
* Vitest config: use `@nuxt/test-utils/config`; ESM required (`"type":"module"` or `vitest.config.m{ts,js}`).
* Env vars: `.env.test`.

3. Core API/CLI:

* Vitest projects:

  * unit: `include test/unit/*.{test,spec}.ts`, `environment: 'node'`.
  * e2e: `include test/e2e/*.{test,spec}.ts`, `environment: 'node'`.
  * nuxt: `include test/nuxt/*.{test,spec}.ts`, `environment: 'nuxt'` via `defineVitestProject`.
* Simple config: `defineVitestConfig({ test:{ environment:'nuxt' }})`; opt-out per file `// @vitest-environment node` (not recommended).
* Run: `vitest`; `vitest --project unit|nuxt`; `--watch`.

4. Flow:

1) Place tests (`test/unit`, `test/nuxt`, `test/e2e`).
2) Configure Vitest projects or simple config.
3) Run suites.
4) For e2e: call `setup()` inside `describe` before tests.

5. Gotchas:

* Nuxt env uses `happy-dom` (default) or `jsdom`; global Nuxt app initialized → avoid global state mutation.
* Simple hybrid env can break (`nuxtApp` not init).
* `@nuxt/test-utils/runtime` vs `/e2e` cannot be in same file; split or use `.nuxt.spec.ts`.
* Built-in mocks: `intersectionObserver:true`; `indexedDb:false` (enable via `environmentOptions.nuxt.mock`).
* TS context auto-includes `test/nuxt` & `tests/nuxt`; other dirs require `typescript.tsConfig.include`; unit tests should not rely on Nuxt auto-imports.

6. Examples:

* Helpers (runtime):

  * `mountSuspended(component, opts?)` (wraps `@vue/test-utils/mount`).
  * `renderSuspended(component, opts?)` (Testing Library; renders in `<div id="test-wrapper">`; enable Vitest globals).
  * `mockNuxtImport(name, factory)`; once per file; hoisted; vary impl via `vi.hoisted`; restore mocks.
  * `mockComponent(name|path, factory|SFC|import)`.
  * `registerEndpoint('/path/', fn | {method, handler})`.
* E2E APIs:

  * `setup({ rootDir='.', configFile='nuxt.config', setupTimeout=120000|240000(win), teardownTimeout=30000, build=true, server=true, port?, host?, browser=false, browserOptions?, runner='vitest'|'jest'|'cucumber' })`
  * `$fetch(url)`, `fetch(url)`, `url(path)`, `createPage(path?)`.
* Playwright runner:

  * Install `@playwright/test @nuxt/test-utils`.
  * `playwright.config.ts` → `use.nuxt.{ rootDir }`.
  * Tests import from `@nuxt/test-utils/playwright`; `goto(path,{waitUntil:'hydration'})`.
* Alt (no Nuxt runtime): plain `@vue/test-utils` + `happy-dom` + Vite Vue plugin.
