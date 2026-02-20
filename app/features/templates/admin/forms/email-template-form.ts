import { computed } from 'vue'
import {
  defineForm,
  textField,
  imageUploadField,
  richTextField,
  alertField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'

export const useEmailTemplateForm = defineForm('emailTemplate', () => {
  const store = useEmailTemplateStore()
  const meta = computed(() => store.templateMeta)

  const subject = textField('subject', {
    id: 'template-subject',
    label: 'Subject',
    placeholder: 'Enter subject...',
    variables: computed(() => meta.value.variables.filter((v) => !v.value.endsWith('_CARD'))),
    autocomplete: 'off'
  })

  const imageUrl = imageUploadField('imageUrl', {
    label: 'Hero Image',
    accept: 'image/*',
    maxSizeMB: 5,
    visibleWhen: computed(() => meta.value.hasImage)
  })

  const bodyHtml = richTextField('bodyHtml', {
    label: 'Body Content',
    variables: computed(() => [...meta.value.variables])
  })

  const signatureNotice = alertField('signatureNotice', {
    variant: 'info',
    description:
      'The email signature is configured in Charity Settings and shared across all emails.',
    cta: {
      label: 'Edit signature',
      to: '/admin/settings/charity#charitySettings.currencyTabs.emailSignature',
      inline: true
    }
  })

  const senderAddressNotice = alertField('senderAddressNotice', {
    variant: 'info',
    description: 'The sender email address is configured in Charity Settings.',
    cta: {
      label: 'Edit sender email',
      to: '/admin/settings/charity#charitySettings.currencyTabs.supportEmail',
      inline: true
    }
  })

  const emailSettings = fieldGroup('email', {
    collapsible: false,
    label: 'Email Settings',
    description: 'Configure subject, content, and display options.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { subject, imageUrl, bodyHtml, signatureNotice, senderAddressNotice },
    $storePath: {
      subject: 'subject',
      imageUrl: 'imageUrl',
      bodyHtml: 'bodyHtml'
    }
  })

  return { email: emailSettings }
})
