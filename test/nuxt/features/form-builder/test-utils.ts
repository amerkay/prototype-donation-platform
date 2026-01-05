import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useForm } from 'vee-validate'
import { defineComponent, h, provide, computed, type Component } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

type FormContext = {
  values: ReturnType<typeof useForm>['values']
  errors: ReturnType<typeof useForm>['errors']
  meta: ReturnType<typeof useForm>['meta']
  validate: ReturnType<typeof useForm>['validate']
}

/**
 * Lightweight FormBuilder context provider for tests
 * Mirrors FormRenderer's context setup but without rendering logic
 * Ensures test context matches production context exactly
 */
function createFormBuilderTestProvider(
  FieldComponent: Component,
  props: Record<string, unknown>,
  options: {
    initialValues?: Record<string, unknown>
    sectionId?: string
    fieldPrefix?: string
    onFormContextCreated?: (ctx: FormContext) => void
  } = {}
) {
  const {
    initialValues = {},
    sectionId = 'test-section',
    fieldPrefix = '',
    onFormContextCreated
  } = options

  return defineComponent({
    name: 'FormBuilderTestProvider',
    emits: ['update:modelValue', 'blur'],
    setup(_props, { emit }) {
      // Initialize vee-validate form (same as FormRenderer)
      const {
        setFieldValue: veeSetFieldValue,
        values: formValues,
        errors,
        meta,
        validate
      } = useForm({
        initialValues: { [sectionId]: initialValues }
      })

      // Pass form context to callback for test access
      if (onFormContextCreated) {
        onFormContextCreated({ values: formValues, errors, meta, validate })
      }

      // Explicitly register array field paths to prevent vee-validate warnings
      // Arrays don't use useField, so they need explicit path registration
      const registerArrayPaths = (obj: Record<string, unknown>, parentPath = sectionId) => {
        for (const [key, value] of Object.entries(obj)) {
          const fullPath = `${parentPath}.${key}`
          if (Array.isArray(value)) {
            // Call setFieldValue to register the array path in vee-validate's field tracking
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            veeSetFieldValue(fullPath, value as any)
          } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively check nested objects
            registerArrayPaths(value as Record<string, unknown>, fullPath)
          }
        }
      }
      registerArrayPaths(initialValues)

      // Provide sectionId (same as FormRenderer)
      provide('sectionId', sectionId)

      // Provide fieldPrefix (same as FormRenderer)
      provide('fieldPrefix', fieldPrefix)

      // Provide setFieldValue (same as FormRenderer)
      const providedSetFieldValue = (path: string, value: unknown): void => {
        const fullPath = fieldPrefix
          ? `${sectionId}.${fieldPrefix}.${path}`
          : `${sectionId}.${path}`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        veeSetFieldValue(fullPath, value as any)
      }
      provide('setFieldValue', providedSetFieldValue)

      // Provide submit function (no-op for tests, same as FormRenderer)
      provide('submitForm', () => {})

      // Provide parent group visibility (default true for isolated field tests)
      provide('parentGroupVisible', () => true)

      // Note: We don't provide 'scopedFormValues' or 'fieldContext' here
      // These are computed by useFormBuilderContext from vee-validate's useFormValues()
      // This ensures composables work exactly as in production

      // Create event handler that calls both original handler and emits for test assertions
      const createEventHandler = <T extends 'update:modelValue' | 'blur'>(
        eventName: T,
        originalHandler?: unknown
      ) => {
        return (...args: unknown[]) => {
          if (typeof originalHandler === 'function') {
            originalHandler(...args)
          }
          emit(eventName, ...args)
        }
      }

      const componentProps = computed(() => ({
        ...props,
        // Forward events from child to wrapper while preserving original handlers
        'onUpdate:modelValue': createEventHandler('update:modelValue', props.onUpdateModelValue),
        onBlur: createEventHandler('blur', props.onBlur)
      }))

      return () => h(FieldComponent, componentProps.value)
    }
  })
}

/**
 * Mount a form field component with complete form-builder context
 * Uses the same context setup as FormRenderer via FormBuilderTestProvider
 * This ensures tests run with identical context as production code
 *
 * @param FieldComponent - The field component to mount (e.g., FormFieldText)
 * @param props - Component props
 * @param options - Test configuration options
 * @returns Mounted component wrapper
 *
 * @example
 * ```ts
 * const wrapper = await mountFormField(FormFieldText, {
 *   meta: { type: 'text', label: 'Username' },
 *   modelValue: '',
 *   errors: [],
 *   name: 'username'
 * })
 *
 * // With initial form values
 * const wrapper = await mountFormField(FormFieldText, {
 *   meta: {
 *     type: 'text',
 *     label: (ctx) => `Hello ${ctx.values.name}`
 *   },
 *   modelValue: '',
 *   errors: [],
 *   name: 'greeting'
 * }, {
 *   initialValues: { name: 'World' }
 * })
 * ```
 */
export async function mountFormField<T extends Record<string, unknown>>(
  FieldComponent: Component,
  props: T,
  options: {
    /** Initial form values for vee-validate context */
    initialValues?: Record<string, unknown>
    /** Section ID (defaults to 'test-section') */
    sectionId?: string
    /** Field prefix for nested fields */
    fieldPrefix?: string
    /** Additional global mount options */
    global?: Record<string, unknown>
  } = {}
) {
  const { global, ...providerOptions } = options

  let capturedFormContext: FormContext | null = null

  const ProviderComponent = createFormBuilderTestProvider(FieldComponent, props, {
    ...providerOptions,
    onFormContextCreated: (ctx) => {
      capturedFormContext = ctx
    }
  })

  const wrapper = await mountSuspended(ProviderComponent, { global })

  return {
    wrapper,
    formValues: capturedFormContext!.values,
    formErrors: capturedFormContext!.errors,
    formMeta: capturedFormContext!.meta,
    validate: capturedFormContext!.validate
  }
}

/**
 * Extract vee-validate form values for a specific section
 * CRITICAL: Verifies internal form state, not just DOM
 *
 * @param formValues - The form values object returned from mountFormField
 * @param sectionId - The section ID (defaults to 'test-section')
 * @returns The values for the specified section
 */
export function getSectionValues(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formValues: any,
  sectionId = 'test-section'
): Record<string, unknown> | undefined {
  const values = formValues.value || formValues
  return values[sectionId] as Record<string, unknown> | undefined
}

/**
 * Assert no duplicate IDs exist in the DOM
 * Duplicate IDs break accessibility and can cause validation bugs
 * Throws an error if duplicate IDs are found
 *
 * @param wrapper - The Vue wrapper from @vue/test-utils
 */
export function assertNoDuplicateIds(wrapper: VueWrapper) {
  const allElements = wrapper.element.querySelectorAll('[id]')
  const ids = Array.from(allElements).map((el) => (el as Element).id)
  const uniqueIds = new Set(ids)

  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    throw new Error(`Duplicate IDs found: ${duplicates.join(', ')}`)
  }
}
