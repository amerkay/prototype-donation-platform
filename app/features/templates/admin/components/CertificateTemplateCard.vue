<script setup lang="ts">
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import CertificatePreviewThumbnail from './CertificatePreviewThumbnail.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Copy, Pencil } from 'lucide-vue-next'
import { formatDistance } from 'date-fns'

const props = defineProps<{
  template: CertificateTemplate
}>()

defineEmits<{
  duplicate: []
  delete: []
}>()

const { getDeleteProtection } = useCertificateTemplates()

const deleteProtection = computed(() => getDeleteProtection(props.template.id))
const formattedDate = computed(() =>
  formatDistance(new Date(props.template.updatedAt), new Date(), { addSuffix: true })
)
</script>

<template>
  <Card class="transition-all hover:shadow-md overflow-hidden pt-0">
    <NuxtLink :to="`/admin/templates/certificates/${template.id}`" class="block">
      <div class="bg-muted/30 border-b p-3">
        <CertificatePreviewThumbnail :template="template" />
      </div>
    </NuxtLink>

    <CardHeader class="pb-2">
      <NuxtLink :to="`/admin/templates/certificates/${template.id}`" class="hover:underline">
        <CardTitle class="text-base truncate">{{ template.name }}</CardTitle>
      </NuxtLink>
      <div class="flex items-center gap-1.5">
        <StatusBadge :status="template.status ?? 'active'" class="text-[10px] px-1.5 py-0" />
        <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar class="w-3 h-3" />
          Updated {{ formattedDate }}
        </p>
      </div>
    </CardHeader>

    <CardContent class="flex gap-2">
      <Button variant="default" size="sm" class="flex-1" as-child>
        <NuxtLink :to="`/admin/templates/certificates/${template.id}`">
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
    </CardContent>
  </Card>
</template>
