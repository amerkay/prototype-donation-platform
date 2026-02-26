// @ts-check
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  eslintPluginPrettierRecommended,
  {
    rules: {
      'vue/require-default-prop': 'off'
    }
  },
  {
    rules: {
      complexity: ['warn', { max: 10 }],
      'max-depth': ['warn', { max: 4 }],
      'max-params': ['warn', { max: 5 }],
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }]
    }
  }
])
