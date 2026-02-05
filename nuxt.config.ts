import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,

  // Disable SSR for admin routes (they use sessionStorage and require auth)
  routeRules: {
    '/admin/**': { ssr: false }
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    // prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  },

  css: ['./app/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },

  modules: [
    // docs https://www.shadcn-vue.com/docs/installation/nuxt
    'shadcn-nuxt',
    // docs https://color-mode.nuxtjs.org/getting-started
    // Exclude color-mode in test environment as it requires browser APIs not available in tests
    ...(process.env.VITEST ? [] : ['@nuxtjs/color-mode']),
    // docs https://eslint.nuxt.com/packages/module
    '@nuxt/eslint',
    // docs https://github.com/nuxt/icon
    '@nuxt/icon',
    // docs https://pinia.vuejs.org/ssr/nuxt.html
    '@pinia/nuxt',
    // docs https://nuxt.com/docs/4.x/getting-started/testing
    '@nuxt/test-utils/module'
  ]
})
