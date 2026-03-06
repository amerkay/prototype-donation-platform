import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import {
  useFormSearch,
  countInputFields
} from '~/features/_library/form-builder/composables/useFormSearch'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'

// Helper to build a simple text field
const text = (label: string, opts: Partial<FieldDef> = {}): FieldDef =>
  ({ type: 'text', label, ...opts }) as FieldDef

// Helper to build a field-group
const group = (
  label: string,
  fields: Record<string, FieldDef>,
  opts: Partial<FieldDef> = {}
): FieldDef => ({ type: 'field-group', label, fields, ...opts }) as unknown as FieldDef

// Helper to build tabs
const tabs = (
  tabDefs: Array<{
    value: string
    label: string
    fields: Record<string, FieldDef>
    visibleWhen?: (ctx: FieldContext) => boolean
  }>,
  opts: Partial<FieldDef> = {}
): FieldDef => ({ type: 'tabs', tabs: tabDefs, ...opts }) as unknown as FieldDef

// Helper: count visible entries matching a term
function countVisibleMatches(search: ReturnType<typeof useFormSearch>, term: string): number {
  const lowerTerm = term.toLowerCase()
  return search.searchIndex.filter((entry) => {
    if (!search.isEntryVisible(entry)) return false
    const haystack =
      `${entry.label} ${entry.description} ${entry.parentLabels.join(' ')}`.toLowerCase()
    return haystack.includes(lowerTerm)
  }).length
}

// Helper: check if a specific path is in visible matches
function isPathVisible(
  search: ReturnType<typeof useFormSearch>,
  term: string,
  path: string
): boolean {
  const lowerTerm = term.toLowerCase()
  return search.searchIndex.some((entry) => {
    if (entry.path !== path) return false
    if (!search.isEntryVisible(entry)) return false
    const haystack =
      `${entry.label} ${entry.description} ${entry.parentLabels.join(' ')}`.toLowerCase()
    return haystack.includes(lowerTerm)
  })
}

describe('useFormSearch', () => {
  describe('countInputFields', () => {
    it('counts only input fields, not display-only types', () => {
      const fields: Record<string, FieldDef> = {
        name: text('Name'),
        alert: { type: 'alert', label: 'Warning' } as FieldDef,
        email: text('Email')
      }
      expect(countInputFields(fields)).toBe(2)
    })
  })

  describe('visibility filtering', () => {
    it('excludes hidden fields from visible entries', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.hiddenField = text('Secret Title', {
        visibleWhen: (ctx: FieldContext) => ctx.values.showSecret === true
      } as Partial<FieldDef>)

      const values = ref<Record<string, unknown>>({ showSecret: false })
      const fieldContext = () => ({ values: values.value, root: values.value })

      const search = useFormSearch(fields, undefined, fieldContext)

      // Hidden field should NOT be visible
      expect(countVisibleMatches(search, 'secret')).toBe(0)
      expect(isPathVisible(search, 'secret', 'hiddenField')).toBe(false)

      // Now make it visible
      values.value = { showSecret: true }
      expect(countVisibleMatches(search, 'secret')).toBe(1)
      expect(isPathVisible(search, 'secret', 'hiddenField')).toBe(true)
    })

    it('excludes children of hidden groups from visible entries', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.secretGroup = group(
        'Secret Group',
        {
          title: text('Secret Title')
        },
        {
          visibleWhen: (ctx: FieldContext) => ctx.values.showGroup === true
        } as Partial<FieldDef>
      )

      const values = ref<Record<string, unknown>>({ showGroup: false })
      const fieldContext = () => ({ values: values.value, root: values.value })

      const search = useFormSearch(fields, undefined, fieldContext)

      expect(countVisibleMatches(search, 'secret')).toBe(0)
    })

    it('excludes children of hidden tabs from visible entries', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 10; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.myTabs = tabs([
        {
          value: 'visible-tab',
          label: 'Visible Tab',
          fields: { title: text('Title Here') }
        },
        {
          value: 'hidden-tab',
          label: 'Hidden Tab',
          fields: { title2: text('Title There') },
          visibleWhen: (ctx: FieldContext) => ctx.values.showTab === true
        }
      ])

      const values = ref<Record<string, unknown>>({ showTab: false })
      const fieldContext = () => ({ values: values.value, root: values.value })

      const search = useFormSearch(fields, undefined, fieldContext)

      // Only the visible tab's field should match
      expect(countVisibleMatches(search, 'title')).toBe(1)

      // Show the tab — now both should match
      values.value = { showTab: true }
      expect(countVisibleMatches(search, 'title')).toBe(2)
    })

    it('indexes tabs container label so searching by container name matches', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.frequencies = tabs(
        [
          {
            value: 'once',
            label: 'One-time',
            fields: { amount: text('Amount') }
          },
          {
            value: 'monthly',
            label: 'Monthly',
            fields: { amount: text('Amount') }
          }
        ],
        { label: 'Donation Frequencies' } as Partial<FieldDef>
      )

      const search = useFormSearch(fields)

      // The tabs container label should be indexed
      expect(isPathVisible(search, 'donation frequencies', 'frequencies')).toBe(true)
    })

    it('indexes individual tab trigger labels', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.myTabs = tabs([
        {
          value: 'general',
          label: 'General Settings',
          fields: { name: text('Name') }
        },
        {
          value: 'advanced',
          label: 'Advanced Options',
          fields: { debug: text('Debug') }
        }
      ])

      const search = useFormSearch(fields)

      // Individual tab labels should be searchable
      expect(isPathVisible(search, 'general settings', 'myTabs.general')).toBe(true)
      expect(isPathVisible(search, 'advanced options', 'myTabs.advanced')).toBe(true)
    })

    it('includes tabs container label in child parentLabels for breadcrumb display', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.frequencies = tabs(
        [
          {
            value: 'once',
            label: 'One-time',
            fields: { amount: text('Amount') }
          }
        ],
        { label: 'Donation Frequencies' } as Partial<FieldDef>
      )

      const search = useFormSearch(fields)

      // The child field's parentLabels should include the tabs container label
      const amountEntry = search.searchIndex.find((e) => e.path === 'frequencies.once.amount')
      expect(amountEntry).toBeDefined()
      expect(amountEntry!.parentLabels).toContain('Donation Frequencies')
      expect(amountEntry!.parentLabels).toContain('One-time')
    })

    it('evaluates nested visibleWhen with local-scope values, not root values', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      fields.tribute = group('Tribute', {
        enabled: text('Enabled Toggle'),
        modal: group('Modal Settings', { title: text('Modal Title') }, {
          visibleWhen: (ctx: FieldContext) => ctx.values.enabled === true
        } as Partial<FieldDef>)
      })

      const values = ref<Record<string, unknown>>({
        tribute: { enabled: true, modal: { title: '' } }
      })
      const fieldContext = () => ({ values: values.value, root: values.value })

      const search = useFormSearch(fields, undefined, fieldContext)

      // "Modal Settings" and "Modal Title" should both be visible
      expect(countVisibleMatches(search, 'modal')).toBeGreaterThanOrEqual(1)
      expect(isPathVisible(search, 'modal', 'tribute.modal')).toBe(true)
      expect(isPathVisible(search, 'modal', 'tribute.modal.title')).toBe(true)

      // When tribute.enabled is false, modal group should be hidden from search
      values.value = { tribute: { enabled: false, modal: { title: '' } } }
      expect(countVisibleMatches(search, 'modal')).toBe(0)
    })
  })
})
