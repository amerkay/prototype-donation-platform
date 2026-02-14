<script setup lang="ts">
import { useEcardTemplateStore } from '~/features/templates/admin/stores/ecardTemplate'
import { useEcardTemplates } from '~/features/templates/admin/composables/useEcardTemplates'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import AdminStatusSelect from '~/features/_admin/components/AdminStatusSelect.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'

const store = useEcardTemplateStore()
const { getDeleteProtection } = useEcardTemplates()

const deleteProtection = computed(() =>
  store.id ? getDeleteProtection(store.id) : { canDelete: false, reason: 'Template not found' }
)

const emit = defineEmits<{
  'update:name': [value: string]
  'update:status': [value: string]
  deleted: []
}>()

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]
</script>

<template>
  <AdminResourceHeader>
    <template #left>
      <InlineEditableText
        :model-value="store.name"
        display-class="text-lg font-bold"
        class="min-w-0"
        :max-length="75"
        @update:model-value="emit('update:name', $event)"
      />
      <AdminStatusSelect
        :model-value="store.status ?? 'active'"
        :options="STATUS_OPTIONS"
        @update:model-value="emit('update:status', $event)"
      />
    </template>
    <template #right>
      <AdminDeleteButton
        :entity-name="store.name"
        entity-type="eCard Template"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="emit('deleted')"
      />
    </template>
  </AdminResourceHeader>
</template>
