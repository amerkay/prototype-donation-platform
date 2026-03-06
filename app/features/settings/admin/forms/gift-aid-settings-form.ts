import {
  defineForm,
  toggleField,
  fieldGroup,
  alertField
} from '~/features/_library/form-builder/api'

export const useGiftAidSettingsForm = defineForm('giftAidSettings', () => {
  const enabled = toggleField('enabled', {
    label: 'Enable Gift Aid',
    description:
      'Show Gift Aid consent for UK donors on all donation forms (GBP currency only).',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  const gbpInfo = alertField('gbpInfo', {
    variant: 'info',
    description:
      'Gift Aid is automatically shown only when a donor selects GBP as their donation currency. No per-form configuration is needed.'
  })

  const giftAid = fieldGroup('giftAid', {
    label: 'Gift Aid (UK Tax Reclaim)',
    description: 'Claim an extra 25p for every £1 donated by UK taxpayers via HMRC Gift Aid.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { enabled, gbpInfo },
    $storePath: 'flatten'
  })

  return { giftAid }
})
