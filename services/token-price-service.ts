// Token Price Service for fetching current prices and historical data using Holdstation SDK

import { ethers } from "ethers"
import { config, HoldSo, inmemoryTokenStorage, SwapHelper, TokenProvider, ZeroX } from "@holdstation/worldchain-sdk"
import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6"

// Since TOKENS is not exported from swap-service, we define it here
// Ensure this list is consistent across all files that use it (mini-wallet, swap-service)
const TOKENS = [
  {
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    symbol: "WLD",
    name: "Worldcoin",
    decimals: 18,
    logo: "/images/worldcoin.jpeg",
    color: "#000000",
  },
  {
    address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    symbol: "TPF",
    name: "TPulseFi",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#00D4FF",
  },
  {
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B", // Updated WDD address
    symbol: "WDD",
    name: "Drachma", // Updated name
    decimals: 18,
    logo: "/images/drachma-token.png", // Updated logo path
    color: "#FFD700",
  },
  {
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "/images/usdc.png",
    color: "#2775CA",
  },
  {
    address: "0x5fa570E9c8514cdFaD81DB6ce0A327D55251fBD4",
    symbol: "KPP",
    name: "KeplerPay",
    decimals: 18,
    logo: "/images/keplerpay-logo.png",
    color: "#6A0DAD",
  },
]

// Time intervals in milliseconds
export const TIME_INTERVALS = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
} as const

export type TimeInterval = keyof typeof TIME_INTERVALS

// TokenPrice interface
export interface TokenPrice {
  currentPrice: number
  changePercent24h: number
  priceHistory: Array<{ time: number; price: number }>
  volume24h?: number
  marketCap?: number
  lastUpdated: number
}

// Cache for price data by token and interval
const priceCache = new Map<string, Map<TimeInterval, TokenPrice>>()
const CACHE_DURATION = 30000 // 30 seconds cache

// Initialize cache for each token
TOKENS.forEach((token) => {
  priceCache.set(token.symbol, new Map())
})

// SDK setup (copied from swap-service.ts and mini-wallet.tsx for consistency)
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })
const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)
const swapHelper = new SwapHelper(client, { tokenStorage: inmemoryTokenStorage })
const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldSwap = new HoldSo(tokenProvider, inmemoryTokenStorage)
swapHelper.load(zeroX)
swapHelper.load(worldSwap)

/**
 * Get real-time token price using swapHelper.estimate.quote
 * This function will now get the price of 1 unit of tokenSymbol in USDC.
 */
async function getRealTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    if (tokenSymbol === "USDC") {
      return 1.0 // USDC price is always 1.0 against itself
    }

    const tokenIn = TOKENS.find((t) => t.symbol === tokenSymbol)
    const tokenOut = TOKENS.find((t) => t.symbol === "USDC") // Always quote against USDC

    if (!tokenIn) {
      // console.warn(`Token ${tokenSymbol} not found in TOKENS list for price fetching.`)
      return 0
    }
    if (!tokenOut) {
      // console.error(`USDC token not found in TOKENS list. This is a configuration error.`)
      return 0
    }

    // console.log(`🔄 Getting real price for ${tokenSymbol} in USDC via Holdstation SDK quote...`)

    // We want the price of 1 unit of tokenIn in terms of tokenOut (USDC)
    // So, we quote 1 unit of tokenIn to tokenOut.
    const amountToQuote = "1" // Quote for 1 unit of the token

    const quote = await swapHelper.estimate.quote({
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      amountIn: amountToQuote,
      slippage: "0.3", // Standard slippage for price estimation
      // No fee or feeReceiver needed for price estimation, but including for consistency if required by SDK
      fee: "0",
      feeReceiver: ethers.ZeroAddress,
    })

    if (!quote || !quote.outAmount) {
      // console.warn(`No valid quote or outAmount received for ${tokenSymbol} to USDC. Quote:`, quote)
      return 0
    }

    const price = Number.parseFloat(quote.outAmount.toString())
    // console.log(`✅ Real price for 1 ${tokenSymbol} = ${price} USDC`)
    return price > 0 ? price : 0
  } catch (error) {
    // console.error(`❌ Error getting real price for ${tokenSymbol} in USDC:`, error)
    return 0
  }
}

/**
 * Generate realistic price history based on current price
 */
function generatePriceHistory(
  currentPrice: number,
  interval: TimeInterval,
  points = 50,
): Array<{ time: number; price: number }> {
  const now = Date.now()
  const intervalMs = TIME_INTERVALS[interval]
  const data: Array<{ time: number; price: number }> = []

  // Start from a base price and work towards current price
  let basePrice = currentPrice * (0.95 + Math.random() * 0.1) // ±5% variation from current

  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * intervalMs

    // Add realistic price movement
    const volatility = interval === "1m" ? 0.002 : interval === "5m" ? 0.005 : 0.01
    const change = (Math.random() - 0.5) * volatility

    // Gradually trend towards current price
    const trendFactor = (points - i) / points
    const targetPrice = basePrice + (currentPrice - basePrice) * trendFactor

    basePrice = Math.max(targetPrice * (1 + change), 0.000001)

    data.push({
      time,
      price: Number.parseFloat(basePrice.toFixed(8)),
    })
  }

  // Ensure last point is current price
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice
  }

  return data
}

/**
 * Get cached price data or return null if expired
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

/**
 * Store price data in cache
 */
function setCachedPrice(symbol: string, interval: TimeInterval, data: TokenPrice): void {
  if (!priceCache.has(symbol)) {
    priceCache.set(symbol, new Map())
  }

  const tokenCache = priceCache.get(symbol)!
  tokenCache.set(interval, data)
}

/**
 * Main function to get token price with mock data
 */
export async function getTokenPrice(symbol: string, interval: TimeInterval = "1h"): Promise<TokenPrice> {
  try {
    // console.log(`📊 Fetching price for ${symbol} (${interval})`)

    // Check cache first
    const cached = getCachedPrice(symbol, interval)
    if (cached) {
      // console.log(`✅ Using cached price for ${symbol} (${interval})`)
      return cached
    }

    // Get real current price
    const currentPrice = await getRealTokenPrice(symbol)

    if (currentPrice === 0) {
      throw new Error(`Failed to get price for ${symbol}`)
    }

    // Generate realistic 24h change (simulate market movement)
    const change24h = (Math.random() - 0.5) * 10 // ±5% change

    // Generate price history based on current real price
    const priceHistory = generatePriceHistory(currentPrice, interval)

    // Calculate volume and market cap estimates
    const volume24h = currentPrice * (Math.random() * 1000000 + 100000) // Random volume
    const marketCap = currentPrice * (Math.random() * 100000000 + 10000000) // Random market cap

    const tokenPrice: TokenPrice = {
      currentPrice,
      changePercent24h: change24h,
      priceHistory,
      volume24h,
      marketCap,
      lastUpdated: Date.now(),
    }

    // Cache the result
    setCachedPrice(symbol, interval, tokenPrice)

    // console.log(`✅ Price fetched for ${symbol}: $${currentPrice.toFixed(8)} (${interval})`)
    return tokenPrice
  } catch (error) {
    // console.error(`❌ Error fetching price for ${symbol}:`, error)

    // Return fallback data with zero price to indicate error
    return {
      currentPrice: 0,
      changePercent24h: 0,
      priceHistory: [],
      lastUpdated: Date.now(),
    }
  }
}

/**
 * Get current token price only (faster method)
 */
export async function getCurrentTokenPrice(symbol: string): Promise<number> {
  try {
    return await getRealTokenPrice(symbol)
  } catch (error) {
    // console.error(`❌ Error fetching current price for ${symbol}:`, error)
    return 0
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
    // console.error(`❌ Error fetching price change for ${symbol}:`, error)
    return 0
  }
}

/**
 * Format price based on token type and value
 */
export function formatPrice(price: number, symbol?: string): string {
  if (price === 0) return "$0.00"

  if (symbol === "USDC") {
    return `$${price.toFixed(4)}`
  }

  if (price < 0.000001) {
    return `$${price.toExponential(2)}`
  }

  if (price < 0.01) {
    return `$${price.toFixed(8)}`
  }

  if (price < 1) {
    return `$${price.toFixed(6)}`
  }

  if (price < 1000) {
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

/**
 * Format time based on interval
 */
export function formatTime(timestamp: number, interval: TimeInterval): string {
  const date = new Date(timestamp)

  switch (interval) {
    case "1m":
    case "5m":
    case "15m":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    case "1h":
    case "4h":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    case "8h":
    case "1d":
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

/**
 * Update price for a specific token and interval (force refresh)
 */
export async function updateTokenPrice(symbol: string, interval: TimeInterval): Promise<TokenPrice> {
  // Force cache miss by clearing the specific entry
  const tokenCache = priceCache.get(symbol)
  if (tokenCache) {
    tokenCache.delete(interval)
  }

  return await getTokenPrice(symbol, interval)
}

/**
 * Get multiple token prices at once
 */
export async function getMultipleTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {}

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        prices[symbol] = await getRealTokenPrice(symbol)
      } catch (error) {
        // console.error(`Error fetching price for ${symbol}:`, error)
        prices[symbol] = 0
      }
    }),
  )

  return prices
}

// Auto-update prices for short intervals
let updateInterval: NodeJS.Timeout | null = null

export function startPriceUpdates(): void {
  if (updateInterval) return

  updateInterval = setInterval(() => {
    TOKENS.forEach((token) => {
      // Update 1m and 5m intervals more frequently
      updateTokenPrice(token.symbol, "1m").catch(console.error)
      if (Math.random() > 0.7) {
        // 30% chance
        updateTokenPrice(token.symbol, "5m").catch(console.error)
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

// Start updates when module loads (only in browser)
if (typeof window !== "undefined") {
  startPriceUpdates()
}
