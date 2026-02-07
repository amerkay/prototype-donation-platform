<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useECardTemplatesStore } from '~/features/templates/admin/stores/ecardTemplates'
import { useECardTemplateForm } from '~/features/templates/admin/forms/ecard-template-form'
import type { ECardTemplate } from '~/features/templates/admin/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

import { formatDate } from '~/lib/formatDate'

definePageMeta({ layout: 'admin' })

const store = useECardTemplatesStore()
const ecardForm = useECardTemplateForm

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'eCards' }
]

const categoryLabels: Record<string, string> = {
  'thank-you': 'Thank You',
  tribute: 'Tribute',
  celebration: 'Celebration',
  custom: 'Custom'
}

// Edit/Create dialog
const showEditDialog = ref(false)
const editFormRef = ref()
const editingId = ref<string | null>(null)
const formData = ref({
  name: '',
  subject: '',
  imageUrl: '',
  bodyText: '',
  category: 'thank-you' as ECardTemplate['category']
})

function openCreate() {
  editingId.value = null
  formData.value = {
    name: '',
    subject: '',
    imageUrl: '',
    bodyText: '',
    category: 'thank-you'
  }
  showEditDialog.value = true
}

function openEdit(template: ECardTemplate) {
  editingId.value = template.id
  formData.value = {
    name: template.name,
    subject: template.subject,
    imageUrl: template.imageUrl,
    bodyText: template.bodyHtml,
    category: template.category
  }
  showEditDialog.value = true
}

function handleSave() {
  const { bodyText, ...rest } = formData.value
  const payload = { ...rest, bodyHtml: bodyText }
  if (editingId.value) {
    store.updateTemplate(editingId.value, payload)
  } else {
    store.createTemplate(payload)
  }
  showEditDialog.value = false
}

// Delete dialog
const templateToDelete = ref<string | null>(null)

function confirmDelete() {
  if (templateToDelete.value) {
    store.deleteTemplate(templateToDelete.value)
    templateToDelete.value = null
  }
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4 space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold">eCards</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ store.templates.length }} templates</p>
        </div>
        <Button size="sm" @click="openCreate">
          <Plus class="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div class="text-xs text-muted-foreground">
        {{ store.templates.length === 0 ? 'No templates yet. Create one to get started.' : '' }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="template in store.templates"
          :key="template.id"
          class="overflow-hidden p-0 gap-y-0"
        >
          <img
            :src="template.imageUrl"
            :alt="template.name"
            class="w-full h-36 object-cover rounded-t-lg"
          />
          <CardHeader class="px-4 pt-3 pb-2">
            <div class="flex items-center justify-between">
              <CardTitle class="text-base">{{ template.name }}</CardTitle>
              <Badge variant="outline" class="text-xs">
                {{ categoryLabels[template.category] }}
              </Badge>
            </div>
            <CardDescription class="text-xs truncate">{{ template.subject }}</CardDescription>
          </CardHeader>
          <CardContent class="px-4 pt-0 pb-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                Created {{ formatDate(template.createdAt) }}
              </span>
              <div class="flex gap-1">
                <Button variant="ghost" size="icon" class="h-7 w-7" @click="openEdit(template)">
                  <Pencil class="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 text-destructive hover:text-destructive"
                  @click="templateToDelete = template.id"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <BaseDialogOrDrawer
      :open="showEditDialog"
      description="Design an email card that donors or recipients will receive."
      max-width="sm:max-w-lg"
      @update:open="showEditDialog = $event"
    >
      <template #header>{{ editingId ? 'Edit' : 'Create' }} eCard Template</template>
      <template #content>
        <FormRenderer ref="editFormRef" v-model="formData" :section="ecardForm" />
      </template>
      <template #footer>
        <Button variant="outline" @click="showEditDialog = false">Cancel</Button>
        <Button :disabled="!formData.name || !formData.subject" @click="handleSave">
          {{ editingId ? 'Update' : 'Create' }}
        </Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Delete Dialog -->
    <AdminDeleteDialog
      :open="!!templateToDelete"
      title="Delete eCard Template"
      description="This template will be permanently removed. This action cannot be undone."
      @update:open="(v) => !v && (templateToDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>
