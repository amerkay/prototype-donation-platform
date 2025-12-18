<script setup lang="ts">
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
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  dismissible: false,
  description: undefined
})

const emit = defineEmits<Emits>()

const isDesktop = useMediaQuery('(min-width: 768px)')

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <!-- Desktop Dialog -->
  <Dialog v-if="isDesktop" :open="open" @update:open="handleOpenChange">
    <DialogScrollContent class="sm:max-w-md">
      <DialogHeader v-if="$slots.header">
        <DialogTitle><slot name="header" /></DialogTitle>
        <DialogDescription v-if="props.description">{{ props.description }}</DialogDescription>
      </DialogHeader>
      <slot name="content" />
      <DialogFooter v-if="$slots.footer">
        <slot name="footer" />
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>

  <!-- Mobile Drawer -->
  <Drawer v-else :open="open" :dismissible="dismissible" @update:open="handleOpenChange">
    <DrawerContent class="flex flex-col">
      <DrawerHeader v-if="$slots.header" class="shrink-0">
        <DrawerTitle><slot name="header" /></DrawerTitle>
        <DrawerDescription v-if="props.description">{{ props.description }}</DrawerDescription>
      </DrawerHeader>
      <div v-if="$slots.content" class="px-4 overflow-y-auto flex-1">
        <slot name="content" />
      </div>
      <DrawerFooter v-if="$slots.footer" class="shrink-0">
        <slot name="footer" />
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
