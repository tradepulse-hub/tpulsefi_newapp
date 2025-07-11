// doSwap.ts
// This file contains a standalone version of the doSwap function from the AniPage.
// It is designed to be self-contained and ready to share with others for demonstration purposes.

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
    address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    symbol: "TPF",
    name: "TradePulse Finance",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#FFFFFF",
  },
  {
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
    symbol: "WDD",
    name: "Drachma Token",
    decimals: 18,
    logo: "/images/drachma-token.png",
    color: "#FFD700",
  },
  {
    address: "0x868D08798F91ba9D6AC126148fdE8bBdfb6354D5",
    symbol: "TPT",
    name: "TradePulse Token",
    decimals: 18,
    logo: "/images/roflex-token.png",
    color: "#00FF00",
  },
]

// --- Provider and SDK setup ---
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })
const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)
const swapHelper = new SwapHelper(client, { tokenStorage: inmemoryTokenStorage })
const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldSwap = new HoldSo(tokenProvider, inmemoryTokenStorage)
swapHelper.load(zeroX)
swapHelper.load(worldSwap)

// --- Mocked helper functions (replace with real implementations as needed) ---
async function updateUserData(address: string) {
  // Placeholder for updating user data after swap
  console.log(`User data updated for address: ${address}`)
}
async function loadTokenBalances(address: string) {
  // Placeholder for reloading token balances after swap
  console.log(`Token balances loaded for address: ${address}`)
}
async function loadAniBalance(address: string) {
  // Placeholder for reloading ANI balance after swap
  console.log(`ANI balance loaded for address: ${address}`)
}

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
    console.log("Getting swap quote:", { tokenInAddress, tokenOutAddress, amountIn })

    const quote = await swapHelper.estimate.quote({
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn,
    })

    console.log("Quote received:", quote)
    return quote
  } catch (error) {
    console.error("Error getting quote:", error)
    throw error
  }
}

// --- The doSwap function ---
/**
 * Executes a token swap using the Worldchain SDK.
 * @param walletAddress The user's wallet address
 * @param quote The quote object returned from getSwapQuote
 * @param amountIn The amount to swap (as a string)
 * @param tokenInAddress The input token address
 * @param tokenOutAddress The output token address
 */
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
    const swapParams: SwapParams["input"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn,
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value,
      },
      partnerCode: "24568",
      feeAmountOut: quote.addons?.feeAmountOut,
      fee: "0.2",
      feeReceiver: "0x4bb270ef6dcb052a083bd5cff518e2e019c0f4ee",
    }

    console.log("Swapping with params:", swapParams)
    const result = await swapHelper.swap(swapParams)

    if (result.success) {
      // Wait for transaction to be confirmed
      await new Promise((res) => setTimeout(res, 2500))
      await provider.getBlockNumber()
      await updateUserData(walletAddress)
      await loadTokenBalances(walletAddress)
      await loadAniBalance(walletAddress)
      console.log("Swap successful!")
      return { success: true }
    } else {
      console.error("Swap failed: ", result)
      return { success: false, error: result.error || "Swap failed" }
    }
  } catch (error) {
    console.error("Swap failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
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

// Example usage (uncomment and fill in real values to test):
// doSwap({ walletAddress: "0x...", quote: { ... }, amountIn: "1.0", tokenInAddress: "0x...", tokenOutAddress: "0x..." })
