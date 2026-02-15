<script setup lang="ts">
import { computed } from 'vue'
import { Info, TriangleAlert } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import type { AlertFieldDef } from '~/features/_library/form-builder/types'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'
import {
  useResolvedFieldMeta,
  resolveText
} from '~/features/_library/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/_library/form-builder/composables/useContainerFieldSetup'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import { useHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'

interface Props {
  meta: AlertFieldDef
  name: string
  fullPath?: string
}

const props = defineProps<Props>()

const { isVisible } = useContainerFieldSetup(props.name, props.meta.visibleWhen)
const { resolvedLabel, resolvedDescription, resolvedClass } = useResolvedFieldMeta(props.meta)

const sanitizedContent = computed(() =>
  props.meta.content ? sanitizeRichText(props.meta.content) : ''
)

const alertVariant = computed(() => props.meta.variant ?? 'default')

const showInfoIcon = computed(() => {
  return props.meta.icon === 'lucide:info' || (!props.meta.icon && alertVariant.value === 'info')
})

const showDestructiveIcon = computed(() => {
  return (
    props.meta.icon === 'lucide:triangle-alert' ||
    (!props.meta.icon && alertVariant.value === 'destructive')
  )
})

const { fieldContext } = useFormBuilderContext()
const resolvedCtaTo = computed(() => {
  const to = props.meta.cta?.to
  return to ? (resolveText(to, fieldContext.value) ?? '') : ''
})

const isInlineCta = computed(() => {
  return !!props.meta.cta?.inline && !props.meta.content && !!resolvedDescription.value
})

const fullPathComputed = computed(() => props.fullPath || '')
const {
  elementRef: alertEl,
  hashHighlightClass,
  fieldId
} = useHashTarget(fullPathComputed, {
  animate: true
})
</script>

<template>
  <Alert
    v-show="isVisible"
    :id="fieldId || undefined"
    ref="alertEl"
    :variant="alertVariant"
    :class="cn(hashHighlightClass, resolvedClass)"
  >
    <Info v-if="showInfoIcon" class="size-4" />
    <TriangleAlert v-else-if="showDestructiveIcon" class="size-4" />

    <AlertTitle v-if="resolvedLabel">{{ resolvedLabel }}</AlertTitle>
    <AlertDescription :class="meta.descriptionClass">
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized -->
      <div v-if="meta.content" class="space-y-2" v-html="sanitizedContent" />
      <p v-else-if="resolvedDescription" class="whitespace-pre-line">
        {{ resolvedDescription }}
        <NuxtLink
          v-if="meta.cta && isInlineCta"
          :to="resolvedCtaTo"
          :class="
            cn(
              'inline-flex items-center gap-1 align-baseline font-medium hover:underline',
              alertVariant === 'info' && 'text-blue-800 dark:text-blue-200',
              meta.cta.class
            )
          "
        >
          {{ meta.cta.label }}
          <Icon :name="meta.cta.icon || 'lucide:arrow-right'" class="size-3" />
        </NuxtLink>
      </p>
      <NuxtLink
        v-if="meta.cta && !isInlineCta"
        :to="resolvedCtaTo"
        :class="
          cn(
            'mt-2 inline-flex items-center gap-1 font-medium hover:underline',
            alertVariant === 'info' && 'text-blue-800 dark:text-blue-200',
            meta.cta.class
          )
        "
      >
        {{ meta.cta.label }}
        <Icon :name="meta.cta.icon || 'lucide:arrow-right'" class="size-3" />
      </NuxtLink>
    </AlertDescription>
  </Alert>
</template>
