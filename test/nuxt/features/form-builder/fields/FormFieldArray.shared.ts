import { vi } from 'vitest'
import { nextTick } from 'vue'
import * as z from 'zod'
import FormFieldArray from '~/features/_library/form-builder/containers/FormFieldArray.vue'
import type { ArrayFieldDef, FieldDef } from '~/features/_library/form-builder/types'
import { mountFormField } from '../test-utils'

/**
 * Shared test utilities for FormFieldArray tests
 * Contains helpers used across multiple test files
 */

/**
 * Wait for all async updates when array operations occur
 * Includes: Vue reactivity, auto-animate transitions, and vee-validate updates
 * Useful for testing components with complex async behavior
 */
export async function waitForArrayUpdate() {
  await nextTick() // Vue reactivity
  await nextTick() // auto-animate
  await nextTick() // vee-validate
}

/**
 * Helper to mount FormFieldArray with complete form-builder context
 * Provides flexible configuration for different test scenarios
 */
export async function mountFormFieldArray(
  meta: Partial<ArrayFieldDef> = {},
  modelValue: unknown[] = [],
  options: {
    initialValues?: Record<string, unknown>
    sectionId?: string
  } = {}
) {
  const defaultMeta: ArrayFieldDef = {
    type: 'array',
    name: 'testArray',
    label: 'Test Array Field',
    itemField: {
      type: 'text',
      name: '',
      label: 'Item',
      rules: z.string().optional()
    },
    rules: z.array(z.any()).optional(),
    ...meta
  }

  return await mountFormField(
    FormFieldArray,
    {
      meta: defaultMeta,
      modelValue: modelValue,
      errors: [],
      name: 'testArray',
      touched: false,
      onBlur: vi.fn()
    },
    {
      initialValues: {
        testArray: modelValue,
        ...options.initialValues
      },
      sectionId: options.sectionId ?? 'test-section'
    }
  )
}

/**
 * Helper to create dynamic itemField function (like custom fields)
 * Returns different fields based on item values
 */
export function createDynamicItemField(): (values: Record<string, unknown>) => FieldDef {
  return (values: Record<string, unknown>) => {
    const type = values.type as string | undefined
    const name = values.name as string | undefined

    // Dynamic label based on item data
    const displayLabel = name ? `Item: ${name}` : 'New Item'

    const fields: Record<string, FieldDef> = {
      type: {
        type: 'select',
        name: '',
        label: 'Type',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'number', label: 'Number' }
        ],
        rules: z.enum(['text', 'number'])
      },
      name: {
        type: 'text',
        name: '',
        label: 'Name',
        rules: z.string().min(1, 'Name is required')
      }
    }

    // Add type-specific fields
    if (type === 'text') {
      fields.maxLength = {
        type: 'number',
        name: '',
        label: 'Max Length',
        min: 1,
        max: 1000,
        optional: true,
        rules: z.number().min(1).max(1000).optional()
      }
    } else if (type === 'number') {
      fields.min = {
        type: 'number',
        name: '',
        label: 'Minimum',
        optional: true,
        rules: z.number().optional()
      }
      fields.max = {
        type: 'number',
        name: '',
        label: 'Maximum',
        optional: true,
        rules: z.number().optional()
      }
    }

    return {
      type: 'field-group',
      name: '',
      label: displayLabel,
      collapsible: true,
      collapsibleDefaultOpen: !type,
      fields
    }
  }
}
