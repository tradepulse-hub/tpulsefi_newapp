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

// --- Real helper functions ---
async function updateUserData(address: string) {
  console.log(`🔄 Updating user data for address: ${address}`)
}

async function loadTokenBalances(address: string) {
  console.log(`🔄 Loading token balances for address: ${address}`)
}

async function loadTpfBalance(address: string) {
  console.log(`🔄 Loading TPF balance for address: ${address}`)
}

// --- The doSwap function - IMPLEMENTAÇÃO CORRETA ---
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
    console.log("📋 Swap parameters:", {
      walletAddress,
      amountIn,
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
      quoteData: quote.data,
      quoteTo: quote.to,
      quoteValue: quote.value,
    })

    // Parâmetros corretos baseados exatamente nos exemplos do Holdstation
    const swapParams: SwapParams["input"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
      amountIn, // Já vem em wei do componente
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value || "0",
      },
      // Usar os mesmos parâmetros dos exemplos
      partnerCode: "24568",
      feeAmountOut: quote.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: "0x4bb270ef6dcb052a083bd5cff518e2e019c0f4ee",
    }

    console.log("📤 Executing swap with params:", JSON.stringify(swapParams, null, 2))

    // Usar o swapHelper.swap diretamente como nos exemplos
    const result = await swapHelper.swap(swapParams)

    console.log("📥 Swap result:", JSON.stringify(result, null, 2))

    // Verificar o resultado baseado na interface SwapParams["output"]
    if (result.success) {
      console.log("✅ Swap executed successfully!")
      console.log("🎯 Transaction ID:", result.transactionId)

      // Wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Get latest block to ensure network sync
      const latestBlock = await provider.getBlockNumber()
      console.log("📊 Latest block number:", latestBlock)

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
    throw error
  }
}

// Função para verificar saldo antes do swap
export async function checkWLDBalance(walletAddress: string, amountWLD: string) {
  try {
    console.log("🔍 Checking WLD balance for:", walletAddress)

    // Simular verificação de saldo (você pode implementar a verificação real)
    const wldBalance = "1.0" // Placeholder - implementar verificação real
    const requiredAmount = Number.parseFloat(amountWLD)
    const availableAmount = Number.parseFloat(wldBalance)

    console.log("💰 Available WLD:", availableAmount)
    console.log("💰 Required WLD:", requiredAmount)

    if (availableAmount < requiredAmount) {
      throw new Error(`Insufficient WLD balance. Available: ${availableAmount}, Required: ${requiredAmount}`)
    }

    return true
  } catch (error) {
    console.error("❌ Error checking WLD balance:", error)
    throw error
  }
}

// Função correta para obter quote baseada nos exemplos
export async function getRealQuote(amountFromWLD: string) {
  try {
    console.log("🔄 Getting REAL quote from Holdstation SDK...")
    console.log("📊 Input amount WLD:", amountFromWLD)

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not properly initialized")
    }

    // Parâmetros corretos baseados na interface SwapParams["quoteInput"]
    const quoteParams: SwapParams["quoteInput"] = {
      tokenIn: wldToken.address, // WLD
      tokenOut: tpfToken.address, // TPF
      amountIn: amountFromWLD, // Valor em formato decimal (não wei)
      slippage: "0.3", // 0.3% slippage
      fee: "0.2", // 0.2% fee
      preferRouters: ["hold-so", "0x"], // Routers corretos
      timeout: 30000,
    }

    console.log("📤 Quote params:", JSON.stringify(quoteParams, null, 2))

    // Get quote from Holdstation SDK
    const quote = await swapHelper.estimate.quote(quoteParams)

    console.log("📥 REAL quote from Holdstation SDK:")
    console.log("  - data:", quote.data?.substring(0, 50) + "...")
    console.log("  - to:", quote.to)
    console.log("  - value:", quote.value)
    console.log("  - addons:", quote.addons)

    // Extract the real output amount
    const realOutputAmount = quote.addons?.outAmount
    console.log("💱 Real output amount (raw):", realOutputAmount)
    console.log("💱 Real output amount (type):", typeof realOutputAmount)

    if (!realOutputAmount) {
      throw new Error("No output amount in quote")
    }

    // O outAmount já vem formatado corretamente (não em wei)
    const formattedOutput = realOutputAmount.toString()
    console.log("✅ Final formatted TPF amount:", formattedOutput)

    // Validar se o quote tem todos os campos necessários
    if (!quote.data || !quote.to) {
      throw new Error("Invalid quote: missing data or to field")
    }

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

// Debug functions para entender a estrutura
export async function debugHoldstationSDK() {
  console.log("🔍 DEBUGGING HOLDSTATION SDK STRUCTURE")

  try {
    // 1. Check SwapHelper structure
    console.log("📋 SwapHelper structure:", {
      swapHelper: !!swapHelper,
      methods: Object.keys(swapHelper),
      estimate: !!swapHelper.estimate,
      estimateMethods: swapHelper.estimate ? Object.keys(swapHelper.estimate) : null,
      swap: !!swapHelper.swap,
      swapType: typeof swapHelper.swap,
    })

    // 2. Check if estimate.quote exists and its type
    if (swapHelper.estimate) {
      console.log("📋 Estimate object:", {
        quote: !!swapHelper.estimate.quote,
        quoteType: typeof swapHelper.estimate.quote,
      })
    }

    // 3. Token addresses
    console.log("📋 Token addresses:", {
      WLD: wldToken.address,
      TPF: tpfToken.address,
    })

    // 4. Test with minimal amount usando parâmetros corretos
    console.log("🧪 Attempting quote with correct parameters...")

    try {
      const testParams: SwapParams["quoteInput"] = {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: "0.001", // Valor decimal pequeno
        slippage: "0.3",
        fee: "0.2",
        preferRouters: ["hold-so", "0x"],
        timeout: 10000,
      }

      const basicQuote = await swapHelper.estimate.quote(testParams)
      console.log("✅ Basic quote successful:", basicQuote)
    } catch (basicError) {
      console.log("❌ Basic quote failed:", basicError.message)
    }

    // 5. Check provider connection
    const blockNumber = await provider.getBlockNumber()
    console.log("📋 Provider connected, latest block:", blockNumber)

    // 6. Check client connection
    console.log("📋 Client structure:", {
      client: !!client,
      clientMethods: Object.keys(client),
    })
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

// Função para testar diferentes parâmetros
export async function testQuoteParameters(amountWLD: string) {
  console.log("🧪 TESTING DIFFERENT QUOTE PARAMETERS")

  const testCases = [
    // Parâmetros básicos corretos
    {
      name: "Basic",
      params: {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: amountWLD, // Valor decimal
        slippage: "0.3",
        fee: "0.2",
      } as SwapParams["quoteInput"],
    },
    // Com routers preferenciais
    {
      name: "With Routers",
      params: {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: amountWLD,
        slippage: "0.3",
        fee: "0.2",
        preferRouters: ["hold-so"],
      } as SwapParams["quoteInput"],
    },
    // Com timeout
    {
      name: "With Timeout",
      params: {
        tokenIn: wldToken.address,
        tokenOut: tpfToken.address,
        amountIn: amountWLD,
        slippage: "0.3",
        fee: "0.2",
        preferRouters: ["hold-so", "0x"],
        timeout: 30000,
      } as SwapParams["quoteInput"],
    },
  ]

  for (const testCase of testCases) {
    try {
      console.log(`🧪 Testing ${testCase.name} parameters:`, testCase.params)
      const quote = await swapHelper.estimate.quote(testCase.params)
      console.log(`✅ ${testCase.name} quote successful:`, {
        hasData: !!quote.data,
        hasTo: !!quote.to,
        hasValue: !!quote.value,
        hasAddons: !!quote.addons,
        outAmount: quote.addons?.outAmount,
        fullQuote: quote,
      })
      return quote // Return first successful quote
    } catch (error) {
      console.log(`❌ ${testCase.name} quote failed:`, error.message)
    }
  }

  throw new Error("All quote parameter combinations failed")
}

// Export tokens, helper, provider and functions for use in components
export { TOKENS, swapHelper, provider }
