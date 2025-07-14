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
import { Mutex } from "async-mutex"
import NodeCache from "node-cache"

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

// Partner code e configuração de teste
const PARTNER_CODE = "24568"
const MAX_SLIPPAGE_TEST = "15.0" // 🧪 TESTE: Slippage máximo de 15%

// Cache e controle
const swapCache = new NodeCache({ stdTTL: 30 })
const swapMutex = new Mutex()

// Rate limiter simples
let requestCount = 0
let lastResetTime = Date.now()
const MAX_REQUESTS_PER_MINUTE = 15

function canMakeRequest(): boolean {
  const now = Date.now()
  if (now - lastResetTime > 60000) {
    requestCount = 0
    lastResetTime = now
  }

  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    console.log(`🚫 RATE LIMIT: ${requestCount}/${MAX_REQUESTS_PER_MINUTE} requests - BLOCKED`)
    return false
  }

  requestCount++
  console.log(`✅ RATE LIMIT: ${requestCount}/${MAX_REQUESTS_PER_MINUTE} requests`)
  return true
}

// Export tokens completos
export const TOKENS = [
  {
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    symbol: "WLD",
    name: "Worldcoin",
    decimals: 18,
    logo: "/images/worldcoin.jpeg",
    color: "#2563EB",
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

// Helper function para obter símbolo do token
function getTokenSymbol(address: string): string {
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  return token?.symbol || "UNKNOWN"
}

// Token functions
export async function getTokenDetail() {
  console.log("🔄 Fetching multiple token details...")
  const tokens = await tokenProvider.details(
    "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDC
    "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B", // WDD
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

// Quote functions - agora com teste de slippage máximo
export async function getRealQuote(amountFromWLD: string) {
  console.log(`🧪 TESTE DE SLIPPAGE: Getting quote with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage...`)

  if (!canMakeRequest()) {
    throw new Error("Rate limit exceeded. Please wait.")
  }

  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: amountFromWLD,
    slippage: MAX_SLIPPAGE_TEST, // 🧪 FORÇAR 15% de slippage
    fee: "0.2",
  }

  console.log(`📋 Quote params with MAX slippage:`, params)

  const result = await swapHelper.estimate.quote(params)
  console.log("✅ Quote result:", result)
  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// Quote function genérica para qualquer par de tokens
export async function getQuoteForTokens(tokenInAddress: string, tokenOutAddress: string, amountIn: string) {
  const tokenInSymbol = getTokenSymbol(tokenInAddress)
  const tokenOutSymbol = getTokenSymbol(tokenOutAddress)

  console.log(
    `🧪 TESTE DE SLIPPAGE: Getting quote ${amountIn} ${tokenInSymbol} → ${tokenOutSymbol} with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage...`,
  )

  if (!canMakeRequest()) {
    throw new Error("Rate limit exceeded. Please wait.")
  }

  const cacheKey = `quote_${tokenInAddress}_${tokenOutAddress}_${amountIn}_${MAX_SLIPPAGE_TEST}`
  const cached = swapCache.get(cacheKey)
  if (cached) {
    console.log("📦 Using cached quote")
    return cached
  }

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: MAX_SLIPPAGE_TEST, // 🧪 FORÇAR 15% de slippage
    fee: "0.2",
  }

  console.log(`📋 Quote params:`, params)

  const result = await swapHelper.estimate.quote(params)
  console.log(`✅ Quote result for ${tokenInSymbol} → ${tokenOutSymbol}:`, result)

  const quoteData = {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }

  // Cache por 30 segundos
  swapCache.set(cacheKey, quoteData)

  return quoteData
}

// Swap functions
export async function estimateSwap() {
  console.log(`🧪 TESTE DE SLIPPAGE: Estimating swap with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage...`)

  if (!canMakeRequest()) {
    throw new Error("Rate limit exceeded. Please wait.")
  }

  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
    slippage: MAX_SLIPPAGE_TEST, // 🧪 FORÇAR 15% de slippage
    fee: "0.2",
  }

  console.log(`📋 Estimate params with MAX slippage:`, params)

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
  return swapMutex.runExclusive(async () => {
    console.log(`🧪 TESTE DE SLIPPAGE: Executing swap with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage...`)

    if (!canMakeRequest()) {
      throw new Error("Rate limit exceeded. Please wait.")
    }

    const params: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: amountIn,
      slippage: MAX_SLIPPAGE_TEST, // 🧪 FORÇAR 15% de slippage
      fee: "0.2",
    }

    console.log(`📋 Swap quote params with MAX slippage:`, params)

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
      partnerCode: PARTNER_CODE,
      feeAmountOut: quoteResponse.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: ethers.ZeroAddress,
    }

    console.log(`📋 Swap execution params:`, {
      ...swapParams,
      tx: { ...swapParams.tx, data: swapParams.tx.data.slice(0, 20) + "..." },
    })

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
      const errorMsg = `Swap failed: ${result.errorCode || "Unknown error"}`

      // 🧪 Verificar se falhou mesmo com slippage máximo
      if (MAX_SLIPPAGE_TEST === "15.0") {
        console.error(`🧪 SLIPPAGE TEST FAILED: Swap failed even with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage!`)
        console.error("🔍 This proves the issue is NOT slippage-related. Possible causes:")
        console.error("   - Insufficient liquidity")
        console.error("   - Token contract issues")
        console.error("   - Network problems")
        console.error("   - API issues")
      }

      throw new Error(errorMsg)
    }
  })
}

// Função de swap genérica para qualquer par de tokens
export async function doSwapForTokens({
  walletAddress,
  tokenInAddress,
  tokenOutAddress,
  amountIn,
}: {
  walletAddress: string
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: string
}) {
  return swapMutex.runExclusive(async () => {
    const tokenInSymbol = getTokenSymbol(tokenInAddress)
    const tokenOutSymbol = getTokenSymbol(tokenOutAddress)

    console.log(
      `🧪 TESTE DE SLIPPAGE: Executing swap ${amountIn} ${tokenInSymbol} → ${tokenOutSymbol} with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage...`,
    )

    if (!canMakeRequest()) {
      throw new Error("Rate limit exceeded. Please wait.")
    }

    const params: SwapParams["quoteInput"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      slippage: MAX_SLIPPAGE_TEST, // 🧪 FORÇAR 15% de slippage
      fee: "0.2",
    }

    console.log(`📋 Swap quote params:`, params)

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
      partnerCode: PARTNER_CODE,
      feeAmountOut: quoteResponse.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: ethers.ZeroAddress,
    }

    console.log(`📋 Swap execution params for ${tokenInSymbol} → ${tokenOutSymbol}:`, {
      tokenIn: swapParams.tokenIn,
      tokenOut: swapParams.tokenOut,
      amountIn: swapParams.amountIn,
      partnerCode: swapParams.partnerCode,
      hasTransactionData: !!swapParams.tx.data,
    })

    const result = await swapHelper.swap(swapParams)
    console.log(`💱 Swap result for ${tokenInSymbol} → ${tokenOutSymbol}:`, result)

    if (result.success) {
      console.log(`✅ Swap ${tokenInSymbol} → ${tokenOutSymbol} completed successfully!`)
      return {
        success: true,
        result,
        transactionId: result.transactionId,
      }
    } else {
      const errorMsg = `Swap ${tokenInSymbol} → ${tokenOutSymbol} failed: ${result.errorCode || "Unknown error"}`

      // 🧪 Verificar se falhou mesmo com slippage máximo
      if (MAX_SLIPPAGE_TEST === "15.0") {
        console.error(
          `🧪 SLIPPAGE TEST FAILED: Swap ${tokenInSymbol} → ${tokenOutSymbol} failed even with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage!`,
        )
        console.error("🔍 This proves the issue is NOT slippage-related. Possible causes:")
        console.error("   - Insufficient liquidity for this token pair")
        console.error("   - Token contract compatibility issues")
        console.error("   - Network congestion")
        console.error("   - DEX routing problems")
      }

      throw new Error(errorMsg)
    }
  })
}

export async function swap() {
  console.log(`🧪 TESTE DE SLIPPAGE: Executing default swap with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage...`)

  if (!canMakeRequest()) {
    throw new Error("Rate limit exceeded. Please wait.")
  }

  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
    slippage: MAX_SLIPPAGE_TEST, // 🧪 FORÇAR 15% de slippage
    fee: "0.2",
  }

  console.log(`📋 Default swap params with MAX slippage:`, params)

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
    partnerCode: PARTNER_CODE,
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress,
  }

  const result = await swapHelper.swap(swapParams)
  console.log("✅ Default swap result:", result)

  // 🧪 Verificar resultado do teste de slippage
  if (!result.success && MAX_SLIPPAGE_TEST === "15.0") {
    console.error(`🧪 SLIPPAGE TEST FAILED: Default swap failed even with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage!`)
    console.error("🔍 This proves the issue is NOT slippage-related.")
  }

  return result
}

// Additional helper functions for compatibility
export async function validateContracts() {
  try {
    console.log("🔍 Validating contracts...")

    for (const token of TOKENS) {
      const code = await provider.getCode(token.address)
      console.log(`📋 ${token.symbol} contract exists:`, code !== "0x")

      if (code === "0x") {
        throw new Error(`${token.symbol} contract not found at ${token.address}`)
      }
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
      slippage: MAX_SLIPPAGE_TEST, // 🧪 Usar slippage máximo no teste
      fee: "0.2",
    }

    console.log(`📋 Test params with MAX slippage ${MAX_SLIPPAGE_TEST}%:`, testParams)

    const testQuote = await swapHelper.estimate.quote(testParams)
    console.log("✅ Test quote successful:", {
      hasData: !!testQuote.data,
      hasTo: !!testQuote.to,
      outAmount: testQuote.addons?.outAmount,
    })

    return true
  } catch (error) {
    console.error("❌ Test failed:", error)

    // 🧪 Verificar se teste falhou mesmo com slippage máximo
    if (MAX_SLIPPAGE_TEST === "15.0") {
      console.error(`🧪 SLIPPAGE TEST: SwapHelper test failed even with MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage!`)
    }

    return false
  }
}

export async function debugHoldstationSDK() {
  try {
    console.log("🔍 DEBUGGING HOLDSTATION SDK")
    console.log(`🧪 SLIPPAGE TEST MODE: Using MAXIMUM ${MAX_SLIPPAGE_TEST}% slippage`)
    console.log(`🤝 Partner Code: ${PARTNER_CODE}`)

    const blockNumber = await provider.getBlockNumber()
    console.log("📋 Provider connected, block:", blockNumber)
    console.log("📋 SwapHelper available:", !!swapHelper)
    console.log("📋 TokenProvider available:", !!tokenProvider)

    // Test token details
    const tokenDetails = await tokenProvider.details("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
    console.log("📋 Token details:", tokenDetails)

    // Test rate limiting
    console.log("📋 Rate limit status:", {
      requestCount,
      maxRequests: MAX_REQUESTS_PER_MINUTE,
      canMakeRequest: canMakeRequest(),
    })

    console.log("✅ Debug completed successfully")
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

export async function debugContractInteraction() {
  try {
    console.log("🔍 Debug contract interaction...")

    // Validar todos os contratos
    await validateContracts()

    // Testar SwapHelper
    const swapHelperTest = await testSwapHelper()

    console.log("📋 Contract interaction debug results:", {
      contractsValid: true,
      swapHelperWorking: swapHelperTest,
      slippageTestMode: MAX_SLIPPAGE_TEST,
      partnerCode: PARTNER_CODE,
    })

    return true
  } catch (error) {
    console.error("❌ Contract debug failed:", error)
    return false
  }
}

// Utility functions
export function getSwapConfig() {
  return {
    partnerCode: PARTNER_CODE,
    maxSlippage: MAX_SLIPPAGE_TEST,
    maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
    cacheTimeout: 30,
    tokens: TOKENS,
  }
}

export function clearSwapCache() {
  swapCache.flushAll()
  console.log("🧹 Swap cache cleared")
}

export function getSwapStats() {
  return {
    cache: {
      keys: swapCache.keys().length,
      stats: swapCache.getStats(),
    },
    rateLimit: {
      requestCount,
      maxRequests: MAX_REQUESTS_PER_MINUTE,
      canMakeRequest: requestCount < MAX_REQUESTS_PER_MINUTE,
    },
    config: getSwapConfig(),
  }
}

// Export principais
export { provider, swapHelper, tokenProvider, PARTNER_CODE, MAX_SLIPPAGE_TEST }
