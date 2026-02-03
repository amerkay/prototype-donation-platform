import type { Component } from 'vue'
import type { Campaign, P2PPreset } from '~/features/campaigns/shared/types'
import { Cake, Heart, Trophy, Gem } from 'lucide-vue-next'
import { createBirthdayPreset } from './birthday'
import { createTributePreset } from './tribute'
import { createChallengePreset } from './challenge'
import { createWeddingPreset } from './wedding'

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
      icon: Cake
    },
    factory: createBirthdayPreset
  },
  {
    metadata: {
      id: 'tribute',
      name: 'Tribute & Memorial',
      description: 'Honour or remember a loved one with a dedicated fundraising campaign',
      icon: Heart
    },
    factory: createTributePreset
  },
  {
    metadata: {
      id: 'challenge',
      name: 'Challenge Fundraiser',
      description: 'Take on a personal challenge and rally supporters to sponsor your effort',
      icon: Trophy
    },
    factory: createChallengePreset
  },
  {
    metadata: {
      id: 'wedding',
      name: 'Wedding Fundraiser',
      description: 'Ask wedding guests to donate to a cause you care about instead of gifts',
      icon: Gem
    },
    factory: createWeddingPreset
  }
]

/**
 * Get preset by ID
 */
export function getPresetById(presetId: P2PPreset): P2PCampaignPreset | undefined {
  return P2P_PRESET_REGISTRY.find((p) => p.metadata.id === presetId)
}
