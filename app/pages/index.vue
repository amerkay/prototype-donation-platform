<script lang="ts"></script>

<script setup lang="ts">
import { ref, provide } from 'vue'
import AppSidebar from '~/features/admin/sidebar/AppSidebar.vue'
import DonationFormSettings from '~/features/admin/DonationFormSettings.vue'
import DonationFormPreview from '~/features/admin/DonationFormPreview.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { formConfig as sampleConfig } from '~/features/donation-form/api-sample-response-form-config'
import type { FormConfig } from '@/lib/common/types'

// Create reactive config that both DonationFormSettings and DonationFormPreview will share
const formConfig = ref<FormConfig>(structuredClone(sampleConfig))

// Provide config to all child components
provide('formConfig', formConfig)
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#"> Campaign: Adopt an Orangutan </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Form 1</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Design</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="space-y-4 lg:flex lg:space-x-4">
          <div class="grow lg:max-w-[45vw]">
            <p class="text-muted-foreground text-sm font-semibold mb-2">Form Settings</p>
            <DonationFormSettings />
          </div>

          <div class="sm:mx-auto sm:max-w-sm sm:w-sm">
            <p class="text-muted-foreground text-sm font-semibold mb-2">Form Preview</p>
            <DonationFormPreview />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
