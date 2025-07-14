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
  maxRequestsPerMinute: 30,
  retryDelays: [1000, 2000, 5000], // 1s, 2s, 5s
  maxRetries: 3,
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
}

const rateLimiter = new RateLimiter()

// Holdstation SDK configuration
const HOLDSTATION_CONFIG = {
  baseURL: "https://api.holdstation.exchange",
  chainId: 480,
  timeout: 30000,
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
  })

  // Enhanced error messages based on error type
  if (error.message?.includes("429") || error.status === 429) {
    throw new Error(
      `Rate limit exceeded. Too many requests to Holdstation API. Please wait ${Math.ceil(rateLimiter.getWaitTime() / 1000)} seconds before trying again.`,
    )
  }

  if (error.message?.includes("timeout") || error.code === "TIMEOUT") {
    throw new Error(`Request timeout. The Holdstation API is taking too long to respond. Please try again.`)
  }

  if (error.message?.includes("Network") || error.code === "NETWORK_ERROR") {
    throw new Error(`Network error. Please check your internet connection and try again.`)
  }

  if (error.message?.includes("insufficient") || error.message?.includes("balance")) {
    throw new Error(`Insufficient token balance for this swap operation.`)
  }

  if (error.message?.includes("slippage")) {
    throw new Error(`Slippage tolerance exceeded. Try increasing slippage or reducing swap amount.`)
  }

  // Generic error with more context
  throw new Error(`Swap ${operation} failed: ${error.message || "Unknown error"}`)
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

      console.log(`🔄 SWAP ATTEMPT ${attempt + 1}/${RATE_LIMIT_CONFIG.maxRetries + 1} [${operationName.toUpperCase()}]`)

      rateLimiter.recordRequest()
      const result = await operation()

      if (attempt > 0) {
        console.log(`✅ SWAP SUCCESS after ${attempt + 1} attempts [${operationName.toUpperCase()}]`)
      }

      return result
    } catch (error) {
      lastError = error

      console.warn(`❌ SWAP ATTEMPT ${attempt + 1} FAILED [${operationName.toUpperCase()}]:`, {
        error: error.message,
        attempt: attempt + 1,
        maxAttempts: RATE_LIMIT_CONFIG.maxRetries + 1,
      })

      // Don't retry on certain errors
      if (
        error.message?.includes("insufficient") ||
        error.message?.includes("Invalid token") ||
        error.message?.includes("slippage")
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

// Test Holdstation SDK helper with rate limiting
export const testSwapHelper = async (): Promise<boolean> => {
  try {
    console.log("🧪 HOLDSTATION: Testing SwapHelper...")

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    const testParams: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: "0.001",
      slippage: "0.5", // Increased slippage
      fee: "0.2",
    }

    const testQuote = await retryWithBackoff(
      async () => {
        return await swapHelper.estimate.quote(testParams)
      },
      "test-quote",
      testParams,
    )

    console.log("✅ HOLDSTATION: Test quote successful:", {
      hasData: !!testQuote.data,
      hasTo: !!testQuote.to,
      outAmount: testQuote.addons?.outAmount,
    })

    return true
  } catch (error) {
    console.error("❌ HOLDSTATION: Test failed:", error)
    return false
  }
}

// Helper function to get token symbol from address
function getTokenSymbol(address: string): string {
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  return token?.symbol || "UNKNOWN"
}

// Enhanced quote function with rate limiting and validation
export async function getRealQuote(amountIn: string, tokenInAddress: string, tokenOutAddress: string) {
  console.log(
    `🔄 HOLDSTATION: Getting quote ${amountIn} ${getTokenSymbol(tokenInAddress)} → ${getTokenSymbol(tokenOutAddress)}`,
  )

  // Validate inputs
  if (!amountIn || Number.parseFloat(amountIn) <= 0) {
    throw new Error("Invalid amount: must be greater than 0")
  }

  const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
  const tokenOut = TOKENS.find((t) => t.address.toLowerCase() === tokenOutAddress.toLowerCase())

  if (!tokenIn || !tokenOut) {
    throw new Error(`Invalid token addresses: ${tokenInAddress} or ${tokenOutAddress}`)
  }

  if (tokenInAddress.toLowerCase() === tokenOutAddress.toLowerCase()) {
    throw new Error("Cannot swap token with itself")
  }

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "0.5", // 0.5% slippage
    fee: "0.2",
  }

  console.log("📤 HOLDSTATION: Quote request:", {
    ...params,
    tokenInSymbol: tokenIn.symbol,
    tokenOutSymbol: tokenOut.symbol,
  })

  const result = await retryWithBackoff(
    async () => {
      return await swapHelper.estimate.quote(params)
    },
    "get-quote",
    params,
  )

  console.log("✅ HOLDSTATION: Quote received:", {
    outputAmount: result.addons?.outAmount,
    hasData: !!result.data,
    hasTo: !!result.to,
    gasEstimate: result.addons?.gasEstimate,
  })

  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// Enhanced swap estimation with validation
export async function estimateSwap(tokenInAddress: string, tokenOutAddress: string, amountIn = "2") {
  console.log(
    `🔄 HOLDSTATION: Estimating swap ${amountIn} ${getTokenSymbol(tokenInAddress)} → ${getTokenSymbol(tokenOutAddress)}`,
  )

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "0.5",
    fee: "0.2",
  }

  const result = await retryWithBackoff(
    async () => {
      return await swapHelper.estimate.quote(params)
    },
    "estimate-swap",
    params,
  )

  console.log("✅ HOLDSTATION: Swap estimate result:", result)
  return result
}

// Enhanced swap execution with comprehensive error handling
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
      `🚀 HOLDSTATION: Executing swap ${amountIn} ${getTokenSymbol(tokenInAddress)} → ${getTokenSymbol(tokenOutAddress)}`,
    )
    console.log("👤 HOLDSTATION: Wallet:", walletAddress)

    // Validate inputs
    if (!ethers.isAddress(walletAddress)) {
      throw new Error("Invalid wallet address")
    }

    if (!ethers.isAddress(tokenInAddress) || !ethers.isAddress(tokenOutAddress)) {
      throw new Error("Invalid token addresses")
    }

    if (!quote.data || !quote.to) {
      throw new Error("Invalid quote data - missing transaction data")
    }

    const params: SwapParams["quoteInput"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      slippage: "0.5",
      fee: "0.2",
    }

    const quoteResponse = await retryWithBackoff(
      async () => {
        return await swapHelper.estimate.quote(params)
      },
      "swap-quote",
      params,
    )

    const swapParams: SwapParams["input"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      tx: {
        data: quoteResponse.data,
        to: quoteResponse.to,
        value: quoteResponse.value,
      },
      partnerCode: "24568", // Replace with your partner code, contact to holdstation team to get one
      feeAmountOut: quoteResponse.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS or your fee receiver address
    }

    console.log("📋 HOLDSTATION: Swap parameters:", {
      ...swapParams,
      tokenInSymbol: getTokenSymbol(tokenInAddress),
      tokenOutSymbol: getTokenSymbol(tokenOutAddress),
    })

    const result = await retryWithBackoff(
      async () => {
        return await swapHelper.swap(swapParams)
      },
      "execute-swap",
      swapParams,
    )

    console.log("💱 HOLDSTATION: Swap result:", result)

    if (result.success) {
      console.log("✅ HOLDSTATION: Swap completed successfully!")
      return {
        success: true,
        transactionId: result.transactionId,
      }
    } else {
      console.log("❌ HOLDSTATION: Swap failed:", result.errorCode)
      throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
    }
  } catch (error) {
    console.error("❌ HOLDSTATION: Swap execution failed:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Default swap function with rate limiting
export async function swap() {
  console.log("🔄 HOLDSTATION: Executing default swap (WLD → TPF)...")

  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
    slippage: "0.5",
    fee: "0.2",
  }

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
    amountIn: "2",
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value,
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

  console.log("✅ HOLDSTATION: Swap result:", result)
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
  }
}

export { provider, swapHelper }
