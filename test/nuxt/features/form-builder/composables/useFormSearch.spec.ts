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
    it('excludes hidden fields from match count', () => {
      // Build a form with 12+ fields to trigger search, some hidden
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      // Add a hidden field that matches search term "secret"
      fields.hiddenField = text('Secret Title', {
        visibleWhen: (ctx: FieldContext) => ctx.values.showSecret === true
      } as Partial<FieldDef>)

      // Context where showSecret is false
      const values = ref<Record<string, unknown>>({ showSecret: false })
      const fieldContext = () => ({ values: values.value, root: values.value })

      const search = useFormSearch(fields, undefined, fieldContext)
      search.searchTerm.value = 'secret'

      // Hidden field should NOT match
      expect(search.matchCount.value).toBe(0)
      expect(search.isFieldVisibleBySearch('hiddenField')).toBe(false)

      // Now make it visible
      values.value = { showSecret: true }
      expect(search.matchCount.value).toBe(1)
      expect(search.isFieldVisibleBySearch('hiddenField')).toBe(true)
    })

    it('excludes children of hidden groups from match count', () => {
      const fields: Record<string, FieldDef> = {}
      for (let i = 0; i < 12; i++) {
        fields[`field${i}`] = text(`Field ${i}`)
      }
      // Group with visibleWhen that hides it
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
      search.searchTerm.value = 'secret'

      // Both the group and its child should be hidden
      expect(search.matchCount.value).toBe(0)
    })

    it('excludes children of hidden tabs from match count and tab counts', () => {
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
      search.searchTerm.value = 'title'

      // Only the visible tab's field should match
      expect(search.matchCount.value).toBe(1)
      expect(search.tabMatchCounts.value.get('visible-tab')).toBe(1)
      expect(search.tabMatchCounts.value.get('hidden-tab')).toBeUndefined()

      // Show the tab — now both should match
      values.value = { showTab: true }
      expect(search.matchCount.value).toBe(2)
      expect(search.tabMatchCounts.value.get('hidden-tab')).toBe(1)
    })
  })
})
