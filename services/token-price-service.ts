import { ethers } from "ethers"
import {
  Client,
  Multicall3,
  config,
  TokenProvider,
  HoldSo,
  ZeroX,
  inmemoryTokenStorage,
  SwapHelper,
} from "@holdstation/worldchain-sdk"

// Definindo TOKENS para corresponder ao serviço de swap e mini-carteira
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
]

// Configuração do SDK Holdstation
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })
const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)
const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldSwap = new HoldSo(tokenProvider, inmemoryTokenStorage)
const swapHelper = new SwapHelper(client, { tokenStorage: inmemoryTokenStorage })
swapHelper.load(zeroX)
swapHelper.load(worldSwap)

export type TimeInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "8h" | "1d"

export interface TokenPrice {
  symbol: string
  currentPrice: number
  changePercent24h: number
  volume24h: number
  priceHistory: { price: number; time: number }[]
}

// Helper para simular dados históricos para o gráfico
function generateMockPriceHistory(
  basePrice: number,
  interval: TimeInterval,
  numPoints: number,
): { price: number; time: number }[] {
  const history = []
  const currentTime = Date.now()
  let intervalMs = 0

  switch (interval) {
    case "1m":
      intervalMs = 60 * 1000
      break
    case "5m":
      intervalMs = 5 * 60 * 1000
      break
    case "15m":
      intervalMs = 15 * 60 * 1000
      break
    case "1h":
      intervalMs = 60 * 60 * 1000
      break
    case "4h":
      intervalMs = 4 * 60 * 60 * 1000
      break
    case "8h":
      intervalMs = 8 * 60 * 60 * 1000
      break
    case "1d":
      intervalMs = 24 * 60 * 60 * 1000
      break
  }

  for (let i = 0; i < numPoints; i++) {
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.1) // Variação de +/- 5%
    history.unshift({ price, time: currentTime - i * intervalMs })
  }
  return history
}

// Replace the existing `getRealTokenPrice` function with the following:
async function getRealTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    const usdcAddress = "0x0b2C639c533813f4Aa9D2FDf37Fc2969E73aeF8C" // USDC address on Worldchain

    if (tokenSymbol === "USDC") {
      return 1.0
    }

    const token = TOKENS.find((t) => t.symbol === tokenSymbol)
    if (!token) {
      console.warn(`Token ${tokenSymbol} not found in TOKENS list.`)
      return 0
    }

    console.log(`🔄 Getting real price for ${tokenSymbol} via Holdstation SDK quote...`)

    const tryQuote = async (amountIn: string, tokenInAddr: string, tokenOutAddr: string): Promise<number | null> => {
      try {
        const quote = await swapHelper.estimate.quote({
          tokenIn: tokenInAddr,
          tokenOut: tokenOutAddr,
          amountIn: amountIn,
          slippage: "0.5",
          fee: "0",
          feeReceiver: ethers.ZeroAddress,
        })

        if (quote && quote.outAmount) {
          const parsedOutAmount = Number.parseFloat(quote.outAmount)
          if (parsedOutAmount > 0) {
            return parsedOutAmount / Number.parseFloat(amountIn)
          }
        }
      } catch (e) {
        console.warn(`Quote attempt failed for ${tokenInAddr} -> ${tokenOutAddr} with amount ${amountIn}:`, e)
      }
      return null
    }

    // Strategy 1: Try quoting 1 unit of token to USDC
    let price = await tryQuote("1", token.address, usdcAddress)
    if (price !== null && price > 0) {
      console.log(`✅ Price for ${tokenSymbol} (1 unit direct): $${price}`)
      return price
    }

    // Strategy 2: If Strategy 1 fails or returns 0, try quoting a larger amount (e.g., 1000 units)
    // This helps with very low-value tokens where 1 unit might result in 0 output due to precision.
    const largeAmountIn = "1000" // Try with 1000 units
    price = await tryQuote(largeAmountIn, token.address, usdcAddress)
    if (price !== null && price > 0) {
      console.log(`✅ Price for ${tokenSymbol} (${largeAmountIn} units direct): $${price}`)
      return price
    }

    // Strategy 3: If direct quotes fail, try reverse quote (USDC to token) and invert the price
    price = await tryQuote("1", usdcAddress, token.address) // Quote 1 USDC to token
    if (price !== null && price > 0) {
      const invertedPrice = 1 / price
      console.log(`✅ Price for ${tokenSymbol} (1 USDC reverse): $${invertedPrice}`)
      return invertedPrice
    }

    // Strategy 4: If reverse quote with 1 USDC fails, try with a larger USDC amount
    price = await tryQuote(largeAmountIn, usdcAddress, token.address) // Quote 1000 USDC to token
    if (price !== null && price > 0) {
      const invertedPrice = 1 / (price / Number.parseFloat(largeAmountIn)) // price is total output for largeAmountIn USDC
      console.log(`✅ Price for ${tokenSymbol} (${largeAmountIn} USDC reverse): $${invertedPrice}`)
      return invertedPrice
    }

    console.warn(`Could not get a valid price for ${tokenSymbol} after multiple attempts.`)
    return 0
  } catch (error) {
    console.error(`❌ Error fetching real price for ${tokenSymbol}:`, error)
    return 0
  }
}

// Cache for price data by token and interval
const priceCache = new Map<string, Map<TimeInterval, TokenPrice>>()
const CACHE_DURATION = 30000 // 30 seconds cache

// Initialize cache for each token
TOKENS.forEach((token) => {
  priceCache.set(token.symbol, new Map())
})

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
    console.log(`📊 Fetching price for ${symbol} (${interval})`)

    // Check cache first
    const cached = getCachedPrice(symbol, interval)
    if (cached) {
      console.log(`✅ Using cached price for ${symbol} (${interval})`)
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
    const priceHistory = generateMockPriceHistory(currentPrice, interval, 50) // 50 points for history

    // Calculate volume and market cap estimates (simulated)
    const volume24h = currentPrice * (Math.random() * 1000000 + 100000)
    const marketCap = currentPrice * (Math.random() * 100000000 + 10000000)

    const tokenPrice: TokenPrice = {
      symbol,
      currentPrice,
      changePercent24h: change24h,
      priceHistory,
      volume24h,
      marketCap,
      lastUpdated: Date.now(),
    }

    // Cache the result
    setCachedPrice(symbol, interval, tokenPrice)

    console.log(`✅ Price fetched for ${symbol}: $${currentPrice.toFixed(8)} (${interval})`)
    return tokenPrice
  } catch (error) {
    console.error(`❌ Error fetching price for ${symbol}:`, error)

    // Return fallback data with zero price to indicate error
    return {
      symbol,
      currentPrice: 0,
      changePercent24h: 0,
      priceHistory: [],
      volume24h: 0,
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
    console.error(`❌ Error fetching current price for ${symbol}:`, error)
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
    console.error(`❌ Error fetching price change for ${symbol}:`, error)
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
        console.error(`Error fetching price for ${symbol}:`, error)
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

export { TOKENS }
