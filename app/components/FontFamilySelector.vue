<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type ComponentPublicInstance } from 'vue'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle
} from '@/components/ui/field'
import type { FontOption } from '~/features/settings/admin/utils/fonts'
import { getBunnyFontUrls } from '~/features/settings/admin/utils/fonts'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options: FontOption[]
    disabled?: boolean
  }>(),
  {
    modelValue: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const scrollViewportRef = ref<HTMLElement | null>(null)
const visibleOptionValues = ref<string[]>([])
const optionElements = new Map<string, HTMLElement>()
let observer: IntersectionObserver | null = null

const visibleFontFamilies = computed(() => {
  const visible = new Set(visibleOptionValues.value)
  return props.options.filter((option) => visible.has(option.value)).map((option) => option.value)
})

useHead({
  link: computed(() =>
    getBunnyFontUrls(visibleFontFamilies.value).map((href) => ({
      rel: 'stylesheet',
      href
    }))
  )
})

function setOptionRef(value: string, element: Element | ComponentPublicInstance | null) {
  let htmlElement: HTMLElement | null = null
  if (element instanceof HTMLElement) {
    htmlElement = element
  } else if (element && '$el' in element && element.$el instanceof HTMLElement) {
    htmlElement = element.$el
  }
  const previous = optionElements.get(value)

  if (previous && observer) observer.unobserve(previous)
  if (!htmlElement) {
    optionElements.delete(value)
    return
  }

  optionElements.set(value, htmlElement)
  if (observer) observer.observe(htmlElement)
}

function optionId(value: string): string {
  return `font-option-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function ensureSelectedValue() {
  if (props.modelValue && props.options.some((option) => option.value === props.modelValue)) return
  const first = props.options[0]?.value
  if (first) emit('update:modelValue', first)
}

function setupObserver() {
  if (!import.meta.client) return

  observer?.disconnect()
  const root = scrollViewportRef.value
  if (!root) return

  const nextVisible = new Set<string>()

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const value = (entry.target as HTMLElement).dataset.optionValue
        if (!value) continue
        if (entry.isIntersecting) nextVisible.add(value)
        else nextVisible.delete(value)
      }
      visibleOptionValues.value = Array.from(nextVisible)
    },
    { root, threshold: 0.6 }
  )

  for (const element of optionElements.values()) observer.observe(element)
}

watch(
  () => props.options,
  async () => {
    ensureSelectedValue()
    await nextTick()
    setupObserver()
  },
  { deep: true, immediate: true }
)

watch(
  () => scrollViewportRef.value,
  async () => {
    await nextTick()
    setupObserver()
  }
)

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <RadioGroup
    :model-value="modelValue"
    :disabled="disabled"
    class="space-y-2"
    @update:model-value="emit('update:modelValue', String($event))"
  >
    <div ref="scrollViewportRef" :class="cn('rounded-md border overflow-y-auto pr-2 h-56')">
      <div class="space-y-1 p-2">
        <div
          v-for="option in options"
          :key="option.value"
          :ref="(el) => setOptionRef(option.value, el)"
          :data-option-value="option.value"
        >
          <FieldLabel :for="optionId(option.value)">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle
                  :class="cn('text-base')"
                  :style="{ fontFamily: `${option.value}, sans-serif` }"
                >
                  {{ option.label }}
                </FieldTitle>
                <FieldDescription>{{ option.value }}</FieldDescription>
              </FieldContent>
              <RadioGroupItem :id="optionId(option.value)" :value="option.value" />
            </Field>
          </FieldLabel>
        </div>
      </div>
    </div>
  </RadioGroup>
</template>
