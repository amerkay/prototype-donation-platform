<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Search, Smile, X } from 'lucide-vue-next'

/**
 * Emojibase compact format:
 * - unicode: rendered character(s)
 * - hexcode: codepoint(s) in hex separated by '-'
 * - label: localized description (good for accessibility)
 * - group: numeric group (0..9 where 2 is "component")
 * - shortcodes/tags: searchable keywords
 * - skins: array of CompactEmoji (skin tone variations)
 *
 * Docs: https://emojibase.dev/docs/datasets/ and CompactEmoji interface.
 */
interface CompactEmoji {
  unicode: string
  hexcode: string
  label: string
  group?: number
  order?: number
  shortcodes?: string[]
  tags?: string[]
  emoticon?: string | string[]
  skins?: CompactEmoji[]
}

interface Props {
  disabled?: boolean
  class?: string
  selectedValue?: string
  open?: boolean
  hideTrigger?: boolean
}

interface Emits {
  (e: 'select', emoji: string): void
  (e: 'update:open', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Emojibase group ids (from emojibase-data/meta/groups.json):
 * 0 smileys-emotion
 * 1 people-body
 * 2 component (exclude)
 * 3 animals-nature
 * 4 food-drink
 * 5 travel-places
 * 6 activities
 * 7 objects
 * 8 symbols
 * 9 flags
 */
const CATEGORIES = [
  {
    group: 0,
    key: 'Smileys & Emotion',
    icon: '😀',
    label: 'Smileys',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    group: 1,
    key: 'People & Body',
    icon: '👋',
    label: 'People',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    group: 3,
    key: 'Animals & Nature',
    icon: '🐶',
    label: 'Nature',
    color: 'bg-green-100 text-green-800'
  },
  { group: 4, key: 'Food & Drink', icon: '🍎', label: 'Food', color: 'bg-red-100 text-red-800' },
  {
    group: 5,
    key: 'Travel & Places',
    icon: '🚗',
    label: 'Travel',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    group: 6,
    key: 'Activities',
    icon: '⚽',
    label: 'Sports',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    group: 7,
    key: 'Objects',
    icon: '💡',
    label: 'Objects',
    color: 'bg-purple-100 text-purple-800'
  },
  { group: 8, key: 'Symbols', icon: '❤️', label: 'Symbols', color: 'bg-red-100 text-red-800' },
  { group: 9, key: 'Flags', icon: '🏁', label: 'Flags', color: 'bg-indigo-100 text-indigo-800' }
] as const

const SKIN_TONES = [
  { key: null, emoji: '✋', label: 'Default', color: 'bg-gray-100' },
  { key: '1F3FB', emoji: '🏻', label: 'Light', color: 'bg-secondary' },
  { key: '1F3FC', emoji: '🏼', label: 'Medium-Light', color: 'bg-orange-100' },
  { key: '1F3FD', emoji: '🏽', label: 'Medium', color: 'bg-amber-100' },
  { key: '1F3FE', emoji: '🏾', label: 'Medium-Dark', color: 'bg-brown-100' },
  { key: '1F3FF', emoji: '🏿', label: 'Dark', color: 'bg-gray-800' }
] as const

const open = computed({
  get: () => props.open ?? false,
  set: (value) => emit('update:open', value)
})
const search = ref('')
const selectedSkinTone = ref<string | null>(null)
const hoveredCategory = ref<string | null>(null)
const searchRef = ref<HTMLInputElement>()

// ---- Lazy-loaded emojibase dataset (compact) ----
const emojiDataset = ref<CompactEmoji[] | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)

async function loadEmojiDatasetIfNeeded() {
  if (emojiDataset.value || loading.value) return
  loading.value = true
  loadError.value = null

  try {
    // This will be split into a separate chunk by Vite (lazy-loaded on first open).
    // Requires TS config `resolveJsonModule: true` (usually already enabled in Vite+Vue TS templates).
    const mod = await import('emojibase-data/en/compact.json')
    // JSON default export:
    emojiDataset.value = (mod as unknown as { default: CompactEmoji[] }).default
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load emoji dataset'
    emojiDataset.value = []
  } finally {
    loading.value = false
  }
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await loadEmojiDatasetIfNeeded()
  await nextTick()
  searchRef.value?.focus()
})

// ---- Helpers ----
function isEmojiSupported(emoji: CompactEmoji) {
  // Exclude non-grouped + components group (2)
  if (emoji.group == null) return false
  if (emoji.group === 2) return false
  if (!emoji.unicode) return false
  return true
}

function pickSkinVariant(base: CompactEmoji, toneHex: string | null): CompactEmoji {
  if (!toneHex) return base
  const skins = base.skins
  if (!skins?.length) return base

  // Find a skin variant whose hexcode includes the tone codepoint (e.g. "1F3FB")
  const match = skins.find((s) => typeof s.hexcode === 'string' && s.hexcode.includes(toneHex))
  return match ?? base
}

const emojis = computed(() => {
  const data = emojiDataset.value
  if (!data) return []
  return data.filter(isEmojiSupported)
})

const categorizedEmojis = computed(() => {
  const categorized: Record<string, CompactEmoji[]> = {}
  for (const cat of CATEGORIES) categorized[cat.key] = []

  for (const emoji of emojis.value) {
    const cat = CATEGORIES.find((c) => c.group === emoji.group)
    if (cat) categorized[cat.key]?.push(emoji)
  }

  // Sort within each category by order when available (keeps nice "keyboard-like" order)
  for (const cat of CATEGORIES) {
    categorized[cat.key]?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  return categorized
})

const filteredEmojis = computed(() => {
  if (!search.value) return categorizedEmojis.value

  const q = search.value.trim().toLowerCase()
  const filtered: Record<string, CompactEmoji[]> = {}

  Object.entries(categorizedEmojis.value).forEach(([category, emojiList]) => {
    const matching = emojiList.filter((emoji) => {
      const label = (emoji.label || '').toLowerCase()
      const shortcodes = (emoji.shortcodes || []).map((s) => s.toLowerCase())
      const tags = (emoji.tags || []).map((t) => t.toLowerCase())

      // match label, any shortcode, or any tag
      if (label.includes(q)) return true
      if (shortcodes.some((s) => s.includes(q))) return true
      if (tags.some((t) => t.includes(q))) return true
      return false
    })

    if (matching.length) filtered[category] = matching
  })

  return filtered
})

function handleSelect(emoji: CompactEmoji) {
  const selected = pickSkinVariant(emoji, selectedSkinTone.value)
  emit('select', selected.unicode)
  open.value = false
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        :class="cn('h-10', hideTrigger && 'sr-only absolute')"
        :aria-label="selectedValue ? 'Change emoji' : 'Select an emoji'"
        :disabled="disabled"
        :tabindex="hideTrigger ? -1 : 0"
      >
        <Smile class="h-5 w-5" />
        <span v-if="!selectedValue" class="ml-2">Select an emoji</span>
      </Button>
    </PopoverTrigger>

    <PopoverContent
      side="top"
      :class="cn('w-80 p-0 z-50 overflow-hidden', props.class)"
      align="start"
      @keydown="handleKeyDown"
    >
      <div class="sticky top-0 bg-background border-b z-10">
        <div class="p-2 sm:p-3">
          <div class="relative">
            <Search
              class="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
            />
            <Input
              ref="searchRef"
              v-model="search"
              type="text"
              placeholder="Search emoji..."
              class="pl-7 sm:pl-10 pr-6 sm:pr-8 text-xs sm:text-sm"
              aria-label="Search emoji"
              :disabled="loading && !emojiDataset"
            />
            <Button
              v-if="search"
              variant="ghost"
              size="sm"
              class="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 p-0"
              @click="search = ''"
            >
              <X class="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div class="px-2 sm:px-3 pb-2">
          <div class="flex gap-1">
            <Button
              v-for="tone in SKIN_TONES"
              :key="tone.key || 'default'"
              :variant="selectedSkinTone === tone.key ? 'default' : 'ghost'"
              size="sm"
              :class="
                cn(
                  'h-6 w-6 sm:h-7 sm:w-7 p-0 text-xs sm:text-sm rounded-full transition-all',
                  selectedSkinTone === tone.key && 'ring-2 ring-primary'
                )
              "
              :title="tone.label"
              @click="selectedSkinTone = tone.key"
            >
              {{ tone.emoji }}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea class="h-64 sm:h-80">
        <div class="p-1 sm:p-2">
          <!-- Loading / error states -->
          <div
            v-if="loading && !emojiDataset"
            class="text-center text-muted-foreground py-8 sm:py-12"
          >
            <p class="text-xs sm:text-sm">Loading emojis…</p>
          </div>

          <div v-else-if="loadError" class="text-center text-muted-foreground py-8 sm:py-12">
            <p class="text-xs sm:text-sm">Could not load emojis</p>
            <p class="text-xs mt-1 opacity-80">{{ loadError }}</p>
          </div>

          <!-- Emoji grid -->
          <template v-else>
            <div
              v-for="[category, emojiList] in Object.entries(filteredEmojis)"
              :key="category"
              class="mb-4 sm:mb-6"
            >
              <template
                v-if="CATEGORIES.find((cat) => cat.key === category) && emojiList.length > 0"
              >
                <div
                  :id="`category-${category}`"
                  :class="
                    cn(
                      'flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 px-1 sm:px-2 py-1 rounded-lg transition-colors',
                      hoveredCategory === category && 'bg-muted/50'
                    )
                  "
                  @mouseenter="hoveredCategory = category"
                  @mouseleave="hoveredCategory = null"
                >
                  <span class="text-sm sm:text-lg">
                    {{ CATEGORIES.find((cat) => cat.key === category)!.icon }}
                  </span>
                  <span class="font-medium text-xs sm:text-sm text-muted-foreground">
                    {{ CATEGORIES.find((cat) => cat.key === category)!.label }}
                  </span>
                  <span class="text-xs text-muted-foreground ml-auto">
                    {{ emojiList.length }}
                  </span>
                </div>

                <div class="grid grid-cols-8 sm:grid-cols-9 gap-0.5 sm:gap-1">
                  <Button
                    v-for="emoji in emojiList"
                    :key="emoji.hexcode"
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="flex items-center justify-center rounded-lg hover:bg-accent focus:bg-accent focus:outline-none text-sm sm:text-lg h-7 w-7 sm:h-8 sm:w-8 transition-colors"
                    :title="emoji.label"
                    :aria-label="emoji.label"
                    @click="handleSelect(emoji)"
                  >
                    {{ pickSkinVariant(emoji, selectedSkinTone).unicode }}
                  </Button>
                </div>
              </template>
            </div>

            <div
              v-if="Object.keys(filteredEmojis).length === 0"
              class="text-center text-muted-foreground py-8 sm:py-12"
            >
              <Smile class="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p class="text-xs sm:text-sm">No emoji found</p>
              <p class="text-xs mt-1">Try a different search term</p>
            </div>
          </template>
        </div>
      </ScrollArea>
    </PopoverContent>
  </Popover>
</template>
