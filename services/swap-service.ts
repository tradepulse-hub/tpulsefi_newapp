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

// Partner code
const PARTNER_CODE = "24568"

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

// Token functions
export async function getTokenDetail() {
  console.log("Fetching multiple token details...")
  const tokens = await tokenProvider.details(
    "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDC
    "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B", // WDD
  )
  console.log("Token Details:", tokens)
  return tokens
}

export async function getTokenInfo() {
  console.log("Fetching single token info...")
  const tokenInfo = await tokenProvider.details("0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45") // TPF
  console.log("Token Info:", tokenInfo)
  return tokenInfo
}

// Quote functions
export async function getRealQuote(amountFromWLD: string) {
  console.log("Getting real quote...")
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: amountFromWLD,
    slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
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
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
    slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
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
  console.log("🧪 TESTE DE SLIPPAGE: Executing swap with MAXIMUM 15% slippage...")

  // Primeiro obter quote com slippage máximo
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: amountIn,
    slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)

  // Usar a estrutura recomendada na documentação
  const swapInput: SwapParams["input"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: ethers.parseUnits(amountIn, 18).toString(), // Converter para wei (18 decimals)
    partnerCode: PARTNER_CODE, // Partner code obrigatório
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value || "0",
    },
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS ou seu endereço de taxa
  }

  console.log("📋 Swap input params:", {
    tokenIn: swapInput.tokenIn,
    tokenOut: swapInput.tokenOut,
    amountIn: swapInput.amountIn,
    partnerCode: swapInput.partnerCode,
    hasTransactionData: !!swapInput.tx.data,
  })

  const result = await swapHelper.swap(swapInput)
  console.log("Swap result:", result)

  if (result.success) {
    console.log("✅ Swap completed successfully!")
    return {
      success: true,
      result,
      transactionId: result.transactionId,
    }
  } else {
    // 🧪 Verificar se falhou mesmo com slippage máximo
    console.error("🧪 SLIPPAGE TEST FAILED: Swap failed even with MAXIMUM 15% slippage!")
    console.error("🔍 This proves the issue is NOT slippage-related. Possible causes:")
    console.error("   - Insufficient liquidity")
    console.error("   - Token contract issues")
    console.error("   - Network problems")
    console.error("   - API issues")

    throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
  }
}

export async function swap() {
  console.log("🧪 TESTE DE SLIPPAGE: Executing default swap with MAXIMUM 15% slippage...")

  // Primeiro obter quote com slippage máximo
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: "2",
    slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)

  // Usar a estrutura recomendada na documentação
  const swapInput: SwapParams["input"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
    amountIn: ethers.parseUnits("2", 18).toString(), // 2 tokens com 18 decimais
    partnerCode: PARTNER_CODE, // Partner code obrigatório
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value || "0",
    },
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS ou seu endereço de taxa
  }

  console.log("📋 Default swap input params:", {
    tokenIn: swapInput.tokenIn,
    tokenOut: swapInput.tokenOut,
    amountIn: swapInput.amountIn,
    partnerCode: swapInput.partnerCode,
    hasTransactionData: !!swapInput.tx.data,
  })

  const result = await swapHelper.swap(swapInput)
  console.log("Default swap result:", result)

  // 🧪 Verificar resultado do teste de slippage
  if (!result.success) {
    console.error("🧪 SLIPPAGE TEST FAILED: Default swap failed even with MAXIMUM 15% slippage!")
    console.error("🔍 This proves the issue is NOT slippage-related.")
  }

  return result
}

// Função genérica para swap entre qualquer par de tokens
export async function doSwapForTokens({
  tokenInAddress,
  tokenOutAddress,
  amountIn,
  walletAddress,
}: {
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: string
  walletAddress: string
}) {
  const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
  const tokenOut = TOKENS.find((t) => t.address.toLowerCase() === tokenOutAddress.toLowerCase())

  console.log(
    `🧪 TESTE DE SLIPPAGE: Executing swap ${amountIn} ${tokenIn?.symbol || "UNKNOWN"} → ${tokenOut?.symbol || "UNKNOWN"} with MAXIMUM 15% slippage...`,
  )

  // Primeiro obter quote com slippage máximo
  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
    fee: "0.2",
  }

  const quoteResponse = await swapHelper.estimate.quote(params)

  // Usar a estrutura recomendada na documentação
  const swapInput: SwapParams["input"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: ethers.parseUnits(amountIn, tokenIn?.decimals || 18).toString(), // Converter para wei
    partnerCode: PARTNER_CODE, // Partner code obrigatório
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value || "0",
    },
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS ou seu endereço de taxa
  }

  console.log(`📋 Swap input params for ${tokenIn?.symbol} → ${tokenOut?.symbol}:`, {
    tokenIn: swapInput.tokenIn,
    tokenOut: swapInput.tokenOut,
    amountIn: swapInput.amountIn,
    partnerCode: swapInput.partnerCode,
    hasTransactionData: !!swapInput.tx.data,
  })

  const result = await swapHelper.swap(swapInput)
  console.log(`Swap result for ${tokenIn?.symbol} → ${tokenOut?.symbol}:`, result)

  if (result.success) {
    console.log(`✅ Swap ${tokenIn?.symbol} → ${tokenOut?.symbol} completed successfully!`)
    return {
      success: true,
      result,
      transactionId: result.transactionId,
    }
  } else {
    // 🧪 Verificar se falhou mesmo com slippage máximo
    console.error(
      `🧪 SLIPPAGE TEST FAILED: Swap ${tokenIn?.symbol} → ${tokenOut?.symbol} failed even with MAXIMUM 15% slippage!`,
    )
    console.error("🔍 This proves the issue is NOT slippage-related. Possible causes:")
    console.error("   - Insufficient liquidity for this token pair")
    console.error("   - Token contract compatibility issues")
    console.error("   - Network congestion")
    console.error("   - DEX routing problems")

    throw new Error(`Swap ${tokenIn?.symbol} → ${tokenOut?.symbol} failed: ${result.errorCode || "Unknown error"}`)
  }
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
    console.log("🧪 Testing SwapHelper with MAXIMUM 15% slippage...")

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not available")
    }

    const testParams: SwapParams["quoteInput"] = {
      tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD
      tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPF
      amountIn: "0.001",
      slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
      fee: "0.2",
    }

    console.log("📋 Test params with MAX slippage:", testParams)

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
    console.error("🧪 SLIPPAGE TEST: SwapHelper test failed even with MAXIMUM 15% slippage!")

    return false
  }
}

export async function debugHoldstationSDK() {
  try {
    console.log("🔍 DEBUGGING HOLDSTATION SDK")
    console.log("🧪 SLIPPAGE TEST MODE: Using MAXIMUM 15% slippage")
    console.log(`🤝 Partner Code: ${PARTNER_CODE}`)

    const blockNumber = await provider.getBlockNumber()
    console.log("📋 Provider connected, block:", blockNumber)
    console.log("📋 SwapHelper available:", !!swapHelper)
    console.log("📋 TokenProvider available:", !!tokenProvider)

    // Test token details
    const tokenDetails = await tokenProvider.details("0x2cFc85d8E48F8EAB294be644d9E25C3030863003")
    console.log("📋 Token details:", tokenDetails)

    console.log("✅ Debug completed successfully")
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

// Função para testar quote genérica
export async function getQuoteForTokens(tokenInAddress: string, tokenOutAddress: string, amountIn: string) {
  const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
  const tokenOut = TOKENS.find((t) => t.address.toLowerCase() === tokenOutAddress.toLowerCase())

  console.log(
    `🧪 TESTE DE SLIPPAGE: Getting quote ${amountIn} ${tokenIn?.symbol || "UNKNOWN"} → ${tokenOut?.symbol || "UNKNOWN"} with MAXIMUM 15% slippage...`,
  )

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "15.0", // 🧪 TESTE: Slippage máximo de 15%
    fee: "0.2",
  }

  console.log(`📋 Quote params for ${tokenIn?.symbol} → ${tokenOut?.symbol}:`, params)

  const result = await swapHelper.estimate.quote(params)
  console.log(`✅ Quote result for ${tokenIn?.symbol} → ${tokenOut?.symbol}:`, result)

  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// Utility functions
export function getSwapConfig() {
  return {
    partnerCode: PARTNER_CODE,
    maxSlippage: "15.0",
    tokens: TOKENS,
    rpcUrl: RPC_URL,
    chainId: 480,
  }
}

export { provider, swapHelper, tokenProvider, PARTNER_CODE }
