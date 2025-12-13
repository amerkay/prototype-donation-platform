<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
const sendECard = ref(props.modelValue?.eCard?.send ?? false)
const recipientFirstName = ref(props.modelValue?.eCard?.recipient?.firstName ?? '')
const recipientLastName = ref(props.modelValue?.eCard?.recipient?.lastName ?? '')
const recipientEmail = ref(props.modelValue?.eCard?.recipient?.email ?? '')

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

// Watch for changes and emit
watch(
  [
    tributeType,
    honoreeFirstName,
    honoreeLastName,
    relationship,
    sendECard,
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
          firstName: recipientFirstName.value,
          lastName: recipientLastName.value,
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
        <Label :for="`relationship`" class="text-sm">Relationship</Label>
        <Input
          :id="`relationship`"
          v-model="relationship"
          placeholder="e.g., Mother, Friend, Teacher"
          autocomplete="off"
        />
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
        <div class="grid grid-cols-2 gap-3">
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
