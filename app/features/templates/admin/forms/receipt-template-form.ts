import {
  defineForm,
  textField,
  textareaField,
  toggleField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useReceiptTemplateForm = defineForm('receiptTemplate', () => {
  const headerText = textField('headerText', {
    label: 'Header Text'
  })

  const footerText = textareaField('footerText', {
    label: 'Footer Text',
    rows: 2
  })

  const content = fieldGroup('content', {
    label: 'Receipt Content',
    description: 'Colors and fonts are inherited from Branding Settings.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { headerText, footerText },
    $storePath: {
      headerText: 'headerText',
      footerText: 'footerText'
    }
  })

  const showGiftAid = toggleField('showGiftAid', {
    label: 'Show Gift Aid Declaration',
    description: 'Include Gift Aid section on receipts'
  })

  const showPaymentMethod = toggleField('showPaymentMethod', {
    label: 'Show Payment Method',
    description: 'Display payment method details'
  })

  const showCampaignName = toggleField('showCampaignName', {
    label: 'Show Campaign Name',
    description: 'Show which campaign the donation was for'
  })

  const display = fieldGroup('display', {
    label: 'Display Options',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { showGiftAid, showPaymentMethod, showCampaignName },
    $storePath: {
      showGiftAid: 'showGiftAid',
      showPaymentMethod: 'showPaymentMethod',
      showCampaignName: 'showCampaignName'
    }
  })

  return { content, display }
})
