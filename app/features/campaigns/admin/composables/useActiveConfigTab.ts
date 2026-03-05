import type { InjectionKey, Ref } from 'vue'

/** Provide/inject key for tracking the active top-level tab in the campaign config panel */
export const ACTIVE_CONFIG_TAB_KEY = Symbol('activeConfigTab') as InjectionKey<Ref<string>>
