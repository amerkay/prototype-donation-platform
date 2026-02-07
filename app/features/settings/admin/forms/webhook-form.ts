import * as z from 'zod'
import { defineForm, textField } from '~/features/_library/form-builder/api'

export const WEBHOOK_EVENTS = [
  'donation.created',
  'donation.completed',
  'donation.failed',
  'subscription.created',
  'subscription.cancelled',
  'campaign.created',
  'campaign.ended'
]

export const useWebhookForm = defineForm('webhook', () => {
  const url = textField('url', {
    label: 'Endpoint URL',
    placeholder: 'https://example.com/webhooks',
    rules: z.string().url('Must be a valid URL')
  })

  const events = textField('events', {
    label: 'Events',
    description: 'Leave empty to subscribe to all events, or enter comma-separated event names.',
    placeholder: WEBHOOK_EVENTS.slice(0, 3).join(', '),
    optional: true
  })

  return { url, events }
})
