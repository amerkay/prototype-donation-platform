<script setup lang="ts">
import { P2P_PRESET_REGISTRY, type P2PCampaignPreset } from '~/features/campaigns/admin/templates'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [preset: P2PCampaignPreset]
}>()

const handlePresetSelect = (preset: P2PCampaignPreset) => {
  emit('select', preset)
  emit('update:open', false)
}
</script>

<template>
  <BaseDialogOrDrawer
    :open="props.open"
    max-width="md:min-w-xl lg:min-w-3xl"
    dismissible
    description="Choose a preset to create a new peer-to-peer fundraising campaign"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <span>Choose a P2P Campaign Preset</span>
    </template>

    <template #content>
      <div class="py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card
            v-for="preset in P2P_PRESET_REGISTRY"
            :key="preset.metadata.id"
            :class="
              cn(
                'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                'hover:scale-[1.02]'
              )
            "
            @click="handlePresetSelect(preset)"
          >
            <CardHeader>
              <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-primary/10 text-primary">
                  <component :is="preset.metadata.icon" class="w-6 h-6" />
                </div>
                <div class="flex-1 space-y-1">
                  <CardTitle class="text-base">{{ preset.metadata.name }}</CardTitle>
                  <CardDescription class="text-xs">
                    {{ preset.metadata.description }}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>
