<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import TermsViewModal from './TermsViewModal.vue'

const props = defineProps<{
  modelValue: boolean
  disabled?: boolean
  config: {
    label?: string
    description?: string
    mode?: string
    externalUrl?: string
    richContent?: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modalOpen = ref(false)

const hasDescription = computed(
  () =>
    props.config.description ||
    (props.config.mode === 'link' && props.config.externalUrl) ||
    (props.config.mode === 'content' && props.config.richContent)
)

function handleAccept() {
  emit('update:modelValue', true)
  modalOpen.value = false
}

function handleDecline() {
  emit('update:modelValue', false)
  modalOpen.value = false
}
</script>

<template>
  <Field orientation="horizontal">
    <Checkbox
      id="terms-acceptance"
      :model-value="!!modelValue"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event === true)"
    />
    <FieldContent>
      <FieldLabel for="terms-acceptance" class="font-normal cursor-pointer">
        {{ config.label || 'I accept the terms and conditions' }}
      </FieldLabel>
      <FieldDescription v-if="hasDescription">
        {{ config.description }}
        <a
          v-if="config.mode === 'link' && config.externalUrl"
          :href="config.externalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-0.5"
        >
          View terms
          <Icon name="lucide:external-link" class="size-3" />
        </a>
        <button
          v-else-if="config.mode === 'content' && config.richContent"
          type="button"
          class="text-primary hover:underline"
          @click="modalOpen = true"
        >
          View terms
        </button>
      </FieldDescription>
    </FieldContent>
  </Field>

  <TermsViewModal
    v-if="config.mode === 'content' && config.richContent"
    :open="modalOpen"
    :rich-content="config.richContent"
    @update:open="modalOpen = $event"
    @accept="handleAccept"
    @decline="handleDecline"
  />
</template>
