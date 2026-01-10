import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Intercept stderr to suppress transformMode deprecation warning
const originalStderrWrite = process.stderr.write.bind(process.stderr)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.stderr.write = ((chunk: any, encoding?: any, callback?: any) => {
  const message = chunk.toString()
  if (message.includes('transformMode')) {
    return true
  }
  return originalStderrWrite(chunk, encoding, callback)
}) as typeof process.stderr.write

export default defineConfig({
  test: {
    onConsoleLog(log) {
      // Suppress Vue Suspense experimental warning
      if (log.includes('<Suspense> is an experimental feature')) return false
    },
    coverage: {
      exclude: [
        'app/components/ui/**',
        'app/assets/**',
        'test/**',
        'app/features/test-forms/**',
        'app/app.vue',
        'app/pages/**'
      ]
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node'
        }
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node'
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt'
        }
      })
    ]
  }
})
