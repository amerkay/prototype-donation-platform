import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { z } from 'zod'
import { nextTick } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import type { FormDef } from '~/features/form-builder/types'

describe('FormRenderer validateOnMount prop', () => {
  it('validates on mount by default (validateOnMount=true)', async () => {
    const schema: FormDef = {
      id: 'test-section',
      fields: {
        email: {
          type: 'text',
          label: 'Email',
          rules: z.string().email('Invalid email').min(1, 'Email is required')
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {},
        validateOnMount: true
      }
    })

    // Wait for validation to run
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should have validation error since field is required and empty
    const errorMessage = wrapper.find('[role="alert"]')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toContain('Required')
  })

  it('does not validate on mount when validateOnMount=false', async () => {
    const schema: FormDef = {
      id: 'test-section',
      fields: {
        email: {
          type: 'text',
          label: 'Email',
          rules: z.string().email('Invalid email').min(1, 'Email is required')
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {},
        validateOnMount: false
      }
    })

    // Wait to ensure validation doesn't run
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should NOT have validation errors initially
    const errorMessage = wrapper.find('[role="alert"]')
    expect(errorMessage.exists()).toBe(false)
  })

  it('does not validate nested fields on mount when validateOnMount=false', async () => {
    const schema: FormDef = {
      id: 'test-section',
      fields: {
        personalInfo: {
          type: 'field-group',
          label: 'Personal Info',
          collapsible: true,
          fields: {
            firstName: {
              type: 'text',
              label: 'First Name',
              rules: z.string().min(1, 'First name is required')
            },
            lastName: {
              type: 'text',
              label: 'Last Name',
              rules: z.string().min(1, 'Last name is required')
            }
          }
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {},
        validateOnMount: false
      }
    })

    // Wait to ensure validation doesn't run
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Error badges SHOULD appear on collapsed accordion (schema validation always runs for badges)
    // This is required so users can see which sections have errors
    const errorBadge = wrapper.find('.bg-destructive')
    expect(errorBadge.exists()).toBe(true)

    // Field-level errors should NOT appear (validateOnMount=false prevents this)
    const errorMessages = wrapper.findAll('[role="alert"]')
    expect(errorMessages.length).toBe(0)
  })

  it('does not validate tab fields on mount when validateOnMount=false', async () => {
    const schema: FormDef = {
      id: 'test-section',
      fields: {
        details: {
          type: 'tabs',
          label: 'Details',
          tabs: [
            {
              value: 'personal',
              label: 'Personal',
              fields: {
                firstName: {
                  type: 'text',
                  label: 'First Name',
                  rules: z.string().min(1, 'First name is required')
                }
              }
            },
            {
              value: 'contact',
              label: 'Contact',
              fields: {
                email: {
                  type: 'text',
                  label: 'Email',
                  rules: z.string().email('Invalid email').min(1, 'Email is required')
                }
              }
            }
          ]
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {},
        validateOnMount: false
      }
    })

    // Wait to ensure validation doesn't run
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Error badges SHOULD appear on tabs (schema validation always runs for badges)
    // This allows users to see which tabs have errors without opening them
    const errorBadges = wrapper.findAll('.bg-destructive')
    expect(errorBadges.length).toBe(2) // Both tabs have required fields that are empty

    // Field-level errors should NOT appear (validateOnMount=false prevents this)
    const errorMessages = wrapper.findAll('[role="alert"]')
    expect(errorMessages.length).toBe(0)
  })

  it('does not validate array items on mount when validateOnMount=false', async () => {
    const schema: FormDef = {
      id: 'test-section',
      fields: {
        addresses: {
          type: 'array',
          label: 'Addresses',
          itemField: {
            type: 'field-group',
            fields: {
              street: {
                type: 'text',
                label: 'Street',
                rules: z.string().min(1, 'Street is required')
              }
            }
          }
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          addresses: [{}] // One empty address item
        },
        validateOnMount: false
      }
    })

    // Wait to ensure validation doesn't run
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should NOT have any field-level errors
    const errorMessages = wrapper.findAll('[role="alert"]')
    expect(errorMessages.length).toBe(0)
  })

  it('does not validate field with default value on mount when validateOnMount=false', async () => {
    const schema: FormDef = {
      id: 'test-section',
      fields: {
        name: {
          type: 'text',
          label: 'Name',
          defaultValue: '', // This was the trigger for the bug
          rules: z.string().min(1, 'Name is required')
        }
      }
    }

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {},
        validateOnMount: false
      }
    })

    // Wait for potentially async validation/watchers
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should NOT have validation errors roughly because we programmatically set default
    const errorMessage = wrapper.find('[role="alert"]')
    expect(errorMessage.exists()).toBe(false)
  })
})
