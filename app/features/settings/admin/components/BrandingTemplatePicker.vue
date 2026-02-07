<script setup lang="ts">
import { computed, ref } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Info, Palette } from 'lucide-vue-next'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import {
  BRANDING_TEMPLATES,
  findMatchingTemplate,
  type BrandingTemplate
} from '~/features/settings/admin/utils/branding-templates'

const { formValues, setFieldValue } = useFormBuilderContext()
const open = ref(false)

const currentColors = computed(
  () =>
    (formValues.value?.branding as Record<string, unknown>)?.colors as
      | Record<string, string>
      | undefined
)

const primaryColor = computed(() => currentColors.value?.primaryColor ?? '')
const secondaryColor = computed(() => currentColors.value?.secondaryColor ?? '')

const activeTemplate = computed(() =>
  findMatchingTemplate(primaryColor.value, secondaryColor.value)
)

function selectTemplate(template: BrandingTemplate) {
  setFieldValue('branding.colors.primaryColor', template.primaryColor)
  setFieldValue('branding.colors.secondaryColor', template.secondaryColor)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        :class="
          cn(
            'flex items-center gap-2.5 w-full rounded-md border border-input bg-background px-3 py-2.5',
            'text-sm hover:bg-accent/50 transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )
        "
      >
        <div class="flex items-center gap-1.5">
          <span
            class="size-3.5 rounded-full border border-black/10 shrink-0"
            :style="{ backgroundColor: primaryColor }"
          />
          <span
            class="size-3.5 rounded-full border border-black/10 shrink-0"
            :style="{ backgroundColor: secondaryColor }"
          />
        </div>
        <span class="flex-1 text-left font-medium">
          {{ activeTemplate?.name ?? 'Custom' }}
        </span>
        <ChevronDown class="size-4 text-muted-foreground shrink-0" />
      </button>
    </PopoverTrigger>

    <PopoverContent align="start" :side-offset="4" class="w-72 p-1 max-h-80 overflow-y-auto">
      <button
        v-for="template in BRANDING_TEMPLATES"
        :key="template.id"
        type="button"
        :class="
          cn(
            'flex items-center gap-2.5 w-full rounded-sm px-2.5 py-2 text-sm cursor-pointer',
            'hover:bg-accent/50 transition-colors',
            activeTemplate?.id === template.id && 'bg-accent/30'
          )
        "
        @click="selectTemplate(template)"
      >
        <div class="size-4 flex items-center justify-center shrink-0">
          <Check v-if="activeTemplate?.id === template.id" class="size-3.5 text-primary" />
        </div>
        <div class="flex items-center gap-1">
          <span
            class="size-3 rounded-full border border-black/10"
            :style="{ backgroundColor: template.primaryColor }"
          />
          <span
            class="size-3 rounded-full border border-black/10"
            :style="{ backgroundColor: template.secondaryColor }"
          />
        </div>
        <span class="truncate text-left">{{ template.name }}</span>
      </button>

      <Separator class="my-1" />

      <div
        :class="
          cn(
            'flex items-center gap-2.5 w-full rounded-sm px-2.5 py-2 text-sm',
            !activeTemplate && 'bg-accent/30'
          )
        "
      >
        <div class="size-4 flex items-center justify-center shrink-0">
          <Check v-if="!activeTemplate" class="size-3.5 text-primary" />
        </div>
        <Palette class="size-3.5 text-muted-foreground" />
        <span class="text-muted-foreground">Custom</span>
        <span class="text-xs text-muted-foreground/60 ml-auto flex items-center gap-1">
          Pick your own
          <Tooltip :delay-duration="200">
            <TooltipTrigger as-child>
              <Info class="size-3 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" class="max-w-52 text-xs">
              Use the color pickers below to set each color manually. Any change to a color switches
              to Custom automatically.
            </TooltipContent>
          </Tooltip>
        </span>
      </div>
    </PopoverContent>
  </Popover>
</template>
