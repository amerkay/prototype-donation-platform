<script setup lang="ts">
import AppSidebar from '~/features/admin/sidebar/AppSidebar.vue'
import { useCampaigns } from '~/features/campaigns/composables/useCampaigns'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, TrendingUp, Target, DollarSign, Edit, Settings, UserPlus } from 'lucide-vue-next'

const route = useRoute()
const { getCampaignById } = useCampaigns()

const campaign = computed(() => getCampaignById(route.params.id as string))

// Redirect to campaigns if not found
if (!campaign.value) {
  navigateTo('/campaigns')
}

const progressPercentage = computed(() => {
  if (!campaign.value?.stats.goalAmount) return 0
  return Math.min((campaign.value.stats.totalRaised / campaign.value.stats.goalAmount) * 100, 100)
})

const formattedAmount = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formattedDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString))
}

const statusVariants: Record<
  NonNullable<typeof campaign.value>['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  completed: 'outline',
  archived: 'outline'
}
</script>

<template>
  <SidebarProvider v-if="campaign">
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="/"> Dashboard </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/campaigns"> Campaigns </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{{ campaign.name }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div class="ml-auto flex gap-2">
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="`/campaigns/${campaign.id}/settings`">
                <Settings class="w-4 h-4 mr-2" />
                Settings
              </NuxtLink>
            </Button>
            <Button size="sm" as-child>
              <NuxtLink :to="`/campaigns/${campaign.id}/form-settings`">
                <Edit class="w-4 h-4 mr-2" />
                Edit Form
              </NuxtLink>
            </Button>
          </div>
        </div>
      </header>

      <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
        <!-- Header -->
        <div class="mb-6 space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h1 class="text-3xl font-bold">{{ campaign.name }}</h1>
              <p class="text-muted-foreground mt-1">
                Created {{ formattedDate(campaign.createdAt) }} · Last updated
                {{ formattedDate(campaign.updatedAt) }}
              </p>
            </div>
            <Badge :variant="statusVariants[campaign.status]" class="shrink-0 text-sm py-1 px-3">
              {{ campaign.status }}
            </Badge>
          </div>

          <!-- Quick Stats Cards -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader class="pb-2">
                <CardDescription class="flex items-center gap-2">
                  <DollarSign class="w-4 h-4" />
                  Total Raised
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ formattedAmount(campaign.stats.totalRaised) }}
                </div>
                <p v-if="campaign.stats.goalAmount" class="text-xs text-muted-foreground mt-1">
                  {{ Math.round(progressPercentage) }}% of
                  {{ formattedAmount(campaign.stats.goalAmount) }}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-2">
                <CardDescription class="flex items-center gap-2">
                  <Users class="w-4 h-4" />
                  Total Donors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ campaign.stats.totalDonors }}</div>
                <p class="text-xs text-muted-foreground mt-1">Unique supporters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-2">
                <CardDescription class="flex items-center gap-2">
                  <TrendingUp class="w-4 h-4" />
                  Total Donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ campaign.stats.totalDonations }}</div>
                <p class="text-xs text-muted-foreground mt-1">
                  Avg {{ formattedAmount(campaign.stats.averageDonation) }}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-2">
                <CardDescription class="flex items-center gap-2">
                  <Target class="w-4 h-4" />
                  Top Donation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">
                  {{ formattedAmount(campaign.stats.topDonation) }}
                </div>
                <p v-if="campaign.stats.daysRemaining" class="text-xs text-muted-foreground mt-1">
                  {{ campaign.stats.daysRemaining }} days left
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <Tabs default-value="overview" class="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fundraisers">
              Fundraisers
              <Badge v-if="campaign.fundraisers.length > 0" variant="secondary" class="ml-2">
                {{ campaign.fundraisers.length }}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="crowdfunding">Crowdfunding Page</TabsTrigger>
            <TabsTrigger value="donations">Recent Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" class="space-y-4">
            <!-- Progress Card -->
            <Card v-if="campaign.stats.goalAmount">
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <Progress :model-value="progressPercentage" class="h-3" />
                <div class="flex justify-between text-sm">
                  <span class="font-semibold">
                    {{ formattedAmount(campaign.stats.totalRaised) }} raised
                  </span>
                  <span class="text-muted-foreground">
                    {{ formattedAmount(campaign.stats.goalAmount) }} goal
                  </span>
                </div>
                <div class="text-sm text-muted-foreground">
                  {{
                    formattedAmount(
                      campaign.stats.goalAmount - campaign.stats.totalRaised > 0
                        ? campaign.stats.goalAmount - campaign.stats.totalRaised
                        : 0
                    )
                  }}
                  remaining to reach goal
                </div>
              </CardContent>
            </Card>

            <!-- Crowdfunding Settings Card -->
            <Card>
              <CardHeader>
                <CardTitle>Crowdfunding Settings</CardTitle>
                <CardDescription>Public-facing campaign page configuration</CardDescription>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid gap-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Status:</span>
                    <span class="font-medium">
                      {{ campaign.crowdfunding.enabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Title:</span>
                    <span class="font-medium">{{ campaign.crowdfunding.title }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">WordPress Plugin:</span>
                    <span class="font-medium">
                      {{ campaign.crowdfunding.wordpressPluginEnabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Peer-to-Peer:</span>
                    <span class="font-medium">
                      {{
                        campaign.crowdfunding.allowPeerToPeerFundraising ? 'Enabled' : 'Disabled'
                      }}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Charity Info Card -->
            <Card>
              <CardHeader>
                <CardTitle>About the Charity</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div>
                  <h4 class="font-semibold">{{ campaign.charity.name }}</h4>
                  <p class="text-sm text-muted-foreground">
                    RCN: {{ campaign.charity.registrationNumber }}
                  </p>
                </div>
                <p class="text-sm">{{ campaign.charity.description }}</p>
                <a
                  :href="campaign.charity.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-primary hover:underline"
                >
                  {{ campaign.charity.website }}
                </a>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fundraisers" class="space-y-4">
            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div>
                    <CardTitle>Peer-to-Peer Fundraisers</CardTitle>
                    <CardDescription>Team members raising funds for this campaign</CardDescription>
                  </div>
                  <Button v-if="campaign.crowdfunding.allowPeerToPeerFundraising" size="sm">
                    <UserPlus class="w-4 h-4 mr-2" />
                    Invite Fundraiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div v-if="campaign.fundraisers.length === 0" class="text-center py-8">
                  <p class="text-muted-foreground">No fundraisers yet.</p>
                  <p
                    v-if="!campaign.crowdfunding.allowPeerToPeerFundraising"
                    class="text-sm text-muted-foreground mt-2"
                  >
                    Enable peer-to-peer fundraising in settings to invite fundraisers.
                  </p>
                </div>

                <div v-else class="space-y-4">
                  <div
                    v-for="fundraiser in campaign.fundraisers"
                    :key="fundraiser.id"
                    class="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <h4 class="font-semibold">{{ fundraiser.name }}</h4>
                        <Badge variant="outline" class="text-xs">{{ fundraiser.type }}</Badge>
                      </div>
                      <p class="text-sm text-muted-foreground">{{ fundraiser.email }}</p>
                      <p class="text-xs text-muted-foreground mt-1">
                        Joined {{ formattedDate(fundraiser.joinedAt) }}
                      </p>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold">
                        {{ formattedAmount(fundraiser.raisedAmount) }}
                      </div>
                      <p class="text-xs text-muted-foreground">
                        {{ fundraiser.donationCount }} donations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crowdfunding" class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crowdfunding Page Content</CardTitle>
                <CardDescription>Content displayed on public campaign page</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <h4 class="font-semibold mb-1">Title</h4>
                  <p class="text-sm">{{ campaign.crowdfunding.title }}</p>
                </div>
                <div>
                  <h4 class="font-semibold mb-1">Short Description</h4>
                  <p class="text-sm">{{ campaign.crowdfunding.shortDescription }}</p>
                </div>
                <div>
                  <h4 class="font-semibold mb-1">Story</h4>
                  <p class="text-sm whitespace-pre-line">{{ campaign.crowdfunding.story }}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid gap-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Show Progress Bar:</span>
                    <span class="font-medium">
                      {{ campaign.crowdfunding.showProgressBar ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Show Recent Donations:</span>
                    <span class="font-medium">
                      {{ campaign.crowdfunding.showRecentDonations ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Default Donations View:</span>
                    <span class="font-medium capitalize">
                      {{ campaign.crowdfunding.defaultDonationsView }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Number of Donations Shown:</span>
                    <span class="font-medium">
                      {{ campaign.crowdfunding.numberOfDonationsToShow }}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="flex flex-wrap gap-2">
                  <Badge v-if="campaign.socialSharing.facebook" variant="secondary">Facebook</Badge>
                  <Badge v-if="campaign.socialSharing.twitter" variant="secondary">Twitter</Badge>
                  <Badge v-if="campaign.socialSharing.linkedin" variant="secondary">LinkedIn</Badge>
                  <Badge v-if="campaign.socialSharing.whatsapp" variant="secondary">WhatsApp</Badge>
                  <Badge v-if="campaign.socialSharing.email" variant="secondary">Email</Badge>
                  <Badge v-if="campaign.socialSharing.copyLink" variant="secondary"
                    >Copy Link</Badge
                  >
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donations received for this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-center py-8 text-muted-foreground">
                  <p>Donation history coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
