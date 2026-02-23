<script setup lang="ts">
import { User, Gift } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

defineProps<{
  donorName: string
  donorEmail: string
  isAnonymous?: boolean
  message?: string
  tribute?: { type: 'gift' | 'memorial'; honoreeName: string }
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <User class="h-4 w-4" />
        Donor
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-muted-foreground">Name</span>
        <span class="font-medium flex items-center gap-1">
          {{ isAnonymous ? 'Anonymous' : donorName }}
          <Badge v-if="isAnonymous" variant="secondary" class="text-xs">Anon</Badge>
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Email</span>
        <span>{{ donorEmail }}</span>
      </div>
      <div v-if="message" class="pt-2">
        <p class="text-muted-foreground mb-1">Message</p>
        <p class="bg-muted rounded p-2 text-sm italic">"{{ message }}"</p>
      </div>
      <div v-if="tribute" class="flex items-center gap-2 pt-1">
        <Gift class="h-4 w-4 text-muted-foreground" />
        <span class="capitalize">{{ tribute.type }}</span>
        <span class="text-muted-foreground">for</span>
        <span class="font-medium">{{ tribute.honoreeName }}</span>
      </div>
    </CardContent>
  </Card>
</template>
