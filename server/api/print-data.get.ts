/**
 * Retrieve print data by token.
 *
 * Used by the print pages (e.g., /print/certificate) to get the certificate model
 * that was stored by the PDF generation endpoint.
 */

import { getPrintData } from '../utils/pdf/print-data-store'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string | undefined

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing token parameter'
    })
  }

  const data = await getPrintData(token)

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Token not found or expired'
    })
  }

  return data
})
