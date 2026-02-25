import type { Component } from 'vue'
import type { Campaign, P2PPreset } from '~/features/campaigns/shared/types'
import { ICON_CAKE, ICON_DONATION, ICON_TROPHY, ICON_GEM, ICON_EDIT } from '~/lib/icons'
import { createBirthdayPreset } from './birthday'
import { createTributePreset } from './tribute'
import { createChallengePreset } from './challenge'
import { createWeddingPreset } from './wedding'
import { createCustomPreset } from './custom'

/**
 * Metadata for display in the preset picker dialog
 */
export interface P2PCampaignPresetMetadata {
  id: P2PPreset
  name: string
  description: string
  icon: Component
}

/**
 * Factory function that returns pre-filled Campaign data for a given preset
 */
export type P2PCampaignPresetFactory = () => Partial<Campaign>

/**
 * Complete preset definition with metadata and factory
 */
export interface P2PCampaignPreset {
  metadata: P2PCampaignPresetMetadata
  factory: P2PCampaignPresetFactory
}

/**
 * Preset registry - all available P2P campaign presets
 */
export const P2P_PRESET_REGISTRY: P2PCampaignPreset[] = [
  {
    metadata: {
      id: 'birthday',
      name: 'Birthday Fundraiser',
      description: 'Celebrate a birthday by asking friends and family to donate instead of gifts',
      icon: ICON_CAKE
    },
    factory: createBirthdayPreset
  },
  {
    metadata: {
      id: 'tribute',
      name: 'Tribute & Memorial',
      description: 'Honour or remember a loved one with a dedicated fundraising campaign',
      icon: ICON_DONATION
    },
    factory: createTributePreset
  },
  {
    metadata: {
      id: 'challenge',
      name: 'Challenge Fundraiser',
      description: 'Take on a personal challenge and rally supporters to sponsor your effort',
      icon: ICON_TROPHY
    },
    factory: createChallengePreset
  },
  {
    metadata: {
      id: 'wedding',
      name: 'Wedding Fundraiser',
      description: 'Ask wedding guests to donate to a cause you care about instead of gifts',
      icon: ICON_GEM
    },
    factory: createWeddingPreset
  },
  {
    metadata: {
      id: 'custom',
      name: 'Custom',
      description: 'Start from scratch and build your own peer-to-peer campaign',
      icon: ICON_EDIT
    },
    factory: createCustomPreset
  }
]

/**
 * Get preset by ID
 */
export function getPresetById(presetId: P2PPreset): P2PCampaignPreset | undefined {
  return P2P_PRESET_REGISTRY.find((p) => p.metadata.id === presetId)
}
