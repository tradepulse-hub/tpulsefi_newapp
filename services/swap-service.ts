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
]

const wldToken = TOKENS.find((t) => t.symbol === "WLD")!
const tpfToken = TOKENS.find((t) => t.symbol === "TPF")!

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

// Token functions
export async function getTokenDetail() {
  console.log("Fetching multiple token details...")
  const tokens = await tokenProvider.details(wldToken.address, tpfToken.address)

  console.log("Token Details:", tokens)
  return tokens
}

export async function getTokenInfo() {
  console.log("Fetching single token info...")
  const tokenInfo = await tokenProvider.details(wldToken.address)

  console.log("Token Info:", tokenInfo)
  return tokenInfo
}

// Quote functions
export async function getRealQuote(amountFromWLD: string) {
  console.log("Getting real quote...")
  const params: SwapParams["quoteInput"] = {
    tokenIn: wldToken.address,
    tokenOut: tpfToken.address,
    amountIn: amountFromWLD,
    slippage: "0.3",
    fee: "0.2",
  }

  const result = await swapHelper.estimate.quote(params)
  console.log("Quote result:", result)

  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// Swap functions
export async function estimateSwap() {
  console.log("Estimating swap...")
  const params: SwapParams["quoteInput"] = {
    tokenIn: wldToken.address,
    tokenOut: tpfToken.address,
    amountIn: "2",
    slippage: "0.3",
    fee: "0.2",
  }

  const result = await swapHelper.estimate.quote(params)
  console.log("Swap estimate result:", result)
  return result
}

export async function doSwap({
  walletAddress,
  quote,
  amountIn,
}: {
  walletAddress: string
  quote: any
  amountIn: string
}) {
  console.log("Executing swap...")
  const params: SwapParams["quoteInput"] = {
    tokenIn: wldToken.address,
    tokenOut: tpfToken.address,
    amountIn: amountIn,
    slippage: "0.3",
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)
  const swapParams: SwapParams["input"] = {
    tokenIn: wldToken.address,
    tokenOut: tpfToken.address,
    amountIn: amountIn,
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value,
    },
    partnerCode: "24568", // Partner code as requested
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: "0x4bb270ef6dcb052a083bd5cff518e2e019c0f4ee", // Your fee receiver address
  }
  const result = await swapHelper.swap(swapParams)
  console.log("Swap result:", result)

  if (result.success) {
    return {
      success: true,
      result,
      transactionId: result.transactionId,
    }
  } else {
    throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
  }
}

// Validation functions
export async function validateContracts() {
  try {
    console.log("🔍 Validating contracts...")

    const wldCode = await provider.getCode(wldToken.address)
    const tpfCode = await provider.getCode(tpfToken.address)

    console.log("📋 Contract validation:")
    console.log("  - WLD contract exists:", wldCode !== "0x")
    console.log("  - TPF contract exists:", tpfCode !== "0x")

    if (wldCode === "0x") {
      throw new Error("WLD contract not found")
    }

    if (tpfCode === "0x") {
      throw new Error("TPF contract not found")
    }

    return true
  } catch (error) {
    console.error("❌ Contract validation failed:", error)
    throw error
  }
}

// Test functions
export async function testSwapHelper() {
  try {
    console.log("🧪 Testing SwapHelper...")

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    const testParams: SwapParams["quoteInput"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
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
    const tokenDetails = await tokenProvider.details(wldToken.address)
    console.log("📋 Token details:", tokenDetails)
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

// Export tokens and provider
export { TOKENS, provider, swapHelper }
