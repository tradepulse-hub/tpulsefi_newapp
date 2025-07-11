import { ethers } from "ethers"

// Partner code updated to 24568
const PARTNER_CODE = "24568"

// Token configurations for Worldchain
export const TOKENS = [
  {
    symbol: "TPF",
    name: "The People's Fund",
    address: "0x4200000000000000000000000000000000000042",
    decimals: 18,
    icon: "/images/logo-tpf.png",
  },
  {
    symbol: "WLD",
    name: "Worldcoin",
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    decimals: 18,
    icon: "/images/worldcoin.jpeg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    decimals: 6,
    icon: "/placeholder.svg?height=32&width=32&text=USDC",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    icon: "/placeholder.svg?height=32&width=32&text=WETH",
  },
]

// Swap service configuration
const SWAP_API_BASE_URL = "https://api.1inch.dev/swap/v6.0/480"

interface SwapQuoteParams {
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: string
}

interface SwapParams {
  walletAddress: string
  quote: any
  amountIn: string
  tokenInAddress: string
  tokenOutAddress: string
}

export async function getSwapQuote({ tokenInAddress, tokenOutAddress, amountIn }: SwapQuoteParams) {
  try {
    console.log("🔄 Getting swap quote from 1inch API...")

    const params = new URLSearchParams({
      src: tokenInAddress,
      dst: tokenOutAddress,
      amount: amountIn,
      includeTokensInfo: "true",
      includeProtocols: "true",
      includeGas: "true",
      partner: PARTNER_CODE,
    })

    const response = await fetch(`${SWAP_API_BASE_URL}/quote?${params}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY || ""}`,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ 1inch API error:", response.status, errorText)
      throw new Error(`1inch API error: ${response.status} ${errorText}`)
    }

    const quote = await response.json()
    console.log("✅ Quote received from 1inch:", quote)

    return {
      ...quote,
      amountOut: quote.dstAmount || quote.toAmount,
      estimatedGas: quote.estimatedGas || quote.gas,
    }
  } catch (error) {
    console.error("❌ Error getting swap quote:", error)
    throw error
  }
}

export async function doSwap({ walletAddress, quote, amountIn, tokenInAddress, tokenOutAddress }: SwapParams) {
  try {
    console.log("🚀 Executing swap with 1inch API...")

    const params = new URLSearchParams({
      src: tokenInAddress,
      dst: tokenOutAddress,
      amount: amountIn,
      from: walletAddress,
      slippage: "1", // 1% slippage
      disableEstimate: "true",
      allowPartialFill: "false",
      partner: PARTNER_CODE,
    })

    const response = await fetch(`${SWAP_API_BASE_URL}/swap?${params}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY || ""}`,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ 1inch swap API error:", response.status, errorText)
      throw new Error(`1inch swap API error: ${response.status} ${errorText}`)
    }

    const swapData = await response.json()
    console.log("✅ Swap data received from 1inch:", swapData)

    // Here you would typically execute the transaction using MiniKit or Web3
    // For now, we'll simulate a successful swap
    console.log("💱 Simulating swap execution...")

    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      amountOut: swapData.dstAmount || swapData.toAmount,
      data: swapData,
    }
  } catch (error) {
    console.error("❌ Error executing swap:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper function to get token by symbol
export function getTokenBySymbol(symbol: string) {
  return TOKENS.find((token) => token.symbol === symbol)
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
