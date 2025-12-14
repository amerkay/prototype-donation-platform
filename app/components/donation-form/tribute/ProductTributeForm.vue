<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'
import * as z from 'zod'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { TributeData, FormConfig } from '@/lib/common/types'

interface Props {
  modelValue?: TributeData
  config: FormConfig['features']['tribute']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: TributeData]
  submit: []
}>()

// Zod Schema with conditional validation
const formSchema = z
  .object({
    type: z.enum(['none', 'gift', 'memorial']),
    honoreeFirstName: z.string().optional(),
    honoreeLastName: z.string().optional(),
    relationship: z.string().optional(),
    sendECard: z.boolean(),
    recipientFirstName: z.string().optional(),
    recipientLastName: z.string().optional(),
    recipientEmail: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // Honoree validation when type is not 'none'
    if (data.type !== 'none') {
      // Honoree first name is required
      if (!data.honoreeFirstName || data.honoreeFirstName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: props.config.validation.honoreeFirstName.minLength,
          path: ['honoreeFirstName']
        })
      }
      // Honoree last name is optional - no validation
      // Relationship is optional - no validation

      // eCard recipient validation when sendECard is true
      if (data.sendECard) {
        // Note: We can't access sameAsHonoree ref here, so we check if recipient fields are empty
        // If they're empty, we assume sameAsHonoree is true and skip validation
        const hasRecipientName = data.recipientFirstName || data.recipientLastName

        if (hasRecipientName) {
          // If user started entering recipient name, require first name only
          if (!data.recipientFirstName || data.recipientFirstName.length < 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: props.config.validation.recipientFirstName.minLength,
              path: ['recipientFirstName']
            })
          }
          // Recipient last name is optional - no validation
        }

        // Email is required when sending eCard
        if (!data.recipientEmail) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: props.config.validation.recipientEmail.required,
            path: ['recipientEmail']
          })
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipientEmail)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: props.config.validation.recipientEmail.invalid,
            path: ['recipientEmail']
          })
        }
      }
    }
  })

// Form setup
const { values, setFieldValue, meta } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    type: props.modelValue?.type ?? 'none',
    honoreeFirstName: props.modelValue?.honoree?.firstName ?? '',
    honoreeLastName: props.modelValue?.honoree?.lastName ?? '',
    relationship: props.modelValue?.honoree?.relationship ?? '',
    sendECard: props.modelValue?.eCard?.send ?? false,
    recipientFirstName: props.modelValue?.eCard?.recipient?.firstName ?? '',
    recipientLastName: props.modelValue?.eCard?.recipient?.lastName ?? '',
    recipientEmail: props.modelValue?.eCard?.recipient?.email ?? ''
  }
})

// Detect if recipient is same as honoree (when editing)
const detectSameAsHonoree = () => {
  if (props.modelValue?.type === 'gift' && props.modelValue?.eCard?.send) {
    const recipient = props.modelValue.eCard.recipient
    const honoree = props.modelValue.honoree
    return !!(
      recipient?.firstName === honoree?.firstName &&
      recipient?.lastName === honoree?.lastName &&
      recipient?.firstName &&
      recipient?.lastName
    )
  }
  return false
}

// Local UI state (not validated)
const sameAsHonoree = ref(detectSameAsHonoree())
const relationshipOpen = ref(false)

// Computed validation state
const isValid = computed(() => {
  // If type is 'none', form is always valid
  if (values.type === 'none') return true
  // Otherwise check vee-validate's meta.valid
  return meta.value.valid
})

// Relationship options from config
const relationships = computed(() => props.config.relationships)

// Refs for scroll targets
const eCardFormRef = ref<HTMLElement | null>(null)
const eCardRecipientFormRef = ref<HTMLElement | null>(null)

// Computed
const showHonoreeForm = computed(() => values.type !== 'none')
const showECardOption = computed(() => values.type !== 'none')
const showECardForm = computed(() => values.sendECard && values.type !== 'none')

const honoreeLabel = computed(() => {
  if (values.type === 'gift') return props.config.form.honoreeSection.legendGift
  if (values.type === 'memorial') return props.config.form.honoreeSection.legendMemorial
  return props.config.form.honoreeSection.legendDefault
})

const honoreeFullName = computed(() => {
  return [values.honoreeFirstName, values.honoreeLastName].filter(Boolean).join(' ')
})

const relationshipLabel = computed(() => {
  const selected = relationships.value.find((r) => r.value === values.relationship)
  return selected?.label || props.config.form.honoreeSection.fields.relationship.placeholder
})

function selectRelationship(selectedValue: string) {
  setFieldValue('relationship', selectedValue === values.relationship ? '' : selectedValue)
  relationshipOpen.value = false
}

const effectiveRecipientFirstName = computed(() => {
  return sameAsHonoree.value ? values.honoreeFirstName : values.recipientFirstName
})

const effectiveRecipientLastName = computed(() => {
  return sameAsHonoree.value ? values.honoreeLastName : values.recipientLastName
})

// Watch for changes and emit
watch(
  () => ({
    type: values.type,
    honoreeFirstName: values.honoreeFirstName,
    honoreeLastName: values.honoreeLastName,
    relationship: values.relationship,
    sendECard: values.sendECard,
    sameAsHonoree: sameAsHonoree.value,
    recipientFirstName: values.recipientFirstName,
    recipientLastName: values.recipientLastName,
    recipientEmail: values.recipientEmail
  }),
  (current) => {
    const data: TributeData = {
      type: current.type ?? 'none'
    }

    if (current.type !== 'none') {
      data.honoree = {
        firstName: current.honoreeFirstName ?? '',
        lastName: current.honoreeLastName ?? '',
        relationship: current.relationship ?? ''
      }

      data.eCard = {
        send: current.sendECard ?? false
      }

      if (current.sendECard) {
        data.eCard.recipient = {
          firstName: effectiveRecipientFirstName.value ?? '',
          lastName: effectiveRecipientLastName.value ?? '',
          email: current.recipientEmail ?? ''
        }
      }
    }

    emit('update:modelValue', data)
  },
  { deep: true }
)

// Reset honoree fields when switching away from gift/memorial
watch(
  () => values.type,
  (newType, oldType) => {
    if (newType === 'none') {
      setFieldValue('honoreeFirstName', '')
      setFieldValue('honoreeLastName', '')
      setFieldValue('relationship', '')
      setFieldValue('sendECard', false)
      setFieldValue('recipientFirstName', '')
      setFieldValue('recipientLastName', '')
      setFieldValue('recipientEmail', '')
    } else if (oldType === 'none') {
      // Scroll to eCard option (which is below the honoree form)
      nextTick(() => {
        eCardFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }

    // Reset sameAsHonoree when switching to memorial
    if (newType === 'memorial') {
      sameAsHonoree.value = false
    }
  }
)

// Reset eCard fields when unchecking
watch(
  () => values.sendECard,
  (newValue) => {
    if (!newValue) {
      setFieldValue('recipientFirstName', '')
      setFieldValue('recipientLastName', '')
      setFieldValue('recipientEmail', '')
    } else {
      // Scroll to newly visible eCard recipient form
      nextTick(() => {
        eCardRecipientFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }
  }
)

// Handle form submission
function handleSubmit() {
  if (isValid.value) {
    emit('submit')
  }
}

// Handle Enter key press in input fields
function handleEnterKey(event: KeyboardEvent) {
  // Prevent default form submission behavior
  event.preventDefault()
  handleSubmit()
}

// Expose validation state to parent
defineExpose({
  isValid
})
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Tribute Type Selection -->
    <VeeField v-slot="{ field, errors }" name="type">
      <FieldSet :data-invalid="!!errors.length">
        <FieldLegend>{{ config.form.tributeTypeSection.legend }}</FieldLegend>
        <FieldDescription>{{ config.form.tributeTypeSection.description }}</FieldDescription>
        <RadioGroup
          :name="field.name"
          :model-value="field.value"
          :aria-invalid="!!errors.length"
          class="gap-3"
          @update:model-value="field.onChange"
        >
          <FieldLabel for="tribute-none">
            <Field orientation="horizontal" :data-invalid="!!errors.length">
              <FieldContent>
                <FieldTitle>{{ config.types.none.label }}</FieldTitle>
              </FieldContent>
              <RadioGroupItem id="tribute-none" value="none" :aria-invalid="!!errors.length" />
            </Field>
          </FieldLabel>

          <FieldLabel for="tribute-gift">
            <Field orientation="horizontal" :data-invalid="!!errors.length">
              <FieldContent>
                <FieldTitle>{{ config.types.gift.label }}</FieldTitle>
              </FieldContent>
              <RadioGroupItem id="tribute-gift" value="gift" :aria-invalid="!!errors.length" />
            </Field>
          </FieldLabel>

          <FieldLabel for="tribute-memorial">
            <Field orientation="horizontal" :data-invalid="!!errors.length">
              <FieldContent>
                <FieldTitle>{{ config.types.memorial.label }}</FieldTitle>
              </FieldContent>
              <RadioGroupItem
                id="tribute-memorial"
                value="memorial"
                :aria-invalid="!!errors.length"
              />
            </Field>
          </FieldLabel>
        </RadioGroup>
        <FieldError v-if="errors.length" :errors="errors" />
      </FieldSet>
    </VeeField>

    <!-- Honoree/Giftee Form -->
    <div v-if="showHonoreeForm" ref="honoreeFormRef">
      <FieldSet class="gap-4">
        <FieldLegend>{{ honoreeLabel }}</FieldLegend>
        <FieldDescription>{{ config.form.honoreeSection.description }}</FieldDescription>
        <FieldGroup class="gap-4">
          <div class="grid grid-cols-2 gap-3">
            <VeeField v-slot="{ field, errors }" name="honoreeFirstName">
              <Field :data-invalid="!!errors.length">
                <FieldLabel for="honoree-first-name">{{
                  config.form.honoreeSection.fields.firstName.label
                }}</FieldLabel>
                <Input
                  id="honoree-first-name"
                  :model-value="field.value"
                  :placeholder="config.form.honoreeSection.fields.firstName.placeholder"
                  autocomplete="off"
                  :aria-invalid="!!errors.length"
                  @update:model-value="field.onChange"
                  @blur="field.onBlur"
                  @keydown.enter="handleEnterKey"
                />
                <FieldError v-if="errors.length" :errors="errors" />
              </Field>
            </VeeField>

            <VeeField v-slot="{ field, errors }" name="honoreeLastName">
              <Field :data-invalid="!!errors.length">
                <FieldLabel for="honoree-last-name"
                  >{{ config.form.honoreeSection.fields.lastName.label }}
                  <span class="text-muted-foreground font-normal">{{
                    config.form.honoreeSection.fields.lastName.optional
                  }}</span></FieldLabel
                >
                <Input
                  id="honoree-last-name"
                  :model-value="field.value"
                  :placeholder="config.form.honoreeSection.fields.lastName.placeholder"
                  autocomplete="off"
                  :aria-invalid="!!errors.length"
                  @update:model-value="field.onChange"
                  @blur="field.onBlur"
                  @keydown.enter="handleEnterKey"
                />
                <FieldError v-if="errors.length" :errors="errors" />
              </Field>
            </VeeField>
          </div>

          <VeeField v-slot="{ field, errors }" name="relationship">
            <Field :data-invalid="!!errors.length">
              <FieldLabel
                >{{ config.form.honoreeSection.fields.relationship.label }}
                <span class="text-muted-foreground font-normal">{{
                  config.form.honoreeSection.fields.relationship.optional
                }}</span></FieldLabel
              >
              <Popover v-model:open="relationshipOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    role="combobox"
                    :aria-expanded="relationshipOpen"
                    :aria-invalid="!!errors.length"
                    class="w-full justify-between font-normal"
                  >
                    <span :class="field.value ? '' : 'text-muted-foreground'">
                      {{ relationshipLabel }}
                    </span>
                    <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      class="h-9"
                      :placeholder="
                        config.form.honoreeSection.fields.relationship.searchPlaceholder
                      "
                    />
                    <CommandList>
                      <CommandEmpty>{{
                        config.form.honoreeSection.fields.relationship.notFound
                      }}</CommandEmpty>
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
                                field.value === rel.value ? 'opacity-100' : 'opacity-0'
                              )
                            "
                          />
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>
        </FieldGroup>
      </FieldSet>
    </div>

    <!-- eCard Option -->
    <div v-if="showECardOption" ref="eCardFormRef">
      <FieldSet class="gap-4">
        <VeeField v-slot="{ field }" name="sendECard">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>{{ config.form.eCardSection.toggle.title }}</FieldTitle>
              <FieldDescription>
                {{ config.form.eCardSection.toggle.description }}
              </FieldDescription>
            </FieldContent>
            <Switch
              id="send-ecard"
              :model-value="field.value"
              @update:model-value="field.onChange"
            />
          </Field>
        </VeeField>

        <!-- eCard Recipient Form -->
        <div v-if="showECardForm" ref="eCardRecipientFormRef">
          <FieldSet class="gap-4">
            <FieldLegend>{{ config.form.eCardSection.recipientSection.legend }}</FieldLegend>
            <FieldDescription>{{
              config.form.eCardSection.recipientSection.description
            }}</FieldDescription>

            <!-- Same as Honoree Toggle (only for gifts, not memorials) -->
            <Field v-if="values.type === 'gift'" orientation="horizontal">
              <FieldContent>
                <FieldTitle>{{
                  config.form.eCardSection.sameAsHonoree.titleTemplate.replace(
                    '{honoree}',
                    honoreeFullName || 'the honoree'
                  )
                }}</FieldTitle>
                <FieldDescription>{{
                  config.form.eCardSection.sameAsHonoree.description
                }}</FieldDescription>
              </FieldContent>
              <Switch id="same-as-honoree" v-model="sameAsHonoree" />
            </Field>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <FieldGroup v-if="!sameAsHonoree" class="gap-4">
                <div class="grid grid-cols-2 gap-3">
                  <VeeField v-slot="{ field, errors }" name="recipientFirstName">
                    <Field :data-invalid="!!errors.length">
                      <FieldLabel for="recipient-first-name">{{
                        config.form.eCardSection.fields.firstName.label
                      }}</FieldLabel>
                      <Input
                        id="recipient-first-name"
                        :model-value="field.value"
                        :placeholder="config.form.eCardSection.fields.firstName.placeholder"
                        autocomplete="off"
                        :aria-invalid="!!errors.length"
                        @update:model-value="field.onChange"
                        @blur="field.onBlur"
                        @keydown.enter="handleEnterKey"
                      />
                      <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                  </VeeField>

                  <VeeField v-slot="{ field, errors }" name="recipientLastName">
                    <Field :data-invalid="!!errors.length">
                      <FieldLabel for="recipient-last-name"
                        >{{ config.form.eCardSection.fields.lastName.label }}
                        <span class="text-muted-foreground font-normal">{{
                          config.form.eCardSection.fields.lastName.optional
                        }}</span></FieldLabel
                      >
                      <Input
                        id="recipient-last-name"
                        :model-value="field.value"
                        :placeholder="config.form.eCardSection.fields.lastName.placeholder"
                        autocomplete="off"
                        :aria-invalid="!!errors.length"
                        @update:model-value="field.onChange"
                        @blur="field.onBlur"
                        @keydown.enter="handleEnterKey"
                      />
                      <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                  </VeeField>
                </div>
              </FieldGroup>
            </Transition>

            <VeeField v-slot="{ field, errors }" name="recipientEmail">
              <Field :data-invalid="!!errors.length">
                <FieldLabel for="recipient-email">{{
                  config.form.eCardSection.fields.email.label
                }}</FieldLabel>
                <Input
                  id="recipient-email"
                  :model-value="field.value"
                  type="email"
                  :placeholder="config.form.eCardSection.fields.email.placeholder"
                  autocomplete="email"
                  :aria-invalid="!!errors.length"
                  @update:model-value="field.onChange"
                  @blur="field.onBlur"
                  @keydown.enter="handleEnterKey"
                />
                <FieldError v-if="errors.length" :errors="errors" />
              </Field>
            </VeeField>
          </FieldSet>
        </div>
      </FieldSet>
    </div>
  </form>
</template>
