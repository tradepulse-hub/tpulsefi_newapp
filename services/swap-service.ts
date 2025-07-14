import { ethers } from "ethers"
import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6"
import {
  config,
  HoldSo,
  inmemoryTokenStorage,
  SwapHelper,
  type SwapParams,
  TokenProvider,
  ZeroX,
} from "@holdstation/worldchain-sdk"

// Token definitions with USDC added and TPT removed
export const TOKENS = [
  {
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    symbol: "WLD",
    name: "Worldcoin",
    decimals: 18,
    logo: "/images/worldcoin.jpeg",
    color: "#2563EB", // Blue color for WLD chart lines
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
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    symbol: "USDC",
    name: "USDC",
    decimals: 6,
    logo: "/placeholder.svg?height=32&width=32&text=USDC",
    color: "#2775CA",
  },
  {
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
    symbol: "WDD",
    name: "World Drachma",
    decimals: 18,
    logo: "/images/drachma-token.png",
    color: "#FFD700",
  },
]

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 15, // Further reduced to be more conservative
  retryDelays: [3000, 8000, 15000], // Longer delays: 3s, 8s, 15s
  maxRetries: 2, // Reduced retries to avoid hitting limits
}

// MAXIMUM SLIPPAGE FOR TESTING - Enhanced swap configuration
const SWAP_CONFIG = {
  defaultSlippage: "15.0", // MAXIMUM SLIPPAGE FOR TESTING - 15%
  maxSlippage: "20.0", // Even higher maximum
  minAmountThreshold: "0.01", // Increased minimum amount
  gasMultiplier: 1.5, // Higher gas estimation multiplier
  simulationRetries: 1, // Reduced simulation retries
  quoteValidityMs: 30000, // Quote validity time (30 seconds)
}

// Rate limiting tracker
class RateLimiter {
  private requests: number[] = []
  private readonly windowMs = 60000 // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now()
    // Remove requests older than 1 minute
    this.requests = this.requests.filter((time) => now - time < this.windowMs)

    console.log(
      `🔄 RATE LIMITER: ${this.requests.length}/${RATE_LIMIT_CONFIG.maxRequestsPerMinute} requests in last minute`,
    )

    return this.requests.length < RATE_LIMIT_CONFIG.maxRequestsPerMinute
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0

    const oldestRequest = Math.min(...this.requests)
    const waitTime = this.windowMs - (Date.now() - oldestRequest)
    return Math.max(0, waitTime)
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.windowMs)
    return Math.max(0, RATE_LIMIT_CONFIG.maxRequestsPerMinute - this.requests.length)
  }
}

const rateLimiter = new RateLimiter()

// Holdstation SDK configuration
const HOLDSTATION_CONFIG = {
  baseURL: "https://api.holdstation.exchange",
  chainId: 480,
  timeout: 60000, // Increased timeout to 60 seconds
}

// Setup
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(
  RPC_URL,
  {
    chainId: 480,
    name: "worldchain",
  },
  {
    staticNetwork: true,
  },
)

const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)

const swapHelper = new SwapHelper(client, {
  tokenStorage: inmemoryTokenStorage,
})

const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })

const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldswap = new HoldSo(tokenProvider, inmemoryTokenStorage)

swapHelper.load(zeroX)
swapHelper.load(worldswap)

// Enhanced error handling with detailed logging
function handleSwapError(error: any, operation: string, context?: any): never {
  console.error(`❌ SWAP ERROR [${operation.toUpperCase()}]:`, {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
    slippageUsed: SWAP_CONFIG.defaultSlippage + "%",
    rateLimiterStatus: {
      remainingRequests: rateLimiter.getRemainingRequests(),
      canMakeRequest: rateLimiter.canMakeRequest(),
      waitTime: rateLimiter.getWaitTime(),
    },
  })

  // Enhanced error messages based on error type
  if (error.message?.includes("429") || error.status === 429) {
    throw new Error(
      `Rate limit exceeded. Please wait ${Math.ceil(rateLimiter.getWaitTime() / 1000)} seconds before trying again.`,
    )
  }

  if (error.message?.includes("simulation_failed") || error.message?.includes("simulation failed")) {
    throw new Error(
      `🧪 SLIPPAGE TEST: Swap simulation failed even with ${SWAP_CONFIG.defaultSlippage}% slippage! This suggests the issue is NOT slippage-related. Possible causes: 1) Insufficient liquidity, 2) Network congestion, 3) Invalid token pair, 4) API issues.`,
    )
  }

  if (error.message?.includes("timeout") || error.code === "TIMEOUT") {
    throw new Error(`Request timeout. Network congestion detected. Please try again in a few minutes.`)
  }

  if (error.message?.includes("Network") || error.code === "NETWORK_ERROR") {
    throw new Error(`Network error. Please check your internet connection and try again.`)
  }

  if (error.message?.includes("insufficient") || error.message?.includes("balance")) {
    throw new Error(`Insufficient token balance. Please check your wallet balance and try a smaller amount.`)
  }

  if (error.message?.includes("slippage")) {
    throw new Error(
      `🧪 SLIPPAGE TEST: Price changed more than ${SWAP_CONFIG.defaultSlippage}%! This is extreme volatility.`,
    )
  }

  if (error.message?.includes("liquidity")) {
    throw new Error(`Insufficient liquidity for this token pair. Try a smaller amount or wait for better conditions.`)
  }

  if (error.message?.includes("price impact")) {
    throw new Error(
      `Price impact too high even with ${SWAP_CONFIG.defaultSlippage}% slippage. Try reducing the swap amount significantly.`,
    )
  }

  // Generic error with more context
  throw new Error(
    `🧪 SLIPPAGE TEST: Swap ${operation} failed with ${SWAP_CONFIG.defaultSlippage}% slippage: ${error.message || "Unknown error"}. If this fails, slippage is NOT the issue.`,
  )
}

// Retry mechanism with exponential backoff
async function retryWithBackoff<T>(operation: () => Promise<T>, operationName: string, context?: any): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= RATE_LIMIT_CONFIG.maxRetries; attempt++) {
    try {
      // Check rate limit before making request
      if (!rateLimiter.canMakeRequest()) {
        const waitTime = rateLimiter.getWaitTime()
        console.warn(`⚠️ RATE LIMIT: Waiting ${Math.ceil(waitTime / 1000)}s before retry...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }

      console.log(
        `🔄 SWAP ATTEMPT ${attempt + 1}/${RATE_LIMIT_CONFIG.maxRetries + 1} [${operationName.toUpperCase()}] - SLIPPAGE: ${SWAP_CONFIG.defaultSlippage}%`,
      )

      rateLimiter.recordRequest()
      const result = await operation()

      if (attempt > 0) {
        console.log(
          `✅ SWAP SUCCESS after ${attempt + 1} attempts [${operationName.toUpperCase()}] with ${SWAP_CONFIG.defaultSlippage}% slippage`,
        )
      }

      return result
    } catch (error) {
      lastError = error

      console.warn(`❌ SWAP ATTEMPT ${attempt + 1} FAILED [${operationName.toUpperCase()}]:`, {
        error: error.message,
        attempt: attempt + 1,
        maxAttempts: RATE_LIMIT_CONFIG.maxRetries + 1,
        slippageUsed: SWAP_CONFIG.defaultSlippage + "%",
        context,
      })

      // Don't retry on certain errors
      if (
        error.message?.includes("insufficient") ||
        error.message?.includes("Invalid token") ||
        error.message?.includes("slippage") ||
        error.message?.includes("liquidity") ||
        error.message?.includes("simulation_failed") ||
        error.message?.includes("price impact")
      ) {
        console.error(`🚫 SWAP NON-RETRYABLE ERROR [${operationName.toUpperCase()}]:`, error.message)
        break
      }

      // Wait before retry (except on last attempt)
      if (attempt < RATE_LIMIT_CONFIG.maxRetries) {
        const delay = RATE_LIMIT_CONFIG.retryDelays[Math.min(attempt, RATE_LIMIT_CONFIG.retryDelays.length - 1)]
        console.log(`⏳ SWAP RETRY DELAY: ${delay}ms [${operationName.toUpperCase()}]`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  handleSwapError(lastError, operationName, context)
}

// Helper function to validate contract addresses
export const validateContracts = async (): Promise<boolean> => {
  try {
    console.log("🔍 BLOCKCHAIN: Validating contract addresses...")

    const validations = await Promise.all([
      provider.getCode("0x2cFc85d8E48F8EAB294be644d9E25C3030863003"), // WLD
      provider.getCode("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"), // TPF
      provider.getCode("0x79A02482A880bCE3F13e09Da970dC34db4CD24d1"), // USDC
    ])

    const results = [
      { name: "WLD", address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", valid: validations[0] !== "0x" },
      { name: "TPF", address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", valid: validations[1] !== "0x" },
      { name: "USDC", address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", valid: validations[2] !== "0x" },
    ]

    results.forEach(({ name, address, valid }) => {
      console.log(`${valid ? "✅" : "❌"} BLOCKCHAIN: ${name} contract ${valid ? "valid" : "invalid"}: ${address}`)
    })

    const allValid = results.every((r) => r.valid)

    if (!allValid) {
      throw new Error("One or more token contracts are invalid")
    }

    console.log("✅ BLOCKCHAIN: All contracts validated successfully")
    return true
  } catch (error) {
    console.error("❌ BLOCKCHAIN: Contract validation failed:", error)
    throw error
  }
}

// Debug contract interaction
export const debugContractInteraction = async (): Promise<boolean> => {
  try {
    console.log("🔧 BLOCKCHAIN: Debug contract interaction...")

    const blockNumber = await provider.getBlockNumber()
    console.log(`📋 BLOCKCHAIN: Connected to block ${blockNumber}`)

    // Test token balances for common addresses
    const testAddress = "0x0000000000000000000000000000000000000001"
    try {
      const wldContract = new ethers.Contract(
        "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
        ["function balanceOf(address) view returns (uint256)"],
        provider,
      )
      const balance = await wldContract.balanceOf(testAddress)
      console.log(`📋 BLOCKCHAIN: WLD contract responsive, test balance: ${balance.toString()}`)
    } catch (error) {
      console.warn(`⚠️ BLOCKCHAIN: WLD contract test failed:`, error.message)
    }

    return true
  } catch (error) {
    console.error("❌ BLOCKCHAIN: Contract debug failed:", error)
    return false
  }
}

// Debug Holdstation SDK
export const debugHoldstationSDK = async (): Promise<void> => {
  try {
    console.log("🔍 HOLDSTATION: Debugging SDK...")

    const blockNumber = await provider.getBlockNumber()
    console.log("📋 HOLDSTATION: Provider connected, block:", blockNumber)

    console.log("📋 HOLDSTATION: SwapHelper available:", !!swapHelper)
    console.log("📋 HOLDSTATION: TokenProvider available:", !!tokenProvider)

    // Test token details with rate limiting
    await retryWithBackoff(async () => {
      const tokenDetails = await tokenProvider.details("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
      console.log("📋 HOLDSTATION: Token details:", tokenDetails)
      return tokenDetails
    }, "debug-token-details")
  } catch (error) {
    console.error("❌ HOLDSTATION: Debug failed:", error)
  }
}

// Enhanced validation with balance checking
function validateSwapParams(params: {
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: string
  walletAddress?: string
}): void {
  const { tokenInAddress, tokenOutAddress, amountIn, walletAddress } = params

  if (!ethers.isAddress(tokenInAddress)) {
    throw new Error(`Invalid token input address: ${tokenInAddress}`)
  }

  if (!ethers.isAddress(tokenOutAddress)) {
    throw new Error(`Invalid token output address: ${tokenOutAddress}`)
  }

  if (tokenInAddress.toLowerCase() === tokenOutAddress.toLowerCase()) {
    throw new Error("Cannot swap token with itself")
  }

  const amount = Number.parseFloat(amountIn)
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${amountIn}`)
  }

  if (amount < Number.parseFloat(SWAP_CONFIG.minAmountThreshold)) {
    throw new Error(`Amount too small. Minimum: ${SWAP_CONFIG.minAmountThreshold}`)
  }

  if (walletAddress && !ethers.isAddress(walletAddress)) {
    throw new Error(`Invalid wallet address: ${walletAddress}`)
  }

  const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
  const tokenOut = TOKENS.find((t) => t.address.toLowerCase() === tokenOutAddress.toLowerCase())

  if (!tokenIn) {
    throw new Error(`Unsupported input token: ${tokenInAddress}`)
  }

  if (!tokenOut) {
    throw new Error(`Unsupported output token: ${tokenOutAddress}`)
  }

  console.log(
    `✅ VALIDATION: Swap parameters valid - ${amount} ${tokenIn.symbol} → ${tokenOut.symbol} (SLIPPAGE: ${SWAP_CONFIG.defaultSlippage}%)`,
  )
}

// Test Holdstation SDK helper with enhanced validation
export const testSwapHelper = async (): Promise<boolean> => {
  try {
    console.log(`🧪 HOLDSTATION: Testing SwapHelper with MAXIMUM SLIPPAGE (${SWAP_CONFIG.defaultSlippage}%)...`)

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    const testParams: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: "0.01", // Increased test amount
      slippage: SWAP_CONFIG.defaultSlippage, // MAXIMUM SLIPPAGE
      fee: "0.2",
    }

    // Validate before testing
    validateSwapParams({
      tokenInAddress: testParams.tokenIn,
      tokenOutAddress: testParams.tokenOut,
      amountIn: testParams.amountIn,
    })

    const testQuote = await retryWithBackoff(
      async () => {
        return await swapHelper.estimate.quote(testParams)
      },
      "test-quote",
      testParams,
    )

    console.log(`✅ HOLDSTATION: Test quote successful with ${SWAP_CONFIG.defaultSlippage}% slippage:`, {
      hasData: !!testQuote.data,
      hasTo: !!testQuote.to,
      outAmount: testQuote.addons?.outAmount,
      gasEstimate: testQuote.addons?.gasEstimate,
    })

    return true
  } catch (error) {
    console.error(`❌ HOLDSTATION: Test failed even with ${SWAP_CONFIG.defaultSlippage}% slippage:`, error)
    return false
  }
}

// Helper function to get token symbol from address
function getTokenSymbol(address: string): string {
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  return token?.symbol || "UNKNOWN"
}

// Enhanced quote function with MAXIMUM slippage
export async function getRealQuote(amountIn: string, tokenInAddress: string, tokenOutAddress: string) {
  console.log(
    `🔄 HOLDSTATION: Getting quote ${amountIn} ${getTokenSymbol(tokenInAddress)} → ${getTokenSymbol(tokenOutAddress)} (SLIPPAGE: ${SWAP_CONFIG.defaultSlippage}%)`,
  )

  // Validate inputs first
  validateSwapParams({ tokenInAddress, tokenOutAddress, amountIn })

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: SWAP_CONFIG.defaultSlippage, // MAXIMUM SLIPPAGE FOR TESTING
    fee: "0.2",
  }

  console.log("📤 HOLDSTATION: Quote request with MAXIMUM SLIPPAGE:", {
    ...params,
    tokenInSymbol: getTokenSymbol(tokenInAddress),
    tokenOutSymbol: getTokenSymbol(tokenOutAddress),
    slippagePercent: SWAP_CONFIG.defaultSlippage + "%",
  })

  const result = await retryWithBackoff(
    async () => {
      const quote = await swapHelper.estimate.quote(params)

      // Enhanced quote validation
      if (!quote.data || !quote.to) {
        throw new Error("Invalid quote response - missing transaction data")
      }

      if (!quote.addons?.outAmount || quote.addons.outAmount === "0") {
        throw new Error("Invalid quote response - no output amount available")
      }

      // Check if quote is too old (for future use)
      const quoteTimestamp = Date.now()
      console.log(
        `📋 HOLDSTATION: Quote generated at ${new Date(quoteTimestamp).toISOString()} with ${SWAP_CONFIG.defaultSlippage}% slippage`,
      )

      return quote
    },
    "get-quote",
    params,
  )

  console.log(`✅ HOLDSTATION: Quote received with ${SWAP_CONFIG.defaultSlippage}% slippage:`, {
    outputAmount: result.addons?.outAmount,
    hasData: !!result.data,
    hasTo: !!result.to,
    gasEstimate: result.addons?.gasEstimate,
    value: result.value,
  })

  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// Enhanced swap estimation
export async function estimateSwap(tokenInAddress: string, tokenOutAddress: string, amountIn = "2") {
  console.log(
    `🔄 HOLDSTATION: Estimating swap ${amountIn} ${getTokenSymbol(tokenInAddress)} → ${getTokenSymbol(tokenOutAddress)} (SLIPPAGE: ${SWAP_CONFIG.defaultSlippage}%)`,
  )

  validateSwapParams({ tokenInAddress, tokenOutAddress, amountIn })

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: SWAP_CONFIG.defaultSlippage, // MAXIMUM SLIPPAGE
    fee: "0.2",
  }

  const result = await retryWithBackoff(
    async () => {
      return await swapHelper.estimate.quote(params)
    },
    "estimate-swap",
    params,
  )

  console.log(`✅ HOLDSTATION: Swap estimate result with ${SWAP_CONFIG.defaultSlippage}% slippage:`, result)
  return result
}

// Completely rewritten swap execution with MAXIMUM slippage
export async function doSwap({
  walletAddress,
  quote,
  amountIn,
  tokenInAddress,
  tokenOutAddress,
}: {
  walletAddress: string
  quote: any
  amountIn: string
  tokenInAddress: string
  tokenOutAddress: string
}): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    console.log(
      `🚀 HOLDSTATION: Executing swap ${amountIn} ${getTokenSymbol(tokenInAddress)} → ${getTokenSymbol(tokenOutAddress)} (SLIPPAGE: ${SWAP_CONFIG.defaultSlippage}%)`,
    )
    console.log("👤 HOLDSTATION: Wallet:", walletAddress)

    // Comprehensive validation
    validateSwapParams({ tokenInAddress, tokenOutAddress, amountIn, walletAddress })

    // Always get a fresh quote for execution to avoid stale data issues
    console.log(`🔄 HOLDSTATION: Getting fresh quote for execution with ${SWAP_CONFIG.defaultSlippage}% slippage...`)
    const params: SwapParams["quoteInput"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      slippage: SWAP_CONFIG.defaultSlippage, // MAXIMUM SLIPPAGE FOR TESTING
      fee: "0.2",
    }

    const quoteResponse = await retryWithBackoff(
      async () => {
        const freshQuote = await swapHelper.estimate.quote(params)

        // Enhanced quote validation
        if (!freshQuote.data || !freshQuote.to) {
          throw new Error("Fresh quote validation failed - missing transaction data")
        }

        if (!freshQuote.addons?.outAmount || freshQuote.addons.outAmount === "0") {
          throw new Error("Fresh quote validation failed - no output amount")
        }

        // Additional validation for swap execution
        if (freshQuote.data.length < 10) {
          throw new Error("Fresh quote validation failed - invalid transaction data")
        }

        console.log(`✅ HOLDSTATION: Fresh quote validated with ${SWAP_CONFIG.defaultSlippage}% slippage:`, {
          hasData: !!freshQuote.data,
          hasTo: !!freshQuote.to,
          outAmount: freshQuote.addons?.outAmount,
          gasEstimate: freshQuote.addons?.gasEstimate,
          dataLength: freshQuote.data.length,
        })

        return freshQuote
      },
      "swap-quote",
      params,
    )

    // Prepare swap parameters with enhanced validation
    const swapParams: SwapParams["input"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      tx: {
        data: quoteResponse.data,
        to: quoteResponse.to,
        value: quoteResponse.value || "0",
      },
      partnerCode: "24568", // Replace with your partner code, contact to holdstation team to get one
      feeAmountOut: quoteResponse.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS or your fee receiver address
    }

    console.log(`📋 HOLDSTATION: Swap parameters prepared with MAXIMUM SLIPPAGE:`, {
      tokenInSymbol: getTokenSymbol(tokenInAddress),
      tokenOutSymbol: getTokenSymbol(tokenOutAddress),
      amountIn: swapParams.amountIn,
      expectedOut: quoteResponse.addons?.outAmount,
      hasTransactionData: !!swapParams.tx.data,
      transactionTo: swapParams.tx.to,
      transactionValue: swapParams.tx.value,
      slippage: SWAP_CONFIG.defaultSlippage + "%",
    })

    // Execute swap with enhanced error handling
    const result = await retryWithBackoff(
      async () => {
        console.log(`🎯 HOLDSTATION: Executing swap with MAXIMUM ${SWAP_CONFIG.defaultSlippage}% slippage`)

        const swapResult = await swapHelper.swap(swapParams)

        console.log(`📊 HOLDSTATION: Raw swap result with ${SWAP_CONFIG.defaultSlippage}% slippage:`, {
          success: swapResult.success,
          errorCode: swapResult.errorCode,
          transactionId: swapResult.transactionId,
          hasTransactionId: !!swapResult.transactionId,
          resultType: typeof swapResult,
        })

        // Enhanced result validation with specific error handling
        if (!swapResult.success) {
          if (swapResult.errorCode === "simulation_failed") {
            throw new Error(
              `🧪 SLIPPAGE TEST FAILED: Swap simulation failed even with MAXIMUM ${SWAP_CONFIG.defaultSlippage}% slippage! This proves the issue is NOT slippage-related. Possible causes: 1) Insufficient liquidity, 2) Network issues, 3) Invalid token pair, 4) API problems.`,
            )
          }

          if (swapResult.errorCode === "insufficient_balance") {
            throw new Error(
              `Insufficient balance. Please check your wallet balance for ${getTokenSymbol(tokenInAddress)}.`,
            )
          }

          if (swapResult.errorCode === "price_impact_too_high") {
            throw new Error(
              `🧪 SLIPPAGE TEST: Price impact too high even with ${SWAP_CONFIG.defaultSlippage}% slippage! Try much smaller amounts.`,
            )
          }

          throw new Error(
            `🧪 SLIPPAGE TEST: Swap failed with ${SWAP_CONFIG.defaultSlippage}% slippage: ${swapResult.errorCode || "Unknown error"}. This suggests slippage is NOT the main issue.`,
          )
        }

        // Additional validation for successful swaps
        if (swapResult.success && !swapResult.transactionId) {
          console.warn(
            `⚠️ HOLDSTATION: Swap marked as successful but no transaction ID provided (${SWAP_CONFIG.defaultSlippage}% slippage)`,
          )
          // Don't throw error, just log warning
        }

        return swapResult
      },
      "execute-swap",
      { ...swapParams, slippage: SWAP_CONFIG.defaultSlippage },
    )

    console.log(`💱 HOLDSTATION: Final swap result with ${SWAP_CONFIG.defaultSlippage}% slippage:`, result)

    if (result.success) {
      console.log(`✅ HOLDSTATION: Swap completed successfully with ${SWAP_CONFIG.defaultSlippage}% slippage!`)
      return {
        success: true,
        transactionId: result.transactionId || "pending",
      }
    } else {
      console.error(
        `❌ HOLDSTATION: Swap completed but marked as failed (${SWAP_CONFIG.defaultSlippage}% slippage):`,
        result.errorCode,
      )
      throw new Error(`Swap execution failed: ${result.errorCode || "Unknown error"}`)
    }
  } catch (error) {
    console.error(`❌ HOLDSTATION: Swap execution failed with ${SWAP_CONFIG.defaultSlippage}% slippage:`, {
      error: error.message,
      stack: error.stack,
      tokenIn: getTokenSymbol(tokenInAddress),
      tokenOut: getTokenSymbol(tokenOutAddress),
      amount: amountIn,
      wallet: walletAddress,
      slippage: SWAP_CONFIG.defaultSlippage + "%",
    })

    return {
      success: false,
      error: error.message,
    }
  }
}

// Default swap function with MAXIMUM slippage
export async function swap() {
  console.log(
    `🔄 HOLDSTATION: Executing default swap (WLD → TPF) with MAXIMUM ${SWAP_CONFIG.defaultSlippage}% slippage...`,
  )

  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "1", // Reduced default amount
    slippage: SWAP_CONFIG.defaultSlippage, // MAXIMUM SLIPPAGE
    fee: "0.2",
  }

  validateSwapParams({
    tokenInAddress: params.tokenIn,
    tokenOutAddress: params.tokenOut,
    amountIn: params.amountIn,
  })

  const quoteResponse = await retryWithBackoff(
    async () => {
      return await swapHelper.estimate.quote(params)
    },
    "default-swap-quote",
    params,
  )

  const swapParams: SwapParams["input"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "1",
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value || "0",
    },
    partnerCode: "24568", // Replace with your partner code, contact to holdstation team to get one
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS or your fee receiver address
  }

  const result = await retryWithBackoff(
    async () => {
      return await swapHelper.swap(swapParams)
    },
    "default-swap-execute",
    swapParams,
  )

  console.log(`✅ HOLDSTATION: Swap result with ${SWAP_CONFIG.defaultSlippage}% slippage:`, result)
  return result
}

// Token functions with rate limiting
export async function getTokenDetail() {
  console.log("🔄 HOLDSTATION: Fetching multiple token details...")

  const tokens = await retryWithBackoff(async () => {
    return await tokenProvider.details(
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDC
    )
  }, "get-token-details")

  console.log("✅ HOLDSTATION: Token Details:", tokens)
  return tokens
}

export async function getTokenInfo() {
  console.log("🔄 HOLDSTATION: Fetching single token info...")

  const tokenInfo = await retryWithBackoff(async () => {
    return await tokenProvider.details("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45") // TPF
  }, "get-token-info")

  console.log("✅ HOLDSTATION: Token Info:", tokenInfo)
  return tokenInfo
}

// Additional helper functions for compatibility
export const getTokenByAddress = (address: string) => {
  return TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

export const getTokenBySymbol = (symbol: string) => {
  return TOKENS.find((token) => token.symbol === symbol)
}

export const formatTokenAmount = (amount: string, decimals: number): string => {
  try {
    const formatted = ethers.formatUnits(amount, decimals)
    const num = Number.parseFloat(formatted)

    if (num === 0) return "0"
    if (num < 0.0001) return "<0.0001"
    if (num < 1) return num.toFixed(6)
    if (num < 1000) return num.toFixed(4)

    return num.toFixed(2)
  } catch (error) {
    console.error("Error formatting token amount:", error)
    return "0"
  }
}

export const parseTokenAmount = (amount: string, decimals: number): string => {
  try {
    return ethers.parseUnits(amount, decimals).toString()
  } catch (error) {
    console.error("Error parsing token amount:", error)
    throw new Error("Invalid amount format")
  }
}

// Rate limiter status for debugging
export const getRateLimiterStatus = () => {
  const now = Date.now()
  const recentRequests = rateLimiter["requests"].filter((time: number) => now - time < 60000)

  return {
    requestsInLastMinute: recentRequests.length,
    maxRequestsPerMinute: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
    canMakeRequest: rateLimiter.canMakeRequest(),
    waitTime: rateLimiter.getWaitTime(),
    remainingRequests: rateLimiter.getRemainingRequests(),
    currentSlippage: SWAP_CONFIG.defaultSlippage + "%",
  }
}

export { provider, swapHelper }
