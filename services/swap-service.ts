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
import { ethers } from "ethers"

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

swapHelper.load(worldswap)

// Export tokens - TPT token removed to fix errors
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

// Token functions
export async function getTokenDetail() {
  console.log("🔄 Fetching multiple token details...")
  const tokens = await tokenProvider.details(
    "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDC
  )

  console.log("✅ Token Details:", tokens)
  return tokens
}

export async function getTokenInfo() {
  console.log("🔄 Fetching single token info...")
  const tokenInfo = await tokenProvider.details("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45") // TPF

  console.log("✅ Token Info:", tokenInfo)
  return tokenInfo
}

// Helper function to get token symbol from address
function getTokenSymbol(address: string): string {
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  return token?.symbol || "UNKNOWN"
}

// Quote functions - now supports all token pairs
export async function getRealQuote(amountIn: string, tokenInAddress: string, tokenOutAddress: string) {
  console.log(
    `🔄 Getting real quote: ${amountIn} from ${getTokenSymbol(tokenInAddress)} to ${getTokenSymbol(tokenOutAddress)}`,
  )

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "0.3",
    fee: "0.2",
  }

  const result = await swapHelper.estimate.quote(params)
  console.log("✅ Quote result:", result)

  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// Swap functions - now supports all token pairs
export async function estimateSwap(tokenInAddress: string, tokenOutAddress: string, amountIn = "2") {
  console.log(`🔄 Estimating swap: ${amountIn} ${getTokenSymbol(tokenInAddress)} to ${getTokenSymbol(tokenOutAddress)}`)

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "0.3",
    fee: "0.2",
  }

  const result = await swapHelper.estimate.quote(params)
  console.log("✅ Swap estimate result:", result)
  return result
}

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
}) {
  console.log(`🚀 Executing swap: ${amountIn} ${getTokenSymbol(tokenInAddress)} to ${getTokenSymbol(tokenOutAddress)}`)

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "0.3",
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)
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
  const result = await swapHelper.swap(swapParams)
  console.log("💱 Swap result:", result)

  if (result.success) {
    console.log("✅ Swap completed successfully!")
    return {
      success: true,
      result,
      transactionId: result.transactionId,
    }
  } else {
    console.log("❌ Swap failed:", result.errorCode)
    throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
  }
}

export async function swap() {
  console.log("🔄 Executing default swap (WLD to TPF)...")
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
    slippage: "0.3",
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)
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
  }
  const result = await swapHelper.swap(swapParams)
  console.log("✅ Swap result:", result)
  return result
}

// Additional helper functions for compatibility
export async function validateContracts() {
  try {
    console.log("🔍 Validating contracts...")

    const wldCode = await provider.getCode("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
    const tpfCode = await provider.getCode("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45")
    const usdcCode = await provider.getCode("0x79A02482A880bCE3F13e09Da970dC34db4CD24d1")

    console.log("📋 Contract validation:")
    console.log("  - WLD contract exists:", wldCode !== "0x")
    console.log("  - TPF contract exists:", tpfCode !== "0x")
    console.log("  - USDC contract exists:", usdcCode !== "0x")

    if (wldCode === "0x") {
      throw new Error("WLD contract not found")
    }

    if (tpfCode === "0x") {
      throw new Error("TPF contract not found")
    }

    if (usdcCode === "0x") {
      throw new Error("USDC contract not found")
    }

    console.log("✅ All contracts validated successfully")
    return true
  } catch (error) {
    console.error("❌ Contract validation failed:", error)
    throw error
  }
}

export async function testSwapHelper() {
  try {
    console.log("🧪 Testing SwapHelper...")

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    const testParams: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: "0.001",
      slippage: "0.3",
      fee: "0.2",
    }

    const testQuote = await swapHelper.estimate.quote(testParams)

    console.log("✅ Test quote successful:", {
      hasData: !!testQuote.data,
      hasTo: !!testQuote.to,
      outAmount: testQuote.addons?.outAmount,
    })

    return true
  } catch (error) {
    console.error("❌ Test failed:", error)
    return false
  }
}

export async function debugHoldstationSDK() {
  try {
    console.log("🔍 DEBUGGING HOLDSTATION SDK")

    const blockNumber = await provider.getBlockNumber()
    console.log("📋 Provider connected, block:", blockNumber)

    console.log("📋 SwapHelper available:", !!swapHelper)
    console.log("📋 TokenProvider available:", !!tokenProvider)

    // Test token details
    const tokenDetails = await tokenProvider.details("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
    console.log("📋 Token details:", tokenDetails)
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

export async function debugContractInteraction() {
  try {
    console.log("🔍 Debug contract interaction...")
    // Add any specific contract debugging here
    return true
  } catch (error) {
    console.error("❌ Contract debug failed:", error)
    return false
  }
}

export { provider, swapHelper }
