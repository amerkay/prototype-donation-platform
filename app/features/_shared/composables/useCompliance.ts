import type { GiftAidDeclaration, ConsentRecord } from '~/features/donor-portal/types'
import {
  getUserGiftAidDeclarations,
  getUserConsentRecords
} from '~/sample-api-responses/api-sample-response-transactions'

// TODO-SUPABASE: Replace with:
// supabase.from('gift_aid_declarations').select('*').eq('donor_email', email)
// supabase.from('consent_records').select('*').eq('donor_email', email)

/**
 * Compliance data composable — Gift Aid declarations and consent records.
 * Centralizes access to compliance data so pages don't import sample data directly.
 */
export function useCompliance() {
  function getGiftAidDeclarations(email: string): GiftAidDeclaration[] {
    return getUserGiftAidDeclarations(email)
  }

  function getConsentRecords(email: string): ConsentRecord[] {
    return getUserConsentRecords(email)
  }

  return { getGiftAidDeclarations, getConsentRecords }
}
