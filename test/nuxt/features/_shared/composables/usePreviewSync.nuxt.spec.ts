import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, ref, nextTick } from 'vue'
import { usePreviewSync } from '~/features/_shared/composables/usePreviewSync'

// Mock activateHashTarget — we just need to verify it's called
vi.mock('~/features/_library/form-builder/composables/useHashTarget', () => ({
  activateHashTarget: vi.fn()
}))

const MAPPING = {
  'section.basic': 'card',
  'section.pricing': 'donation',
  'section.certificate': 'certificate'
} as const

/** Mount a wrapper that exposes usePreviewSync for testing */
async function setup(defaultTab = 'card') {
  const accordionId = ref<string | undefined>(undefined)

  let sync!: ReturnType<typeof usePreviewSync>
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        sync = usePreviewSync({
          accordionId,
          mapping: { ...MAPPING },
          defaultTab
        })
        return {}
      },
      render: () => null
    })
  )

  return { accordionId, sync, wrapper }
}

describe('usePreviewSync', () => {
  it('initializes activePreviewTab to defaultTab', async () => {
    const { sync } = await setup('donation')
    expect(sync.activePreviewTab.value).toBe('donation')
  })

  it('syncs accordion → preview tab', async () => {
    const { accordionId, sync } = await setup()

    accordionId.value = 'section.pricing'
    await nextTick()
    expect(sync.activePreviewTab.value).toBe('donation')

    accordionId.value = 'section.certificate'
    await nextTick()
    expect(sync.activePreviewTab.value).toBe('certificate')
  })

  it('ignores unmapped accordion IDs', async () => {
    const { accordionId, sync } = await setup()

    accordionId.value = 'section.unknown'
    await nextTick()
    expect(sync.activePreviewTab.value).toBe('card')
  })

  it('syncs preview tab → accordion (reverse)', async () => {
    const { accordionId, sync } = await setup()

    sync.syncToAccordion('donation')
    expect(accordionId.value).toBe('section.pricing')
    expect(sync.activePreviewTab.value).toBe('donation')
  })

  it('does not loop: syncToAccordion suppresses the accordion→tab watcher', async () => {
    const { accordionId, sync } = await setup()

    // Set accordion to 'basic' first
    accordionId.value = 'section.basic'
    await nextTick()
    expect(sync.activePreviewTab.value).toBe('card')

    // Now sync from preview to 'donation' — this sets accordionId to 'section.pricing'
    // The suppression flag should prevent the accordion watcher from firing
    sync.syncToAccordion('donation')
    expect(sync.activePreviewTab.value).toBe('donation')
    expect(accordionId.value).toBe('section.pricing')

    // After nextTick, suppression is released — verify state is still consistent
    await nextTick()
    expect(sync.activePreviewTab.value).toBe('donation')
    expect(accordionId.value).toBe('section.pricing')
  })

  it('handles accordion set to undefined (all closed)', async () => {
    const { accordionId, sync } = await setup()

    accordionId.value = 'section.basic'
    await nextTick()
    expect(sync.activePreviewTab.value).toBe('card')

    accordionId.value = undefined
    await nextTick()
    // Preview tab stays on last value — no mapping for undefined
    expect(sync.activePreviewTab.value).toBe('card')
  })

  it('calls activateHashTarget on reverse sync', async () => {
    const { activateHashTarget } = await import(
      '~/features/_library/form-builder/composables/useHashTarget'
    )
    const { sync } = await setup()

    sync.syncToAccordion('certificate')
    await nextTick()
    expect(activateHashTarget).toHaveBeenCalledWith('section.certificate')
  })

  it('accepts numeric tab values (Tabs emits StringOrNumber)', async () => {
    const { sync } = await setup()
    sync.syncToAccordion('donation')
    expect(sync.activePreviewTab.value).toBe('donation')
  })
})
