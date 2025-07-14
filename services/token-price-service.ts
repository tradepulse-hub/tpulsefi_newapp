// Token Price Service for fetching current prices and historical data

import { getRealQuote, TOKENS } from "./swap-service"

export interface PricePoint {
  timestamp: number
  price: number
}

export interface PriceData {
  timestamp: number
  price: number
  volume?: number
}

export interface TokenPrice {
  symbol: string
  currentPrice: number
  changeAmount24h: number
  changePercent24h: number
  priceHistory: Record<string, PricePoint[]>
  lastUpdated: number
}

export interface TokenPriceInfo {
  symbol: string
  currentPrice: number
  priceChange24h: number
  priceChangePercentage24h: number
  volume24h: number
  marketCap: number
  lastUpdated: number
}

// Price data cache with different intervals
interface TokenPriceCache {
  [tokenSymbol: string]: {
    [interval: string]: PriceData[]
  }
}

// Time intervals in milliseconds
export const TIME_INTERVALS = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
}

// Cache for storing price data
let priceCache: TokenPriceCache = {}

// Load cache from localStorage
function loadCacheFromStorage() {
  try {
    const stored = localStorage.getItem("tokenPriceCache")
    if (stored) {
      priceCache = JSON.parse(stored)
    }
  } catch (error) {
    console.warn("Failed to load price cache from storage:", error)
    priceCache = {}
  }
}

// Save cache to localStorage
function saveCacheToStorage() {
  try {
    localStorage.setItem("tokenPriceCache", JSON.stringify(priceCache))
  } catch (error) {
    console.warn("Failed to save price cache to storage:", error)
  }
}

// Initialize cache
loadCacheFromStorage()

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
      return getBasePriceForToken(tokenSymbol)
    }

    console.log(`🔄 Getting real price for ${tokenSymbol} via Holdstation SDK`)

    // Get quote for 1 token against USDC
    const { outputAmount } = await getRealQuote("1", token.address, "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1")
    const price = Number.parseFloat(outputAmount)

    console.log(`✅ Real price for ${tokenSymbol}: $${price}`)
    return price > 0 ? price : getBasePriceForToken(tokenSymbol)
  } catch (error) {
    console.error(`❌ Error getting real price for ${tokenSymbol}:`, error)
    return getBasePriceForToken(tokenSymbol)
  }
}

/**
 * Generate realistic price data for a token
 */
function generatePriceData(symbol: string, interval: string, count: number): PriceData[] {
  const basePrice = getBasePriceForToken(symbol)
  const intervalMs = TIME_INTERVALS[interval as keyof typeof TIME_INTERVALS]
  const now = Date.now()
  const data: PriceData[] = []

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs
    const volatility = getVolatilityForToken(symbol)
    const randomChange = (Math.random() - 0.5) * volatility
    const price = basePrice * (1 + randomChange + Math.sin(i * 0.1) * 0.02)

    data.push({
      timestamp,
      price: Math.max(0.001, price), // Ensure price is never negative or zero
      volume: Math.random() * 1000000 + 100000,
    })
  }

  return data
}

/**
 * Get base price for different tokens
 */
function getBasePriceForToken(symbol: string): number {
  const basePrices: { [key: string]: number } = {
    WLD: 2.45,
    TPF: 0.0234,
    USDC: 1.0,
    WDD: 0.156,
    TPT: 0.0089,
  }
  return basePrices[symbol] || 1.0
}

/**
 * Get volatility factor for different tokens
 */
function getVolatilityForToken(symbol: string): number {
  const volatilities: { [key: string]: number } = {
    WLD: 0.05, // 5% volatility
    TPF: 0.08, // 8% volatility
    USDC: 0.001, // 0.1% volatility (stable coin)
    WDD: 0.12, // 12% volatility
    TPT: 0.15, // 15% volatility
  }
  return volatilities[symbol] || 0.05
}

/**
 * Get data points count for different intervals
 */
function getDataPointsForInterval(interval: string): number {
  const dataPoints: { [key: string]: number } = {
    "1m": 60, // 1 hour of 1-minute data
    "5m": 72, // 6 hours of 5-minute data
    "15m": 96, // 24 hours of 15-minute data
    "1h": 168, // 7 days of hourly data
    "4h": 180, // 30 days of 4-hour data
    "8h": 90, // 30 days of 8-hour data
    "1d": 365, // 1 year of daily data
  }
  return dataPoints[interval] || 100
}

/**
 * Get or generate price data for a token and interval
 */
export function getPriceData(symbol: string, interval = "1h"): PriceData[] {
  // Initialize token cache if it doesn't exist
  if (!priceCache[symbol]) {
    priceCache[symbol] = {}
  }

  // Initialize interval cache if it doesn't exist
  if (!priceCache[symbol][interval]) {
    const dataPoints = getDataPointsForInterval(interval)
    priceCache[symbol][interval] = generatePriceData(symbol, interval, dataPoints)
    saveCacheToStorage()
  }

  return priceCache[symbol][interval]
}

/**
 * Add new price point to existing data
 */
export function addPricePoint(symbol: string, interval: string, price: number) {
  const data = getPriceData(symbol, interval)
  const now = Date.now()
  const intervalMs = TIME_INTERVALS[interval as keyof typeof TIME_INTERVALS]

  // Check if we need to add a new point based on interval
  const lastPoint = data[data.length - 1]
  if (!lastPoint || now - lastPoint.timestamp >= intervalMs) {
    const newPoint: PriceData = {
      timestamp: now,
      price,
      volume: Math.random() * 1000000 + 100000,
    }

    data.push(newPoint)

    // Keep only the required number of data points
    const maxPoints = getDataPointsForInterval(interval)
    if (data.length > maxPoints) {
      data.splice(0, data.length - maxPoints)
    }

    saveCacheToStorage()
  }
}

/**
 * Get current price for a token
 */
export function getCurrentPrice(symbol: string): number {
  const data = getPriceData(symbol, "1m")
  return data[data.length - 1]?.price || getBasePriceForToken(symbol)
}

/**
 * Get price change percentage for a specific interval
 */
export function getPriceChange(symbol: string, interval = "1h"): number {
  const data = getPriceData(symbol, interval)
  if (data.length < 2) return 0

  const currentPrice = data[data.length - 1].price
  const previousPrice = data[0].price

  return ((currentPrice - previousPrice) / previousPrice) * 100
}

/**
 * Update prices for all tokens (simulated real-time updates)
 */
export function updateAllPrices() {
  TOKENS.forEach((token) => {
    const currentPrice = getCurrentPrice(token.symbol)
    const volatility = getVolatilityForToken(token.symbol)
    const change = (Math.random() - 0.5) * volatility * 0.1 // Smaller changes for updates
    const newPrice = Math.max(0.001, currentPrice * (1 + change))

    // Update 1-minute data (most frequent)
    addPricePoint(token.symbol, "1m", newPrice)

    // Occasionally update other intervals
    if (Math.random() < 0.1) {
      // 10% chance
      addPricePoint(token.symbol, "5m", newPrice)
    }
    if (Math.random() < 0.05) {
      // 5% chance
      addPricePoint(token.symbol, "15m", newPrice)
    }
  })
}

/**
 * Format price based on token
 */
export function formatPrice(price: number, symbol: string): string {
  if (symbol === "USDC") {
    return `$${price.toFixed(4)}`
  }

  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  } else if (price < 1) {
    return `$${price.toFixed(4)}`
  } else {
    return `$${price.toFixed(2)}`
  }
}

/**
 * Format timestamp based on interval
 */
export function formatTimestamp(timestamp: number, interval: string): string {
  const date = new Date(timestamp)

  switch (interval) {
    case "1m":
    case "5m":
    case "15m":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    case "1h":
    case "4h":
    case "8h":
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        hour12: false,
      })
    case "1d":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    default:
      return date.toLocaleTimeString()
  }
}

/**
 * Clear cache for a specific token or all tokens
 */
export function clearPriceCache(symbol?: string) {
  if (symbol) {
    delete priceCache[symbol]
  } else {
    priceCache = {}
  }
  saveCacheToStorage()
}

/**
 * Start automatic price updates
 */
let updateInterval: NodeJS.Timeout | null = null

export function startPriceUpdates() {
  if (updateInterval) return

  // Update prices every 30 seconds
  updateInterval = setInterval(updateAllPrices, 30000)

  // Initial update
  updateAllPrices()
}

export function stopPriceUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

// Auto-start price updates
if (typeof window !== "undefined") {
  startPriceUpdates()
}
