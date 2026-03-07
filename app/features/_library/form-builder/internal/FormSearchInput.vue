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
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { FORM_SEARCH_KEY } from '../composables/useFormSearch'
import { activateHashTarget } from '../composables/useHashTarget'

const props = defineProps<{
  /**
   * When true, results float in a portal (escaping overflow containers).
   * Input stays inline; results render via PopoverContent.
   */
  floating?: boolean
}>()

const emit = defineEmits<{ select: [path: string] }>()

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
  emit('select', path)
}

function onInput(e: Event) {
  searchTerm.value = (e.target as HTMLInputElement).value
}
</script>

<template>
  <div v-if="formSearch.isSearchEnabled" :class="!props.floating && 'mb-4'">
    <Command
      :class="[!props.floating && 'rounded-lg border', { 'shadow-md': hasSearch && !floating }]"
    >
      <!-- Floating mode: input inline, results in a portal via PopoverContent -->
      <template v-if="floating">
        <PopoverRoot :open="hasSearch">
          <PopoverAnchor as-child>
            <CommandInput placeholder="Search fields..." @input="onInput" />
          </PopoverAnchor>
          <PopoverPortal>
            <PopoverContent
              side="bottom"
              align="start"
              :side-offset="4"
              class="z-50 w-md lg:w-xl p-0 rounded-lg border shadow-md bg-popover text-popover-foreground outline-hidden"
              @open-auto-focus.prevent
              @interact-outside="searchTerm = ''"
            >
              <CommandList class="max-h-64">
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
                    <span
                      v-if="entry.breadcrumb"
                      class="ml-auto text-xs text-muted-foreground truncate"
                    >
                      {{ entry.breadcrumb }}
                    </span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </template>

      <!-- Inline mode: standard rendering -->
      <template v-else>
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
      </template>
    </Command>
  </div>
</template>
