import * as z from 'zod'
import { defineForm, textField } from '~/features/_library/form-builder/api'

export const useCardUpdateForm = defineForm('cardUpdate', () => {
  const cardNumber = textField('cardNumber', {
    label: 'Card Number',
    placeholder: '4242 4242 4242 4242',
    rules: z.string().min(1, 'Card number is required')
  })

  const expMonth = textField('expMonth', {
    label: 'Month',
    placeholder: '12'
  })

  const expYear = textField('expYear', {
    label: 'Year',
    placeholder: '2027'
  })

  const cvc = textField('cvc', {
    label: 'CVC',
    placeholder: '123'
  })

  return { cardNumber, expMonth, expYear, cvc }
})
