<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer'

interface Props {
  open?: boolean
  dismissible?: boolean
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  contentStyle?: CSSProperties
}

const SIZE_CLASSES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl'
} as const

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  dismissible: true,
  description: undefined,
  size: 'sm',
  contentStyle: undefined
})

const emit = defineEmits<Emits>()

const isDesktop = useMediaQuery('(min-width: 768px)')

const Modal = computed(() => ({
  Root: isDesktop.value ? Dialog : Drawer,
  Content: isDesktop.value ? DialogScrollContent : DrawerContent,
  Header: isDesktop.value ? DialogHeader : DrawerHeader,
  Title: isDesktop.value ? DialogTitle : DrawerTitle,
  Description: isDesktop.value ? DialogDescription : DrawerDescription,
  Footer: isDesktop.value ? DialogFooter : DrawerFooter
}))

const openModel = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const rootProps = computed(() => (isDesktop.value ? {} : { dismissible: props.dismissible }))

const contentClass = computed(() => (isDesktop.value ? SIZE_CLASSES[props.size] : 'flex flex-col'))
</script>

<template>
  <component :is="Modal.Root" v-model:open="openModel" v-bind="rootProps">
    <component :is="Modal.Content" :class="contentClass" :style="props.contentStyle">
      <component :is="Modal.Header" v-if="$slots.header" :class="{ 'shrink-0': !isDesktop }">
        <component :is="Modal.Title"><slot name="header" /></component>
        <component :is="Modal.Description" v-if="props.description">
          {{ props.description }}
        </component>
      </component>

      <slot v-if="isDesktop" name="content" />
      <template v-else>
        <div v-if="$slots.content" class="px-4 overflow-y-auto flex-1">
          <slot name="content" />
        </div>
      </template>

      <component :is="Modal.Footer" v-if="$slots.footer" :class="{ 'shrink-0': !isDesktop }">
        <slot name="footer" />
      </component>
    </component>
  </component>
</template>
