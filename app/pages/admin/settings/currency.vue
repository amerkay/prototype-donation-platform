<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CurrencySettingsConfig from '~/features/settings/admin/components/CurrencySettingsConfig.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import {
  useCurrencyConversion,
  type CurrencyChangePreview
} from '~/features/settings/admin/composables/useCurrencyConversion'
import {
  useCurrency,
  type ConversionBreakdown
} from '~/features/donation-form/shared/composables/useCurrency'
import CurrencyConversionBreakdown from '~/features/settings/admin/components/CurrencyConversionBreakdown.vue'

const store = useCurrencySettingsStore()
const { previewChanges, applyChanges } = useCurrencyConversion()
const { getConversionBreakdown } = useCurrency()

const originalData = computed(() => store.toSnapshot())

const formConfigRef = ref()
const showCharityCheckDialog = ref(false)
const showConversionDialog = ref(false)
const changePreview = ref<CurrencyChangePreview | null>(null)
const conversionBreakdown = ref<ConversionBreakdown | null>(null)
const pendingOldCurrency = ref('')
const pendingOldSupported = ref<string[]>([])
const lastSavedDefaultCurrency = ref(store.defaultCurrency)
const lastSavedSupported = ref([...store.supportedCurrencies])

const {
  handleSave: _handleSave,
  handleDiscard,
  confirmDiscard,
  showDiscardDialog
} = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

const hasImpact = computed(() => {
  if (!changePreview.value) return false
  const p = changePreview.value
  return p.productCount > 0 || p.campaignCount > 0 || p.affectedForms.length > 0
})

async function handleSave() {
  const oldDefault = lastSavedDefaultCurrency.value
  const newDefault = store.defaultCurrency
  const oldSupported = lastSavedSupported.value
  const newSupported = store.supportedCurrencies

  const defaultChanged = newDefault !== oldDefault
  const currenciesRemoved = oldSupported.some((c) => !newSupported.includes(c))

  // Show impact dialog if anything changed that affects other entities
  if (defaultChanged || currenciesRemoved) {
    pendingOldCurrency.value = oldDefault
    pendingOldSupported.value = oldSupported
    changePreview.value = previewChanges(oldDefault, newDefault, oldSupported, newSupported)
    conversionBreakdown.value = defaultChanged
      ? getConversionBreakdown(30, newDefault, oldDefault)
      : null
    if (hasImpact.value) {
      showConversionDialog.value = true
      return
    }
  }

  await completeSave(defaultChanged)
}

async function completeSave(defaultCurrencyChanged: boolean) {
  await _handleSave()
  if (!store.isDirty) {
    if (defaultCurrencyChanged) {
      showCharityCheckDialog.value = true
    }
    lastSavedDefaultCurrency.value = store.defaultCurrency
    lastSavedSupported.value = [...store.supportedCurrencies]
  }
}

async function handleConvertAndSave() {
  showConversionDialog.value = false
  const oldDefault = pendingOldCurrency.value
  const newDefault = store.defaultCurrency
  const defaultChanged = oldDefault !== newDefault

  // Save currency settings first
  await completeSave(defaultChanged)

  // Then apply conversions and cleanups
  const result = await applyChanges(oldDefault, newDefault, store.supportedCurrencies)
  const parts = []
  if (result.products > 0)
    parts.push(`${result.products} product${result.products !== 1 ? 's' : ''}`)
  if (result.forms > 0) parts.push(`${result.forms} form${result.forms !== 1 ? 's' : ''}`)
  if (result.campaigns > 0)
    parts.push(`${result.campaigns} campaign${result.campaigns !== 1 ? 's' : ''}`)
  if (parts.length > 0) {
    toast.success(`Updated: ${parts.join(', ')}`)
  }
}

function handleSkipConversion() {
  showConversionDialog.value = false
  const defaultChanged = pendingOldCurrency.value !== store.defaultCurrency
  completeSave(defaultChanged)
}

// Breadcrumbs
const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settings', href: '#' },
  { label: 'Currency' }
]

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
    <AdminEditLayout
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      :show-preview="false"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
    >
      <template #content>
        <div class="space-y-6">
          <CurrencySettingsConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>
    </AdminEditLayout>

    <!-- Pre-save: impact warning when currencies change -->
    <AlertDialog v-model:open="showConversionDialog">
      <AlertDialogContent class="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Currency Changes Will Affect Existing Data</AlertDialogTitle>
          <AlertDialogDescription v-if="changePreview" as="div" class="space-y-4">
            <p class="text-sm text-muted-foreground">
              The following will be updated automatically. Review carefully before proceeding.
            </p>

            <!-- Products & campaigns summary -->
            <div
              v-if="changePreview.productCount > 0 || changePreview.campaignCount > 0"
              class="space-y-1 text-sm"
            >
              <p v-if="changePreview.productCount > 0">
                <span class="font-medium">{{ changePreview.productCount }}</span>
                product{{ changePreview.productCount !== 1 ? 's' : '' }} — prices will be converted
              </p>
              <p v-if="changePreview.campaignCount > 0">
                <span class="font-medium">{{ changePreview.campaignCount }}</span>
                campaign{{ changePreview.campaignCount !== 1 ? 's' : '' }} — goals will be converted
              </p>
            </div>

            <!-- Conversion breakdown -->
            <CurrencyConversionBreakdown
              v-if="conversionBreakdown"
              :breakdown="conversionBreakdown"
              :from-currency="pendingOldCurrency"
              :to-currency="store.defaultCurrency"
            />

            <!-- Per-entity examples -->
            <div v-if="changePreview.examples.length > 0" class="text-sm space-y-1">
              <p class="font-medium">Affected prices:</p>
              <p v-for="ex in changePreview.examples" :key="ex.label" class="text-muted-foreground">
                {{ ex.label }}: {{ ex.from }} → {{ ex.to }}
              </p>
            </div>

            <!-- Affected forms with links -->
            <div v-if="changePreview.affectedForms.length > 0" class="space-y-2">
              <p class="text-sm font-medium">Affected forms:</p>
              <div class="max-h-48 overflow-y-auto space-y-2">
                <div
                  v-for="form in changePreview.affectedForms"
                  :key="`${form.campaignId}-${form.formId}`"
                  class="bg-muted rounded-md p-3 text-sm space-y-1"
                >
                  <NuxtLink :to="form.href" class="font-medium text-primary hover:underline">
                    {{ form.campaignName }} : {{ form.formName }}
                  </NuxtLink>
                  <p v-if="form.defaultCurrencyAffected" class="text-muted-foreground">
                    Base currency will switch to {{ store.defaultCurrency }}
                    <span v-if="form.conversionExample"> — {{ form.conversionExample }}</span>
                  </p>
                  <p v-if="form.removedFromEnabled.length > 0" class="text-muted-foreground">
                    {{ form.removedFromEnabled.join(', ') }} will be removed from enabled currencies
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="handleSkipConversion"
            >Save Without Converting</AlertDialogCancel
          >
          <AlertDialogAction @click="handleConvertAndSave">Convert &amp; Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Post-save: remind to check charity settings -->
    <AlertDialog v-model:open="showCharityCheckDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Check Charity Information</AlertDialogTitle>
          <AlertDialogDescription>
            Currency settings saved. Make sure your charity name, registration number, and address
            are correct for the updated currency configuration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
          <AlertDialogAction as-child>
            <NuxtLink to="/admin/settings/charity">Review Charity Settings</NuxtLink>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
