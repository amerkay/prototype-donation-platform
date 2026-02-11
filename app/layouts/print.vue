<script setup lang="ts">
/**
 * Minimal print layout for PDF generation.
 *
 * - Zero margins/padding for exact page sizing
 * - Uses CSS custom properties for dynamic page dimensions
 * - No navigation or UI chrome
 */
</script>

<template>
  <div class="print-page">
    <slot />
  </div>
</template>

<style>
@page {
  size: var(--page-width, 210mm) var(--page-height, 297mm);
  margin: 0;
}

html,
body {
  margin: 0;
  padding: 0;
  background: white;
}

.print-page {
  width: var(--page-width, 210mm);
  height: var(--page-height, 297mm);
  overflow: hidden;
}
</style>
