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

// Configuração correta do provider como nos exemplos
const provider = new ethers.JsonRpcProvider(
  RPC_URL,
  {
    chainId: 480,
    name: "WorldChain",
  },
  {
    staticNetwork: true,
  },
)
console.log("✅ Provider created")

// Configuração correta do client
const client = new Client(provider)
console.log("✅ Client created")

// Configuração global correta
config.client = client
config.multicall3 = new Multicall3(provider)
console.log("✅ Config set")

// Inicialização correta do SwapHelper
const swapHelper = new SwapHelper(client, {
  tokenStorage: inmemoryTokenStorage,
})
console.log("✅ SwapHelper created")

// Configuração correta dos módulos
const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const holdSo = new HoldSo(tokenProvider, inmemoryTokenStorage)

console.log("✅ Loading routers into swapHelper...")
swapHelper.load(zeroX)
swapHelper.load(holdSo)
console.log("✅ SwapHelper fully initialized with routers")

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
  if (!walletAddress || !quote || !amountIn) {
    console.error("❌ Missing required parameters for swap")
    throw new Error("Missing required parameters for swap")
  }

  try {
    console.log("🚀 Starting REAL swap with Holdstation SDK...")
    console.log("📋 Swap parameters:")
    console.log("  - walletAddress:", walletAddress)
    console.log("  - amountIn:", amountIn)
    console.log("  - tokenIn:", wldToken.address)
    console.log("  - tokenOut:", tpfToken.address)
    console.log("  - quote.data:", quote.data?.substring(0, 100) + "...")
    console.log("  - quote.to:", quote.to)
    console.log("  - quote.value:", quote.value)
    console.log("  - quote.addons:", quote.addons)

    // Verificar se o quote tem os campos obrigatórios
    if (!quote.data || !quote.to) {
      throw new Error("Invalid quote: missing data or to field")
    }

    // Parâmetros corretos baseados EXATAMENTE nos exemplos do Holdstation
    // Usar apenas os campos obrigatórios primeiro
    const swapParams: SwapParams["input"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
      amountIn, // Já vem em wei
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value || "0",
      },
    }

    console.log("📤 Executing swap with minimal params:")
    console.log(JSON.stringify(swapParams, null, 2))

    // Usar o swapHelper.swap diretamente como nos exemplos
    const result = await swapHelper.swap(swapParams)

    console.log("📥 Swap result:")
    console.log("  - success:", result.success)
    console.log("  - transactionId:", result.transactionId)
    console.log("  - errorCode:", result.errorCode)
    console.log("  - full result:", JSON.stringify(result, null, 2))

    // Verificar o resultado baseado na interface SwapParams["output"]
    if (result.success) {
      console.log("✅ Swap executed successfully!")
      console.log("🎯 Transaction ID:", result.transactionId)

      // Wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 3000))

      console.log("🎉 Swap completed successfully!")
      return {
        success: true,
        result,
        transactionId: result.transactionId,
      }
    } else {
      console.error("❌ Swap failed:", result)
      console.error("❌ Error code:", result.errorCode)
      throw new Error(`Swap failed: ${result.errorCode || "Unknown error"}`)
    }
  } catch (error) {
    console.error("❌ Swap execution failed:", error)
    console.error("❌ Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })

    // Log específico para erro de contrato inválido
    if (error?.message?.includes("invalid contract") || error?.message?.includes("Invalid contract")) {
      console.error("🔍 INVALID CONTRACT ERROR DETAILS:")
      console.error("  - quote.to:", quote.to)
      console.error("  - quote.data length:", quote.data?.length)
      console.error("  - tokenIn:", wldToken.address)
      console.error("  - tokenOut:", tpfToken.address)
      console.error("  - amountIn:", amountIn)
    }

    throw error
  }
}

// Função para verificar se os contratos são válidos
export async function validateContracts() {
  try {
    console.log("🔍 Validating contracts...")

    // Verificar se os tokens existem
    const wldCode = await provider.getCode(wldToken.address)
    const tpfCode = await provider.getCode(tpfToken.address)

    console.log("📋 Contract validation:")
    console.log("  - WLD contract exists:", wldCode !== "0x")
    console.log("  - TPF contract exists:", tpfCode !== "0x")
    console.log("  - WLD address:", wldToken.address)
    console.log("  - TPF address:", tpfToken.address)

    if (wldCode === "0x") {
      throw new Error("WLD contract not found at address: " + wldToken.address)
    }

    if (tpfCode === "0x") {
      throw new Error("TPF contract not found at address: " + tpfToken.address)
    }

    return true
  } catch (error) {
    console.error("❌ Contract validation failed:", error)
    throw error
  }
}

// Função correta para obter quote baseada nos exemplos
export async function getRealQuote(amountFromWLD: string) {
  try {
    console.log("🔄 Getting REAL quote from Holdstation SDK...")
    console.log("📊 Input amount WLD:", amountFromWLD)

    // Primeiro validar contratos
    await validateContracts()

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not properly initialized")
    }

    // Parâmetros corretos baseados na interface SwapParams["quoteInput"]
    const quoteParams: SwapParams["quoteInput"] = {
      tokenIn: wldToken.address, // WLD
      tokenOut: tpfToken.address, // TPF
      amountIn: amountFromWLD, // Valor em formato decimal (não wei)
      slippage: "0.5", // Aumentar slippage para 0.5%
      fee: "0.2", // 0.2% fee
      preferRouters: ["hold-so"], // Usar apenas hold-so primeiro
      timeout: 30000,
    }

    console.log("📤 Quote params:", JSON.stringify(quoteParams, null, 2))

    // Get quote from Holdstation SDK
    const quote = await swapHelper.estimate.quote(quoteParams)

    console.log("📥 REAL quote from Holdstation SDK:")
    console.log("  - data exists:", !!quote.data)
    console.log("  - data length:", quote.data?.length)
    console.log("  - to:", quote.to)
    console.log("  - value:", quote.value)
    console.log("  - addons:", quote.addons)

    // Validar se o quote.to é um contrato válido
    if (quote.to) {
      const contractCode = await provider.getCode(quote.to)
      console.log("  - quote.to contract exists:", contractCode !== "0x")
      if (contractCode === "0x") {
        throw new Error("Quote points to invalid contract: " + quote.to)
      }
    }

    // Extract the real output amount
    const realOutputAmount = quote.addons?.outAmount
    console.log("💱 Real output amount (raw):", realOutputAmount)

    if (!realOutputAmount) {
      throw new Error("No output amount in quote")
    }

    // Validar se o quote tem todos os campos necessários
    if (!quote.data || !quote.to) {
      throw new Error("Invalid quote: missing data or to field")
    }

    // O outAmount já vem formatado corretamente (não em wei)
    const formattedOutput = realOutputAmount.toString()
    console.log("✅ Final formatted TPF amount:", formattedOutput)

    return {
      quote,
      outputAmount: formattedOutput,
      rawOutputAmount: realOutputAmount,
    }
  } catch (error) {
    console.error("❌ Error getting real quote:", error)
    throw error
  }
}

// Test function baseado nos exemplos
export async function testSwapHelper() {
  try {
    console.log("🧪 Testing swapHelper with REAL Holdstation SDK...")

    // Primeiro validar contratos
    await validateContracts()

    console.log("🔍 SwapHelper methods:", Object.keys(swapHelper))
    console.log("🔍 SwapHelper estimate available:", !!swapHelper.estimate)
    console.log("🔍 SwapHelper estimate.quote available:", typeof swapHelper.estimate?.quote)

    if (swapHelper.estimate?.quote) {
      console.log("✅ swapHelper.estimate.quote is available")

      // Test com parâmetros corretos baseados nos exemplos
      try {
        console.log("🧪 Testing quote with 0.001 WLD...")

        const testParams: SwapParams["quoteInput"] = {
          tokenIn: wldToken.address,
          tokenOut: tpfToken.address,
          amountIn: "0.001", // Valor decimal pequeno
          slippage: "0.5",
          fee: "0.2",
          preferRouters: ["hold-so"], // Apenas hold-so
          timeout: 10000,
        }

        const testQuote = await swapHelper.estimate.quote(testParams)

        console.log("✅ Test quote successful:", {
          hasData: !!testQuote.data,
          hasTo: !!testQuote.to,
          hasValue: !!testQuote.value,
          hasAddons: !!testQuote.addons,
          outAmount: testQuote.addons?.outAmount,
        })

        // Validar o contrato do quote
        if (testQuote.to) {
          const contractCode = await provider.getCode(testQuote.to)
          console.log("✅ Quote contract is valid:", contractCode !== "0x")
        }

        return true
      } catch (testError) {
        console.error("❌ Test quote failed:", testError)
        return false
      }
    } else {
      console.error("❌ swapHelper.estimate.quote is not available")
      return false
    }
  } catch (error) {
    console.error("❌ Error testing swapHelper:", error)
    return false
  }
}

// Debug functions para entender a estrutura
export async function debugHoldstationSDK() {
  console.log("🔍 DEBUGGING HOLDSTATION SDK STRUCTURE")

  try {
    // 1. Validar contratos primeiro
    await validateContracts()

    // 2. Check SwapHelper structure
    console.log("📋 SwapHelper structure:", {
      swapHelper: !!swapHelper,
      methods: Object.keys(swapHelper),
      estimate: !!swapHelper.estimate,
      estimateMethods: swapHelper.estimate ? Object.keys(swapHelper.estimate) : null,
      swap: !!swapHelper.swap,
      swapType: typeof swapHelper.swap,
    })

    // 3. Check provider connection
    const blockNumber = await provider.getBlockNumber()
    console.log("📋 Provider connected, latest block:", blockNumber)

    // 4. Check client connection
    console.log("📋 Client structure:", {
      client: !!client,
      clientMethods: Object.keys(client),
    })

    // 5. Test basic quote
    console.log("🧪 Attempting basic quote...")
    try {
      const testParams: SwapParams["quoteInput"] = {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: "0.001",
        slippage: "0.5",
        fee: "0.2",
        preferRouters: ["hold-so"],
        timeout: 10000,
      }

      const basicQuote = await swapHelper.estimate.quote(testParams)
      console.log("✅ Basic quote successful")
      console.log("  - has data:", !!basicQuote.data)
      console.log("  - has to:", !!basicQuote.to)
      console.log("  - to address:", basicQuote.to)

      // Verificar se o contrato do quote é válido
      if (basicQuote.to) {
        const contractCode = await provider.getCode(basicQuote.to)
        console.log("  - contract valid:", contractCode !== "0x")
        if (contractCode === "0x") {
          console.error("❌ Quote points to invalid contract!")
        }
      }
    } catch (basicError) {
      console.log("❌ Basic quote failed:", basicError.message)
    }
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

// Função para testar diferentes parâmetros
export async function testQuoteParameters(amountWLD: string) {
  console.log("🧪 TESTING DIFFERENT QUOTE PARAMETERS")

  const testCases = [
    // Apenas hold-so
    {
      name: "Hold-So Only",
      params: {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: amountWLD,
        slippage: "0.5",
        fee: "0.2",
        preferRouters: ["hold-so"],
        timeout: 30000,
      } as SwapParams["quoteInput"],
    },
    // Apenas 0x
    {
      name: "0x Only",
      params: {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: amountWLD,
        slippage: "0.5",
        fee: "0.2",
        preferRouters: ["0x"],
        timeout: 30000,
      } as SwapParams["quoteInput"],
    },
    // Sem preferência de router
    {
      name: "No Router Preference",
      params: {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: amountWLD,
        slippage: "0.5",
        fee: "0.2",
        timeout: 30000,
      } as SwapParams["quoteInput"],
    },
  ]

  for (const testCase of testCases) {
    try {
      console.log(`🧪 Testing ${testCase.name} parameters:`, testCase.params)
      const quote = await swapHelper.estimate.quote(testCase.params)

      // Validar o contrato
      let contractValid = false
      if (quote.to) {
        const contractCode = await provider.getCode(quote.to)
        contractValid = contractCode !== "0x"
      }

      console.log(`✅ ${testCase.name} quote successful:`, {
        hasData: !!quote.data,
        hasTo: !!quote.to,
        hasValue: !!quote.value,
        hasAddons: !!quote.addons,
        outAmount: quote.addons?.outAmount,
        contractValid,
        toAddress: quote.to,
      })

      if (contractValid) {
        return quote // Return first valid quote
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} quote failed:`, error.message)
    }
  }

  throw new Error("All quote parameter combinations failed")
}

// Export tokens, helper, provider and functions for use in components
export { TOKENS, swapHelper, provider }
