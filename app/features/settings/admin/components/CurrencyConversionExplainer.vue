<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-vue-next'

const showRounding = ref(false)
</script>

<template>
  <div class="bg-muted/50 rounded-lg border p-4 space-y-3 text-sm">
    <p class="font-semibold text-base">How Currency Conversion Works</p>
    <p class="text-muted-foreground">
      When donors switch currencies, preset amounts are converted in three steps:
    </p>

    <div class="space-y-2">
      <div class="flex items-start gap-2.5">
        <span
          class="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
        >
          1
        </span>
        <p>
          <span class="font-medium">Exchange rate</span>
          <span class="text-muted-foreground">
            — Live rate converts the base amount (e.g., £7 → $10)
          </span>
        </p>
      </div>

      <div class="flex items-start gap-2.5">
        <span
          class="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
        >
          2
        </span>
        <p>
          <span class="font-medium">Multiplier</span>
          <span class="text-muted-foreground">
            — Your adjustment scales the result up or down (e.g., USD at 1.20× turns $10 into $12)
          </span>
        </p>
      </div>

      <div class="flex items-start gap-2.5">
        <span
          class="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
        >
          3
        </span>
        <p>
          <span class="font-medium">Smart rounding</span>
          <span class="text-muted-foreground"> — Rounded to a clean, donor-friendly number </span>
        </p>
      </div>
    </div>

    <Collapsible v-model:open="showRounding">
      <CollapsibleTrigger
        class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        Rounding rules
        <ChevronDown
          class="h-3.5 w-3.5 transition-transform"
          :class="{ 'rotate-180': showRounding }"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="mt-2 text-xs text-muted-foreground space-y-0.5">
          <p><span class="font-medium text-foreground">Under £5:</span> Nearest whole number</p>
          <p><span class="font-medium text-foreground">£5-£50:</span> Nearest £5</p>
          <p><span class="font-medium text-foreground">£50-£200:</span> Nearest £25</p>
          <p><span class="font-medium text-foreground">£200-£500:</span> Nearest £50</p>
          <p><span class="font-medium text-foreground">Over £500:</span> Nearest £100</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>
