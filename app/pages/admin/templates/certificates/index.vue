<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import CertificateTemplateCard from '~/features/templates/admin/components/CertificateTemplateCard.vue'
import AdminCardGrid from '~/features/_admin/components/AdminCardGrid.vue'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { templates, stats, createTemplate, duplicateTemplate, deleteTemplate } =
  useCertificateTemplates()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Certificates' }
]

function handleNew() {
  const id = createTemplate()
  navigateTo(`/admin/templates/certificates/${id}`)
}

function handleDuplicate(id: string) {
  const newId = duplicateTemplate(id)
  if (newId) navigateTo(`/admin/templates/certificates/${newId}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Certificate Templates" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="handleNew">
            <Plus class="w-4 h-4 mr-2" />
            New Certificate
          </Button>
        </template>
      </AdminPageHeader>

      <AdminCardGrid>
        <CertificateTemplateCard
          v-for="template in templates"
          :key="template.id"
          :template="template"
          @duplicate="handleDuplicate(template.id)"
          @delete="deleteTemplate(template.id)"
        />
      </AdminCardGrid>

      <div v-if="!templates.length" class="text-center py-12 text-muted-foreground">
        <p class="text-lg font-medium">No certificate templates yet</p>
        <p class="text-sm mt-1">Create your first certificate template to get started.</p>
      </div>
    </div>
  </div>
</template>
