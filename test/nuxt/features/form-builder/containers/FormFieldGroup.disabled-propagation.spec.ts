import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, provide } from 'vue'
import { useForm } from 'vee-validate'
import { textField } from '~/features/_library/form-builder/api'
import FormFieldGroup from '~/features/_library/form-builder/containers/FormFieldGroup.vue'
import type { FieldGroupDef } from '~/features/_library/form-builder/types'

/**
 * Test suite for disabled state propagation from field-group to child fields
 * Verifies that when a field-group is disabled, all children inherit disabled state
 */

function createFormGroupWrapper(meta: FieldGroupDef, name: string) {
  return defineComponent({
    setup() {
      const { setFieldValue, setFieldTouched, setFieldError } = useForm({
        initialValues: { 'test-section': {} }
      })

      provide('sectionId', 'test-section')
      provide('fieldPrefix', '')
      provide('setFieldValue', (path: string, value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFieldValue(`test-section.${path}` as any, value)
      })
      provide('setFieldError', setFieldError)
      provide('setFieldTouched', setFieldTouched)
      provide('submitForm', () => {})
      provide('parentGroupVisible', () => true)
      provide('parentGroupDisabled', () => false)

      return () => h(FormFieldGroup, { meta, name })
    }
  })
}

describe('FormFieldGroup - Disabled Propagation', () => {
  it('propagates disabled to child inputs when group is disabled (collapsible, open)', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      collapsibleDefaultOpen: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Child input should be disabled
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('does not disable child inputs when group is enabled', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      collapsibleDefaultOpen: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: false
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('disabled')).toBeUndefined()
  })

  it('allows accordion to open when disabled (click trigger)', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Click trigger to open
    const trigger = wrapper.find('button')
    await trigger.trigger('click')
    await wrapper.vm.$nextTick()

    // Content should be visible after click (accordion is not locked)
    const content = wrapper.find('[data-state="open"]')
    expect(content.exists()).toBe(true)
  })

  it('shows "View" when disabled, "Edit" when enabled', async () => {
    const disabledMeta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const enabledMeta: FieldGroupDef = {
      ...disabledMeta,
      disabled: false
    }

    const DisabledWrapper = createFormGroupWrapper(disabledMeta, 'testGroup')
    const EnabledWrapper = createFormGroupWrapper(enabledMeta, 'testGroup')

    const disabledW = await mountSuspended(DisabledWrapper)
    const enabledW = await mountSuspended(EnabledWrapper)

    expect(disabledW.text()).toContain('View')
    expect(disabledW.text()).not.toContain('Edit')

    expect(enabledW.text()).toContain('Edit')
    expect(enabledW.text()).not.toContain('View')
  })

  it('propagates disabled to children in non-collapsible field group', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: false,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Non-collapsible: children should still be disabled via provide/inject
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('disabled')).toBeDefined()
  })
})
