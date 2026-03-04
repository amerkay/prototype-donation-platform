/**
 * Validates that TARGETS constants resolve to real fields in the form tree.
 * Catches stale/misspelled target paths at test time.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed } from 'vue'
import type {
  FieldDef,
  FieldGroupDef,
  TabsFieldDef,
  FormContext
} from '~/features/_library/form-builder/types'

// Forms under test
import {
  useReceiptTemplateForm,
  RECEIPT_TEMPLATE_TARGETS
} from '~/features/templates/admin/forms/receipt-template-form'
import {
  useCertificateTemplateForm,
  CERTIFICATE_TEMPLATE_TARGETS
} from '~/features/templates/admin/forms/certificate-template-form'

// Store dependencies (receipt form reads currency + branding stores)
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(values: Record<string, unknown> = {}): FormContext {
  return { values: computed(() => values), form: computed(() => values) }
}

/**
 * Recursively collect all dot-notation field paths from a form field tree.
 * Walks fieldGroups and tabs to build the full path map.
 */
function collectFieldPaths(fields: Record<string, FieldDef>, prefix: string = ''): Set<string> {
  const paths = new Set<string>()
  for (const [key, field] of Object.entries(fields)) {
    const path = prefix ? `${prefix}.${key}` : key
    paths.add(path)

    if (field.type === 'field-group') {
      const group = field as FieldGroupDef
      if (group.fields) {
        for (const p of collectFieldPaths(group.fields, path)) {
          paths.add(p)
        }
      }
    } else if (field.type === 'tabs') {
      const tabs = field as TabsFieldDef
      for (const tab of tabs.tabs) {
        const tabPath = `${path}.${tab.value}`
        paths.add(tabPath)
        for (const p of collectFieldPaths(tab.fields, tabPath)) {
          paths.add(p)
        }
      }
    }
  }
  return paths
}

/**
 * Flatten a TARGETS object (possibly nested) into an array of target path strings.
 */
function flattenTargets(targets: Record<string, unknown>): string[] {
  const result: string[] = []
  for (const value of Object.values(targets)) {
    if (typeof value === 'string') {
      result.push(value)
    } else if (typeof value === 'object' && value !== null) {
      result.push(...flattenTargets(value as Record<string, unknown>))
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TARGETS validation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Seed currency store (receipt form checks supportedCurrencies for GBP)
    const currencyStore = useCurrencySettingsStore()
    currencyStore.initialize({
      supportedCurrencies: ['GBP', 'USD'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })
    // Branding store auto-initializes from sample defaults (logoUrl, colors)
  })

  it('every RECEIPT_TEMPLATE_TARGETS value resolves to a field path', () => {
    const fields = useReceiptTemplateForm.setup(makeCtx())
    const paths = collectFieldPaths(fields)
    const targets = flattenTargets(RECEIPT_TEMPLATE_TARGETS)

    for (const target of targets) {
      expect(paths, `Target "${target}" not found in form field tree`).toContain(target)
    }
  })

  it('every CERTIFICATE_TEMPLATE_TARGETS value resolves to a field path', () => {
    const fields = useCertificateTemplateForm.setup(makeCtx())
    const paths = collectFieldPaths(fields)
    const targets = flattenTargets(CERTIFICATE_TEMPLATE_TARGETS)

    for (const target of targets) {
      expect(paths, `Target "${target}" not found in form field tree`).toContain(target)
    }
  })
})
