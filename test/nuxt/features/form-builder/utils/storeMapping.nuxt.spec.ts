import { describe, expect, it, vi } from 'vitest'
import type { Component } from 'vue'
import {
  generateStoreMapping,
  generateGetData,
  generateSetData
} from '~/features/_library/form-builder/utils/storeMapping'
import {
  defineForm,
  fieldGroup,
  textField,
  componentField
} from '~/features/_library/form-builder/api'

describe('storeMapping', () => {
  describe('generateStoreMapping', () => {
    it('uses convention for simple fieldGroups', () => {
      const form = defineForm('test', () => ({
        basicSettings: fieldGroup('basicSettings', {
          fields: {
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      // Only leaf fields are mapped, not intermediate groups
      expect(mapping.paths.has('basicSettings')).toBe(false)
      expect(mapping.paths.get('basicSettings.name')).toBe('basicSettings.name')
    })

    it('respects $storePath string override', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            title: textField('title', { label: 'Title' })
          },
          $storePath: 'customPath'
        })
      }))

      const mapping = generateStoreMapping(form)

      // Only leaf fields are mapped, not the group itself
      expect(mapping.paths.has('settings')).toBe(false)
      // Nested field inherits the path prefix from parent
      expect(mapping.paths.get('settings.title')).toBe('settings.title')
    })

    it('respects $storePath object for granular mapping', () => {
      const form = defineForm('test', () => ({
        basicSettings: fieldGroup('basicSettings', {
          fields: {
            name: textField('name', { label: 'Name' }),
            status: textField('status', { label: 'Status' })
          },
          $storePath: {
            name: 'topLevelName',
            status: 'topLevelStatus'
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      expect(mapping.paths.get('basicSettings.name')).toBe('topLevelName')
      expect(mapping.paths.get('basicSettings.status')).toBe('topLevelStatus')
    })

    it('excludes component fields automatically', () => {
      const form = defineForm('test', () => ({
        group: fieldGroup('group', {
          fields: {
            myComponent: componentField('myComponent', {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              component: {} as any
            })
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      expect(mapping.excluded.has('group.myComponent')).toBe(true)
      expect(mapping.paths.has('group.myComponent')).toBe(false)
    })

    it('excludes fieldGroups with $storePath: null', () => {
      const form = defineForm('test', () => ({
        excluded: fieldGroup('excluded', {
          fields: {
            field: textField('field', { label: 'Field' })
          },
          $storePath: null
        })
      }))

      const mapping = generateStoreMapping(form)

      expect(mapping.excluded.has('excluded')).toBe(true)
      expect(mapping.paths.has('excluded')).toBe(false)
    })

    it('handles nested fieldGroups with convention', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            basic: fieldGroup('basic', {
              fields: {
                name: textField('name', { label: 'Name' })
              }
            })
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      // Only leaf fields are mapped, not intermediate groups
      expect(mapping.paths.has('settings')).toBe(false)
      expect(mapping.paths.has('settings.basic')).toBe(false)
      expect(mapping.paths.get('settings.basic.name')).toBe('settings.basic.name')
    })

    it('flattens nested groups with granular $storePath', () => {
      const form = defineForm('test', () => ({
        features: fieldGroup('features', {
          fields: {
            impactCart: fieldGroup('impactCart', {
              fields: {
                enabled: textField('enabled', { label: 'Enabled' })
              }
            }),
            coverCosts: fieldGroup('coverCosts', {
              fields: {
                enabled: textField('enabled', { label: 'Enabled' })
              }
            })
          },
          $storePath: {
            impactCart: 'impactCart',
            coverCosts: 'coverCosts'
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      // Features group itself not mapped
      expect(mapping.paths.has('features')).toBe(false)
      // Nested groups mapped to flat store
      expect(mapping.paths.get('features.impactCart')).toBe('impactCart')
      expect(mapping.paths.get('features.coverCosts')).toBe('coverCosts')
    })
  })

  describe('generateGetData', () => {
    it('extracts nested store data to form structure', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)

      const store = {
        settings: { name: 'Test Campaign' }
      }

      const result = getData(store)

      expect(result).toEqual({
        settings: { name: 'Test Campaign' }
      })
    })

    it('flattens nested form to flat store (granular mapping)', () => {
      const form = defineForm('test', () => ({
        basicSettings: fieldGroup('basicSettings', {
          fields: {
            name: textField('name', { label: 'Name' }),
            status: textField('status', { label: 'Status' })
          },
          $storePath: {
            name: 'name',
            status: 'status'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)

      const store = {
        name: 'My Campaign',
        status: 'active'
      }

      const result = getData(store)

      expect(result).toEqual({
        basicSettings: {
          name: 'My Campaign',
          status: 'active'
        }
      })
    })

    it('handles nested features flattening', () => {
      const form = defineForm('test', () => ({
        features: fieldGroup('features', {
          fields: {
            impactCart: fieldGroup('impactCart', {
              fields: {
                enabled: textField('enabled', { label: 'Enabled' })
              }
            })
          },
          $storePath: {
            impactCart: 'impactCart'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)

      const store = {
        impactCart: { enabled: true }
      }

      const result = getData(store)

      expect(result).toEqual({
        features: { impactCart: { enabled: true } }
      })
    })

    it('handles undefined store values gracefully', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            optional: textField('optional', { label: 'Optional' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)

      const store = {}

      const result = getData(store)

      expect(result).toEqual({
        settings: { optional: undefined }
      })
    })
  })

  describe('generateSetData', () => {
    it('updates store from form data', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      const store = {
        settings: { name: 'Old Name' },
        markDirty: vi.fn()
      }

      const formData = {
        settings: { name: 'New Name' }
      }

      setData(store, formData)

      expect(store.settings.name).toBe('New Name')
      expect(store.markDirty).toHaveBeenCalled()
    })

    it('maps flat form to nested store (granular mapping)', () => {
      const form = defineForm('test', () => ({
        basicSettings: fieldGroup('basicSettings', {
          fields: {
            name: textField('name', { label: 'Name' }),
            status: textField('status', { label: 'Status' })
          },
          $storePath: {
            name: 'name',
            status: 'status'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      const store = {
        name: 'Old Name',
        status: 'draft',
        markDirty: vi.fn()
      }

      const formData = {
        basicSettings: {
          name: 'New Name',
          status: 'active'
        }
      }

      setData(store, formData)

      expect(store.name).toBe('New Name')
      expect(store.status).toBe('active')
      expect(store.markDirty).toHaveBeenCalled()
    })

    it('flattens nested features to store', () => {
      const form = defineForm('test', () => ({
        features: fieldGroup('features', {
          fields: {
            impactCart: fieldGroup('impactCart', {
              fields: {
                enabled: textField('enabled', { label: 'Enabled' })
              }
            })
          },
          $storePath: {
            impactCart: 'impactCart'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      const store = {
        impactCart: { enabled: false },
        markDirty: vi.fn()
      }

      const formData = {
        features: { impactCart: { enabled: true } }
      }

      setData(store, formData)

      expect(store.impactCart.enabled).toBe(true)
      expect(store.markDirty).toHaveBeenCalled()
    })

    it('skips undefined form values', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      const store = {
        settings: { name: 'Original' },
        markDirty: vi.fn()
      }

      const formData = {
        settings: { name: undefined }
      }

      setData(store, formData)

      // Value should remain unchanged
      expect(store.settings.name).toBe('Original')
      // But markDirty should still be called
      expect(store.markDirty).toHaveBeenCalled()
    })
  })

  describe('integration: full form flow', () => {
    it('round-trips data correctly with convention mapping', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            name: textField('name', { label: 'Name' }),
            description: textField('description', { label: 'Description' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)
      const setData = generateSetData(mapping)

      const store = {
        settings: { name: 'Original', description: 'Original description' },
        markDirty: vi.fn()
      }

      // Get data
      const formData = getData(store)
      expect(formData).toEqual({
        settings: { name: 'Original', description: 'Original description' }
      })

      // Modify
      ;(formData.settings as { name: string; description: string }).name = 'Modified'

      // Set data back
      setData(store, formData)

      expect(store.settings.name).toBe('Modified')
      expect(store.settings.description).toBe('Original description')
    })

    it('round-trips data with granular $storePath mapping', () => {
      const form = defineForm('test', () => ({
        basicSettings: fieldGroup('basicSettings', {
          fields: {
            name: textField('name', { label: 'Name' }),
            status: textField('status', { label: 'Status' })
          },
          $storePath: {
            name: 'name',
            status: 'status'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)
      const setData = generateSetData(mapping)

      const store = {
        name: 'Campaign',
        status: 'draft',
        markDirty: vi.fn()
      }

      // Get data - should create nested form structure
      const formData = getData(store)
      expect(formData).toEqual({
        basicSettings: { name: 'Campaign', status: 'draft' }
      })

      // Modify
      ;(formData.basicSettings as { name: string; status: string }).status = 'active'

      // Set data back - should flatten to store
      setData(store, formData)

      expect(store.name).toBe('Campaign')
      expect(store.status).toBe('active')
    })
  })
})
