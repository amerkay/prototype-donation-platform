<script setup lang="ts">
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { generateFormId, generateFormName } from '~/features/campaigns/admin/templates'
import type { DonationFormTemplate } from '~/features/campaigns/admin/templates'
import DonationFormTemplatesDialog from '~/features/campaigns/admin/components/DonationFormTemplatesDialog.vue'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import {
  Edit,
  Check,
  FileText,
  Plus,
  Eye,
  Copy,
  MoreHorizontal,
  Trash2,
  Loader2
} from 'lucide-vue-next'

const router = useRouter()
const store = useCampaignConfigStore()

const { forms, setDefaultForm, createForm, duplicateForm, deleteForm } = useForms(store.id!)

// Loading state
const isLoading = ref(true)

onMounted(() => {
  // Simulate loading completion - in real app this would be after async data fetch
  // Set to false immediately since data comes from sessionStorage/sample data synchronously
  isLoading.value = false
})

// Track loading states
const settingDefaultId = ref<string | null>(null)
const duplicatingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

// Templates dialog state
const showTemplatesDialog = ref(false)

// Delete confirmation dialog state
const formToDelete = ref<{ id: string; name: string } | null>(null)

const handleSetDefault = async (formId: string) => {
  settingDefaultId.value = formId
  try {
    await setDefaultForm(formId)
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

const handleAddForm = () => {
  showTemplatesDialog.value = true
}

const handleTemplateSelect = async (template: DonationFormTemplate) => {
  try {
    // Generate unique form ID and name
    const formId = generateFormId(store.id!, template.metadata.id)
    const existingNames = forms.value.map((f) => f.name)
    const formName = generateFormName(template.metadata.name, existingNames)

    // Generate form config from template
    const { config, products } = template.factory(store.id!)

    // Create form
    await createForm(formId, formName, config, products)

    // Navigate to edit page
    router.push(`/admin/campaigns/${store.id}/forms/${formId}/edit`)
  } catch (error) {
    console.error('Failed to create form', error)
  }
}

const handleDuplicateForm = async (formId: string, formName: string) => {
  duplicatingId.value = formId
  try {
    // Generate new form ID and name
    const newFormId = generateFormId(store.id!, 'duplicate')
    const existingNames = forms.value.map((f) => f.name)
    const newFormName = generateFormName(`${formName} (Copy)`, existingNames)

    // Duplicate form
    await duplicateForm(formId, newFormId, newFormName)
  } catch (error) {
    console.error('Failed to duplicate form', error)
  } finally {
    duplicatingId.value = null
  }
}

const handleDeleteForm = (formId: string, formName: string) => {
  formToDelete.value = { id: formId, name: formName }
}

const handleConfirmDelete = async () => {
  if (!formToDelete.value) return

  deletingId.value = formToDelete.value.id
  try {
    await deleteForm(formToDelete.value.id)
  } catch (error) {
    console.error('Failed to delete form', error)
  } finally {
    deletingId.value = null
    formToDelete.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm flex items-center gap-x-1.5">
        <FileText class="size-4" />
        Donation Forms
      </h3>
      <Button size="sm" @click="handleAddForm">
        <Plus class="w-4 h-4 mr-1.5" />
        Add Form
      </Button>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      Manage donation forms for this campaign. Set a default form for direct campaign links.
    </p>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 class="w-6 h-6 animate-spin mr-2" />
      <span>Loading forms...</span>
    </div>

    <!-- Empty State -->
    <Empty v-else-if="forms.length === 0" class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>No Forms Yet</EmptyTitle>
        <EmptyDescription>
          Create your first donation form to start collecting donations for this campaign.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button @click="handleAddForm">
          <Plus class="w-4 h-4 mr-1.5" />
          Create Your First Form
        </Button>
      </EmptyContent>
    </Empty>

    <!-- Table State -->
    <ClientOnly v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Form Name</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="form in forms" :key="form.id">
            <TableCell>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ form.name }}</span>
                <Badge v-if="form.isDefault" variant="default" class="gap-1">
                  <Check class="w-3 h-3" />
                  Default
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  title="Preview form"
                  @click="handlePreviewForm(form.id)"
                >
                  <Eye class="w-4 h-4" />
                </Button>
                <Button size="sm" @click="handleEditForm(form.id)">
                  <Edit class="w-4 h-4 mr-1.5" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="icon" title="More actions">
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      v-if="!form.isDefault"
                      :disabled="settingDefaultId === form.id"
                      @click="handleSetDefault(form.id)"
                    >
                      <Check class="w-4 h-4 mr-2" />
                      {{ settingDefaultId === form.id ? 'Setting...' : 'Set default' }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="!form.isDefault" />
                    <DropdownMenuItem
                      :disabled="duplicatingId === form.id"
                      @click="handleDuplicateForm(form.id, form.name)"
                    >
                      <Copy class="w-4 h-4 mr-2" />
                      {{ duplicatingId === form.id ? 'Duplicating...' : 'Duplicate' }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      class="text-destructive focus:text-destructive"
                      :disabled="deletingId === form.id"
                      @click="handleDeleteForm(form.id, form.name)"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      {{ deletingId === form.id ? 'Deleting...' : 'Delete' }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ClientOnly>

    <!-- Templates Dialog -->
    <DonationFormTemplatesDialog
      v-model:open="showTemplatesDialog"
      :campaign-id="store.id!"
      @select="handleTemplateSelect"
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="!!formToDelete" @update:open="(open) => !open && (formToDelete = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Form</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ formToDelete?.name }}"? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="!!deletingId">Cancel</AlertDialogCancel>
          <Button variant="destructive" :disabled="!!deletingId" @click="handleConfirmDelete">
            {{ deletingId ? 'Deleting...' : 'Delete' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
