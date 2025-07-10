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

// --- Token definitions (updated with project tokens) ---
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
  {
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
    symbol: "WDD",
    name: "Drachma",
    decimals: 18,
    logo: "/images/drachma-token.png",
    color: "#FFD700",
  },
  {
    address: "0x868D08798F91ba9D6AC126148fdE8bBdfb6354D5",
    symbol: "TPT",
    name: "TradePulse Token",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#FF6B35",
  },
]

const wldToken = TOKENS.find((t) => t.symbol === "WLD")!
const tpfToken = TOKENS.find((t) => t.symbol === "TPF")!

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
async function loadTpfBalance(address: string) {
  // Placeholder for reloading TPF balance after swap
  console.log(`TPF balance loaded for address: ${address}`)
}

// --- Helper function to get quote ---
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
    const params: SwapParams["quoteInput"] = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: amountIn,
      slippage: "3", // 3% slippage
      fee: "0.2", // 0.2% fee
    }

    console.log("Getting quote with params:", params)
    const estimate = await swapHelper.quote(params)
    console.log("Quote estimate:", estimate)

    return estimate
  } catch (error) {
    console.error("Error getting quote:", error)
    throw error
  }
}

// --- The doSwap function ---
/**
 * Executes a token swap using the Worldchain SDK.
 * @param walletAddress The user's wallet address
 * @param quote The quote object returned from swapHelper.quote
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
  if (!walletAddress || !quote || !amountIn) return
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
      await loadTpfBalance(walletAddress)
      console.log("Swap successful!")
      return { success: true, result }
    } else {
      console.error("Swap failed: ", result)
      return { success: false, error: result }
    }
  } catch (error) {
    console.error("Swap failed:", error)
    return { success: false, error }
  }
}

// Export helper functions for the mini wallet
export { TOKENS, swapHelper, provider }

// Example usage (uncomment and fill in real values to test):
// doSwap({ walletAddress: "0x...", quote: { ... }, amountIn: "1.0", tokenInAddress: "0x...", tokenOutAddress: "0x..." })
