import { computed, ref, watch, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { useRoute } from '#imports'
import type { FieldDef, FieldContext, TabsFieldDef, FieldGroupDef, VisibilityFn } from '../types'
import type { ConditionGroup } from '../conditions'
import { checkFieldVisibility } from './useFieldPath'
import { activateHashTarget, lastActivatedTarget } from './useHashTarget'
import { resolveText, type ResolvableText } from './useResolvedFieldMeta'

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarNode {
  /** Unique key (tab value or group field name) */
  id: string
  /** Display label — resolved via resolveText() at render time */
  label: ResolvableText
  /** Dot-path for internal navigation (suffix-matched by useHashTarget) */
  path: string
  children?: SidebarNode[]
  /** Auto-detected: the field key of the enabled toggle (e.g., 'enabled', 'pauseEnabled') */
  enabledToggleKey?: string
  /** Badge label — resolved via resolveText() at render time */
  badgeLabel?: ResolvableText
  /** Badge variant — static string or dynamic via FieldContext */
  badgeVariant?: string | ((ctx: FieldContext) => string)
  /** Visibility conditions accumulated from ancestors + this node */
  visibilityChecks?: Array<{ visibleWhen: VisibilityFn | ConditionGroup; valuesPath: string }>
}

export interface FormSidebarState {
  tree: ComputedRef<SidebarNode[]>
  activePath: Ref<string>
  fieldContext: () => FieldContext
  navigateTo: (path: string) => void
  isNodeActive: (node: SidebarNode) => boolean
  isNodeEnabled: (node: SidebarNode) => boolean
}

export const FORM_SIDEBAR_KEY: InjectionKey<FormSidebarState> = Symbol('formSidebar')

// ============================================================================
// TREE BUILDING
// ============================================================================

type VisibilityCheck = { visibleWhen: VisibilityFn | ConditionGroup; valuesPath: string }

/**
 * Find the enabled toggle field key in a field group.
 * Checks for 'enabled' first, then any key ending with 'Enabled' (e.g., 'pauseEnabled').
 * Returns the key if found, undefined otherwise.
 */
function detectEnabledToggle(fields: Record<string, FieldDef>): string | undefined {
  if ('enabled' in fields && fields.enabled?.type === 'toggle') return 'enabled'
  for (const key of Object.keys(fields)) {
    if (key.endsWith('Enabled') && fields[key]?.type === 'toggle') return key
  }
  return undefined
}

/**
 * Build sidebar tree from a tabs field's tab definitions.
 * Each tab becomes a collapsible group; inner tabs/groups become children.
 */
function buildTabsNodes(
  tabs: TabsFieldDef,
  parentPath: string,
  ancestorChecks: VisibilityCheck[],
  emptyCtx: FieldContext,
  fieldContext: () => FieldContext
): SidebarNode[] {
  const nodes: SidebarNode[] = []

  for (const tab of tabs.tabs) {
    const tabPath = `${parentPath}.${tab.value}`
    const tabChecks = tab.visibleWhen
      ? [...ancestorChecks, { visibleWhen: tab.visibleWhen, valuesPath: parentPath }]
      : ancestorChecks

    const children = buildTreeFromFields(tab.fields, tabPath, tabChecks, emptyCtx, fieldContext)

    const node: SidebarNode = {
      id: tab.value,
      label: tab.label,
      path: tab.value, // Use short path for suffix matching
      children: children.length > 0 ? children : undefined,
      enabledToggleKey: tab.fields ? detectEnabledToggle(tab.fields) : undefined,
      badgeLabel: tab.badgeLabel,
      badgeVariant: tab.badgeVariant,
      visibilityChecks: tabChecks.length > 0 ? tabChecks : undefined
    }

    nodes.push(node)
  }

  return nodes
}

/**
 * Recursively walk field definitions and build sidebar tree nodes.
 * Only tabs and collapsible fieldGroups with labels produce nodes.
 */
function buildTreeFromFields(
  fields: Record<string, FieldDef>,
  parentPath: string,
  ancestorChecks: VisibilityCheck[],
  emptyCtx: FieldContext,
  fieldContext: () => FieldContext
): SidebarNode[] {
  const nodes: SidebarNode[] = []

  for (const [key, field] of Object.entries(fields)) {
    const fieldPath = parentPath ? `${parentPath}.${key}` : key

    const fieldChecks = field.visibleWhen
      ? [...ancestorChecks, { visibleWhen: field.visibleWhen, valuesPath: parentPath }]
      : ancestorChecks

    if (field.type === 'tabs') {
      const tabsDef = field as TabsFieldDef
      // Recurse into tabs — each tab becomes a node
      const tabNodes = buildTabsNodes(tabsDef, fieldPath, fieldChecks, emptyCtx, fieldContext)
      nodes.push(...tabNodes)
    } else if (field.type === 'field-group') {
      const group = field as FieldGroupDef
      const sidebarLabel = group.sidebarLabel ?? group.label ?? ''
      const groupLabel = resolveText(sidebarLabel, emptyCtx)

      // Show collapsible groups or groups with sidebar metadata as sidebar items
      if (groupLabel && (group.collapsible || group.sidebar)) {
        const node: SidebarNode = {
          id: key,
          label: sidebarLabel,
          path: key, // Short path for suffix matching
          enabledToggleKey: detectEnabledToggle(group.fields),
          badgeLabel: group.badgeLabel,
          badgeVariant: group.badgeVariant,
          visibilityChecks: fieldChecks.length > 0 ? fieldChecks : undefined
        }
        nodes.push(node)
      } else if (group.fields) {
        // Non-collapsible group: recurse into children (e.g., the 'config' wrapper)
        const childNodes = buildTreeFromFields(
          group.fields,
          fieldPath,
          fieldChecks,
          emptyCtx,
          fieldContext
        )
        nodes.push(...childNodes)
      }
    }
    // Skip all other field types (text, select, etc.) — they're not navigable
  }

  return nodes
}

// ============================================================================
// SCOPED CONTEXT (for visibility evaluation)
// ============================================================================

function buildScopedContext(ctx: FieldContext, valuesPath: string): FieldContext {
  if (!valuesPath) return ctx
  let values: Record<string, unknown> = ctx.values as Record<string, unknown>
  for (const segment of valuesPath.split('.')) {
    const next = values?.[segment]
    if (next == null || typeof next !== 'object') return { values: {}, root: ctx.root }
    values = next as Record<string, unknown>
  }
  return { values, root: ctx.root }
}

function isNodeVisible(node: SidebarNode, fieldContext: () => FieldContext): boolean {
  if (!node.visibilityChecks?.length) return true
  const ctx = fieldContext()

  for (const check of node.visibilityChecks) {
    const scopedCtx = check.valuesPath ? buildScopedContext(ctx, check.valuesPath) : ctx
    if (
      !checkFieldVisibility({ visibleWhen: check.visibleWhen }, scopedCtx, {
        skipContainerValidation: true
      })
    ) {
      return false
    }
  }
  return true
}

// ============================================================================
// VALUE READING (for enabled toggle dots)
// ============================================================================

/**
 * Read a nested value from form values using a dot-path.
 * Used to check if a fieldGroup's `enabled` toggle is true/false.
 */
function readNestedValue(values: Record<string, unknown>, path: string): unknown {
  let current: unknown = values
  for (const segment of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

// ============================================================================
// ACTIVE PATH MATCHING
// ============================================================================

function flattenPaths(nodes: SidebarNode[]): string[] {
  const paths: string[] = []
  for (const node of nodes) {
    paths.push(node.path)
    if (node.children) {
      paths.push(...flattenPaths(node.children))
    }
  }
  return paths
}

// ============================================================================
// COMPOSABLE
// ============================================================================

/**
 * Build a sidebar navigation tree from form field definitions.
 * Auto-detects tabs (→ collapsible groups) and fieldGroups with enabled toggles (→ dot indicators).
 */
export function useFormSidebar(
  fields: Record<string, FieldDef>,
  fieldContext: () => FieldContext,
  options?: { disabled?: boolean }
): FormSidebarState {
  const route = useRoute()
  const emptyCtx: FieldContext = { values: {}, root: {} }

  // Build the raw tree once from field definitions
  const rawTree = buildTreeFromFields(fields, '', [], emptyCtx, fieldContext)

  // Filter tree reactively based on visibility
  const tree = computed((): SidebarNode[] => {
    if (options?.disabled) return []

    const filterVisible = (nodes: SidebarNode[]): SidebarNode[] => {
      return nodes
        .filter((node) => isNodeVisible(node, fieldContext))
        .map((node) => ({
          ...node,
          children: node.children ? filterVisible(node.children) : undefined
        }))
    }

    return filterVisible(rawTree)
  })

  // Track active sidebar section
  const activePath = ref('')

  /**
   * Match a target path against sidebar paths.
   * Sidebar paths are SHORT (e.g., 'crowdfunding', 'impactBoost').
   * Target can be short OR full (e.g., 'sections.crowdfunding.title').
   * Finds the longest matching sidebar path.
   */
  function matchActivePath(target: string): string | undefined {
    const allPaths = flattenPaths(tree.value)
    return allPaths
      .filter((p) => {
        // Exact match
        if (target === p) return true
        // Target starts with sidebar path (target is a child of the sidebar node)
        if (target.startsWith(`${p}.`)) return true
        // Target ends with sidebar path (target is a full path, sidebar has suffix)
        if (target.endsWith(`.${p}`)) return true
        // Target contains sidebar path as a segment
        if (target.includes(`.${p}.`)) return true
        return false
      })
      .sort((a, b) => b.length - a.length)[0]
  }

  // Sync from route hash
  watch(
    () => route.hash,
    (hash) => {
      if (!hash) return
      const clean = hash.startsWith('#') ? hash.slice(1) : hash
      const match = matchActivePath(clean)
      if (match) activePath.value = match
    },
    { immediate: true }
  )

  // Default to first visible node when no hash sets the active path
  if (!activePath.value && tree.value.length > 0) {
    const first = tree.value[0]!
    activePath.value = first.children?.[0]?.path ?? first.path
  }

  // Sync from programmatic activateHashTarget calls (search, preview clicks)
  watch(lastActivatedTarget, (activated) => {
    if (!activated) return
    const match = matchActivePath(activated.target)
    if (match) activePath.value = match
  })

  function navigateTo(path: string) {
    activePath.value = path
    activateHashTarget(path, { noHighlight: true })
  }

  function isNodeActive(node: SidebarNode): boolean {
    if (node.path === activePath.value) return true
    return node.children?.some((c) => c.path === activePath.value) ?? false
  }

  function isNodeEnabled(node: SidebarNode): boolean {
    if (!node.enabledToggleKey) return false
    const ctx = fieldContext()
    const root = ctx.root as Record<string, unknown>
    // Walk values to find this node's data — try suffix matching on the path
    const val = readNestedValue(root, node.path)
    if (val != null && typeof val === 'object') {
      return (val as Record<string, unknown>)[node.enabledToggleKey] === true
    }
    // Try finding it deeper in the tree
    return findEnabledByKey(root, node.id, node.enabledToggleKey)
  }

  return {
    tree,
    activePath,
    fieldContext,
    navigateTo,
    isNodeActive,
    isNodeEnabled
  }
}

/**
 * Recursively search for a node by key in nested values and check its enabled toggle.
 * Handles the case where form values are nested under tabs/groups.
 */
function findEnabledByKey(
  values: Record<string, unknown>,
  targetKey: string,
  enabledKey: string
): boolean {
  if (targetKey in values) {
    const val = values[targetKey]
    if (val != null && typeof val === 'object') {
      return (val as Record<string, unknown>)[enabledKey] === true
    }
  }
  for (const v of Object.values(values)) {
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const result = findEnabledByKey(v as Record<string, unknown>, targetKey, enabledKey)
      if (result) return true
    }
  }
  return false
}

/**
 * Check if a form has tabs (and thus should show a sidebar).
 */
export function formHasTabs(fields: Record<string, FieldDef>): boolean {
  for (const field of Object.values(fields)) {
    if (field.type === 'tabs') return true
    if (field.type === 'field-group' && 'fields' in field && field.fields) {
      if (formHasTabs(field.fields as Record<string, FieldDef>)) return true
    }
  }
  return false
}
