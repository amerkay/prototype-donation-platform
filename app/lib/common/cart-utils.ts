/**
 * Generate a unique key for a cart item based on its ID and timestamp
 */
export const getCartItemKey = (itemId: string, addedAt: number): string => {
    return `${itemId}___${addedAt}`
}

/**
 * Parse a cart item key back into its components
 */
export const parseCartItemKey = (key: string): { itemId: string; addedAt: number } | null => {
    const parts = key.split('___')
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null
    
    const itemId = parts[0]
    const addedAt = parseInt(parts[1])
    
    if (isNaN(addedAt)) return null
    
    return { itemId, addedAt }
}
