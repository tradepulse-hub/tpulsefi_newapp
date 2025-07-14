// Token Price Service for fetching current prices and historical data

import { getRealQuote, TOKENS } from "./swap-service"

export interface PriceData {
  timestamp: number
  price: number
}

export interface TokenPrice {
  symbol: string
  currentPrice: number
  changePercent24h: number
  changeAmount24h: number
  priceHistory: PriceData[]
  lastUpdated: number
}

// Mock price data - in a real app, this would fetch from an API like CoinGecko
const MOCK_PRICES: Record<string, TokenPrice> = {
  WLD: {
    symbol: "WLD",
    currentPrice: 2.45,
    changePercent24h: 5.14,
    changeAmount24h: 0.12,
    priceHistory: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 2.33 },
      { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 2.28 },
      { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 2.35 },
      { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 2.41 },
      { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 2.38 },
      { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 2.42 },
      { timestamp: Date.now(), price: 2.45 },
    ],
    lastUpdated: Date.now(),
  },
  TPF: {
    symbol: "TPF",
    currentPrice: 0.0234,
    changePercent24h: -4.87,
    changeAmount24h: -0.0012,
    priceHistory: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 0.0246 },
      { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 0.0251 },
      { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 0.0248 },
      { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 0.0242 },
      { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 0.0238 },
      { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 0.0236 },
      { timestamp: Date.now(), price: 0.0234 },
    ],
    lastUpdated: Date.now(),
  },
  USDC: {
    symbol: "USDC",
    currentPrice: 1.0,
    changePercent24h: 0.1,
    changeAmount24h: 0.001,
    priceHistory: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 0.999 },
      { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 1.001 },
      { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 0.998 },
      { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 1.002 },
      { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 0.999 },
      { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 1.001 },
      { timestamp: Date.now(), price: 1.0 },
    ],
    lastUpdated: Date.now(),
  },
  WDD: {
    symbol: "WDD",
    currentPrice: 0.156,
    changePercent24h: 5.41,
    changeAmount24h: 0.008,
    priceHistory: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 0.148 },
      { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 0.151 },
      { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 0.149 },
      { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 0.153 },
      { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 0.155 },
      { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 0.154 },
      { timestamp: Date.now(), price: 0.156 },
    ],
    lastUpdated: Date.now(),
  },
  TPT: {
    symbol: "TPT",
    currentPrice: 0.0089,
    changePercent24h: -3.26,
    changeAmount24h: -0.0003,
    priceHistory: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 0.0092 },
      { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 0.0094 },
      { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 0.0091 },
      { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 0.009 },
      { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 0.0088 },
      { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 0.0089 },
      { timestamp: Date.now(), price: 0.0089 },
    ],
    lastUpdated: Date.now(),
  },
}

// Base token for price calculations (USDC as reference)
const BASE_TOKEN_ADDRESS = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1" // USDC
const BASE_TOKEN_SYMBOL = "USDC"

// Amount to use for price calculations (1 token)
const PRICE_CALCULATION_AMOUNT = "1"

class TokenPriceService {
  private priceCache: Map<string, TokenPrice> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly HISTORY_STORAGE_KEY = "token_price_history"
  private readonly MAX_HISTORY_POINTS = 24 // 24 hours of data

  constructor() {
    this.loadHistoryFromStorage()
  }

  private loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem(this.HISTORY_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([symbol, history]) => {
          if (Array.isArray(history)) {
            const tokenPrice = this.priceCache.get(symbol) || this.createEmptyTokenPrice(symbol)
            tokenPrice.priceHistory = history as PriceData[]
            this.priceCache.set(symbol, tokenPrice)
          }
        })
        console.log("📊 Loaded price history from localStorage")
      }
    } catch (error) {
      console.error("❌ Error loading price history from localStorage:", error)
    }
  }

  private saveHistoryToStorage() {
    try {
      const historyData: Record<string, PriceData[]> = {}
      this.priceCache.forEach((tokenPrice, symbol) => {
        if (tokenPrice.priceHistory.length > 0) {
          historyData[symbol] = tokenPrice.priceHistory
        }
      })
      localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(historyData))
      console.log("💾 Saved price history to localStorage")
    } catch (error) {
      console.error("❌ Error saving price history to localStorage:", error)
    }
  }

  private createEmptyTokenPrice(symbol: string): TokenPrice {
    return {
      symbol,
      currentPrice: 0,
      changePercent24h: 0,
      changeAmount24h: 0,
      priceHistory: [],
      lastUpdated: 0,
    }
  }

  private getTokenBySymbol(symbol: string) {
    return TOKENS.find((token) => token.symbol === symbol)
  }

  private async getRealTokenPrice(symbol: string): Promise<number> {
    try {
      console.log(`🔄 Getting real price for ${symbol} via Holdstation SDK`)

      const token = this.getTokenBySymbol(symbol)
      if (!token) {
        throw new Error(`Token ${symbol} not found`)
      }

      // Skip price calculation for USDC (base token)
      if (symbol === BASE_TOKEN_SYMBOL) {
        return 1.0
      }

      // Get quote from token to USDC
      const { outputAmount } = await getRealQuote(PRICE_CALCULATION_AMOUNT, token.address, BASE_TOKEN_ADDRESS)

      const price = Number.parseFloat(outputAmount) || 0
      console.log(`💰 ${symbol} price: $${price.toFixed(4)}`)

      return price
    } catch (error) {
      console.error(`❌ Error getting price for ${symbol}:`, error)

      // Return fallback prices if real price fails
      const fallbackPrices: Record<string, number> = {
        WLD: 2.45,
        TPF: 0.0012,
        USDC: 1.0,
      }

      return fallbackPrices[symbol] || 0.001
    }
  }

  private addPriceToHistory(symbol: string, price: number) {
    const tokenPrice = this.priceCache.get(symbol) || this.createEmptyTokenPrice(symbol)
    const now = Date.now()

    // Add new price point
    tokenPrice.priceHistory.push({
      timestamp: now,
      price: price,
    })

    // Keep only last MAX_HISTORY_POINTS
    if (tokenPrice.priceHistory.length > this.MAX_HISTORY_POINTS) {
      tokenPrice.priceHistory = tokenPrice.priceHistory.slice(-this.MAX_HISTORY_POINTS)
    }

    // Calculate 24h change
    if (tokenPrice.priceHistory.length >= 2) {
      const oldestPrice = tokenPrice.priceHistory[0].price
      const currentPrice = price

      tokenPrice.changeAmount24h = currentPrice - oldestPrice
      tokenPrice.changePercent24h = oldestPrice > 0 ? ((currentPrice - oldestPrice) / oldestPrice) * 100 : 0
    }

    tokenPrice.currentPrice = price
    tokenPrice.lastUpdated = now

    this.priceCache.set(symbol, tokenPrice)
    this.saveHistoryToStorage()
  }

  private generateMissingHistoryPoints(symbol: string, currentPrice: number) {
    const tokenPrice = this.priceCache.get(symbol) || this.createEmptyTokenPrice(symbol)
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    // If we don't have enough history, generate some realistic data
    if (tokenPrice.priceHistory.length < this.MAX_HISTORY_POINTS) {
      const pointsToGenerate = this.MAX_HISTORY_POINTS - tokenPrice.priceHistory.length
      const basePrice = currentPrice

      for (let i = pointsToGenerate; i > 0; i--) {
        const timestamp = now - i * oneHour
        // Generate realistic price variation (±5% random walk)
        const variation = (Math.random() - 0.5) * 0.1 // ±5%
        const price = basePrice * (1 + variation * (i / pointsToGenerate))

        tokenPrice.priceHistory.unshift({
          timestamp,
          price: Math.max(0.0001, price), // Ensure price is never negative or zero
        })
      }

      this.priceCache.set(symbol, tokenPrice)
      this.saveHistoryToStorage()
    }
  }

  async getTokenPrice(symbol: string): Promise<TokenPrice> {
    const cached = this.priceCache.get(symbol)
    const now = Date.now()

    // Return cached data if still valid
    if (cached && now - cached.lastUpdated < this.CACHE_DURATION) {
      console.log(`📋 Using cached price for ${symbol}`)
      return cached
    }

    try {
      console.log(`🔄 Fetching fresh price for ${symbol}`)

      // Get real price from Holdstation SDK
      const currentPrice = await this.getRealTokenPrice(symbol)

      // Add to history and calculate changes
      this.addPriceToHistory(symbol, currentPrice)

      // Generate missing history points if needed
      this.generateMissingHistoryPoints(symbol, currentPrice)

      const tokenPrice = this.priceCache.get(symbol)!
      console.log(
        `✅ Updated price for ${symbol}: $${currentPrice.toFixed(4)} (${tokenPrice.changePercent24h.toFixed(2)}%)`,
      )

      return tokenPrice
    } catch (error) {
      console.error(`❌ Error fetching price for ${symbol}:`, error)

      // Return cached data if available, even if expired
      if (cached) {
        return cached
      }

      // Return empty data as fallback
      return this.createEmptyTokenPrice(symbol)
    }
  }

  async refreshAllPrices(): Promise<void> {
    console.log("🔄 Refreshing all token prices...")

    const promises = TOKENS.map((token) => this.getTokenPrice(token.symbol))

    try {
      await Promise.all(promises)
      console.log("✅ All token prices refreshed")
    } catch (error) {
      console.error("❌ Error refreshing token prices:", error)
    }
  }

  getPriceHistory(symbol: string): PriceData[] {
    const tokenPrice = this.priceCache.get(symbol)
    return tokenPrice?.priceHistory || []
  }

  clearPriceHistory(): void {
    this.priceCache.clear()
    localStorage.removeItem(this.HISTORY_STORAGE_KEY)
    console.log("🗑️ Cleared all price history")
  }
}

// Create singleton instance
const tokenPriceService = new TokenPriceService()

// Export service methods
export const getTokenPrice = (symbol: string) => tokenPriceService.getTokenPrice(symbol)
export const refreshAllPrices = () => tokenPriceService.refreshAllPrices()
export const getPriceHistory = (symbol: string) => tokenPriceService.getPriceHistory(symbol)
export const clearPriceHistory = () => tokenPriceService.clearPriceHistory()

// Utility functions for formatting
export function formatPrice(price: number): string {
  if (price === 0) return "$0.00"
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  if (price < 100) return `$${price.toFixed(2)}`
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPriceChange(change: number, isPercentage = false): string {
  const sign = change >= 0 ? "+" : ""
  if (isPercentage) {
    return `${sign}${change.toFixed(2)}%`
  }
  return `${sign}${formatPrice(Math.abs(change))}`
}

// Auto-refresh prices every 5 minutes
setInterval(
  () => {
    tokenPriceService.refreshAllPrices()
  },
  5 * 60 * 1000,
)
