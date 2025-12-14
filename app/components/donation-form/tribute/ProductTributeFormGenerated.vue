<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FormRenderer from '@/components/form-builder/FormRenderer.vue'
import { createTributeFormSection } from '@/lib/form-builder/sections/tribute-form'
import type { TributeData, FormConfig } from '@/lib/common/types'

interface Props {
  modelValue?: TributeData
  config: FormConfig['features']['tribute']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: TributeData]
  submit: []
}>()

// Create form section from config
const formSection = computed(() => createTributeFormSection(props.config))

// Convert TributeData to flat form values
const formValues = ref({
  type: props.modelValue?.type ?? 'none',
  honoreeFirstName: props.modelValue?.honoree?.firstName ?? '',
  honoreeLastName: props.modelValue?.honoree?.lastName ?? '',
  relationship: props.modelValue?.honoree?.relationship ?? '',
  sendECard: props.modelValue?.eCard?.send ?? false,
  sameAsHonoree: detectSameAsHonoree(),
  recipientFirstName: props.modelValue?.eCard?.recipient?.firstName ?? '',
  recipientLastName: props.modelValue?.eCard?.recipient?.lastName ?? '',
  recipientEmail: props.modelValue?.eCard?.recipient?.email ?? ''
})

// Detect if recipient is same as honoree (when editing)
function detectSameAsHonoree() {
  if (props.modelValue?.type === 'gift' && props.modelValue?.eCard?.send) {
    const recipient = props.modelValue.eCard.recipient
    const honoree = props.modelValue.honoree
    return !!(
      recipient?.firstName === honoree?.firstName &&
      recipient?.lastName === honoree?.lastName &&
      recipient?.firstName &&
      recipient?.lastName
    )
  }
  return false
}

// Watch form values and convert back to TributeData
watch(
  formValues,
  (current) => {
    const data: TributeData = {
      type: current.type ?? 'none'
    }

    if (current.type !== 'none') {
      data.honoree = {
        firstName: current.honoreeFirstName ?? '',
        lastName: current.honoreeLastName ?? '',
        relationship: current.relationship ?? ''
      }

      data.eCard = {
        send: current.sendECard ?? false
      }

      if (current.sendECard) {
        // Use honoree name if sameAsHonoree is true
        data.eCard.recipient = {
          firstName: current.sameAsHonoree ? current.honoreeFirstName : current.recipientFirstName,
          lastName: current.sameAsHonoree ? current.honoreeLastName : current.recipientLastName,
          email: current.recipientEmail ?? ''
        }
      }
    }

    emit('update:modelValue', data)
  },
  { deep: true }
)

// Handle submit
function handleSubmit() {
  emit('submit')
}

// Expose form renderer for validation
const formRenderer = ref<InstanceType<typeof FormRenderer>>()

defineExpose({
  isValid: computed(() => formRenderer.value?.isValid ?? false)
})
</script>

<template>
  <FormRenderer
    ref="formRenderer"
    v-model="formValues"
    :section="formSection"
    @submit="handleSubmit"
  />
</template>
