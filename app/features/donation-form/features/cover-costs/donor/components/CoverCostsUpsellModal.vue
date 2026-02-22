<script setup lang="ts">
import { computed } from 'vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import { Button } from '@/components/ui/button'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import CoverCostsModalContent from './CoverCostsModalContent.vue'

interface Props {
  open?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const brandingStyle = useInjectedBrandingStyle()
const charityStore = useCharitySettingsStore()

const charityCosts = computed(() => charityStore.charityCosts)

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <BaseDialogOrDrawer
    :open="open"
    :content-style="brandingStyle"
    @update:open="emit('update:open', $event)"
  >
    <template #header>{{ charityCosts.heading }}</template>

    <template #content>
      <div class="py-4">
        <CoverCostsModalContent />
      </div>
    </template>

    <template #footer>
      <Button variant="outline" class="w-full" @click="handleClose">Close</Button>
    </template>
  </BaseDialogOrDrawer>
</template>
