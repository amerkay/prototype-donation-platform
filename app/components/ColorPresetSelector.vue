<script setup lang="ts">
import { Check, ChevronDown, Palette } from 'lucide-vue-next'
import { computed } from 'vue'
import ColorSwatch from '@/components/ColorSwatch.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = withDefaults(
  defineProps<{
    modelValue?: string // 'primary' | 'secondary' | '#RRGGBB'
    primaryColor: string
    secondaryColor: string
    label?: string
    disabled?: boolean
  }>(),
  {
    modelValue: 'primary'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Derive current mode from modelValue
const currentMode = computed(() => {
  const val = props.modelValue
  if (!val || val === '' || val === 'primary') return 'primary'
  if (val === 'secondary') return 'secondary'
  return 'custom'
})

// Resolve display color for preview swatch
const displayColor = computed(() => {
  const mode = currentMode.value
  if (mode === 'primary') return props.primaryColor
  if (mode === 'secondary') return props.secondaryColor
  return props.modelValue // Custom hex color
})

// Display label for trigger button
const displayLabel = computed(() => {
  const mode = currentMode.value
  if (mode === 'primary') return 'Primary'
  if (mode === 'secondary') return 'Secondary'
  return 'Custom'
})

// Custom color value (only used when mode is custom)
const customColor = computed({
  get: () => (currentMode.value === 'custom' ? props.modelValue : '#000000'),
  set: (value: string) => emit('update:modelValue', value)
})

function selectPreset(preset: 'primary' | 'secondary') {
  emit('update:modelValue', preset)
}

function selectCustom() {
  // When switching to custom mode, initialize with current display color
  emit('update:modelValue', displayColor.value)
}
</script>

<template>
  <div class="space-y-2">
    <Label v-if="label">{{ label }}</Label>
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :disabled="disabled"
          class="w-full justify-between"
        >
          <div class="flex items-center gap-2">
            <ColorSwatch :color="displayColor" size="md" />
            <span>{{ displayLabel }}</span>
          </div>
          <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[280px] p-3">
        <div class="space-y-2">
          <!-- Primary Option -->
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors"
            :class="currentMode === 'primary' ? 'bg-muted' : ''"
            @click="selectPreset('primary')"
          >
            <ColorSwatch :color="primaryColor" size="md" />
            <span class="flex-1 text-left">Primary</span>
            <Check v-if="currentMode === 'primary'" class="h-4 w-4 text-primary" />
          </button>

          <!-- Secondary Option -->
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors"
            :class="currentMode === 'secondary' ? 'bg-muted' : ''"
            @click="selectPreset('secondary')"
          >
            <ColorSwatch :color="secondaryColor" size="md" />
            <span class="flex-1 text-left">Secondary</span>
            <Check v-if="currentMode === 'secondary'" class="h-4 w-4 text-primary" />
          </button>

          <!-- Custom Option -->
          <div class="space-y-2">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors"
              :class="currentMode === 'custom' ? 'bg-muted' : ''"
              @click="selectCustom"
            >
              <Palette class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="flex-1 text-left">Custom</span>
              <Check v-if="currentMode === 'custom'" class="h-4 w-4 text-primary" />
            </button>

            <!-- Inline Color Picker (only shown when Custom is selected) -->
            <div v-if="currentMode === 'custom'" class="flex items-center gap-2 px-3">
              <Input v-model="customColor" type="color" class="h-9 w-16 cursor-pointer" />
              <Input
                v-model="customColor"
                type="text"
                placeholder="#000000"
                class="flex-1 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
