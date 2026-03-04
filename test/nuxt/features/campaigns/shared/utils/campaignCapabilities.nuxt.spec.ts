import { describe, it, expect } from 'vitest'
import {
  getCampaignCapabilities,
  getFormType
} from '~/features/campaigns/shared/utils/campaignCapabilities'
import type { CampaignType } from '~/features/campaigns/shared/types'

describe('getCampaignCapabilities', () => {
  it('standard campaigns allow recurring donations', () => {
    const caps = getCampaignCapabilities('standard')
    expect(caps.allowsRecurring).toBe(true)
    expect(caps.allowedFrequencies).toContain('monthly')
    expect(caps.allowedFrequencies).toContain('yearly')
  })

  it('P2P campaigns do not allow recurring donations', () => {
    const caps = getCampaignCapabilities('p2p')
    expect(caps.allowsRecurring).toBe(false)
    expect(caps.allowedFrequencies).toEqual(['once'])
  })

  it('P2P fundraiser campaigns do not allow recurring donations', () => {
    const caps = getCampaignCapabilities('p2p-fundraiser')
    expect(caps.allowsRecurring).toBe(false)
    expect(caps.allowedFrequencies).toEqual(['once'])
  })

  it('event campaigns do not allow recurring donations', () => {
    const caps = getCampaignCapabilities('event')
    expect(caps.allowsRecurring).toBe(false)
    expect(caps.allowedFrequencies).toEqual(['once'])
  })

  it('P2P campaigns use donation form type', () => {
    expect(getCampaignCapabilities('p2p').formType).toBe('donation')
  })

  it('event campaigns use registration form type', () => {
    expect(getCampaignCapabilities('event').formType).toBe('registration')
  })

  it('every campaign type has a capabilities entry', () => {
    const types: CampaignType[] = ['standard', 'p2p', 'p2p-fundraiser', 'event']
    for (const type of types) {
      const caps = getCampaignCapabilities(type)
      expect(caps).toBeDefined()
      expect(caps.allowedFrequencies.length).toBeGreaterThan(0)
    }
  })
})

describe('getFormType', () => {
  it('returns donation for standard campaigns', () => {
    expect(getFormType('standard')).toBe('donation')
  })

  it('returns registration for event campaigns', () => {
    expect(getFormType('event')).toBe('registration')
  })
})
