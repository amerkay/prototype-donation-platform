import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignoreDependencies: [
    // Nuxt modules — declared in nuxt.config.ts, not directly imported
    '@nuxt/hints',
    '@nuxt/fonts',
    '@nuxt/image',
    'pinia-plugin-persistedstate',
    // Tailwind / CSS — consumed by Vite plugin, not imported in TS
    'tailwindcss',
    'tw-animate-css',
    // Tiptap extensions registered via .extend(), not direct imports in some files
    '@tiptap/extension-link',
    '@tiptap/extension-underline',
    // Netlify Blobs — used server-side via Nuxt server routes
    '@netlify/blobs',
    // Transitive deps used directly (unlisted in package.json)
    '@nuxt/schema',
    'vitest-environment-nuxt',
    // ESLint plugins loaded by @nuxt/eslint config chain
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    '@vue/eslint-config-prettier',
    '@vue/eslint-config-typescript',
    'eslint-plugin-vue',
    'prettier-plugin-organize-attributes',
    // Iconify JSON data loaded by @nuxt/icon at build time
    '@iconify-json/lucide'
  ],
  ignoreUnresolved: [
    // Nuxt virtual modules
    '#components'
  ],
  ignore: [
    // Referenced in nuxt.config.ts css array, not a JS import
    'app/assets/css/main.css'
  ],
  entry: ['app/**/*.vue', 'app/**/*.ts']
}

export default config
