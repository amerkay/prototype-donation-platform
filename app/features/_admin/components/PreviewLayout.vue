<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowLeft, Smartphone, Tablet, Monitor } from 'lucide-vue-next'

type DeviceMode = 'mobile' | 'tablet' | 'desktop'

const deviceMode = ref<DeviceMode>('mobile')

const deviceSizes = {
  mobile: 'max-w-[375px]',
  tablet: 'max-w-[768px]',
  desktop: 'max-w-[1024px]'
}

const props = withDefaults(
  defineProps<{
    backUrl?: string
    backLabel?: string
  }>(),
  {
    backUrl: undefined,
    backLabel: 'Back to Admin'
  }
)

const goBack = () => {
  if (props.backUrl) {
    navigateTo(props.backUrl)
  } else {
    window.close()
  }
}
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- Preview Banner -->
    <div class="sticky top-0 z-50 bg-background border-b">
      <div class="px-4 py-2 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="goBack">
            <ArrowLeft class="w-4 h-4 mr-1" />
            {{ backLabel }}
          </Button>
        </div>

        <!-- Device Mode Switcher -->
        <div class="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-background shadow-sm': deviceMode === 'mobile' }"
            @click="deviceMode = 'mobile'"
          >
            <Smartphone class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-background shadow-sm': deviceMode === 'tablet' }"
            @click="deviceMode = 'tablet'"
          >
            <Tablet class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-background shadow-sm': deviceMode === 'desktop' }"
            @click="deviceMode = 'desktop'"
          >
            <Monitor class="w-4 h-4" />
          </Button>
        </div>

        <div class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">Preview Mode</div>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="py-6 px-4 flex justify-center">
      <div :class="[deviceSizes[deviceMode], 'w-full transition-all duration-300 ease-in-out']">
        <slot />
      </div>
    </div>
  </div>
</template>
