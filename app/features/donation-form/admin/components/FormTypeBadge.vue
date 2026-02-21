<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const props = defineProps<{
  modelValue?: string
}>()

const label = computed(() => (props.modelValue === 'registration' ? 'Registration' : 'Donation'))
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium">Form Type</span>
    <Tooltip :delay-duration="100">
      <TooltipTrigger as-child>
        <Badge variant="outline" class="cursor-default">
          {{ label }}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" :collision-padding="8" class="w-64 text-xs">
        <p class="font-bold">Form type is set at creation and cannot be changed.</p>
        <p class="mt-1 opacity-80">
          Donation forms include Gift Aid, Cover Costs, Tribute, Impact Boost, and Donation Amounts.
          Registration forms hide these donation-specific features.
        </p>
      </TooltipContent>
    </Tooltip>
  </div>
</template>
