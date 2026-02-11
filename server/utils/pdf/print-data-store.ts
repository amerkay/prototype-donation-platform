/**
 * Persistent storage for print data using Nitro's useStorage.
 *
 * Stores certificate/receipt models with short-lived tokens for PDF generation.
 * Puppeteer navigates to a print URL with this token to retrieve the data.
 *
 * Uses:
 * - Local dev: Filesystem driver (.data/pdf-tokens/)
 * - Netlify: Netlify Blobs driver (persists across invocations)
 */

import { randomBytes } from 'crypto'

interface StoredEntry<T = unknown> {
  data: T
  expiresAt: number
}

/** Token TTL in milliseconds (30 seconds) */
const TOKEN_TTL_MS = 30_000

/**
 * Store data and return a short-lived token.
 *
 * @param data - The data to store (e.g., CertificateModel)
 * @returns A token that can be used to retrieve the data
 */
export async function storePrintData<T>(data: T): Promise<string> {
  const storage = useStorage('pdf-tokens')
  const token = randomBytes(16).toString('hex')
  const entry: StoredEntry<T> = {
    data,
    expiresAt: Date.now() + TOKEN_TTL_MS
  }
  await storage.setItem(token, entry)
  return token
}

/**
 * Retrieve and consume stored data by token.
 *
 * The data is deleted after retrieval (single-use token).
 *
 * @param token - The token returned from storePrintData
 * @returns The stored data, or null if not found or expired
 */
export async function getPrintData<T>(token: string): Promise<T | null> {
  const storage = useStorage('pdf-tokens')
  const entry = await storage.getItem<StoredEntry<T>>(token)

  if (!entry) return null

  // Check if expired
  if (entry.expiresAt < Date.now()) {
    await storage.removeItem(token)
    return null
  }

  // Delete after retrieval (single-use)
  await storage.removeItem(token)

  return entry.data
}
