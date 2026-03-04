/** Average payment amount with zero-guard */
export function getAvgPayment(sub: { totalPaid: number; paymentCount: number }): number {
  if (sub.paymentCount === 0) return 0
  return sub.totalPaid / sub.paymentCount
}
