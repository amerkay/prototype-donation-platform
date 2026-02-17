<script setup lang="ts">
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  onClear?: () => void
}>()

const { fieldPrefix, setFieldValue } = useFormBuilderContext()

const ADDRESS_FIELDS = [
  'address1',
  'address2',
  'city',
  'country',
  'group1.region',
  'group1.postcode'
]

function clearAddress() {
  for (const field of ADDRESS_FIELDS) {
    setFieldValue(`${fieldPrefix}.${field}`, '')
  }
  props.onClear?.()
}
</script>

<template>
  <Button variant="outline" size="sm" class="text-muted-foreground" @click="clearAddress">
    Clear address
  </Button>
</template>
