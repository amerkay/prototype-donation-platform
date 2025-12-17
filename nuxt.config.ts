import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  runtimeConfig: {
    // Private keys (server-side only)
    locationiqApiKey: process.env.LOCATIONIQ_API_KEY || ''
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
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode', '@nuxt/eslint', '@nuxt/icon']
})
