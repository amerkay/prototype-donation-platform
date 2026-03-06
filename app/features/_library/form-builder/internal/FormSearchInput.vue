<script setup lang="ts">
import { inject } from 'vue'
import { FORM_SEARCH_KEY } from '../composables/useFormSearch'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'

const formSearch = inject(FORM_SEARCH_KEY)!
</script>

<template>
  <div v-if="formSearch.isSearchEnabled" class="mb-4 space-y-2">
    <div class="relative">
      <Icon
        name="lucide:search"
        class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
      <Input
        v-model="formSearch.searchTerm.value"
        type="text"
        placeholder="Search fields..."
        class="pl-9 pr-9"
      />
      <button
        v-if="formSearch.searchTerm.value"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        @click="formSearch.searchTerm.value = ''"
      >
        <Icon name="lucide:x" class="size-4" />
      </button>
    </div>
    <!-- Match count -->
    <p
      v-if="formSearch.isSearchActive.value && formSearch.matchCount.value > 0"
      class="text-xs text-muted-foreground"
    >
      {{ formSearch.matchCount.value }}
      {{ formSearch.matchCount.value === 1 ? 'match' : 'matches' }} found
    </p>
    <!-- No results -->
    <Empty
      v-if="formSearch.isSearchActive.value && formSearch.matchCount.value === 0"
      class="border border-dashed py-6"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="lucide:search-x" />
        </EmptyMedia>
        <EmptyTitle>
          No fields match "<span class="font-medium">{{ formSearch.searchTerm.value }}</span
          >"
        </EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <button
          type="button"
          class="text-xs text-primary hover:underline"
          @click="formSearch.searchTerm.value = ''"
        >
          Clear search
        </button>
      </EmptyContent>
    </Empty>
  </div>
</template>
