/**
 * LocationIQ Autocomplete API Proxy
 *
 * This server route proxies requests to LocationIQ's autocomplete API
 * to keep the API key secure on the server side.
 *
 * Setup:
 * 1. Get a free API key from https://locationiq.com/
 * 2. Add to .env: LOCATIONIQ_API_KEY=your_key_here
 * 3. Restart your dev server
 *
 * API Docs: https://locationiq.com/docs#autocomplete
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchQuery = String(query.q || '')
  const countryCode = String(query.country || '').toLowerCase()
  const lang = String(query.lang || 'en')

  // Validate required parameters
  if (!searchQuery || searchQuery.length < 3) {
    return []
  }

  // Get API key from runtime config
  const config = useRuntimeConfig()
  const apiKey = config.locationiqApiKey

  if (!apiKey) {
    console.error('LOCATIONIQ_API_KEY not set in environment variables')
    throw createError({
      statusCode: 500,
      statusMessage: 'LocationIQ API key not configured'
    })
  }

  try {
    // Build LocationIQ API URL
    const url = new URL('https://api.locationiq.com/v1/autocomplete')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('limit', '7')
    url.searchParams.set('dedupe', '1')
    url.searchParams.set('normalizecity', '1')
    url.searchParams.set('accept-language', lang)

    // Restrict to specific country if provided
    if (countryCode) {
      url.searchParams.set('countrycodes', countryCode)
    }

    // Fetch from LocationIQ
    const response = await $fetch(url.toString())

    return response
  } catch (error) {
    console.error('LocationIQ API error:', error)

    // Return empty array on error to avoid breaking the UI
    return []
  }
})
