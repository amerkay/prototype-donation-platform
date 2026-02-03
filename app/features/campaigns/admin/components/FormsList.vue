<script setup lang="ts">
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import type { CampaignForm } from '~/features/campaigns/shared/types'
import {
  generateFormId,
  generateFormName,
  convertTemplateAmounts
} from '~/features/donation-form/admin/templates'
import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import DonationFormTemplatesDialog from '~/features/donation-form/admin/components/DonationFormTemplatesDialog.vue'
import CopyFormFromCampaignDialog from '~/features/campaigns/admin/components/CopyFormFromCampaignDialog.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
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
import { Edit, Check, FileText, Plus, Eye, Copy, MoreHorizontal, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const store = useCampaignConfigStore()
const currencySettings = useCurrencySettingsStore()
const { smartRound } = useCurrency()

const { forms, setDefaultForm, renameForm, createForm, duplicateForm } = useForms(store.id!)

const visibleForms = computed(() => forms.value.filter((f) => !store.pendingFormDeletes.has(f.id)))

// P2P campaigns are limited to a single donation form
// Fundraiser campaigns cannot add forms (they use a copy from parent template)
const canAddForm = computed(() => {
  if (store.isFundraiser) return false
  return visibleForms.value.length < store.maxFormsAllowed
})

// Fundraisers cannot modify forms (they use copied forms from parent)
const canModifyForms = computed(() => !store.isFundraiser)

// Track loading states
const settingDefaultId = ref<string | null>(null)
const duplicatingId = ref<string | null>(null)

// Templates dialog state
const showTemplatesDialog = ref(false)

// Copy from campaign dialog state
const showCopyDialog = ref(false)

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

    // Generate form config from template and convert GBP amounts to default currency
    const defaultCurrency = currencySettings.defaultCurrency
    const templateResult = template.factory(store.id!, defaultCurrency)
    const { config, products } = convertTemplateAmounts(templateResult, (amount) =>
      smartRound(amount, defaultCurrency, 'GBP')
    )

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

const handleConfirmDelete = () => {
  if (!formToDelete.value) return
  store.addPendingFormDelete(formToDelete.value.id)
  formToDelete.value = null
}

const handleCopyFromCampaign = async (sourceForm: CampaignForm, sourceCampaignId: string) => {
  try {
    // Generate unique form ID and name
    const formId = generateFormId(store.id!, 'copy')
    const existingNames = forms.value.map((f) => f.name)
    const formName = generateFormName(`${sourceForm.name} (Copy)`, existingNames)

    // Copy the form to current campaign
    const { forms: sourceForms } = useForms(sourceCampaignId)
    const sourceFormData = sourceForms.value.find((f) => f.id === sourceForm.id)
    if (!sourceFormData) {
      throw new Error('Source form not found')
    }

    // Create form with copied config and products
    await createForm(formId, formName, sourceFormData.config, sourceFormData.products)
  } catch (error) {
    console.error('Failed to copy form', error)
  }
}
</script>

<template>
  <div>
    <div class="mb-3">
      <h3 class="text-sm flex items-center gap-x-1.5">
        <FileText class="size-4" />
        Donation Forms
      </h3>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      <template v-if="store.isFundraiser">
        Fundraiser campaigns use a copy of the parent template's form.
      </template>
      <template v-else-if="store.isP2P && !canAddForm">
        P2P campaigns use a single donation form.
      </template>
      <template v-else>
        Manage donation forms for this campaign. Set a default form for direct campaign links.
      </template>
    </p>

    <!-- Empty State -->
    <Empty v-if="visibleForms.length === 0" class="border border-dashed">
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
        <div class="flex flex-col sm:flex-row gap-2">
          <Button @click="handleAddForm">
            <Plus class="w-4 h-4 mr-1.5" />
            Create Your First Form
          </Button>
          <Button variant="outline" class="text-foreground" @click="showCopyDialog = true">
            <Copy class="w-4 h-4 mr-1.5" />
            Copy from another campaign
          </Button>
        </div>
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
          <TableRow v-for="form in visibleForms" :key="form.id">
            <TableCell>
              <div class="flex items-center gap-2">
                <InlineEditableText
                  v-if="canModifyForms"
                  :model-value="form.name"
                  @update:model-value="renameForm(form.id, $event)"
                />
                <span v-else class="font-medium">{{ form.name }}</span>
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
                      v-if="!form.isDefault && canModifyForms"
                      :disabled="settingDefaultId === form.id"
                      @click="handleSetDefault(form.id)"
                    >
                      <Check class="w-4 h-4 mr-2" />
                      {{ settingDefaultId === form.id ? 'Setting...' : 'Set default' }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="!form.isDefault && canModifyForms" />
                    <DropdownMenuItem
                      v-if="canAddForm && canModifyForms"
                      :disabled="duplicatingId === form.id"
                      @click="handleDuplicateForm(form.id, form.name)"
                    >
                      <Copy class="w-4 h-4 mr-2" />
                      {{ duplicatingId === form.id ? 'Duplicating...' : 'Duplicate' }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="canModifyForms" />
                    <DropdownMenuItem
                      v-if="canModifyForms"
                      class="text-destructive focus:text-destructive"
                      @click="handleDeleteForm(form.id, form.name)"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ClientOnly>

    <!-- Add/Copy Buttons -->
    <div
      v-if="canAddForm && visibleForms.length > 0"
      class="flex items-center gap-2 mt-3 mr-2 ml-2 sm:justify-end"
    >
      <Button
        v-if="store.type === 'standard'"
        class="flex-1 sm:flex-initial"
        variant="outline"
        size="sm"
        @click="showCopyDialog = true"
      >
        <Copy class="w-4 h-4 mr-1.5" />
        Copy from...
      </Button>
      <Button class="flex-1 sm:flex-initial" size="sm" @click="handleAddForm">
        <Plus class="w-4 h-4 mr-1.5" />
        Add Form
      </Button>
    </div>

    <!-- Templates Dialog -->
    <DonationFormTemplatesDialog
      v-model:open="showTemplatesDialog"
      :campaign-id="store.id ?? ''"
      @select="handleTemplateSelect"
    />

    <!-- Copy from Campaign Dialog -->
    <CopyFormFromCampaignDialog
      v-model:open="showCopyDialog"
      :current-campaign-id="store.id ?? ''"
      @select="handleCopyFromCampaign"
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="!!formToDelete" @update:open="(open) => !open && (formToDelete = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Form</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ formToDelete?.name }}"? You can restore it by
            discarding changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" @click="handleConfirmDelete"> Delete </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
