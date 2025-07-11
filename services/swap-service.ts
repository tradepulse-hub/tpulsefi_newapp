import { ethers } from "ethers"
import { Client, Multicall3, Quoter, SwapHelper } from "@holdstation/worldchain-ethers-v6"
import { config, inmemoryTokenStorage, TokenProvider } from "@holdstation/worldchain-sdk"

// --- Token definitions ---
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
    address: "0x4200000000000000000000000000000000000042",
    symbol: "TPF",
    name: "The People's Fund",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#FFFFFF",
  },
  {
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "/placeholder.svg?height=32&width=32&text=USDC",
    color: "#2775CA",
  },
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    logo: "/placeholder.svg?height=32&width=32&text=WETH",
    color: "#627EEA",
  },
]

// --- Provider and SDK setup ---
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })

const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)

const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const quoter = new Quoter(client)
const swapHelper = new SwapHelper(client, {
  tokenStorage: inmemoryTokenStorage,
})

// --- Get Quote function ---
export async function getSwapQuote({
  tokenInAddress,
  tokenOutAddress,
  amountIn,
}: {
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: string
}) {
  try {
    console.log("🔄 Getting swap quote:", { tokenInAddress, tokenOutAddress, amountIn })

    // Convert wei amount to human readable format for the quote
    const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
    if (!tokenIn) {
      throw new Error(`Token not found for address: ${tokenInAddress}`)
    }

    const humanReadableAmount = ethers.formatUnits(amountIn, tokenIn.decimals)
    console.log("💰 Human readable amount:", humanReadableAmount)

    const params = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: humanReadableAmount,
      slippage: "0.3", // 0.3% slippage
      fee: "0.2", // 0.2% fee
    }

    console.log("🔄 Quote params:", params)
    const quote = await swapHelper.quote(params)
    console.log("✅ Quote received:", quote)

    return {
      ...quote,
      amountOut: quote.amountOut,
      estimatedGas: quote.estimatedGas,
    }
  } catch (error) {
    console.error("❌ Error getting quote:", error)
    throw error
  }
}

// --- The doSwap function ---
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
  if (!walletAddress || !quote || !amountIn) {
    return { success: false, error: "Missing required parameters" }
  }

  try {
    console.log("🚀 Executing swap with params:", {
      walletAddress,
      tokenInAddress,
      tokenOutAddress,
      amountIn,
    })

    // Convert wei amount to human readable format for the swap
    const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
    if (!tokenIn) {
      throw new Error(`Token not found for address: ${tokenInAddress}`)
    }

    const humanReadableAmount = ethers.formatUnits(amountIn, tokenIn.decimals)
    console.log("💰 Human readable swap amount:", humanReadableAmount)

    const swapParams = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: humanReadableAmount,
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value,
      },
      feeAmountOut: quote.addons?.feeAmountOut,
      fee: "0.2", // 0.2% fee
      feeReceiver: "0x4bb270ef6dcb052a083bd5cff518e2e019c0f4ee", // Fee receiver address
    }

    console.log("💱 Swap params:", swapParams)
    const result = await swapHelper.swap(swapParams)

    if (result.success) {
      console.log("✅ Swap successful:", result)
      return {
        success: true,
        transactionHash: result.transactionHash,
        amountOut: result.amountOut,
      }
    } else {
      console.error("❌ Swap failed:", result)
      return {
        success: false,
        error: result.error || "Swap failed",
      }
    }
  } catch (error) {
    console.error("❌ Swap error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Helper function to get token by symbol
export function getTokenBySymbol(symbol: string) {
  return TOKENS.find((token) => token.symbol === symbol)
}

// Helper function to get token by address
export function getTokenByAddress(address: string) {
  return TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

// Helper function to format token amount
export function formatTokenAmount(amount: string, decimals: number): string {
  try {
    const formatted = ethers.formatUnits(amount, decimals)
    const num = Number.parseFloat(formatted)

    if (num === 0) return "0"
    if (num < 0.0001) return "<0.0001"
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  } catch (error) {
    console.error("Error formatting token amount:", error)
    return "0"
  }
}

// Helper function to get token details
export async function getTokenDetails(tokenAddress: string) {
  try {
    console.log("🔄 Getting token details for:", tokenAddress)
    const tokenInfo = await tokenProvider.details(tokenAddress)
    console.log("✅ Token details:", tokenInfo)
    return tokenInfo
  } catch (error) {
    console.error("❌ Error getting token details:", error)
    throw error
  }
}

// Helper function to get multiple token details
export async function getMultipleTokenDetails(tokenAddresses: string[]) {
  try {
    console.log("🔄 Getting multiple token details for:", tokenAddresses)
    const tokens = await tokenProvider.details(...tokenAddresses)
    console.log("✅ Multiple token details:", tokens)
    return tokens
  } catch (error) {
    console.error("❌ Error getting multiple token details:", error)
    throw error
  }
}

// Helper function for simple quote (preview)
export async function getSimpleQuote(tokenInAddress: string, tokenOutAddress: string) {
  try {
    console.log("🔄 Getting simple quote:", { tokenInAddress, tokenOutAddress })
    const quote = await quoter.simple(tokenInAddress, tokenOutAddress)
    console.log("✅ Simple quote:", quote)
    return quote
  } catch (error) {
    console.error("❌ Error getting simple quote:", error)
    throw error
  }
}

// Helper function for smart quote with slippage and deadline
export async function getSmartQuote(tokenInAddress: string, slippage = 3, deadline = 10) {
  try {
    console.log("🔄 Getting smart quote:", { tokenInAddress, slippage, deadline })
    const quote = await quoter.smart(tokenInAddress, {
      slippage,
      deadline,
    })
    console.log("✅ Smart quote:", quote)
    return quote
  } catch (error) {
    console.error("❌ Error getting smart quote:", error)
    throw error
  }
}
