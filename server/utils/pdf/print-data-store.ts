/**
 * Temporary in-memory storage for print data.
 *
 * Stores certificate/receipt models with short-lived tokens for PDF generation.
 * Puppeteer navigates to a print URL with this token to retrieve the data.
 */

import { randomBytes } from 'crypto'

interface StoredData<T = unknown> {
  data: T
  expiresAt: number
}

const store = new Map<string, StoredData>()

/** Token TTL in milliseconds (30 seconds) */
const TOKEN_TTL_MS = 30_000

/** Cleanup interval in milliseconds (10 seconds) */
const CLEANUP_INTERVAL_MS = 10_000

/** Generate a cryptographically secure random token */
function generateToken(): string {
  return randomBytes(16).toString('hex')
}

/** Remove expired entries from the store */
function cleanupExpired(): void {
  const now = Date.now()
  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt < now) {
      store.delete(token)
    }
  }
}

// Run cleanup periodically
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function ensureCleanupRunning(): void {
  if (cleanupInterval) return
  cleanupInterval = setInterval(cleanupExpired, CLEANUP_INTERVAL_MS)
  // Don't prevent Node.js from exiting
  if (typeof cleanupInterval.unref === 'function') {
    cleanupInterval.unref()
  }
}

/**
 * Store data and return a short-lived token.
 *
 * @param data - The data to store (e.g., CertificateModel)
 * @returns A token that can be used to retrieve the data
 */
export function storePrintData<T>(data: T): string {
  ensureCleanupRunning()

  const token = generateToken()
  const entry: StoredData<T> = {
    data,
    expiresAt: Date.now() + TOKEN_TTL_MS
  }

  store.set(token, entry)
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
export function getPrintData<T>(token: string): T | null {
  const entry = store.get(token) as StoredData<T> | undefined

  if (!entry) return null

  // Check if expired
  if (entry.expiresAt < Date.now()) {
    store.delete(token)
    return null
  }

  // Delete after retrieval (single-use)
  store.delete(token)

  return entry.data
}
