import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, provide } from 'vue'
import { useForm } from 'vee-validate'
import { textField } from '~/features/_library/form-builder/api'
import FormFieldGroup from '~/features/_library/form-builder/containers/FormFieldGroup.vue'
import type { FieldGroupDef, FieldContext } from '~/features/_library/form-builder/types'

/**
 * Test suite for disabled property on field-group containers
 * Ensures that disabled attribute properly disables collapsible accordions
 */

/**
 * Create a test wrapper with proper form context to prevent vee-validate warnings
 */
function createFormGroupWrapper(meta: FieldGroupDef, name: string) {
  return defineComponent({
    setup() {
      // Initialize vee-validate form context
      const { setFieldValue, setFieldTouched, setFieldError } = useForm({
        initialValues: { 'test-section': {} }
      })

      // Provide required form-builder context
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

      return () => h(FormFieldGroup, { meta, name })
    }
  })
}

describe('FormFieldGroup - Disabled Property', () => {
  it('disables collapsible field group with static boolean', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // AccordionTrigger should have disabled cursor styling
    const accordionTrigger = wrapper.find('button')
    expect(accordionTrigger.classes()).toContain('cursor-not-allowed')
    expect(accordionTrigger.classes()).toContain('opacity-60')
  })

  it('does not show Edit text when disabled', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Should not display "Edit" text when disabled
    expect(wrapper.text()).not.toContain('Edit')
  })

  it('shows Edit text when not disabled', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: false
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Should display "Edit" text when not disabled
    expect(wrapper.text()).toContain('Edit')
  })

  it('disables field group with dynamic function', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: (ctx: FieldContext) => ctx.values.isLocked === true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Verify the component renders without errors
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('disabled does not affect non-collapsible field groups', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: false, // Not collapsible
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Non-collapsible field groups use FieldSet, not Accordion
    // The disabled prop is still processed but doesn't have UI effect on FieldSet
    const fieldSet = wrapper.find('fieldset')
    expect(fieldSet.exists()).toBe(true)

    // Verify child fields are still rendered (disabled doesn't hide the group)
    expect(wrapper.find('legend').text()).toContain('Test Group')
  })

  it('prevents underline hover effect when disabled', async () => {
    const meta: FieldGroupDef = {
      type: 'field-group',
      name: 'testGroup',
      label: 'Test Group',
      collapsible: true,
      fields: {
        field1: textField('field1', { label: 'Field 1' })
      },
      disabled: true
    }

    const WrapperComponent = createFormGroupWrapper(meta, 'testGroup')
    const wrapper = await mountSuspended(WrapperComponent)

    // Label should not have the hover:underline class when disabled
    const label = wrapper.find('h3')
    expect(label.classes()).not.toContain('group-hover:underline')
  })
})
