// Token Price Service for fetching current prices and historical data

import { getRealQuote, TOKENS } from "./swap-service"

export interface PricePoint {
  timestamp: number
  price: number
}

export interface TokenPrice {
  symbol: string
  currentPrice: number
  changeAmount24h: number
  changePercent24h: number
  priceHistory: PricePoint[]
  lastUpdated: number
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// Fallback prices for when API fails
const FALLBACK_PRICES: Record<string, number> = {
  WLD: 2.45,
  TPF: 0.0012,
  USDC: 1.0,
  WDD: 0.156,
  TPT: 0.0089,
}

// Get USDC token address for price quotes
const USDC_TOKEN = TOKENS.find((token) => token.symbol === "USDC")
const USDC_ADDRESS = USDC_TOKEN?.address || "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1"

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
      return FALLBACK_PRICES[tokenSymbol] || 0
    }

    console.log(`🔄 Getting real price for ${tokenSymbol} via Holdstation SDK`)

    // Get quote for 1 token against USDC
    const { outputAmount } = await getRealQuote("1", token.address, USDC_ADDRESS)
    const price = Number.parseFloat(outputAmount)

    console.log(`✅ Real price for ${tokenSymbol}: $${price}`)
    return price > 0 ? price : FALLBACK_PRICES[tokenSymbol] || 0
  } catch (error) {
    console.error(`❌ Error getting real price for ${tokenSymbol}:`, error)
    return FALLBACK_PRICES[tokenSymbol] || 0
  }
}

/**
 * Generate price history points for the last 24 hours
 */
function generatePriceHistory(currentPrice: number, symbol: string): PricePoint[] {
  const now = Date.now()
  const points: PricePoint[] = []

  // Get existing history from localStorage
  const existingData = getStoredPriceData(symbol)
  const existingHistory = existingData?.priceHistory || []

  // If we have existing history, use it as base and add current price
  if (existingHistory.length > 0) {
    // Filter points from last 24 hours
    const last24Hours = existingHistory.filter((point) => now - point.timestamp < 24 * 60 * 60 * 1000)

    // Add current price point
    const newPoint: PricePoint = {
      timestamp: now,
      price: currentPrice,
    }

    // Combine and limit to 24 points max
    const allPoints = [...last24Hours, newPoint]
    return allPoints.slice(-24)
  }

  // Generate initial 24-hour history with some realistic variation
  const basePrice = currentPrice
  const volatility = symbol === "USDC" ? 0.001 : 0.05 // USDC is more stable

  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000 // Every hour
    const variation = (Math.random() - 0.5) * volatility
    const price = Math.max(0.0001, basePrice * (1 + variation))

    points.push({ timestamp, price })
  }

  return points
}

/**
 * Calculate 24h price change
 */
function calculate24hChange(priceHistory: PricePoint[], currentPrice: number) {
  if (priceHistory.length < 2) {
    return { changeAmount24h: 0, changePercent24h: 0 }
  }

  const price24hAgo = priceHistory[0].price
  const changeAmount24h = currentPrice - price24hAgo
  const changePercent24h = price24hAgo > 0 ? (changeAmount24h / price24hAgo) * 100 : 0

  return { changeAmount24h, changePercent24h }
}

/**
 * Get stored price data from localStorage
 */
function getStoredPriceData(symbol: string): TokenPrice | null {
  try {
    const stored = localStorage.getItem(`token_price_${symbol}`)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error(`Error reading stored price data for ${symbol}:`, error)
    return null
  }
}

/**
 * Store price data in localStorage
 */
function storePriceData(priceData: TokenPrice): void {
  try {
    localStorage.setItem(`token_price_${priceData.symbol}`, JSON.stringify(priceData))
  } catch (error) {
    console.error(`Error storing price data for ${priceData.symbol}:`, error)
  }
}

/**
 * Get token price with caching and real-time data from Holdstation SDK
 */
export async function getTokenPrice(symbol: string): Promise<TokenPrice> {
  const now = Date.now()

  // Check cache first
  const cached = getStoredPriceData(symbol)
  if (cached && now - cached.lastUpdated < CACHE_DURATION) {
    console.log(`📦 Using cached price for ${symbol}`)
    return cached
  }

  try {
    // Get real price from Holdstation SDK
    const currentPrice = await getRealTokenPrice(symbol)

    // Generate/update price history
    const priceHistory = generatePriceHistory(currentPrice, symbol)

    // Calculate 24h changes
    const { changeAmount24h, changePercent24h } = calculate24hChange(priceHistory, currentPrice)

    const priceData: TokenPrice = {
      symbol,
      currentPrice,
      changeAmount24h,
      changePercent24h,
      priceHistory,
      lastUpdated: now,
    }

    // Store in localStorage
    storePriceData(priceData)

    console.log(`💾 Price data cached for ${symbol}:`, {
      price: currentPrice,
      change24h: `${changePercent24h.toFixed(2)}%`,
    })

    return priceData
  } catch (error) {
    console.error(`❌ Error fetching price for ${symbol}:`, error)

    // Return cached data if available, otherwise fallback
    if (cached) {
      console.log(`📦 Using stale cached data for ${symbol}`)
      return cached
    }

    // Create fallback price data
    const fallbackPrice = FALLBACK_PRICES[symbol] || 0
    const fallbackHistory = generatePriceHistory(fallbackPrice, symbol)

    return {
      symbol,
      currentPrice: fallbackPrice,
      changeAmount24h: 0,
      changePercent24h: 0,
      priceHistory: fallbackHistory,
      lastUpdated: now,
    }
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price === 0) return "$0.00"
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  if (price < 100) return `$${price.toFixed(2)}`
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format price change for display
 */
export function formatPriceChange(change: number, includeSign = false): string {
  const sign = includeSign ? (change >= 0 ? "+" : "") : ""

  if (Math.abs(change) < 0.01) {
    return `${sign}${change.toFixed(4)}${includeSign ? "%" : ""}`
  }

  return `${sign}${change.toFixed(2)}${includeSign ? "%" : ""}`
}

/**
 * Clear all cached price data
 */
export function clearPriceCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("token_price_"))
    keys.forEach((key) => localStorage.removeItem(key))
    console.log("🗑️ Price cache cleared")
  } catch (error) {
    console.error("Error clearing price cache:", error)
  }
}
