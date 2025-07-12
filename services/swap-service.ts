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

// Holdstation contract address
const HOLDSTATION_CONTRACT = "0x43222f934ea5c593a060a6d46772fdbdc2e2cff0"

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
  console.log("🔍 Fetching multiple token details...")
  console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)
  const tokens = await tokenProvider.details(
    "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
  )

  console.log("✅ Token Details:", tokens)
  return tokens
}

export async function getTokenInfo() {
  console.log("🔍 Fetching single token info...")
  console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)
  const tokenInfo = await tokenProvider.details("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45") // TPF

  console.log("✅ Token Info:", tokenInfo)
  return tokenInfo
}

// Quote functions
export async function getRealQuote(amountFromWLD: string) {
  console.log("🔄 Getting real quote...")
  console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: amountFromWLD,
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

// Swap functions
export async function estimateSwap() {
  console.log("🧪 Estimating swap...")
  console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
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
}: {
  walletAddress: string
  quote: any
  amountIn: string
}) {
  console.log("🚀 Executing swap...")
  console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: amountIn,
    slippage: "0.3",
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)
  const swapParams: SwapParams["input"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
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
}

export async function swap() {
  console.log("🚀 Executing swap...")
  console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)
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
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS or your fee receiver address
  }
  const result = await swapHelper.swap(swapParams)
  console.log("✅ Swap result:", result)
  return result
}

// Additional helper functions for compatibility
export async function validateContracts() {
  try {
    console.log("🔍 Validating contracts...")
    console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)

    const wldCode = await provider.getCode("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
    const tpfCode = await provider.getCode("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45")
    const holdstationCode = await provider.getCode(HOLDSTATION_CONTRACT)

    console.log("📋 Contract validation:")
    console.log("  - WLD contract exists:", wldCode !== "0x")
    console.log("  - TPF contract exists:", tpfCode !== "0x")
    console.log("  - Holdstation contract exists:", holdstationCode !== "0x")

    if (wldCode === "0x") {
      throw new Error("WLD contract not found")
    }

    if (tpfCode === "0x") {
      throw new Error("TPF contract not found")
    }

    if (holdstationCode === "0x") {
      throw new Error("Holdstation contract not found")
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
    console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)

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
    console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)

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
    console.log("🔍 Debugging contract interaction...")
    console.log("📋 Using Holdstation contract:", HOLDSTATION_CONTRACT)

    const holdstationCode = await provider.getCode(HOLDSTATION_CONTRACT)
    console.log("📋 Holdstation contract code length:", holdstationCode.length)
    console.log("📋 Holdstation contract exists:", holdstationCode !== "0x")

    if (holdstationCode === "0x") {
      console.error("❌ Holdstation contract not found at:", HOLDSTATION_CONTRACT)
    } else {
      console.log("✅ Holdstation contract found at:", HOLDSTATION_CONTRACT)
    }
  } catch (error) {
    console.error("❌ Contract interaction debug failed:", error)
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

export { provider, swapHelper, HOLDSTATION_CONTRACT }
