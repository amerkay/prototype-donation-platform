/** "Visa ****1234" | "PayPal" | "Bank Transfer" | raw type */
export function paymentMethodLabel(pm: { type: string; brand?: string; last4?: string }): string {
  if (pm.type === 'card' && pm.brand && pm.last4) return `${pm.brand} ****${pm.last4}`
  if (pm.type === 'paypal') return 'PayPal'
  if (pm.type === 'bank_transfer') return 'Bank Transfer'
  return pm.type
}
