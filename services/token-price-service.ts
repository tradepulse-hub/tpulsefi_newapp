// Token Price Service for fetching current prices and historical data

import { getRealQuote, TOKENS } from "./swap-service"

// Mock price data for demonstration
const MOCK_PRICES: Record<string, number> = {
  WLD: 2.45,
  TPF: 0.0012,
  USDC: 1.0,
  WDD: 0.85,
}

// Time intervals in milliseconds
export const TIME_INTERVALS = {
  "1M": 60 * 1000,
  "5M": 5 * 60 * 1000,
  "15M": 15 * 60 * 1000,
  "1H": 60 * 60 * 1000,
  "4H": 4 * 60 * 60 * 1000,
  "8H": 8 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
} as const

export type TimeInterval = keyof typeof TIME_INTERVALS

// Cache for price data by token and interval
const priceCache = new Map<string, Map<TimeInterval, Array<{ time: number; price: number }>>>()

// Initialize cache for each token
TOKENS.forEach((token) => {
  priceCache.set(token.symbol, new Map())
})

/**
 * Get real-time token price using Holdstation SDK
 */
async function getRealTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    // Skip USDC as it's our base currency
    if (tokenSymbol === "USDC") {
      return 1.0
    }

    const token = TOKENS.find((t) => t.symbol === tokenSymbol)
    if (!token) {
      console.warn(`Token ${tokenSymbol} not found in TOKENS list`)
      return MOCK_PRICES[tokenSymbol] || 1
    }

    console.log(`🔄 Getting real price for ${tokenSymbol} via Holdstation SDK`)

    // Get quote for 1 token against USDC
    const { outputAmount } = await getRealQuote("1", token.address, "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1")
    const price = Number.parseFloat(outputAmount)

    console.log(`✅ Real price for ${tokenSymbol}: $${price}`)
    return price > 0 ? price : MOCK_PRICES[tokenSymbol] || 1
  } catch (error) {
    console.error(`❌ Error getting real price for ${tokenSymbol}:`, error)
    return MOCK_PRICES[tokenSymbol] || 1
  }
}

/**
 * Generate realistic price data for a given interval
 */
function generatePriceData(
  symbol: string,
  interval: TimeInterval,
  points = 50,
): Array<{ time: number; price: number }> {
  const basePrice = MOCK_PRICES[symbol] || 1
  const now = Date.now()
  const intervalMs = TIME_INTERVALS[interval]
  const data: Array<{ time: number; price: number }> = []

  let currentPrice = basePrice

  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * intervalMs

    // Add some realistic price movement
    const volatility = symbol === "USDC" ? 0.001 : 0.02 // USDC is more stable
    const change = (Math.random() - 0.5) * volatility
    currentPrice = Math.max(currentPrice * (1 + change), 0.0001)

    data.push({
      time,
      price: Number(currentPrice.toFixed(symbol === "USDC" ? 4 : 6)),
    })
  }

  return data
}

/**
 * Get cached price data or generate new data
 */
function getCachedPriceData(symbol: string, interval: TimeInterval): Array<{ time: number; price: number }> {
  const tokenCache = priceCache.get(symbol)
  if (!tokenCache) return []

  let intervalData = tokenCache.get(interval)
  if (!intervalData || intervalData.length === 0) {
    intervalData = generatePriceData(symbol, interval)
    tokenCache.set(interval, intervalData)
  }

  return intervalData
}

/**
 * Add new price point to existing data
 */
function addNewPricePoint(symbol: string, interval: TimeInterval): void {
  const tokenCache = priceCache.get(symbol)
  if (!tokenCache) return

  const intervalData = tokenCache.get(interval) || []
  if (intervalData.length === 0) return

  const lastPrice = intervalData[intervalData.length - 1]?.price || MOCK_PRICES[symbol] || 1
  const now = Date.now()

  // Add some realistic price movement
  const volatility = symbol === "USDC" ? 0.001 : 0.015
  const change = (Math.random() - 0.5) * volatility
  const newPrice = Math.max(lastPrice * (1 + change), 0.0001)

  intervalData.push({
    time: now,
    price: Number(newPrice.toFixed(symbol === "USDC" ? 4 : 6)),
  })

  // Keep only last 100 points to prevent memory issues
  if (intervalData.length > 100) {
    intervalData.shift()
  }

  tokenCache.set(interval, intervalData)
}

/**
 * Get current token price
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  try {
    // In a real app, this would fetch from an API
    const basePrice = MOCK_PRICES[symbol] || 1

    // Add small random variation to simulate real-time price changes
    const variation = (Math.random() - 0.5) * 0.01
    const currentPrice = basePrice * (1 + variation)

    return Number(currentPrice.toFixed(symbol === "USDC" ? 4 : 6))
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return MOCK_PRICES[symbol] || 1
  }
}

/**
 * Get price history for a specific interval
 */
export async function getPriceHistory(
  symbol: string,
  interval: TimeInterval = "1H",
): Promise<Array<{ time: number; price: number }>> {
  try {
    console.log(`📊 Getting price history for ${symbol} (${interval})`)

    // Get cached data or generate new data
    let data = getCachedPriceData(symbol, interval)

    // Add a new point if enough time has passed
    const now = Date.now()
    const lastPoint = data[data.length - 1]
    const intervalMs = TIME_INTERVALS[interval]

    if (!lastPoint || now - lastPoint.time >= intervalMs) {
      addNewPricePoint(symbol, interval)
      data = getCachedPriceData(symbol, interval)
    }

    console.log(`✅ Retrieved ${data.length} price points for ${symbol}`)
    return data
  } catch (error) {
    console.error(`Error fetching price history for ${symbol}:`, error)
    return []
  }
}

/**
 * Get price change percentage for a specific interval
 */
export async function getPriceChange(symbol: string, interval: TimeInterval = "1H"): Promise<number> {
  try {
    const data = await getPriceHistory(symbol, interval)

    if (data.length < 2) return 0

    const firstPrice = data[0].price
    const lastPrice = data[data.length - 1].price

    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100
    return Number(changePercent.toFixed(2))
  } catch (error) {
    console.error(`Error calculating price change for ${symbol}:`, error)
    return 0
  }
}

/**
 * Format price based on token type
 */
export function formatPrice(price: number, symbol: string): string {
  if (symbol === "USDC") {
    return `$${price.toFixed(4)}`
  }

  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  }

  if (price < 1) {
    return `$${price.toFixed(4)}`
  }

  return `$${price.toFixed(2)}`
}

/**
 * Format time based on interval
 */
export function formatTime(timestamp: number, interval: TimeInterval): string {
  const date = new Date(timestamp)

  switch (interval) {
    case "1M":
    case "5M":
    case "15M":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    case "1H":
    case "4H":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    case "8H":
    case "1D":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      })
    default:
      return date.toLocaleString("en-US")
  }
}

/**
 * Clear cache for a specific token (useful for testing)
 */
export function clearPriceCache(symbol?: string): void {
  if (symbol) {
    const tokenCache = priceCache.get(symbol)
    if (tokenCache) {
      tokenCache.clear()
    }
  } else {
    priceCache.clear()
    // Reinitialize cache
    TOKENS.forEach((token) => {
      priceCache.set(token.symbol, new Map())
    })
  }
}

// Auto-update prices for short intervals
let updateInterval: NodeJS.Timeout | null = null

export function startPriceUpdates(): void {
  if (updateInterval) return

  updateInterval = setInterval(() => {
    TOKENS.forEach((token) => {
      // Update 1M and 5M intervals more frequently
      addNewPricePoint(token.symbol, "1M")
      if (Math.random() > 0.7) {
        // 30% chance
        addNewPricePoint(token.symbol, "5M")
      }
    })
  }, 30000) // Update every 30 seconds
}

export function stopPriceUpdates(): void {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

// Start updates when module loads
if (typeof window !== "undefined") {
  startPriceUpdates()
}
