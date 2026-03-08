import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick, defineComponent, h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'
import {
  useFormSidebar,
  type FormSidebarState
} from '~/features/_library/form-builder/composables/useFormSidebar'
import { lastActivatedTarget } from '~/features/_library/form-builder/composables/useHashTarget'

// ---------------------------------------------------------------------------
// Helpers — lightweight field definition builders (same pattern as useFormSearch.spec)
// ---------------------------------------------------------------------------

const text = (label: string, opts: Partial<FieldDef> = {}): FieldDef =>
  ({ type: 'text', label, ...opts }) as FieldDef

const toggle = (label: string, opts: Partial<FieldDef> = {}): FieldDef =>
  ({ type: 'toggle', label, ...opts }) as FieldDef

const alert = (label: string): FieldDef => ({ type: 'alert', label }) as FieldDef

const group = (
  label: string,
  fields: Record<string, FieldDef>,
  opts: Record<string, unknown> = {}
): FieldDef => ({ type: 'field-group', label, fields, ...opts }) as unknown as FieldDef

const tabs = (
  tabDefs: Array<{
    value: string
    label: string
    fields: Record<string, FieldDef>
    badgeLabel?: string | ((ctx: FieldContext) => string)
    badgeVariant?: string | ((ctx: FieldContext) => string)
    visibleWhen?: (ctx: FieldContext) => boolean
  }>
): FieldDef => ({ type: 'tabs', tabs: tabDefs }) as unknown as FieldDef

// ---------------------------------------------------------------------------
// Mount helper — wraps useFormSidebar in a component for Nuxt runtime context
// ---------------------------------------------------------------------------

async function createSidebar(
  fields: Record<string, FieldDef>,
  values: Record<string, unknown> = {}
) {
  const formValues = ref(values)
  const fieldContext = () => ({ values: formValues.value, root: formValues.value }) as FieldContext

  let sidebar!: FormSidebarState

  const Wrapper = defineComponent({
    setup() {
      sidebar = useFormSidebar(fields, fieldContext)
      return () => h('div')
    }
  })

  const wrapper = await mountSuspended(Wrapper)

  return { sidebar, formValues, wrapper }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFormSidebar', () => {
  beforeEach(() => {
    // Reset global state between tests
    lastActivatedTarget.value = null
  })

  // =========================================================================
  // Issue 1: Sidebar tree building from form fields
  // =========================================================================

  describe('tree building', () => {
    it('builds nodes from tabs — each tab becomes a top-level node', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          { value: 'general', label: 'General', fields: { title: text('Title') } },
          { value: 'advanced', label: 'Advanced', fields: { apiKey: text('API Key') } }
        ])
      })

      expect(sidebar.tree.value).toHaveLength(2)
      expect(sidebar.tree.value[0]!.id).toBe('general')
      expect(sidebar.tree.value[0]!.label).toBe('General')
      expect(sidebar.tree.value[1]!.id).toBe('advanced')
    })

    it('builds child nodes from collapsible fieldGroups inside tabs', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              boost: group('Impact Boost', { enabled: toggle('Enable') }, { collapsible: true }),
              costs: group('Cover Costs', { enabled: toggle('Enable') }, { collapsible: true })
            }
          }
        ])
      })

      const featuresNode = sidebar.tree.value[0]!
      expect(featuresNode.id).toBe('features')
      expect(featuresNode.children).toHaveLength(2)
      expect(featuresNode.children![0]!.id).toBe('boost')
      expect(featuresNode.children![0]!.label).toBe('Impact Boost')
      expect(featuresNode.children![1]!.id).toBe('costs')
    })

    it('recurses through non-collapsible fieldGroups transparently', async () => {
      const { sidebar } = await createSidebar({
        wrapper: group(
          '',
          {
            inner: tabs([{ value: 'tab1', label: 'Tab 1', fields: { name: text('Name') } }])
          },
          {}
        )
      })

      // The non-collapsible unlabeled wrapper is skipped; the tab node surfaces
      expect(sidebar.tree.value).toHaveLength(1)
      expect(sidebar.tree.value[0]!.id).toBe('tab1')
    })

    it('skips non-tab, non-group fields (text, select, etc.)', async () => {
      const { sidebar } = await createSidebar({
        title: text('Title'),
        description: text('Description'),
        sections: tabs([{ value: 'settings', label: 'Settings', fields: { name: text('Name') } }])
      })

      // Only the tab shows up, not the text fields
      expect(sidebar.tree.value).toHaveLength(1)
      expect(sidebar.tree.value[0]!.id).toBe('settings')
    })

    it('shows fieldGroups with sidebar: true even if not collapsible', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'general',
            label: 'General',
            fields: {
              info: group('Information', { name: text('Name') }, { sidebar: true })
            }
          }
        ])
      })

      const generalNode = sidebar.tree.value[0]!
      expect(generalNode.children).toHaveLength(1)
      expect(generalNode.children![0]!.label).toBe('Information')
    })

    it('returns empty tree when disabled', async () => {
      const formValues = ref({})
      const fieldContext = () =>
        ({ values: formValues.value, root: formValues.value }) as FieldContext

      let sidebar!: FormSidebarState

      const Wrapper = defineComponent({
        setup() {
          sidebar = useFormSidebar(
            { sections: tabs([{ value: 'a', label: 'A', fields: {} }]) },
            fieldContext,
            { disabled: true }
          )
          return () => h('div')
        }
      })

      await mountSuspended(Wrapper)
      expect(sidebar.tree.value).toHaveLength(0)
    })
  })

  // =========================================================================
  // Issue 2: Enabled toggle detection (exact 'enabled' + prefixed '*Enabled')
  // =========================================================================

  describe('enabled toggle detection', () => {
    it('detects exact "enabled" toggle key in fieldGroup', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              boost: group(
                'Impact Boost',
                { enabled: toggle('Enable'), amount: text('Amount') },
                { collapsible: true }
              )
            }
          }
        ])
      })

      const boostNode = sidebar.tree.value[0]!.children![0]!
      expect(boostNode.enabledToggleKey).toBe('enabled')
    })

    it('detects prefixed "*Enabled" toggle key (e.g., pauseEnabled)', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'subscriptions',
            label: 'Subscriptions',
            fields: {
              pause: group(
                'Pause Subscription',
                { pauseEnabled: toggle('Enable'), pauseDuration: text('Duration') },
                { collapsible: true }
              )
            }
          }
        ])
      })

      const pauseNode = sidebar.tree.value[0]!.children![0]!
      expect(pauseNode.enabledToggleKey).toBe('pauseEnabled')
    })

    it('prefers exact "enabled" over prefixed key', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'tab',
            label: 'Tab',
            fields: {
              section: group(
                'Section',
                { enabled: toggle('Enable'), sectionEnabled: toggle('Also Enable') },
                { collapsible: true }
              )
            }
          }
        ])
      })

      expect(sidebar.tree.value[0]!.children![0]!.enabledToggleKey).toBe('enabled')
    })

    it('returns undefined when no toggle fields exist', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'tab',
            label: 'Tab',
            fields: {
              section: group(
                'Section',
                { name: text('Name'), description: text('Desc') },
                { collapsible: true }
              )
            }
          }
        ])
      })

      expect(sidebar.tree.value[0]!.children![0]!.enabledToggleKey).toBeUndefined()
    })

    it('detects enabled toggle on tab nodes (not just fieldGroups)', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'step2',
            label: 'Step 2',
            fields: {
              enabled: toggle('Enable this step'),
              title: text('Title')
            }
          }
        ])
      })

      expect(sidebar.tree.value[0]!.enabledToggleKey).toBe('enabled')
    })

    it('detects enabled toggle when first field is alert (not toggle)', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              cart: group(
                'Impact Cart',
                {
                  alwaysEnabledInfo: alert('This is always enabled'),
                  enabled: toggle('Enable'),
                  mode: text('Mode')
                },
                { collapsible: true }
              )
            }
          }
        ])
      })

      const cartNode = sidebar.tree.value[0]!.children![0]!
      expect(cartNode.enabledToggleKey).toBe('enabled')
    })
  })

  // =========================================================================
  // Issue 2 (continued): isNodeEnabled reads values correctly
  // =========================================================================

  describe('isNodeEnabled', () => {
    it('returns true when enabled toggle is true in form values', async () => {
      const { sidebar } = await createSidebar(
        {
          sections: tabs([
            {
              value: 'features',
              label: 'Features',
              fields: {
                boost: group('Impact Boost', { enabled: toggle('Enable') }, { collapsible: true })
              }
            }
          ])
        },
        { sections: { features: { boost: { enabled: true } } } }
      )

      const boostNode = sidebar.tree.value[0]!.children![0]!
      expect(sidebar.isNodeEnabled(boostNode)).toBe(true)
    })

    it('returns false when enabled toggle is false', async () => {
      const { sidebar } = await createSidebar(
        {
          sections: tabs([
            {
              value: 'features',
              label: 'Features',
              fields: {
                boost: group('Impact Boost', { enabled: toggle('Enable') }, { collapsible: true })
              }
            }
          ])
        },
        { sections: { features: { boost: { enabled: false } } } }
      )

      const boostNode = sidebar.tree.value[0]!.children![0]!
      expect(sidebar.isNodeEnabled(boostNode)).toBe(false)
    })

    it('reads prefixed toggle key from nested form values', async () => {
      const { sidebar } = await createSidebar(
        {
          portal: group('', {
            topTabs: tabs([
              {
                value: 'subscriptions',
                label: 'Subscriptions',
                fields: {
                  pause: group('Pause', { pauseEnabled: toggle('Enable') }, { collapsible: true })
                }
              }
            ])
          })
        },
        { portal: { topTabs: { subscriptions: { pause: { pauseEnabled: true } } } } }
      )

      const pauseNode = sidebar.tree.value[0]!.children![0]!
      expect(pauseNode.enabledToggleKey).toBe('pauseEnabled')
      expect(sidebar.isNodeEnabled(pauseNode)).toBe(true)
    })

    it('returns false when node has no enabledToggleKey', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'tab',
            label: 'Tab',
            fields: {
              plain: group('Plain', { name: text('Name') }, { collapsible: true })
            }
          }
        ])
      })

      const plainNode = sidebar.tree.value[0]!.children![0]!
      expect(sidebar.isNodeEnabled(plainNode)).toBe(false)
    })
  })

  // =========================================================================
  // Issue 3: Badge resolution from field configs
  // =========================================================================

  describe('badge resolution', () => {
    it('resolves static string badgeLabel on tabs', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: { name: text('Name') },
            badgeLabel: '6 active'
          }
        ])
      })

      expect(sidebar.tree.value[0]!.badgeLabel).toBe('6 active')
    })

    it('resolves function badgeLabel with field context', async () => {
      const { sidebar } = await createSidebar(
        {
          sections: tabs([
            {
              value: 'features',
              label: 'Features',
              fields: { name: text('Name') },
              badgeLabel: (ctx: FieldContext) => {
                const count = (ctx.root as Record<string, unknown>).featureCount as number
                return `${count} active`
              }
            }
          ])
        },
        { featureCount: 3 }
      )

      const badgeLabel = sidebar.tree.value[0]!.badgeLabel as (ctx: FieldContext) => string
      expect(badgeLabel(sidebar.fieldContext())).toBe('3 active')
    })

    it('resolves badgeVariant from static string', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'tab',
            label: 'Tab',
            fields: {},
            badgeLabel: 'test',
            badgeVariant: 'outline'
          }
        ])
      })

      expect(sidebar.tree.value[0]!.badgeVariant).toBe('outline')
    })

    it('resolves badgeLabel on collapsible fieldGroups', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'tab',
            label: 'Tab',
            fields: {
              section: group(
                'Section',
                { name: text('Name') },
                {
                  collapsible: true,
                  badgeLabel: '1 custom'
                }
              )
            }
          }
        ])
      })

      expect(sidebar.tree.value[0]!.children![0]!.badgeLabel).toBe('1 custom')
    })

    it('returns undefined badgeLabel when none configured', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([{ value: 'tab', label: 'Tab', fields: { name: text('Name') } }])
      })

      expect(sidebar.tree.value[0]!.badgeLabel).toBeUndefined()
    })
  })

  // =========================================================================
  // Issue 10: Redundant badge suppression (nodes with dot indicators)
  // This tests the SidebarNode shape — the resolvedBadge() suppression
  // in FormSidebarNav.vue relies on enabledToggleKey being set.
  // =========================================================================

  describe('badge suppression for nodes with enabled indicators', () => {
    it('node has both enabledToggleKey and badgeLabel (component must suppress badge)', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              boost: group(
                'Impact Boost',
                { enabled: toggle('Enable') },
                { collapsible: true, badgeLabel: 'Enabled' }
              )
            }
          }
        ])
      })

      const boostNode = sidebar.tree.value[0]!.children![0]!
      // Both are set — FormSidebarNav.resolvedBadge() checks enabledToggleKey first
      expect(boostNode.enabledToggleKey).toBe('enabled')
      expect(boostNode.badgeLabel).toBeDefined()
      // The component should return '' when enabledToggleKey is set
      // (tested here as a data contract — the component logic is in FormSidebarNav.vue)
    })

    it('node without enabledToggleKey keeps its badgeLabel', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'multipliers',
            label: 'Multipliers',
            fields: { name: text('Name') },
            badgeLabel: '1 custom'
          }
        ])
      })

      const node = sidebar.tree.value[0]!
      expect(node.enabledToggleKey).toBeUndefined()
      expect(node.badgeLabel).toBe('1 custom')
    })
  })

  // =========================================================================
  // Issues 4 & 5: Active path syncing (tab switch + accordion open)
  // =========================================================================

  describe('active path syncing via lastActivatedTarget', () => {
    it('syncs activePath when lastActivatedTarget matches a tab node', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          { value: 'general', label: 'General', fields: { name: text('Name') } },
          { value: 'advanced', label: 'Advanced', fields: { key: text('Key') } }
        ])
      })

      // Simulate tab switch (FormFieldTabs writes to lastActivatedTarget)
      lastActivatedTarget.value = { target: 'advanced', ts: Date.now() }
      await nextTick()

      expect(sidebar.activePath.value).toBe('advanced')
    })

    it('syncs activePath when lastActivatedTarget matches a child node', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              boost: group('Impact Boost', { enabled: toggle('Enable') }, { collapsible: true }),
              costs: group('Cover Costs', { enabled: toggle('Enable') }, { collapsible: true })
            }
          }
        ])
      })

      // Simulate accordion open (FormFieldGroup writes props.name to lastActivatedTarget)
      lastActivatedTarget.value = { target: 'costs', ts: Date.now() }
      await nextTick()

      expect(sidebar.activePath.value).toBe('costs')
    })

    it('matches short name from accordion open (FormFieldGroup sends props.name)', async () => {
      const { sidebar } = await createSidebar({
        portal: group('', {
          topTabs: tabs([
            {
              value: 'subscriptions',
              label: 'Subscriptions',
              fields: {
                pause: group('Pause', { pauseEnabled: toggle('Enable') }, { collapsible: true })
              }
            }
          ])
        })
      })

      // FormFieldGroup writes props.name (short key) to lastActivatedTarget
      lastActivatedTarget.value = { target: 'pause', ts: Date.now() }
      await nextTick()

      expect(sidebar.activePath.value).toBe('pause')
    })

    it('picks longest matching path when multiple nodes match', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              boost: group('Impact Boost', { enabled: toggle('Enable') }, { collapsible: true })
            }
          }
        ])
      })

      // 'features.boost' contains both 'features' and 'boost' as segments.
      // 'boost' is longer match than 'features' when the target is 'boost'
      lastActivatedTarget.value = { target: 'boost', ts: Date.now() }
      await nextTick()

      expect(sidebar.activePath.value).toBe('boost')
    })

    it('does not update activePath when target matches no node', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([{ value: 'general', label: 'General', fields: { name: text('Name') } }])
      })

      sidebar.activePath.value = 'general'
      lastActivatedTarget.value = { target: 'nonexistent', ts: Date.now() }
      await nextTick()

      expect(sidebar.activePath.value).toBe('general')
    })
  })

  // =========================================================================
  // isNodeActive
  // =========================================================================

  describe('isNodeActive', () => {
    it('returns true when node path matches activePath', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          { value: 'general', label: 'General', fields: { name: text('Name') } },
          { value: 'advanced', label: 'Advanced', fields: { key: text('Key') } }
        ])
      })

      sidebar.activePath.value = 'general'
      expect(sidebar.isNodeActive(sidebar.tree.value[0]!)).toBe(true)
      expect(sidebar.isNodeActive(sidebar.tree.value[1]!)).toBe(false)
    })

    it('returns true for parent when child is active', async () => {
      const { sidebar } = await createSidebar({
        sections: tabs([
          {
            value: 'features',
            label: 'Features',
            fields: {
              boost: group('Boost', { enabled: toggle('Enable') }, { collapsible: true })
            }
          }
        ])
      })

      sidebar.activePath.value = 'boost'
      expect(sidebar.isNodeActive(sidebar.tree.value[0]!)).toBe(true)
    })
  })

  // =========================================================================
  // Visibility filtering
  // =========================================================================

  describe('visibility filtering', () => {
    it('hides tab nodes when visibleWhen returns false', async () => {
      // visibleWhen on tabs receives scoped context — use ctx.root for form-level values
      const { sidebar, formValues } = await createSidebar(
        {
          sections: tabs([
            { value: 'general', label: 'General', fields: { name: text('Name') } },
            {
              value: 'advanced',
              label: 'Advanced',
              fields: { key: text('Key') },
              visibleWhen: (ctx: FieldContext) =>
                (ctx.root as Record<string, unknown>).showAdvanced === true
            }
          ])
        },
        { showAdvanced: false }
      )

      expect(sidebar.tree.value).toHaveLength(1)
      expect(sidebar.tree.value[0]!.id).toBe('general')

      // Make it visible
      formValues.value = { showAdvanced: true }
      await nextTick()

      expect(sidebar.tree.value).toHaveLength(2)
      expect(sidebar.tree.value[1]!.id).toBe('advanced')
    })
  })
})
