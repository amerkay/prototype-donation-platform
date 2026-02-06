<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2 } from 'lucide-vue-next'

const store = useCampaignConfigStore()
const { deleteCampaign } = useCampaigns()

const emit = defineEmits<{ deleted: [] }>()

const hasDonations = computed(() => (store.stats?.totalDonations ?? 0) > 0)
const showDialog = ref(false)

function handleConfirm() {
  if (!store.id) return
  deleteCampaign(store.id)
  showDialog.value = false
  emit('deleted')
}
</script>

<template>
  <Tooltip v-if="hasDonations" :delay-duration="100">
    <TooltipTrigger as-child>
      <span class="inline-flex">
        <Button variant="ghost" size="icon" class="pointer-events-none text-destructive opacity-30">
          <Trash2 class="size-4" />
        </Button>
      </span>
    </TooltipTrigger>
    <TooltipContent>Cannot delete a campaign that has received donations</TooltipContent>
  </Tooltip>
  <Button
    v-else
    variant="ghost"
    size="icon"
    class="text-destructive hover:text-destructive"
    @click="showDialog = true"
  >
    <Trash2 class="size-4" />
  </Button>

  <AlertDialog v-model:open="showDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{{ store.name }}"? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button variant="destructive" @click="handleConfirm">Delete</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
