<script setup lang="ts"></script>

<template>
  <div class="bg-muted/30 rounded-xl border px-4 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <div class="flex w-full items-center gap-x-3 gap-y-1.5 min-w-0 flex-wrap sm:w-auto">
        <slot name="left" />
      </div>
      <div v-if="$slots.center" class="sm:ml-auto">
        <slot name="center" />
      </div>
      <div v-if="$slots.right" class="hidden shrink-0 sm:block" :class="{ 'sm:ml-auto': !$slots.center }">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
