import { Mutex } from "async-mutex"
import NodeCache from "node-cache"
import { ethers } from "ethers"

// Types
interface SwapQuote {
  inputAmount: string
  outputAmount: string
  route: any
  gasEstimate: string
  priceImpact: string
  timestamp: number
}

interface SwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  slippage?: number
  userAddress: string
}

interface SwapResult {
  success: boolean
  transactionHash?: string
  error?: string
  outputAmount?: string
  gasUsed?: string
}

// Configuration
const SWAP_CONFIG = {
  MAX_SLIPPAGE: 15, // 15% maximum slippage for testing
  QUOTE_CACHE_TTL: 30, // 30 seconds
  MAX_RETRIES: 2,
  RETRY_DELAYS: [3000, 8000], // 3s, 8s
  RATE_LIMIT: {
    MAX_REQUESTS: 15, // Reduced from 20
    WINDOW_MS: 60000, // 1 minute
  },
  TIMEOUTS: {
    QUOTE: 30000, // 30 seconds
    SWAP: 60000, // 60 seconds
  },
  MIN_AMOUNT: "0.01", // Minimum swap amount
}

// Global instances
const swapMutex = new Mutex()
const quoteCache = new NodeCache({ stdTTL: SWAP_CONFIG.QUOTE_CACHE_TTL })
const rateLimiter = new Map<string, number[]>()

// Rate limiting
function checkRateLimit(identifier = "default"): boolean {
  const now = Date.now()
  const requests = rateLimiter.get(identifier) || []

  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp) => now - timestamp < SWAP_CONFIG.RATE_LIMIT.WINDOW_MS)

  console.log(`🚦 RATE LIMITER: ${validRequests.length}/${SWAP_CONFIG.RATE_LIMIT.MAX_REQUESTS} requests in last minute`)

  if (validRequests.length >= SWAP_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
    return false
  }

  validRequests.push(now)
  rateLimiter.set(identifier, validRequests)
  return true
}

// Logging utility
function logSwap(level: "INFO" | "ERROR" | "WARN", message: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `${timestamp} SWAP`

  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2))
  } else {
    console.log(`${prefix} ${message}`)
  }
}

// Validation functions
function validateSwapParams(params: SwapParams): string | null {
  if (!params.tokenIn || !params.tokenOut) {
    return "Token addresses are required"
  }

  if (!params.amountIn || Number.parseFloat(params.amountIn) <= 0) {
    return "Valid amount is required"
  }

  if (Number.parseFloat(params.amountIn) < Number.parseFloat(SWAP_CONFIG.MIN_AMOUNT)) {
    return `Minimum swap amount is ${SWAP_CONFIG.MIN_AMOUNT}`
  }

  if (!params.userAddress || !ethers.isAddress(params.userAddress)) {
    return "Valid user address is required"
  }

  if (params.tokenIn.toLowerCase() === params.tokenOut.toLowerCase()) {
    return "Cannot swap same token"
  }

  return null
}

function validateQuoteData(quote: any): boolean {
  return !!(quote && quote.outputAmount && quote.route && Number.parseFloat(quote.outputAmount) > 0)
}

function validateTransactionData(txData: any): boolean {
  return !!(
    txData &&
    txData.to &&
    txData.data &&
    txData.data.length > 2 && // Must have actual data
    txData.value !== undefined
  )
}

// Get fresh quote
async function getFreshQuote(params: SwapParams): Promise<SwapQuote | null> {
  const cacheKey = `quote_${params.tokenIn}_${params.tokenOut}_${params.amountIn}`

  // Check cache first
  const cached = quoteCache.get<SwapQuote>(cacheKey)
  if (cached && Date.now() - cached.timestamp < SWAP_CONFIG.QUOTE_CACHE_TTL * 1000) {
    logSwap("INFO", "📋 Using cached quote", { age: Date.now() - cached.timestamp })
    return cached
  }

  if (!checkRateLimit("quote")) {
    throw new Error("Rate limit exceeded for quotes")
  }

  try {
    logSwap("INFO", "🔍 Fetching fresh quote from Holdstation...", {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      slippage: SWAP_CONFIG.MAX_SLIPPAGE,
    })

    // Mock Holdstation quote call - replace with actual implementation
    const response = await fetch("/api/holdstation/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        slippage: SWAP_CONFIG.MAX_SLIPPAGE,
      }),
      signal: AbortSignal.timeout(SWAP_CONFIG.TIMEOUTS.QUOTE),
    })

    if (!response.ok) {
      throw new Error(`Quote API failed: ${response.status} ${response.statusText}`)
    }

    const quoteData = await response.json()

    if (!validateQuoteData(quoteData)) {
      throw new Error("Invalid quote data received")
    }

    const quote: SwapQuote = {
      inputAmount: params.amountIn,
      outputAmount: quoteData.outputAmount,
      route: quoteData.route,
      gasEstimate: quoteData.gasEstimate || "0",
      priceImpact: quoteData.priceImpact || "0",
      timestamp: Date.now(),
    }

    // Cache the quote
    quoteCache.set(cacheKey, quote)

    logSwap("INFO", "✅ Fresh quote obtained", {
      outputAmount: quote.outputAmount,
      priceImpact: quote.priceImpact,
      gasEstimate: quote.gasEstimate,
    })

    return quote
  } catch (error: any) {
    logSwap("ERROR", "❌ Failed to get quote", {
      error: error.message,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
    })
    throw error
  }
}

// Execute swap with Holdstation
async function executeSwapWithHoldstation(params: SwapParams, quote: SwapQuote): Promise<SwapResult> {
  if (!checkRateLimit("swap")) {
    throw new Error("Rate limit exceeded for swaps")
  }

  try {
    logSwap("INFO", "🧪 HOLDSTATION: Testing SwapHelper with MAXIMUM SLIPPAGE (15%)...", {
      slippage: SWAP_CONFIG.MAX_SLIPPAGE,
      inputAmount: params.amountIn,
      expectedOutput: quote.outputAmount,
    })

    // Get transaction data from Holdstation
    const txResponse = await fetch("/api/holdstation/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        amountOutMin: quote.outputAmount,
        userAddress: params.userAddress,
        slippage: SWAP_CONFIG.MAX_SLIPPAGE,
        route: quote.route,
      }),
      signal: AbortSignal.timeout(SWAP_CONFIG.TIMEOUTS.SWAP),
    })

    if (!txResponse.ok) {
      throw new Error(`Swap API failed: ${txResponse.status} ${txResponse.statusText}`)
    }

    const txData = await txResponse.json()
    logSwap("INFO", "🎯 HOLDSTATION: Raw swap result:", txData)

    if (!validateTransactionData(txData)) {
      throw new Error("Invalid transaction data received from Holdstation")
    }

    logSwap("INFO", "🎯 HOLDSTATION: Executing swap with MAXIMUM 15% slippage", {
      to: txData.to,
      value: txData.value,
      dataLength: txData.data?.length || 0,
      slippage: SWAP_CONFIG.MAX_SLIPPAGE,
    })

    // Execute the transaction (mock implementation)
    // In real implementation, this would use ethers or web3 to send the transaction
    const result = await mockExecuteTransaction(txData)

    if (result.success) {
      logSwap("INFO", "✅ HOLDSTATION: Swap executed successfully", {
        transactionHash: result.transactionHash,
        outputAmount: result.outputAmount,
        gasUsed: result.gasUsed,
        slippage: SWAP_CONFIG.MAX_SLIPPAGE,
      })

      return {
        success: true,
        transactionHash: result.transactionHash,
        outputAmount: result.outputAmount,
        gasUsed: result.gasUsed,
      }
    } else {
      throw new Error(result.error || "Transaction execution failed")
    }
  } catch (error: any) {
    logSwap("ERROR", "❌ HOLDSTATION: Swap execution failed:", {
      error: error.message,
      slippage: SWAP_CONFIG.MAX_SLIPPAGE,
      params: {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        userAddress: params.userAddress,
      },
    })
    throw error
  }
}

// Mock transaction execution (replace with real implementation)
async function mockExecuteTransaction(txData: any): Promise<SwapResult> {
  // Simulate transaction execution
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock success/failure based on some logic
  const success = Math.random() > 0.3 // 70% success rate for testing

  if (success) {
    return {
      success: true,
      transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      outputAmount: "1.234567",
      gasUsed: "150000",
    }
  } else {
    return {
      success: false,
      error:
        "Swap simulation failed. This could be due to insufficient liquidity, high price impact, or network congestion.",
    }
  }
}

// Main swap function
export async function executeSwap(params: SwapParams): Promise<SwapResult> {
  return swapMutex.runExclusive(async () => {
    const startTime = Date.now()

    try {
      // Validate parameters
      const validationError = validateSwapParams(params)
      if (validationError) {
        logSwap("ERROR", "❌ Parameter validation failed", { error: validationError })
        return { success: false, error: validationError }
      }

      logSwap("INFO", "🚀 Starting swap execution with MAXIMUM slippage test", {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        slippage: SWAP_CONFIG.MAX_SLIPPAGE,
        userAddress: params.userAddress,
      })

      let lastError: Error | null = null

      // Retry logic
      for (let attempt = 1; attempt <= SWAP_CONFIG.MAX_RETRIES; attempt++) {
        try {
          logSwap(
            "INFO",
            `🔄 SWAP ATTEMPT ${attempt}/${SWAP_CONFIG.MAX_RETRIES} [EXECUTE-SWAP] - SLIPPAGE: ${SWAP_CONFIG.MAX_SLIPPAGE}%`,
          )

          // Get fresh quote for each attempt
          const quote = await getFreshQuote(params)
          if (!quote) {
            throw new Error("Failed to obtain valid quote")
          }

          // Execute swap
          const result = await executeSwapWithHoldstation(params, quote)

          const duration = Date.now() - startTime
          logSwap("INFO", `✅ Swap completed successfully in ${duration}ms`, {
            attempt,
            transactionHash: result.transactionHash,
            outputAmount: result.outputAmount,
            slippage: SWAP_CONFIG.MAX_SLIPPAGE,
          })

          return result
        } catch (error: any) {
          lastError = error

          logSwap("ERROR", `❌ SWAP ATTEMPT ${attempt} FAILED [EXECUTE-SWAP]:`, {
            error: error.message,
            attempt,
            slippage: SWAP_CONFIG.MAX_SLIPPAGE,
          })

          // Check if error is non-retryable
          const isNonRetryable =
            error.message.includes("Rate limit") ||
            error.message.includes("Invalid") ||
            error.message.includes("validation") ||
            error.message.includes("simulation_failed")

          if (isNonRetryable) {
            logSwap("ERROR", `🚫 SWAP NON-RETRYABLE ERROR [EXECUTE-SWAP]:`, {
              error: error.message,
              reason: "Error type indicates no point in retrying",
              slippage: SWAP_CONFIG.MAX_SLIPPAGE,
            })
            break
          }

          // Wait before retry (except on last attempt)
          if (attempt < SWAP_CONFIG.MAX_RETRIES) {
            const delay = SWAP_CONFIG.RETRY_DELAYS[attempt - 1] || 5000
            logSwap("INFO", `⏳ Waiting ${delay}ms before retry ${attempt + 1}...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        }
      }

      // All attempts failed
      const duration = Date.now() - startTime
      const finalError = lastError?.message || "Unknown error occurred"

      // Special message if failed even with maximum slippage
      if (finalError.includes("simulation_failed") || finalError.includes("Swap simulation failed")) {
        const testFailureMessage = `🧪 SLIPPAGE TEST FAILED: Swap simulation failed even with MAXIMUM ${SWAP_CONFIG.MAX_SLIPPAGE}% slippage! This proves the issue is NOT slippage-related. Possible causes: insufficient liquidity, token contract issues, or network problems.`

        logSwap("ERROR", testFailureMessage)

        return {
          success: false,
          error: `${testFailureMessage} Original error: ${finalError}`,
        }
      }

      logSwap("ERROR", `❌ SWAP ERROR [EXECUTE-SWAP]:`, {
        error: finalError,
        attempts: SWAP_CONFIG.MAX_RETRIES,
        duration,
        slippage: SWAP_CONFIG.MAX_SLIPPAGE,
        suggestion: finalError.includes("Rate limit")
          ? "Wait a few minutes before trying again"
          : finalError.includes("insufficient")
            ? "Try a smaller amount or different token pair"
            : "Check network connection and try again",
      })

      return {
        success: false,
        error: `Swap failed after ${SWAP_CONFIG.MAX_RETRIES} attempts with ${SWAP_CONFIG.MAX_SLIPPAGE}% slippage. Last error: ${finalError}`,
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      logSwap("ERROR", "💥 SWAP CRITICAL ERROR [EXECUTE-SWAP]:", {
        error: error.message,
        stack: error.stack,
        duration,
        slippage: SWAP_CONFIG.MAX_SLIPPAGE,
      })

      return {
        success: false,
        error: `Critical swap error: ${error.message}`,
      }
    }
  })
}

// Utility functions
export function getSwapConfig() {
  return { ...SWAP_CONFIG }
}

export function clearSwapCache() {
  quoteCache.flushAll()
  logSwap("INFO", "🧹 Swap cache cleared")
}

export function getSwapStats() {
  const cacheStats = quoteCache.getStats()
  const rateLimitStats = Array.from(rateLimiter.entries()).map(([key, requests]) => ({
    identifier: key,
    requests: requests.length,
    oldestRequest: requests.length > 0 ? new Date(Math.min(...requests)).toISOString() : null,
  }))

  return {
    cache: cacheStats,
    rateLimit: rateLimitStats,
    config: SWAP_CONFIG,
  }
}
