<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { FORM_SEARCH_KEY } from '../composables/useFormSearch'
import { activateHashTarget } from '../composables/useHashTarget'

const formSearch = inject(FORM_SEARCH_KEY)!

// Track search term locally via input events (Command's filterState is internal)
const searchTerm = ref('')
const hasSearch = computed(() => searchTerm.value.trim().length > 0)

// Group entries by first parentLabel (top-level tab/section) and filter out hidden entries
const groupedEntries = computed(() => {
  const groups = new Map<string, Array<{ path: string; label: string; breadcrumb: string }>>()

  for (const entry of formSearch.searchIndex) {
    if (!formSearch.isEntryVisible(entry)) continue

    const groupName = entry.parentLabels[0] || 'Fields'
    if (!groups.has(groupName)) {
      groups.set(groupName, [])
    }

    const breadcrumb = entry.parentLabels.length > 1 ? entry.parentLabels.slice(1).join(' › ') : ''

    groups.get(groupName)!.push({
      path: entry.path,
      label: entry.label,
      breadcrumb
    })
  }

  return groups
})

function handleSelect(path: string) {
  searchTerm.value = ''
  activateHashTarget(path)
}

function onInput(e: Event) {
  searchTerm.value = (e.target as HTMLInputElement).value
}
</script>

<template>
  <div v-if="formSearch.isSearchEnabled" class="mb-4">
    <Command class="rounded-lg border" :class="{ 'shadow-md': hasSearch }">
      <CommandInput placeholder="Search fields..." @input="onInput" />
      <CommandList v-show="hasSearch" class="max-h-64">
        <CommandEmpty>No fields found.</CommandEmpty>
        <CommandGroup
          v-for="[groupName, entries] in groupedEntries"
          :key="groupName"
          :heading="groupName"
        >
          <CommandItem
            v-for="entry in entries"
            :key="entry.path"
            :value="entry.path"
            @select="handleSelect(entry.path)"
          >
            <span>{{ entry.label }}</span>
            <span v-if="entry.breadcrumb" class="ml-auto text-xs text-muted-foreground truncate">
              {{ entry.breadcrumb }}
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
</template>
