<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { TributeData } from '@/lib/common/types'

interface Props {
  modelValue?: TributeData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: TributeData]
}>()

// Local state
const tributeType = ref<'none' | 'gift' | 'memorial'>(props.modelValue?.type ?? 'none')
const honoreeFirstName = ref(props.modelValue?.honoree?.firstName ?? '')
const honoreeLastName = ref(props.modelValue?.honoree?.lastName ?? '')
const relationship = ref(props.modelValue?.honoree?.relationship ?? '')
const relationshipOpen = ref(false)
const sendECard = ref(props.modelValue?.eCard?.send ?? false)
const sameAsHonoree = ref(false)
const recipientFirstName = ref(props.modelValue?.eCard?.recipient?.firstName ?? '')
const recipientLastName = ref(props.modelValue?.eCard?.recipient?.lastName ?? '')
const recipientEmail = ref(props.modelValue?.eCard?.recipient?.email ?? '')

// Relationship options
const relationships = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'parent', label: 'Parent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'partner', label: 'Partner' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'other', label: 'Other' }
]

// Refs for scroll targets
const honoreeFormRef = ref<HTMLElement | null>(null)
const eCardFormRef = ref<HTMLElement | null>(null)
const eCardRecipientFormRef = ref<HTMLElement | null>(null)

// Computed
const showHonoreeForm = computed(() => tributeType.value !== 'none')
const showECardOption = computed(() => tributeType.value !== 'none')
const showECardForm = computed(() => sendECard.value && tributeType.value !== 'none')

const honoreeLabel = computed(() => {
  if (tributeType.value === 'gift') return 'Gift to'
  if (tributeType.value === 'memorial') return 'In Memory of'
  return 'Honoree'
})

const honoreeFullName = computed(() => {
  return [honoreeFirstName.value, honoreeLastName.value].filter(Boolean).join(' ')
})

const relationshipLabel = computed(() => {
  const selected = relationships.find((r) => r.value === relationship.value)
  return selected?.label || 'Select relationship...'
})

function selectRelationship(selectedValue: string) {
  relationship.value = selectedValue === relationship.value ? '' : selectedValue
  relationshipOpen.value = false
}

const effectiveRecipientFirstName = computed(() => {
  return sameAsHonoree.value ? honoreeFirstName.value : recipientFirstName.value
})

const effectiveRecipientLastName = computed(() => {
  return sameAsHonoree.value ? honoreeLastName.value : recipientLastName.value
})

// Watch for changes and emit
watch(
  [
    tributeType,
    honoreeFirstName,
    honoreeLastName,
    relationship,
    sendECard,
    sameAsHonoree,
    recipientFirstName,
    recipientLastName,
    recipientEmail
  ],
  () => {
    const data: TributeData = {
      type: tributeType.value
    }

    if (tributeType.value !== 'none') {
      data.honoree = {
        firstName: honoreeFirstName.value,
        lastName: honoreeLastName.value,
        relationship: relationship.value
      }

      data.eCard = {
        send: sendECard.value
      }

      if (sendECard.value) {
        data.eCard.recipient = {
          firstName: effectiveRecipientFirstName.value,
          lastName: effectiveRecipientLastName.value,
          email: recipientEmail.value
        }
      }
    }

    emit('update:modelValue', data)
  }
)

// Reset honoree fields when switching away from gift/memorial
watch(tributeType, (newType, oldType) => {
  if (newType === 'none') {
    honoreeFirstName.value = ''
    honoreeLastName.value = ''
    relationship.value = ''
    sendECard.value = false
    recipientFirstName.value = ''
    recipientLastName.value = ''
    recipientEmail.value = ''
  } else if (oldType === 'none') {
    // Scroll to eCard option (which is below the honoree form)
    nextTick(() => {
      eCardFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }
})

// Reset eCard fields when unchecking
watch(sendECard, (newValue) => {
  if (!newValue) {
    recipientFirstName.value = ''
    recipientLastName.value = ''
    recipientEmail.value = ''
  } else {
    // Scroll to newly visible eCard recipient form
    nextTick(() => {
      eCardRecipientFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-3">
      <Label class="text-base font-semibold">Make this donation a tribute?</Label>
      <RadioGroup v-model="tributeType" class="space-y-2">
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="tribute-none" value="none" />
          <Label for="tribute-none" class="font-normal cursor-pointer">No, thank you</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="tribute-gift" value="gift" />
          <Label for="tribute-gift" class="font-normal cursor-pointer">🎁 Gift to someone</Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem id="tribute-memorial" value="memorial" />
          <Label for="tribute-memorial" class="font-normal cursor-pointer"
            >🕊️ In memory of someone</Label
          >
        </div>
      </RadioGroup>
    </div>

    <!-- Honoree/Giftee Form -->
    <div v-if="showHonoreeForm" ref="honoreeFormRef" class="space-y-3 pt-2 border-t">
      <Label class="text-sm font-semibold">{{ honoreeLabel }} Details</Label>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label :for="`honoree-first-name`" class="text-sm">First Name</Label>
          <Input
            :id="`honoree-first-name`"
            v-model="honoreeFirstName"
            placeholder="First name"
            autocomplete="off"
          />
        </div>
        <div class="space-y-1.5">
          <Label :for="`honoree-last-name`" class="text-sm">Last Name</Label>
          <Input
            :id="`honoree-last-name`"
            v-model="honoreeLastName"
            placeholder="Last name"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-sm">Relationship</Label>
        <Popover v-model:open="relationshipOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="relationshipOpen"
              class="w-full justify-between font-normal"
            >
              <span :class="relationship ? '' : 'text-muted-foreground'">
                {{ relationshipLabel }}
              </span>
              <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandInput class="h-9" placeholder="Search relationship..." />
              <CommandList>
                <CommandEmpty>No relationship found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    v-for="rel in relationships"
                    :key="rel.value"
                    :value="rel.value"
                    @select="
                      (ev) => {
                        selectRelationship(ev.detail.value as string)
                      }
                    "
                  >
                    {{ rel.label }}
                    <CheckIcon
                      :class="
                        cn(
                          'ml-auto h-4 w-4',
                          relationship === rel.value ? 'opacity-100' : 'opacity-0'
                        )
                      "
                    />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- eCard Option -->
    <div v-if="showECardOption" ref="eCardFormRef" class="space-y-3 pt-2 border-t">
      <div class="flex items-center justify-between">
        <Label for="send-ecard" class="font-normal cursor-pointer"
          >📧 Send an eCard to notify them</Label
        >
        <Switch id="send-ecard" v-model="sendECard" />
      </div>

      <!-- eCard Recipient Form -->
      <div v-if="showECardForm" ref="eCardRecipientFormRef" class="space-y-3 pl-6 pt-2">
        <Label class="text-sm font-semibold">eCard Recipient</Label>

        <!-- Same as Honoree Toggle -->
        <div class="flex items-center justify-between py-2">
          <Label for="same-as-honoree" class="font-normal cursor-pointer text-sm">
            Send to {{ honoreeFullName || 'the honoree' }}
          </Label>
          <Switch id="same-as-honoree" v-model="sameAsHonoree" />
        </div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="!sameAsHonoree" class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label :for="`recipient-first-name`" class="text-sm">First Name</Label>
              <Input
                :id="`recipient-first-name`"
                v-model="recipientFirstName"
                placeholder="First name"
                autocomplete="off"
              />
            </div>
            <div class="space-y-1.5">
              <Label :for="`recipient-last-name`" class="text-sm">Last Name</Label>
              <Input
                :id="`recipient-last-name`"
                v-model="recipientLastName"
                placeholder="Last name"
                autocomplete="off"
              />
            </div>
          </div>
        </Transition>

        <div class="space-y-1.5">
          <Label :for="`recipient-email`" class="text-sm">Email Address</Label>
          <Input
            :id="`recipient-email`"
            v-model="recipientEmail"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
          />
        </div>
      </div>
    </div>
  </div>
</template>
