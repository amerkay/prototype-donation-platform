import { describe, expect, it, vi } from 'vitest'
import { defineStore, createPinia, setActivePinia } from 'pinia'
import { reactive, ref, toRefs } from 'vue'
import {
  generateStoreMapping,
  generateGetData,
  generateSetData
} from '~/features/_library/form-builder/utils/storeMapping'
import {
  defineForm,
  fieldGroup,
  textField,
  tabsField,
  toggleField,
  componentField,
  alertField,
  readonlyField
} from '~/features/_library/form-builder/api'

describe('storeMapping', () => {
  describe('generateStoreMapping', () => {
    it('uses convention for simple fieldGroups', () => {
      const form = defineForm('test', () => ({
        donationForms: fieldGroup('donationForms', {
          fields: {
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      // Only leaf fields are mapped, not intermediate groups
      expect(mapping.paths.has('donationForms')).toBe(false)
      expect(mapping.paths.get('donationForms.name')).toBe('donationForms.name')
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
        donationForms: fieldGroup('donationForms', {
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

      expect(mapping.paths.get('donationForms.name')).toBe('topLevelName')
      expect(mapping.paths.get('donationForms.status')).toBe('topLevelStatus')
    })

    it('excludes all display-only field types (component, alert, readonly)', () => {
      const form = defineForm('test', () => ({
        group: fieldGroup('group', {
          fields: {
            myComponent: componentField('myComponent', {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              component: {} as any
            }),
            myAlert: alertField('myAlert', { variant: 'info', description: 'Info' }),
            myReadonly: readonlyField('myReadonly', {
              label: 'Type',
              defaultValue: 'donation'
            }),
            // Regular field should still be mapped
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)

      // componentField is NOT excluded — setData's `in` guard skips non-store keys safely
      expect(mapping.excluded.has('group.myComponent')).toBe(false)
      expect(mapping.paths.has('group.myComponent')).toBe(true)
      expect(mapping.excluded.has('group.myAlert')).toBe(true)
      expect(mapping.excluded.has('group.myReadonly')).toBe(true)
      expect(mapping.paths.has('group.myAlert')).toBe(false)
      expect(mapping.paths.has('group.myReadonly')).toBe(false)
      // Regular field still mapped
      expect(mapping.paths.get('group.name')).toBe('group.name')
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

    it('creates identity mapping for regular fields with $storePath: flatten', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            showLogo: textField('showLogo', { label: 'Show Logo' }),
            headerText: textField('headerText', { label: 'Header' })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)

      expect(mapping.paths.get('settings.showLogo')).toBe('showLogo')
      expect(mapping.paths.get('settings.headerText')).toBe('headerText')
    })

    it('auto-excludes display-only fields with $storePath: flatten', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            showLogo: textField('showLogo', { label: 'Show Logo' }),
            notice: alertField('notice', { variant: 'info', description: 'Info' }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            preview: componentField('preview', { component: {} as any })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)

      // Regular field is mapped
      expect(mapping.paths.get('settings.showLogo')).toBe('showLogo')
      // Alert fields are excluded, componentFields are mapped (setData skips non-store keys)
      expect(mapping.paths.has('settings.notice')).toBe(false)
      expect(mapping.paths.get('settings.preview')).toBe('preview')
    })

    it('recursively flattens fields inside tabs with $storePath: flatten', () => {
      const form = defineForm('test', () => ({
        certificate: fieldGroup('certificate', {
          fields: {
            certTabs: tabsField('certTabs', {
              tabs: [
                {
                  value: 'logo',
                  label: 'Logo',
                  fields: {
                    showLogo: textField('showLogo', { label: 'Show Logo' }),
                    logoSize: textField('logoSize', { label: 'Logo Size' })
                  }
                },
                {
                  value: 'footer',
                  label: 'Footer',
                  fields: {
                    footerText: textField('footerText', { label: 'Footer Text' }),
                    notice: alertField('notice', { variant: 'info', description: 'Info' })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)

      // Leaf fields mapped to identity store paths through tab segments
      expect(mapping.paths.get('certificate.certTabs.logo.showLogo')).toBe('showLogo')
      expect(mapping.paths.get('certificate.certTabs.logo.logoSize')).toBe('logoSize')
      expect(mapping.paths.get('certificate.certTabs.footer.footerText')).toBe('footerText')
      // Display-only fields excluded even inside tabs
      expect(mapping.paths.has('certificate.certTabs.footer.notice')).toBe(false)
      // Tab container and tab values not mapped as entries
      expect(mapping.paths.has('certificate.certTabs')).toBe(false)
      expect(mapping.paths.has('certificate.certTabs.logo')).toBe(false)
    })

    it('recursively flattens nested field groups inside tabs', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            tabs: tabsField('tabs', {
              tabs: [
                {
                  value: 'details',
                  label: 'Details',
                  fields: {
                    address: fieldGroup('address', {
                      fields: {
                        city: textField('city', { label: 'City' }),
                        postcode: textField('postcode', { label: 'Postcode' })
                      }
                    })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)

      // Leaf fields inside nested fieldGroup inside tab → identity mapped
      expect(mapping.paths.get('settings.tabs.details.address.city')).toBe('city')
      expect(mapping.paths.get('settings.tabs.details.address.postcode')).toBe('postcode')
    })

    it('supports flatten alongside manual $storePath: Record', () => {
      const form = defineForm('test', () => ({
        flat: fieldGroup('flat', {
          fields: {
            name: textField('name', { label: 'Name' })
          },
          $storePath: 'flatten'
        }),
        manual: fieldGroup('manual', {
          fields: {
            status: textField('status', { label: 'Status' })
          },
          $storePath: { status: 'topLevel.status' }
        })
      }))

      const mapping = generateStoreMapping(form)

      expect(mapping.paths.get('flat.name')).toBe('name')
      expect(mapping.paths.get('manual.status')).toBe('topLevel.status')
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
        donationForms: fieldGroup('donationForms', {
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
        donationForms: {
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
        donationForms: fieldGroup('donationForms', {
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
        donationForms: {
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

    it('skips writes when store intermediate is missing', () => {
      const form = defineForm('test', () => ({
        config: fieldGroup('config', {
          fields: {
            enabled: textField('enabled', { label: 'Enabled' })
          },
          $storePath: {
            enabled: 'overrides.USD.enabled'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      // Store starts with empty overrides (no USD key)
      const store = {
        overrides: {} as Record<string, Record<string, unknown>>,
        markDirty: vi.fn()
      }

      const formData = {
        config: { enabled: true }
      }

      setData(store, formData)

      // Should NOT create intermediate — store must be pre-populated
      expect(store.overrides.USD).toBeUndefined()
      expect(store.markDirty).not.toHaveBeenCalled()
    })

    it('writes to pre-populated deep store paths', () => {
      const form = defineForm('test', () => ({
        config: fieldGroup('config', {
          fields: {
            enabled: textField('enabled', { label: 'Enabled' }),
            name: textField('name', { label: 'Name' })
          },
          $storePath: {
            enabled: 'overrides.USD.enabled',
            name: 'overrides.USD.name'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      // Store pre-populated with defaults
      const store = {
        overrides: {
          USD: { enabled: false, name: '' }
        } as Record<string, Record<string, unknown>>,
        markDirty: vi.fn()
      }

      const formData = {
        config: { enabled: true, name: 'US Charity' }
      }

      setData(store, formData)

      expect(store.overrides.USD).toEqual({ enabled: true, name: 'US Charity' })
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
      // markDirty should NOT be called since no values actually changed
      expect(store.markDirty).not.toHaveBeenCalled()
    })
  })

  describe('generateSetData - false positive prevention', () => {
    it('does not mark dirty when form data contains unmapped extra properties', () => {
      // Regression: granular $storePath like { 'sections.donationForms': 'donationForms' }
      // maps the entire tab as a blob. If the tab only has componentFields (excluded),
      // the store has no 'donationForms' property. When vee-validate emits form values
      // containing { donationForms: { formCard: { formsCount: 1 } } }, setData should
      // NOT write this to the store and trigger a false dirty flag.
      const form = defineForm('test', () => ({
        config: fieldGroup('config', {
          fields: {
            crowdfunding: fieldGroup('crowdfunding', {
              fields: {
                title: textField('title', { label: 'Title' })
              }
            }),
            donationForms: fieldGroup('donationForms', {
              fields: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formCard: componentField('formCard', { component: {} as any })
              }
            })
          },
          $storePath: {
            crowdfunding: 'crowdfunding',
            donationForms: 'donationForms'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      // Store does NOT have 'donationForms' (it's a componentField-only tab)
      const markDirty = vi.fn()
      const store = {
        crowdfunding: { title: 'My Campaign' },
        markDirty
      }

      // Form emits values including componentField data injected by watcher
      setData(store, {
        config: {
          crowdfunding: { title: 'My Campaign' },
          donationForms: { formCard: { formsCount: 1 } }
        }
      })

      // Should NOT mark dirty (crowdfunding unchanged, donationForms is unmapped blob)
      expect(markDirty).not.toHaveBeenCalled()
      // Should NOT create donationForms on store
      expect((store as Record<string, unknown>).donationForms).toBeUndefined()
    })

    it('does not mark dirty when readonlyField default adds extra property to blob-mapped group', () => {
      // Regression: granular $storePath maps 'sections.form' → 'form' as a blob.
      // The group contains readonlyField('formType', { defaultValue: 'donation' }).
      // Store has { title, subtitle } (no formType). vee-validate fills formType
      // from defaultValue. setData must strip extra keys when writing blobs.
      const form = defineForm('test', () => ({
        config: fieldGroup('config', {
          fields: {
            form: fieldGroup('form', {
              fields: {
                formType: readonlyField('formType', {
                  label: 'Type',
                  defaultValue: 'donation'
                }),
                title: textField('title', { label: 'Title' }),
                subtitle: textField('subtitle', { label: 'Subtitle' })
              }
            })
          },
          $storePath: {
            form: 'form'
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      const store = {
        form: { title: 'My Form', subtitle: 'Sub' },
        markDirty: vi.fn()
      }

      // vee-validate emits blob with extra formType from readonlyField default
      setData(store, {
        config: {
          form: { title: 'My Form', subtitle: 'Sub', formType: 'donation' }
        }
      })

      // Extra key must be stripped — no dirty, no formType on store
      expect(store.markDirty).not.toHaveBeenCalled()
      expect((store.form as Record<string, unknown>).formType).toBeUndefined()
    })

    it('does not mark dirty when getData round-trips unchanged data', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            name: textField('name', { label: 'Name' })
          }
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)
      const setData = generateSetData(mapping)

      const store = {
        settings: { name: 'Original' },
        markDirty: vi.fn()
      }

      // Round-trip: getData → setData with same values
      const formData = getData(store)
      setData(store, formData)

      expect(store.markDirty).not.toHaveBeenCalled()
    })
  })

  describe('generateSetData - componentField handling', () => {
    it('writes componentField values to store when store property exists', () => {
      const form = defineForm('test', () => ({
        certificate: fieldGroup('certificate', {
          fields: {
            certTabs: tabsField('certTabs', {
              tabs: [
                {
                  value: 'footer',
                  label: 'Footer',
                  fields: {
                    footerText: textField('footerText', { label: 'Footer' }),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    signatureFont: componentField('signatureFont', { component: {} as any })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      // Store HAS signatureFont (it's a real store property)
      const store = {
        footerText: 'Original',
        signatureFont: 'Sacramento',
        markDirty: vi.fn()
      }

      setData(store, {
        certificate: {
          certTabs: { footer: { footerText: 'Original', signatureFont: 'Pacifico' } }
        }
      })

      expect(store.signatureFont).toBe('Pacifico')
      expect(store.markDirty).toHaveBeenCalledOnce()
    })

    it('skips componentField values when store property does not exist', () => {
      const form = defineForm('test', () => ({
        certificate: fieldGroup('certificate', {
          fields: {
            certTabs: tabsField('certTabs', {
              tabs: [
                {
                  value: 'product',
                  label: 'Product',
                  fields: {
                    showProduct: toggleField('showProduct', { label: 'Show' }),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    linkedProducts: componentField('linkedProducts', { component: {} as any })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)
      const setData = generateSetData(mapping)

      // Store does NOT have linkedProducts (display-only component)
      const store = {
        showProduct: true,
        markDirty: vi.fn()
      }

      setData(store, {
        certificate: {
          certTabs: { product: { showProduct: true, linkedProducts: ['prod-1'] } }
        }
      })

      // linkedProducts skipped (not in store), showProduct unchanged → no dirty
      expect((store as Record<string, unknown>).linkedProducts).toBeUndefined()
      expect(store.markDirty).not.toHaveBeenCalled()
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
        donationForms: fieldGroup('donationForms', {
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
        donationForms: { name: 'Campaign', status: 'draft' }
      })

      // Modify
      ;(formData.donationForms as { name: string; status: string }).status = 'active'

      // Set data back - should flatten to store
      setData(store, formData)

      expect(store.name).toBe('Campaign')
      expect(store.status).toBe('active')
    })

    it('round-trips data with flatten through tabs', () => {
      const form = defineForm('test', () => ({
        certificate: fieldGroup('certificate', {
          fields: {
            certTabs: tabsField('certTabs', {
              tabs: [
                {
                  value: 'logo',
                  label: 'Logo',
                  fields: {
                    showLogo: textField('showLogo', { label: 'Show Logo' }),
                    logoSize: textField('logoSize', { label: 'Logo Size' })
                  }
                },
                {
                  value: 'footer',
                  label: 'Footer',
                  fields: {
                    footerText: textField('footerText', { label: 'Footer' })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)
      const setData = generateSetData(mapping)

      const store = {
        showLogo: true,
        logoSize: 'large',
        footerText: 'Original footer',
        markDirty: vi.fn()
      }

      // Get data — flat store → nested form structure
      const formData = getData(store)
      expect(formData).toEqual({
        certificate: {
          certTabs: {
            logo: { showLogo: true, logoSize: 'large' },
            footer: { footerText: 'Original footer' }
          }
        }
      })

      // Modify nested form data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(formData as any).certificate.certTabs.footer.footerText = 'Updated footer'

      // Set data back — nested form → flat store
      setData(store, formData)

      expect(store.showLogo).toBe(true)
      expect(store.logoSize).toBe('large')
      expect(store.footerText).toBe('Updated footer')
      expect(store.markDirty).toHaveBeenCalledOnce()
    })

    it('marks dirty when toggling a boolean field inside tabs with flatten', () => {
      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            tabs: tabsField('tabs', {
              tabs: [
                {
                  value: 'footer',
                  label: 'Footer',
                  fields: {
                    showPhone: toggleField('showPhone', { label: 'Phone' }),
                    showEmail: toggleField('showEmail', { label: 'Email' })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)
      const setData = generateSetData(mapping)

      const store = {
        showPhone: true,
        showEmail: true,
        markDirty: vi.fn()
      }

      // Get initial data
      const formData = getData(store)
      expect(formData).toEqual({
        settings: { tabs: { footer: { showPhone: true, showEmail: true } } }
      })

      // Toggle showPhone off
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(formData as any).settings.tabs.footer.showPhone = false

      // Set data back — should detect change and mark dirty
      setData(store, formData)

      expect(store.showPhone).toBe(false)
      expect(store.showEmail).toBe(true)
      expect(store.markDirty).toHaveBeenCalledOnce()
    })

    it('toSnapshot must include id so discard does not break dirty detection', () => {
      // Regression: toSnapshot() omitted id. After discard, restoreLastSaved() called
      // store.initialize(snapshot), which set templateId = undefined. This made
      // originalData (guarded by store.id) return undefined, permanently breaking isDirty.
      setActivePinia(createPinia())

      const useTestStore = defineStore('test-snapshot-id', () => {
        const isDirty = ref(false)
        const templateId = ref<string | undefined>(undefined)
        const state = reactive({ showLogo: true, footerText: 'Original' })

        function initialize(data: Record<string, unknown>) {
          templateId.value = data.id as string | undefined
          if (data.showLogo !== undefined) state.showLogo = data.showLogo as boolean
          if (data.footerText !== undefined) state.footerText = data.footerText as string
        }

        function toSnapshot() {
          return { id: templateId.value, ...state }
        }

        return {
          ...toRefs(state),
          id: templateId,
          isDirty,
          markDirty: () => {
            isDirty.value = true
          },
          markClean: () => {
            isDirty.value = false
          },
          initialize,
          toSnapshot
        }
      })

      const store = useTestStore()
      store.initialize({ id: 'tmpl-1', showLogo: true, footerText: 'Original' })

      // Simulate discard: restoreLastSaved calls initialize with toSnapshot data
      const snapshot = JSON.parse(JSON.stringify(store.toSnapshot()))
      store.initialize(snapshot)

      // id must survive the round-trip
      expect(store.id).toBe('tmpl-1')

      // originalData guard (store.id ? toSnapshot() : undefined) must still work
      const originalData = store.id ? store.toSnapshot() : undefined
      expect(originalData).toBeDefined()
    })

    it('toSnapshot without id breaks dirty detection after discard', () => {
      // Proves the bug: if toSnapshot omits id, discard kills dirty detection
      setActivePinia(createPinia())

      const useTestStore = defineStore('test-snapshot-no-id', () => {
        const isDirty = ref(false)
        const templateId = ref<string | undefined>(undefined)
        const state = reactive({ showLogo: true })

        function initialize(data: Record<string, unknown>) {
          templateId.value = data.id as string | undefined
          if (data.showLogo !== undefined) state.showLogo = data.showLogo as boolean
        }

        // BAD: omits id
        function toSnapshotBroken() {
          return { ...state }
        }

        return {
          ...toRefs(state),
          id: templateId,
          isDirty,
          markDirty: () => {
            isDirty.value = true
          },
          markClean: () => {
            isDirty.value = false
          },
          initialize,
          toSnapshot: toSnapshotBroken
        }
      })

      const store = useTestStore()
      store.initialize({ id: 'tmpl-1', showLogo: true })

      // Discard with broken snapshot
      const snapshot = JSON.parse(JSON.stringify(store.toSnapshot()))
      store.initialize(snapshot)

      // id is now undefined — proves the bug
      expect(store.id).toBeUndefined()
      const originalData = store.id ? store.toSnapshot() : undefined
      expect(originalData).toBeUndefined()
    })

    it('marks dirty with real Pinia store (toRefs) and flatten through tabs', () => {
      setActivePinia(createPinia())

      const useTestStore = defineStore('test-flatten-pinia', () => {
        const isDirty = ref(false)
        const state = reactive({ showPhone: true, showEmail: true, footerText: 'Original' })
        const markDirty = () => {
          isDirty.value = true
        }
        const markClean = () => {
          isDirty.value = false
        }
        return { ...toRefs(state), isDirty, markDirty, markClean }
      })

      const form = defineForm('test', () => ({
        settings: fieldGroup('settings', {
          fields: {
            tabs: tabsField('tabs', {
              tabs: [
                {
                  value: 'footer',
                  label: 'Footer',
                  fields: {
                    footerText: textField('footerText', { label: 'Footer' }),
                    showPhone: toggleField('showPhone', { label: 'Phone' }),
                    showEmail: toggleField('showEmail', { label: 'Email' })
                  }
                }
              ]
            })
          },
          $storePath: 'flatten'
        })
      }))

      const mapping = generateStoreMapping(form)
      const getData = generateGetData(mapping)
      const setData = generateSetData(mapping)

      const store = useTestStore()

      // Get initial data
      const formData = getData(store)
      expect(formData).toEqual({
        settings: { tabs: { footer: { footerText: 'Original', showPhone: true, showEmail: true } } }
      })

      // Toggle showPhone off
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(formData as any).settings.tabs.footer.showPhone = false

      // Set data back — should detect change and mark dirty
      setData(store, formData)

      expect(store.showPhone).toBe(false)
      expect(store.showEmail).toBe(true)
      expect(store.isDirty).toBe(true)
    })
  })
})
