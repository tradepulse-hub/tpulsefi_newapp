import { ethers } from "ethers"
import {
  config,
  HoldSo,
  SwapHelper,
  TokenProvider,
  ZeroX,
  inmemoryTokenStorage,
  type SwapParams,
} from "@holdstation/worldchain-sdk"
import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6"

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

// --- Provider and SDK setup CORRETO baseado nos exemplos ---
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
console.log("🔄 Initializing swap service with RPC:", RPC_URL)

// ✅ Configuração EXATA dos exemplos do Holdstation
let provider: ethers.JsonRpcProvider
let client: Client
let swapHelper: SwapHelper
let tokenProvider: TokenProvider

// Função para inicializar o SDK corretamente
async function initializeSDK() {
  try {
    console.log("🚀 Initializing Holdstation SDK...")

    // ✅ Provider configuration EXATA dos exemplos
    provider = new ethers.JsonRpcProvider(RPC_URL, {
      chainId: 480,
      name: "worldchain",
    })

    console.log("✅ Provider created")

    // Test provider connection
    const blockNumber = await provider.getBlockNumber()
    console.log("✅ Provider connected, block:", blockNumber)

    // ✅ Client configuration EXATA dos exemplos
    client = new Client(provider)
    console.log("✅ Client created")

    // ✅ Global config EXATA dos exemplos
    config.client = client
    config.multicall3 = new Multicall3(provider)
    console.log("✅ Config set")

    // ✅ TokenProvider EXATA dos exemplos
    tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
    console.log("✅ TokenProvider created")

    // ✅ SwapHelper EXATA dos exemplos
    swapHelper = new SwapHelper(client, {
      tokenStorage: inmemoryTokenStorage,
    })
    console.log("✅ SwapHelper created")

    // ✅ Load modules EXATA dos exemplos
    const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
    const holdSo = new HoldSo(tokenProvider, inmemoryTokenStorage)

    await swapHelper.load(zeroX)
    await swapHelper.load(holdSo)
    console.log("✅ Modules loaded successfully")

    // Test basic functionality
    const testResult = await testBasicFunctionality()
    if (!testResult) {
      throw new Error("Basic functionality test failed")
    }

    console.log("🎉 SDK initialized successfully!")
    return true
  } catch (error) {
    console.error("❌ SDK initialization failed:", error)
    throw error
  }
}

// Test basic functionality
async function testBasicFunctionality() {
  try {
    console.log("🧪 Testing basic SDK functionality...")

    // Test token details
    const tokenDetails = await tokenProvider.details(wldToken.address, tpfToken.address)
    console.log("✅ Token details fetched:", Object.keys(tokenDetails))

    // Test if swapHelper is ready
    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper estimate not available")
    }

    console.log("✅ Basic functionality test passed")
    return true
  } catch (error) {
    console.error("❌ Basic functionality test failed:", error)
    return false
  }
}

// Initialize SDK on module load
let sdkInitialized = false
const initPromise = initializeSDK()
  .then(() => {
    sdkInitialized = true
  })
  .catch((error) => {
    console.error("❌ Failed to initialize SDK:", error)
    sdkInitialized = false
  })

// Ensure SDK is initialized before any operation
async function ensureSDKInitialized() {
  if (!sdkInitialized) {
    console.log("⏳ Waiting for SDK initialization...")
    await initPromise
  }

  if (!sdkInitialized) {
    throw new Error("SDK not initialized")
  }
}

// Função correta para obter quote baseada nos exemplos
export async function getRealQuote(amountFromWLD: string) {
  try {
    await ensureSDKInitialized()

    console.log("🔄 Getting REAL quote from Holdstation SDK...")
    console.log("📊 Input amount WLD:", amountFromWLD)

    // Validate input
    const amount = Number.parseFloat(amountFromWLD)
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount")
    }

    // ✅ Parâmetros EXATOS dos exemplos
    const quoteParams: SwapParams["quoteInput"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
      amountIn: amountFromWLD,
      slippage: "0.3", // 0.3%
      fee: "0.2", // 0.2%
    }

    console.log("📤 Quote params:", JSON.stringify(quoteParams, null, 2))

    // Get quote with timeout
    const quotePromise = swapHelper.estimate.quote(quoteParams)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Quote timeout after 30s")), 30000)
    })

    const quote = (await Promise.race([quotePromise, timeoutPromise])) as SwapParams["quoteOutput"]

    console.log("📥 Quote received:")
    console.log("  - data exists:", !!quote.data)
    console.log("  - data length:", quote.data?.length)
    console.log("  - to:", quote.to)
    console.log("  - value:", quote.value)
    console.log("  - addons:", quote.addons)

    // Validate quote
    if (!quote.data || !quote.to) {
      throw new Error("Invalid quote: missing data or to field")
    }

    // Validate contract
    if (quote.to) {
      try {
        const contractCode = await provider.getCode(quote.to)
        if (contractCode === "0x") {
          throw new Error("Quote points to invalid contract: " + quote.to)
        }
        console.log("✅ Quote contract is valid")
      } catch (contractError) {
        console.error("❌ Contract validation failed:", contractError)
        throw new Error("Invalid quote contract")
      }
    }

    // Extract output amount
    const outputAmount = quote.addons?.outAmount
    if (!outputAmount) {
      throw new Error("No output amount in quote")
    }

    console.log("✅ Quote successful, output amount:", outputAmount)

    return {
      quote,
      outputAmount: outputAmount.toString(),
      rawOutputAmount: outputAmount,
    }
  } catch (error) {
    console.error("❌ Error getting quote:", error)

    // Provide more specific error messages
    if (error.message?.includes("timeout")) {
      throw new Error("Quote request timed out. Please try again.")
    } else if (error.message?.includes("fetch")) {
      throw new Error("Network error. Please check your connection.")
    } else if (error.message?.includes("Invalid")) {
      throw new Error("Invalid quote parameters.")
    } else {
      throw new Error(`Quote failed: ${error.message || "Unknown error"}`)
    }
  }
}

// --- The doSwap function - IMPLEMENTAÇÃO CORRETA BASEADA NOS EXEMPLOS ---
export async function doSwap({
  walletAddress,
  quote,
  amountIn,
}: {
  walletAddress: string
  quote: any
  amountIn: string
}) {
  try {
    await ensureSDKInitialized()

    if (!walletAddress || !quote || !amountIn) {
      throw new Error("Missing required parameters for swap")
    }

    console.log("🚀 Starting swap with Holdstation SDK...")
    console.log("📋 Swap parameters:")
    console.log("  - walletAddress:", walletAddress)
    console.log("  - amountIn:", amountIn)
    console.log("  - tokenIn:", wldToken.address)
    console.log("  - tokenOut:", tpfToken.address)

    // Validate quote
    if (!quote.data || !quote.to) {
      throw new Error("Invalid quote: missing transaction data")
    }

    // ✅ Parâmetros EXATOS dos exemplos
    const swapParams: SwapParams["input"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
      amountIn,
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value || "0",
      },
      partnerCode: "24568",
      feeAmountOut: quote.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: "0x4bb270ef6dcb052a083bd5cff518e2e019c0f4ee",
    }

    console.log("📤 Executing swap...")

    // Execute swap with timeout
    const swapPromise = swapHelper.swap(swapParams)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Swap timeout after 60s")), 60000)
    })

    const result = (await Promise.race([swapPromise, timeoutPromise])) as SwapParams["output"]

    console.log("📥 Swap result:", result)

    if (result.success) {
      console.log("✅ Swap executed successfully!")
      console.log("🎯 Transaction ID:", result.transactionId)

      return {
        success: true,
        result,
        transactionId: result.transactionId,
      }
    } else {
      console.error("❌ Swap failed:", result.errorCode)
      throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
    }
  } catch (error) {
    console.error("❌ Swap execution failed:", error)

    // Provide more specific error messages
    if (error.message?.includes("timeout")) {
      throw new Error("Swap request timed out. Please try again.")
    } else if (error.message?.includes("fetch")) {
      throw new Error("Network error during swap. Please try again.")
    } else if (error.message?.includes("Insufficient")) {
      throw new Error("Insufficient balance for swap.")
    } else {
      throw new Error(`Swap failed: ${error.message || "Unknown error"}`)
    }
  }
}

// Função para verificar se os contratos são válidos
export async function validateContracts() {
  try {
    await ensureSDKInitialized()

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

    console.log("✅ Contracts validated successfully")
    return true
  } catch (error) {
    console.error("❌ Contract validation failed:", error)
    throw error
  }
}

// Test function
export async function testSwapHelper() {
  try {
    await ensureSDKInitialized()

    console.log("🧪 Testing SwapHelper...")

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    // Test with small amount
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

// Debug function
export async function debugHoldstationSDK() {
  try {
    await ensureSDKInitialized()

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

// Export tokens and functions
export { TOKENS }

// Export provider only after initialization
export const getProvider = async () => {
  await ensureSDKInitialized()
  return provider
}

export const getSwapHelper = async () => {
  await ensureSDKInitialized()
  return swapHelper
}
