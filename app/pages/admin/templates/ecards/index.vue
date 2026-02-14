<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import EcardTemplateCard from '~/features/templates/admin/components/EcardTemplateCard.vue'
import { useEcardTemplates } from '~/features/templates/admin/composables/useEcardTemplates'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { templates, stats, createTemplate, duplicateTemplate, updateTemplateName, deleteTemplate } =
  useEcardTemplates()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'eCards' }
]

function handleNew() {
  const id = createTemplate()
  navigateTo(`/admin/templates/ecards/${id}`)
}

function handleDuplicate(id: string) {
  const newId = duplicateTemplate(id)
  if (newId) navigateTo(`/admin/templates/ecards/${newId}`)
}

function handleRename(id: string, name: string) {
  updateTemplateName(id, name)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="eCard Templates" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="handleNew">
            <Plus class="w-4 h-4 mr-2" />
            New eCard
          </Button>
        </template>
      </AdminPageHeader>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EcardTemplateCard
          v-for="template in templates"
          :key="template.id"
          :template="template"
          @rename="handleRename(template.id, $event)"
          @duplicate="handleDuplicate(template.id)"
          @delete="deleteTemplate(template.id)"
        />
      </div>

      <div v-if="!templates.length" class="text-center py-12 text-muted-foreground">
        <p class="text-lg font-medium">No eCard templates yet</p>
        <p class="text-sm mt-1">Create your first eCard template to get started.</p>
      </div>
    </div>
  </div>
</template>
