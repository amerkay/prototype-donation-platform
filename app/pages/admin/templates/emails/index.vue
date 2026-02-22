<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import EmailTemplateCard from '~/features/templates/admin/components/EmailTemplateCard.vue'
import AdminCardGrid from '~/features/_admin/components/AdminCardGrid.vue'
import FilterTabs from '~/components/FilterTabs.vue'
import { useEmailTemplates } from '~/features/templates/admin/composables/useEmailTemplates'
import type { EmailTemplateCategory } from '~/features/templates/admin/types'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'

definePageMeta({ layout: 'admin' })

const { templates, stats, categoryCounts } = useEmailTemplates()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Emails' }
]

const filters = [
  { value: 'ecard', label: 'eCards' },
  { value: 'donor', label: 'Donor' }
]

const activeFilter = ref<EmailTemplateCategory>('donor')

const filteredTemplates = computed(() =>
  templates.value.filter((t) => EMAIL_TEMPLATE_META[t.type]?.category === activeFilter.value)
)
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Email Templates" :stats="stats" />

      <div class="mb-4">
        <FilterTabs v-model="activeFilter" :filters="filters" :counts="categoryCounts" />
      </div>

      <AdminCardGrid>
        <EmailTemplateCard
          v-for="template in filteredTemplates"
          :key="template.id"
          :template="template"
        />
      </AdminCardGrid>
    </div>
  </div>
</template>
