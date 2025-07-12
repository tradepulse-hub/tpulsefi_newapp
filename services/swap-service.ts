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

swapHelper.load(zeroX)
swapHelper.load(worldswap)

// Token functions
export async function getTokenDetail() {
  console.log("Fetching multiple token details...")
  try {
    const tokens = await tokenProvider.details(
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    )

    console.log("Token Details:", tokens)
    return tokens
  } catch (error) {
    console.error("❌ Error fetching token details:", error)
    throw error
  }
}

export async function getTokenInfo() {
  console.log("Fetching single token info...")
  try {
    const tokenInfo = await tokenProvider.details("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45") // TPF

    console.log("Token Info:", tokenInfo)
    return tokenInfo
  } catch (error) {
    console.error("❌ Error fetching token info:", error)
    throw error
  }
}

// Quote functions
export async function getRealQuote(amountFromWLD: string) {
  console.log("🔍 Getting real quote for amount:", amountFromWLD)

  try {
    // Validate amount
    if (!amountFromWLD || amountFromWLD === "0") {
      throw new Error("Invalid amount")
    }

    // Convert to Wei if needed (assuming input is in ETH units)
    const amountInWei = ethers.parseEther(amountFromWLD).toString()
    console.log("📊 Amount in Wei:", amountInWei)

    const params: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: amountInWei,
      slippage: "0.3",
      fee: "0.2",
    }

    console.log("📋 Quote params:", params)

    const result = await swapHelper.estimate.quote(params)
    console.log("✅ Quote result:", result)

    if (!result || !result.data || !result.to) {
      throw new Error("Invalid quote response")
    }

    return {
      quote: result,
      outputAmount: result.addons?.outAmount || "0",
      rawOutputAmount: result.addons?.outAmount || "0",
    }
  } catch (error) {
    console.error("❌ Error getting quote:", error)
    throw error
  }
}

// Swap functions
export async function estimateSwap() {
  console.log("Estimating swap...")
  try {
    const params: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: ethers.parseEther("2").toString(),
      slippage: "0.3",
      fee: "0.2",
    }

    const result = await swapHelper.estimate.quote(params)
    console.log("Swap estimate result:", result)
    return result
  } catch (error) {
    console.error("❌ Error estimating swap:", error)
    throw error
  }
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
  console.log("🔄 Executing swap...")
  console.log("📊 Wallet:", walletAddress)
  console.log("📊 Amount:", amountIn)

  try {
    // Convert to Wei
    const amountInWei = ethers.parseEther(amountIn).toString()
    console.log("📊 Amount in Wei:", amountInWei)

    const params: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: amountInWei,
      slippage: "0.3",
      fee: "0.2",
    }

    console.log("📋 Getting fresh quote for swap...")
    const quoteResponse = await swapHelper.estimate.quote(params)
    console.log("📋 Fresh quote response:", quoteResponse)

    if (!quoteResponse || !quoteResponse.data || !quoteResponse.to) {
      throw new Error("Invalid quote response for swap")
    }

    const swapParams: SwapParams["input"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: amountInWei,
      tx: {
        data: quoteResponse.data,
        to: quoteResponse.to,
        value: quoteResponse.value,
      },
      partnerCode: "24568",
      feeAmountOut: quoteResponse.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: ethers.ZeroAddress,
    }

    console.log("📋 Swap params:", swapParams)

    const result = await swapHelper.swap(swapParams)
    console.log("✅ Swap result:", result)

    if (result.success) {
      return {
        success: true,
        result,
        transactionId: result.transactionId,
      }
    } else {
      throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
    }
  } catch (error) {
    console.error("❌ Error executing swap:", error)
    throw error
  }
}

export async function swap() {
  console.log("Executing swap...")
  try {
    const amountInWei = ethers.parseEther("2").toString()

    const params: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: amountInWei,
      slippage: "0.3",
      fee: "0.2",
    }

    const quoteResponse = await swapHelper.estimate.quote(params)
    const swapParams: SwapParams["input"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: amountInWei,
      tx: {
        data: quoteResponse.data,
        to: quoteResponse.to,
        value: quoteResponse.value,
      },
      partnerCode: "24568",
      feeAmountOut: quoteResponse.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: ethers.ZeroAddress,
    }
    const result = await swapHelper.swap(swapParams)
    console.log("Swap result:", result)
    return result
  } catch (error) {
    console.error("❌ Error in swap:", error)
    throw error
  }
}

// Additional helper functions for compatibility
export async function validateContracts() {
  try {
    console.log("🔍 Validating contracts...")

    const wldCode = await provider.getCode("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
    const tpfCode = await provider.getCode("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45")

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

export async function testSwapHelper() {
  try {
    console.log("🧪 Testing SwapHelper...")

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    const testParams: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: ethers.parseEther("0.001").toString(),
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

// Export for compatibility
export const TOKENS = [
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

export { provider, swapHelper }
