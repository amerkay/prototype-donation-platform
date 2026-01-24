<script setup lang="ts">
import ShareContent from '~/features/campaigns/donor/components/ShareContent.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2 } from 'lucide-vue-next'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Share2 class="w-5 h-5" />
        Share Preview
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ShareContent />
    </CardContent>
  </Card>
</template>
