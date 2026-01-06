/**
 * Tests for external context reactivity bug fix
 * Verifies that visibility conditions and field labels update
 * when external context values change (e.g., donation form state)
 *
 * Critical bug: External context was provided as static object snapshot,
 * preventing re-evaluation of conditions when donation form state changed.
 */

import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import * as z from 'zod'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import type { FormDef, FieldContext } from '@/features/form-builder/types'

async function waitForUpdate() {
  await nextTick()
  await nextTick()
}

describe('external context reactivity', () => {
  /**
   * TEST 1: Field visibility re-evaluates when external context changes
   *
   * Simulates: User fills out Step 1 (donor email), then Step 2 shows
   * conditional "Gmail Bonus Code" field based on email domain.
   * When user changes email from gmail.com to outlook.com, field should hide.
   *
   * This test directly validates the reported bug fix.
   */
  it('re-evaluates visibleWhen condition when external context updates', async () => {
    // Create reactive external context (simulating donation form store)
    const externalContext = ref<Record<string, unknown>>({
      'donorInfo.email': 'test@outlook.com'
    })

    // Form with conditional field based on external context
    const formSection: FormDef = {
      id: 'test-form',
      fields: {
        gmailBonus: {
          type: 'text',
          label: 'Gmail Bonus Code',
          placeholder: 'Enter bonus code',
          rules: z.string().min(5),
          visibleWhen: {
            match: 'all',
            conditions: [
              {
                field: 'donorInfo.email',
                operator: 'contains',
                value: 'gmail'
              }
            ]
          }
        }
      }
    }

    const modelValue = ref({})

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: formSection,
        modelValue: modelValue.value,
        context: externalContext.value
      }
    })

    await waitForUpdate()

    // Initially: field should be hidden (email is outlook.com)
    let input = wrapper.find('input[placeholder="Enter bonus code"]')
    expect(input.exists()).toBe(false)

    // Update external context (user changes email to gmail)
    externalContext.value = {
      'donorInfo.email': 'user@gmail.com'
    }

    // Update prop to trigger reactivity
    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // Field should now be visible (email contains gmail)
    input = wrapper.find('input[placeholder="Enter bonus code"]')
    expect(input.exists()).toBe(true)

    // Change back to non-gmail
    externalContext.value = {
      'donorInfo.email': 'user@yahoo.com'
    }

    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // Field should be hidden again
    input = wrapper.find('input[placeholder="Enter bonus code"]')
    expect(input.exists()).toBe(false)
  })

  /**
   * TEST 2: Dynamic field labels update when external context changes
   *
   * Simulates: Admin configures custom field with dynamic label based on
   * donation form state. Label should update reactively when form values change.
   *
   * This test validates that computed context propagates through useFormBuilderContext
   * and dynamic functions receive updated values.
   */
  it('updates dynamic field labels when external context changes', async () => {
    // Start with empty context (Guest user scenario)
    const externalContext = ref<Record<string, unknown>>({})

    const formSection: FormDef = {
      id: 'test-form',
      fields: {
        thankYouMessage: {
          type: 'text',
          // Dynamic label based on external context
          label: (ctx: FieldContext) =>
            `Message for ${ctx.values.donorName || 'Guest'} ($${ctx.values['donation.amount'] || 0} donation)`,
          placeholder: 'Enter your message',
          rules: z.string()
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: formSection,
        modelValue: {},
        context: externalContext.value
      }
    })

    await waitForUpdate()

    // Initially: should show default values (Guest, $0)
    expect(wrapper.text()).toContain('Message for Guest ($0 donation)')

    // Update external context (user enters their info in Step 1)
    externalContext.value = {
      donorName: 'John Doe',
      'donation.amount': 100
    }

    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // Label should update to show actual donor info
    expect(wrapper.text()).toContain('Message for John Doe ($100 donation)')

    // Update context again (donor increases amount)
    externalContext.value = {
      donorName: 'John Doe',
      'donation.amount': 250
    }

    await wrapper.setProps({ context: externalContext.value })
    await waitForUpdate()

    // Label should reflect new amount
    expect(wrapper.text()).toContain('Message for John Doe ($250 donation)')
  })
})
