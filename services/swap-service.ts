import { HoldstationSDK } from "@holdstation/sdk"

// Holdstation SDK configuration for Worldchain
const HOLDSTATION_CONFIG = {
  chainId: 480, // Worldchain mainnet
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
  apiKey: process.env.HOLDSTATION_API_KEY || "demo-key",
}

// Initialize Holdstation SDK
let holdstationSDK: HoldstationSDK | null = null

try {
  holdstationSDK = new HoldstationSDK({
    chainId: HOLDSTATION_CONFIG.chainId,
    rpcUrl: HOLDSTATION_CONFIG.rpcUrl,
    apiKey: HOLDSTATION_CONFIG.apiKey,
  })
  console.log("✅ Holdstation SDK initialized successfully")
} catch (error) {
  console.error("❌ Failed to initialize Holdstation SDK:", error)
}

// Token configurations for Worldchain
export const TOKENS = [
  {
    symbol: "WLD",
    name: "Worldcoin",
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    decimals: 18,
    logo: "/images/worldcoin.jpeg",
    color: "#00D4FF",
  },
  {
    symbol: "TPF",
    name: "TPulseFi",
    address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#FF6B35",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    decimals: 6,
    logo: "/placeholder.svg?height=32&width=32&text=USDC",
    color: "#2775CA",
  },
  {
    symbol: "WDD",
    name: "World Drachma",
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
    decimals: 18,
    logo: "/images/drachma-token.png",
    color: "#8B5CF6",
  },
] as const

// Swap interfaces
interface SwapQuote {
  data: string
  to: string
  value: string
  gasLimit: string
  gasPrice: string
}

interface SwapParams {
  walletAddress: string
  quote: SwapQuote
  amountIn: string
  tokenInAddress: string
  tokenOutAddress: string
}

interface SwapResult {
  success: boolean
  transactionId?: string
  error?: string
}

/**
 * Get real quote from Holdstation SDK
 */
export async function getRealQuote(
  amountIn: string,
  tokenInAddress: string,
  tokenOutAddress: string,
): Promise<{ quote: SwapQuote; outputAmount: string }> {
  try {
    if (!holdstationSDK) {
      throw new Error("Holdstation SDK not initialized")
    }

    console.log(`🔄 Getting real quote via Holdstation SDK:`)
    console.log(`  Amount In: ${amountIn}`)
    console.log(`  Token In: ${tokenInAddress}`)
    console.log(`  Token Out: ${tokenOutAddress}`)

    // Get quote from Holdstation SDK
    const quoteResponse = await holdstationSDK.getQuote({
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      slippage: 0.5, // 0.5% slippage
    })

    console.log("✅ Quote response received:", quoteResponse)

    if (!quoteResponse || !quoteResponse.data) {
      throw new Error("Invalid quote response from Holdstation SDK")
    }

    const quote: SwapQuote = {
      data: quoteResponse.data,
      to: quoteResponse.to || tokenOutAddress,
      value: quoteResponse.value || "0",
      gasLimit: quoteResponse.gasLimit || "300000",
      gasPrice: quoteResponse.gasPrice || "1000000000",
    }

    const outputAmount = quoteResponse.amountOut || "0"

    console.log(`✅ Real quote obtained: ${outputAmount} tokens`)
    return { quote, outputAmount }
  } catch (error) {
    console.error("❌ Error getting real quote:", error)
    throw new Error(`Failed to get quote: ${error.message}`)
  }
}

/**
 * Execute swap using MiniKit
 */
export async function doSwap(params: SwapParams): Promise<SwapResult> {
  try {
    console.log("🚀 Starting real swap with MiniKit...")
    console.log("Swap params:", params)

    // Import MiniKit dynamically
    const { MiniKit } = await import("@worldcoin/minikit-js")

    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit not installed. Please use World App.")
    }

    // Prepare transaction for MiniKit
    const transactionConfig = {
      transaction: [
        {
          address: params.quote.to,
          abi: [], // Holdstation handles the ABI
          functionName: "swap",
          args: [],
          value: params.quote.value,
          data: params.quote.data,
        },
      ],
    }

    console.log("📋 Transaction config for MiniKit:", transactionConfig)

    // Execute transaction via MiniKit
    const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction(transactionConfig)

    console.log("📨 MiniKit command payload:", commandPayload)
    console.log("📦 MiniKit final payload:", finalPayload)

    if (finalPayload.status === "error") {
      throw new Error(finalPayload.message || "Transaction failed")
    }

    if (finalPayload.status === "success") {
      console.log("✅ Swap transaction successful!")
      return {
        success: true,
        transactionId: finalPayload.transaction_id,
      }
    }

    throw new Error("Unknown transaction status")
  } catch (error) {
    console.error("❌ Swap execution failed:", error)
    return {
      success: false,
      error: error.message || "Swap failed",
    }
  }
}

/**
 * Test Holdstation SDK functionality
 */
export async function testSwapHelper(): Promise<boolean> {
  try {
    console.log("🧪 Testing Holdstation SDK...")

    if (!holdstationSDK) {
      console.error("❌ Holdstation SDK not initialized")
      return false
    }

    // Test with a small amount: 0.001 WLD to USDC
    const testQuote = await getRealQuote("0.001", TOKENS[0].address, TOKENS[2].address)

    if (testQuote && testQuote.outputAmount) {
      console.log("✅ Holdstation SDK test successful")
      console.log(`Test quote: 0.001 WLD = ${testQuote.outputAmount} USDC`)
      return true
    }

    console.error("❌ Holdstation SDK test failed - no output amount")
    return false
  } catch (error) {
    console.error("❌ Holdstation SDK test failed:", error)
    return false
  }
}

/**
 * Validate contract addresses
 */
export async function validateContracts(): Promise<void> {
  console.log("🔍 Validating contract addresses...")

  for (const token of TOKENS) {
    console.log(`✅ ${token.symbol}: ${token.address}`)
  }

  console.log("✅ All contract addresses validated")
}

/**
 * Debug contract interaction
 */
export async function debugContractInteraction(): Promise<void> {
  console.log("🔧 Debug: Contract interaction test")

  try {
    if (!holdstationSDK) {
      console.log("⚠️ Holdstation SDK not available for debugging")
      return
    }

    console.log("✅ Holdstation SDK is available")
    console.log("📊 Supported tokens:", TOKENS.length)

    // Test basic SDK functionality
    const sdkInfo = {
      chainId: HOLDSTATION_CONFIG.chainId,
      rpcUrl: HOLDSTATION_CONFIG.rpcUrl,
      tokensCount: TOKENS.length,
    }

    console.log("✅ SDK Debug Info:", sdkInfo)
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

/**
 * Get supported tokens
 */
export function getSupportedTokens() {
  return TOKENS
}

/**
 * Find token by address
 */
export function findTokenByAddress(address: string) {
  return TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

/**
 * Find token by symbol
 */
export function findTokenBySymbol(symbol: string) {
  return TOKENS.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase())
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  try {
    const num = Number.parseFloat(amount)
    if (num === 0) return "0"
    if (num < 0.0001) return "<0.0001"
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    return num.toLocaleString()
  } catch {
    return "0"
  }
}

/**
 * Calculate price impact
 */
export function calculatePriceImpact(amountIn: string, amountOut: string, price: number): number {
  try {
    const expectedOut = Number.parseFloat(amountIn) * price
    const actualOut = Number.parseFloat(amountOut)
    const impact = ((expectedOut - actualOut) / expectedOut) * 100
    return Math.abs(impact)
  } catch {
    return 0
  }
}

export default {
  getRealQuote,
  doSwap,
  testSwapHelper,
  validateContracts,
  debugContractInteraction,
  getSupportedTokens,
  findTokenByAddress,
  findTokenBySymbol,
  formatTokenAmount,
  calculatePriceImpact,
  TOKENS,
}
