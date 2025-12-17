<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'

interface Props {
  currentStep: number
  totalSteps: number
}

const props = defineProps<Props>()

const progress = computed(() => (props.currentStep / props.totalSteps) * 100)
</script>

<template>
  <Progress :model-value="progress" class="h-2.5 w-full rounded-none rounded-tr-xl rounded-tl-xl" />
</template>
