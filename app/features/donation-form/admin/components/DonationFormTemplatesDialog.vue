<script setup lang="ts">
import {
  TEMPLATE_REGISTRY,
  type DonationFormTemplate
} from '~/features/donation-form/admin/templates'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  campaignId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [template: DonationFormTemplate]
}>()

// Group templates by category
const simpleTemplates = computed(() =>
  TEMPLATE_REGISTRY.filter((t) => t.metadata.category === 'simple')
)
const enhancedTemplates = computed(() =>
  TEMPLATE_REGISTRY.filter((t) => t.metadata.category === 'enhanced')
)
const advancedTemplates = computed(() =>
  TEMPLATE_REGISTRY.filter((t) => t.metadata.category === 'advanced')
)

const handleTemplateSelect = (template: DonationFormTemplate) => {
  emit('select', template)
  emit('update:open', false)
}
</script>

<template>
  <BaseDialogOrDrawer
    :open="props.open"
    max-width="md:min-w-xl lg:min-w-4xl"
    dismissible
    description="Select a template to create a new donation form for your campaign"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <span>Choose a Donation Form Template</span>
    </template>

    <template #content>
      <div class="space-y-6 py-4">
        <!-- Simple Templates -->
        <div v-if="simpleTemplates.length > 0">
          <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
            <Badge variant="secondary">Simple</Badge>
            Quick setup for basic donation forms
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card
              v-for="template in simpleTemplates"
              :key="template.metadata.id"
              :class="
                cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  'hover:scale-[1.02]'
                )
              "
              @click="handleTemplateSelect(template)"
            >
              <CardHeader>
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-primary/10 text-primary">
                    <component :is="template.metadata.icon" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <CardTitle class="text-base">{{ template.metadata.name }}</CardTitle>
                    <CardDescription class="text-xs">
                      {{ template.metadata.description }}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        <!-- Enhanced Templates -->
        <div v-if="enhancedTemplates.length > 0">
          <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
            <Badge variant="default">Enhanced</Badge>
            Advanced features for better engagement
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card
              v-for="template in enhancedTemplates"
              :key="template.metadata.id"
              :class="
                cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  'hover:scale-[1.02]'
                )
              "
              @click="handleTemplateSelect(template)"
            >
              <CardHeader>
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-primary/10 text-primary">
                    <component :is="template.metadata.icon" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <CardTitle class="text-base">{{ template.metadata.name }}</CardTitle>
                    <Badge
                      v-if="template.metadata.requiresProducts"
                      variant="outline"
                      class="text-xs"
                    >
                      Products
                    </Badge>
                    <CardDescription class="text-xs">
                      {{ template.metadata.description }}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        <!-- Advanced Templates -->
        <div v-if="advancedTemplates.length > 0">
          <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
            <Badge variant="destructive">Advanced</Badge>
            Full-featured experience
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card
              v-for="template in advancedTemplates"
              :key="template.metadata.id"
              :class="
                cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  'hover:scale-[1.02]'
                )
              "
              @click="handleTemplateSelect(template)"
            >
              <CardHeader>
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-primary/10 text-primary">
                    <component :is="template.metadata.icon" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <CardTitle class="text-base">{{ template.metadata.name }}</CardTitle>
                    <CardDescription class="text-xs">
                      {{ template.metadata.description }}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>
