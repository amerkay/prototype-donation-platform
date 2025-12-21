<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

const items = [
  'Schedule perm',
  'Rewind VHS tapes',
  'Make change for the arcade',
  'Get disposable camera developed',
  'Learn C++',
  'Return Nintendo Power Glove',
  'Pickup new mix-tape from Beth',
  'Implement drag handles'
]

const [listRef, listItems] = useDragAndDrop(items, {
  dragHandle: '.drag-handle'
})
</script>

<template>
  <div class="container mx-auto p-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-8">Drag and Drop Test</h1>

    <ul ref="listRef" class="space-y-2 bg-muted/20 rounded-lg p-4">
      <li
        v-for="item in listItems"
        :key="item"
        class="flex items-center gap-3 bg-card border rounded-lg p-3"
      >
        <span class="drag-handle cursor-grab active:cursor-grabbing">
          <Icon name="lucide:grip-vertical" class="h-5 w-5 text-muted-foreground" />
        </span>
        {{ item }}
      </li>
    </ul>
  </div>
</template>
