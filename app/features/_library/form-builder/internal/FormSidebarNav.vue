<script setup lang="ts">
import { inject } from 'vue'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator
} from '@/components/ui/sidebar'
import {
  FORM_SIDEBAR_KEY,
  type SidebarNode,
  type FormSidebarState
} from '../composables/useFormSidebar'
import { resolveText } from '../composables/useResolvedFieldMeta'
import FormSearchInput from './FormSearchInput.vue'

const sidebar = inject<FormSidebarState>(FORM_SIDEBAR_KEY)!

function isLeafActive(node: SidebarNode): boolean {
  return node.path === sidebar.activePath.value
}

function resolvedLabel(node: SidebarNode): string {
  return resolveText(node.label, sidebar.fieldContext()) ?? ''
}

function resolvedBadge(node: SidebarNode): string {
  // Nodes with enabled dot indicators don't need text badges (redundant)
  if (node.enabledToggleKey) return ''
  return resolveText(node.badgeLabel, sidebar.fieldContext()) ?? ''
}

function hasErrors(node: SidebarNode): boolean {
  return sidebar.nodeHasErrors(node)
}
</script>

<template>
  <nav
    class="w-52 shrink-0 rounded-lg hidden lg:block sticky top-16 self-start max-h-[calc(100vh-4.75rem)] overflow-y-auto overflow-x-hidden bg-sidebar text-sidebar-foreground"
    data-slot="form-sidebar"
    data-sidebar="sidebar"
  >
    <div class="flex flex-col py-1">
      <!-- Search: input inline in sidebar, results float via portal -->
      <div class="px-1.5 pt-1 pb-1 has-[>*]:block hidden form-sidebar-search">
        <FormSearchInput floating />
      </div>

      <template v-for="(node, i) in sidebar.tree.value" :key="node.id">
        <SidebarSeparator v-if="i > 0" class="mx-2 my-0" />

        <!-- Group with children → uppercase heading + direct items -->
        <SidebarGroup v-if="node.children && node.children.length > 0" class="px-2 py-1">
          <p
            class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 pt-1.5 pb-1 flex items-center gap-1.5"
          >
            {{ resolvedLabel(node) }}
            <Icon
              v-if="hasErrors(node)"
              name="lucide:alert-circle"
              class="size-3 text-destructive shrink-0"
            />
            <span
              v-else-if="resolvedBadge(node)"
              class="normal-case tracking-normal font-medium text-muted-foreground"
            >
              {{ resolvedBadge(node) }}
            </span>
          </p>
          <SidebarMenu>
            <template v-for="child in node.children" :key="child.id">
              <!-- Child with grandchildren (e.g., Features → Impact Boost, ...) -->
              <SidebarMenuItem v-if="child.children && child.children.length > 0">
                <SidebarMenuSubButton
                  size="sm"
                  as="button"
                  :is-active="isLeafActive(child)"
                  class="w-full translate-x-0"
                  @click="sidebar.navigateTo(child.path)"
                >
                  <span class="truncate">{{ resolvedLabel(child) }}</span>
                  <Icon
                    v-if="hasErrors(child)"
                    name="lucide:alert-circle"
                    class="ml-auto size-3.5 text-destructive shrink-0"
                  />
                  <span
                    v-else-if="resolvedBadge(child)"
                    class="ml-auto text-[10px] tabular-nums text-muted-foreground"
                  >
                    {{ resolvedBadge(child) }}
                  </span>
                </SidebarMenuSubButton>
                <SidebarMenuSub class="mx-1.5 px-1 gap-0.5">
                  <SidebarMenuSubItem v-for="grandchild in child.children" :key="grandchild.id">
                    <SidebarMenuSubButton
                      size="sm"
                      as="button"
                      :is-active="isLeafActive(grandchild)"
                      class="w-full"
                      @click="sidebar.navigateTo(grandchild.path)"
                    >
                      <Icon
                        v-if="hasErrors(grandchild)"
                        name="lucide:alert-circle"
                        class="size-3.5 text-destructive shrink-0"
                      />
                      <span
                        v-else-if="grandchild.enabledToggleKey"
                        :class="[
                          'inline-block h-1.5 w-1.5 rounded-full shrink-0',
                          sidebar.isNodeEnabled(grandchild)
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/30'
                        ]"
                      />
                      <span class="truncate">{{ resolvedLabel(grandchild) }}</span>
                      <span
                        v-if="!hasErrors(grandchild) && resolvedBadge(grandchild)"
                        class="ml-auto text-[10px] tabular-nums text-muted-foreground"
                      >
                        {{ resolvedBadge(grandchild) }}
                      </span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <!-- Simple child (leaf) -->
              <SidebarMenuItem v-else>
                <SidebarMenuSubButton
                  size="sm"
                  as="button"
                  :is-active="isLeafActive(child)"
                  class="w-full translate-x-0"
                  @click="sidebar.navigateTo(child.path)"
                >
                  <Icon
                    v-if="hasErrors(child)"
                    name="lucide:alert-circle"
                    class="size-3.5 text-destructive shrink-0"
                  />
                  <span
                    v-else-if="child.enabledToggleKey"
                    :class="[
                      'inline-block h-1.5 w-1.5 rounded-full shrink-0',
                      sidebar.isNodeEnabled(child) ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    ]"
                  />
                  <span class="truncate">{{ resolvedLabel(child) }}</span>
                  <span
                    v-if="!hasErrors(child) && resolvedBadge(child)"
                    class="ml-auto text-[10px] tabular-nums text-muted-foreground"
                  >
                    {{ resolvedBadge(child) }}
                  </span>
                </SidebarMenuSubButton>
              </SidebarMenuItem>
            </template>
          </SidebarMenu>
        </SidebarGroup>

        <!-- Leaf node (no children) -->
        <SidebarGroup v-else class="px-2 py-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSubButton
                size="sm"
                as="button"
                :is-active="isLeafActive(node)"
                class="w-full translate-x-0"
                @click="sidebar.navigateTo(node.path)"
              >
                <Icon
                  v-if="hasErrors(node)"
                  name="lucide:alert-circle"
                  class="size-3.5 text-destructive shrink-0"
                />
                <span
                  v-else-if="node.enabledToggleKey"
                  :class="[
                    'inline-block h-1.5 w-1.5 rounded-full shrink-0',
                    sidebar.isNodeEnabled(node) ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  ]"
                />
                <span class="truncate font-medium text-xs">{{ resolvedLabel(node) }}</span>
              </SidebarMenuSubButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </template>
    </div>
  </nav>
</template>

<style>
/* Compact search input when rendered inside sidebar */
.form-sidebar-search [cmdk-input] {
  height: 1.75rem;
  font-size: 0.75rem;
}
</style>
