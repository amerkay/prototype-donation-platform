<script setup lang="ts">
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Check, FileText } from 'lucide-vue-next'

const router = useRouter()
const store = useCampaignConfigStore()

const { forms, setDefaultForm } = useForms(store.id!)

// Track loading state for set default action
const settingDefaultId = ref<string | null>(null)

const handleSetDefault = async (formId: string) => {
  settingDefaultId.value = formId
  try {
    await setDefaultForm(formId)
    // In real app, would refresh data from API
    // For now, just clear the loading state
  } finally {
    settingDefaultId.value = null
  }
}

const handleEditForm = (formId: string) => {
  router.push(`/admin/campaigns/${store.id}/forms/${formId}/edit`)
}

const handlePreviewForm = (formId: string) => {
  window.open(`/admin/campaigns/${store.id}/forms/${formId}/preview`, '_blank')
}
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-3 flex items-center gap-2">
      <FileText class="w-5 h-5" />
      Donation Forms
    </h3>
    <p class="text-sm text-muted-foreground mb-4">
      Manage donation forms for this campaign. Set a default form for direct campaign links.
    </p>

    <Table v-if="forms.length > 0">
      <TableHeader>
        <TableRow>
          <TableHead>Form Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="form in forms" :key="form.id">
          <TableCell>
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ form.name }}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge v-if="form.isDefault" variant="default" class="gap-1">
              <Check class="w-3 h-3" />
              Default
            </Badge>
            <Button
              v-else
              variant="ghost"
              size="sm"
              :disabled="settingDefaultId === form.id"
              @click="handleSetDefault(form.id)"
            >
              {{ settingDefaultId === form.id ? 'Setting...' : 'Set as Default' }}
            </Button>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" @click="handlePreviewForm(form.id)">
                Preview
              </Button>
              <Button size="sm" @click="handleEditForm(form.id)">
                <Edit class="w-4 h-4 mr-1.5" />
                Edit
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div v-else class="text-center py-8 text-muted-foreground">
      <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No forms found for this campaign.</p>
    </div>
  </div>
</template>
