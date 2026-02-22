<script setup lang="ts">
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import CertificatePreviewThumbnail from './CertificatePreviewThumbnail.vue'
import AdminEntityCard from '~/features/_admin/components/AdminEntityCard.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Copy, Pencil } from 'lucide-vue-next'

const props = defineProps<{
  template: CertificateTemplate
}>()

defineEmits<{
  duplicate: []
  delete: []
}>()

const { getDeleteProtection } = useCertificateTemplates()
const deleteProtection = computed(() => getDeleteProtection(props.template.id))
const href = computed(() => `/admin/templates/certificates/${props.template.id}`)
</script>

<template>
  <AdminEntityCard :title="template.name" :href="href" :updated-at="template.updatedAt">
    <template #image>
      <div class="p-3">
        <CertificatePreviewThumbnail :template="template" />
      </div>
    </template>

    <template #badges>
      <StatusBadge :status="template.status ?? 'active'" class="text-[10px] px-1.5 py-0" />
    </template>

    <template #actions>
      <div class="flex gap-2">
        <Button variant="default" size="sm" class="flex-1" as-child>
          <NuxtLink :to="href">
            <Pencil class="w-3.5 h-3.5 mr-1.5" />
            Edit
          </NuxtLink>
        </Button>
        <Button variant="outline" size="sm" @click="$emit('duplicate')">
          <Copy class="w-3.5 h-3.5" />
        </Button>
        <AdminDeleteButton
          :entity-name="template.name"
          entity-type="Certificate Template"
          :disabled="!deleteProtection.canDelete"
          :disabled-reason="deleteProtection.reason"
          @deleted="$emit('delete')"
        />
      </div>
    </template>
  </AdminEntityCard>
</template>
