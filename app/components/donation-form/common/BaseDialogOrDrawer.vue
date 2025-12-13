<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import {
  Dialog,
  DialogContent,
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
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer'

interface Props {
  open?: boolean
  dismissible?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  dismissible: false
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
    <DialogContent class="sm:max-w-md">
      <DialogHeader v-if="$slots.header">
        <slot name="header" />
      </DialogHeader>
      <slot name="content" />
      <DialogFooter v-if="$slots.footer">
        <slot name="footer" />
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Mobile Drawer -->
  <Drawer v-else :open="open" :dismissible="dismissible" @update:open="handleOpenChange">
    <DrawerContent>
      <DrawerHeader v-if="$slots.header">
        <slot name="header" />
      </DrawerHeader>
      <div v-if="$slots.content" class="px-4">
        <slot name="content" />
      </div>
      <DrawerFooter v-if="$slots.footer">
        <slot name="footer" />
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
