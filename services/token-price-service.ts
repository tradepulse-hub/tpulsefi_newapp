// Token Price Service for fetching current prices and historical data

import { getRealQuote, TOKENS } from "./swap-service"
import type { TokenPrice } from "./types" // Declare the TokenPrice variable

// Mock price data for demonstration
const MOCK_PRICES: Record<string, number> = {
  WLD: 2.45,
  TPF: 0.0234,
  USDC: 1.0,
  WDD: 0.156,
}

// Cache for storing price data by token and interval
const priceCache = new Map<string, Map<TimeInterval, TokenPrice>>()
const CACHE_DURATION = 60000 // 1 minute cache

// Time intervals in milliseconds
export type TimeInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "8h" | "1d"

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
 * Generate realistic price history for a given timeframe
 */
function generatePriceHistory(
  basePrice: number,
  interval: TimeInterval,
  points = 50,
): Array<{ time: number; price: number }> {
  const now = Date.now()
  const history: Array<{ time: number; price: number }> = []

  // Define time intervals in milliseconds
  const intervalMs = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "8h": 8 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
  }

  const stepMs = intervalMs[interval]
  let currentPrice = basePrice

  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * stepMs

    // Add some realistic price movement
    const volatility = interval === "1m" ? 0.002 : interval === "5m" ? 0.005 : 0.01
    const change = (Math.random() - 0.5) * volatility
    currentPrice = Math.max(currentPrice * (1 + change), 0.001)

    history.push({
      time,
      price: currentPrice,
    })
  }

  return history
}

/**
 * Get cached price data or generate new data
 */
function getCachedPrice(symbol: string, interval: TimeInterval): TokenPrice | null {
  const tokenCache = priceCache.get(symbol)
  if (!tokenCache) return null

  const cachedData = tokenCache.get(interval)
  if (!cachedData) return null

  // Check if cache is still valid
  if (Date.now() - cachedData.lastUpdated > CACHE_DURATION) {
    return null
  }

  return cachedData
}

// Store price data in cache
function setCachedPrice(symbol: string, interval: TimeInterval, data: TokenPrice): void {
  if (!priceCache.has(symbol)) {
    priceCache.set(symbol, new Map())
  }

  const tokenCache = priceCache.get(symbol)!
  tokenCache.set(interval, data)
}

/**
 * Main function to get token price with interval support
 */
export async function getTokenPrice(symbol: string, interval: TimeInterval = "1h"): Promise<TokenPrice> {
  try {
    console.log(`📊 Fetching price for ${symbol} (${interval})`)

    // Check cache first
    const cached = getCachedPrice(symbol, interval)
    if (cached) {
      console.log(`✅ Using cached price for ${symbol} (${interval})`)
      return cached
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const basePrice = MOCK_PRICES[symbol] || 1.0

    // Generate realistic price movement
    const priceVariation = (Math.random() - 0.5) * 0.1 // ±5% variation
    const currentPrice = basePrice * (1 + priceVariation)

    // Generate 24h change
    const change24h = (Math.random() - 0.5) * 20 // ±10% change

    // Generate price history for the selected interval
    const priceHistory = generatePriceHistory(currentPrice, interval)

    const tokenPrice: TokenPrice = {
      currentPrice,
      changePercent24h: change24h,
      priceHistory,
      volume24h: Math.random() * 1000000,
      marketCap: currentPrice * (Math.random() * 100000000),
      lastUpdated: Date.now(),
    }

    // Cache the result
    setCachedPrice(symbol, interval, tokenPrice)

    console.log(`✅ Price fetched for ${symbol}: $${currentPrice.toFixed(6)} (${interval})`)
    return tokenPrice
  } catch (error) {
    console.error(`❌ Error fetching price for ${symbol}:`, error)

    // Return fallback data
    const fallbackPrice = MOCK_PRICES[symbol] || 1.0
    return {
      currentPrice: fallbackPrice,
      changePercent24h: 0,
      priceHistory: generatePriceHistory(fallbackPrice, interval),
      lastUpdated: Date.now(),
    }
  }
}

/**
 * Get price change for a specific interval
 */
export async function getPriceChange(symbol: string, interval: TimeInterval): Promise<number> {
  try {
    const priceData = await getTokenPrice(symbol, interval)
    return priceData.changePercent24h
  } catch (error) {
    console.error(`❌ Error fetching price change for ${symbol}:`, error)
    return 0
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number, symbol?: string): string {
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
 * Format price change with color indication
 */
export function formatPriceChange(change: number, includeSign = false): string {
  const sign = includeSign ? (change >= 0 ? "+" : "") : ""
  return `${sign}${change.toFixed(2)}%`
}

// Clear cache for a specific token or all tokens
export function clearPriceCache(symbol?: string): void {
  if (symbol) {
    priceCache.delete(symbol)
    console.log(`🗑️ Cleared cache for ${symbol}`)
  } else {
    priceCache.clear()
    console.log("🗑️ Cleared all price cache")
  }
}

// Get all cached symbols
export function getCachedSymbols(): string[] {
  return Array.from(priceCache.keys())
}

// Update price for a specific token and interval
export async function updateTokenPrice(symbol: string, interval: TimeInterval): Promise<TokenPrice> {
  // Force cache miss by clearing the specific entry
  const tokenCache = priceCache.get(symbol)
  if (tokenCache) {
    tokenCache.delete(interval)
  }

  return await getTokenPrice(symbol, interval)
}

// Auto-update prices for short intervals
let updateInterval: NodeJS.Timeout | null = null

export function startPriceUpdates(): void {
  if (updateInterval) return

  updateInterval = setInterval(() => {
    TOKENS.forEach((token) => {
      // Update 1M and 5M intervals more frequently
      updateTokenPrice(token.symbol, "1m")
      if (Math.random() > 0.7) {
        // 30% chance
        updateTokenPrice(token.symbol, "5m")
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
