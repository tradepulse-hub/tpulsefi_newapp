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
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B", // Updated WDD address
    symbol: "WDD",
    name: "Drachma", // Updated name
    decimals: 18,
    logo: "/images/drachma-token.png", // Updated logo path
    color: "#FFD700",
  },
  {
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "/images/usdc.png",
    color: "#2775CA",
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
async function loadTpfBalance(address: string) {
  // Placeholder for reloading ANI balance after swap
  console.log(`TPF balance loaded for address: ${address}`)
}

// --- The doSwap function ---
/**
 * Executes a token swap using the Worldchain SDK.
 * @param walletAddress The user's wallet address
 * @param quote The quote object returned from swapHelper.estimate.quote
 * @param amountIn The amount of tokenIn to swap (as a string)
 * @param tokenInSymbol The symbol of the input token (e.g., "WLD")
 * @param tokenOutSymbol The symbol of the output token (e.g., "TPF")
 * @returns A result object indicating success or failure.
 */
export async function doSwap({
  walletAddress,
  quote,
  amountIn,
  tokenInSymbol,
  tokenOutSymbol,
}: {
  walletAddress: string
  quote: any
  amountIn: string
  tokenInSymbol: string
  tokenOutSymbol: string
}) {
  if (!walletAddress || !quote || !amountIn || !tokenInSymbol || !tokenOutSymbol) {
    console.warn("doSwap called with missing parameters.")
    return { success: false, errorCode: "MISSING_PARAMETERS" }
  }

  const tokenIn = TOKENS.find((t) => t.symbol === tokenInSymbol)
  const tokenOut = TOKENS.find((t) => t.symbol === tokenOutSymbol)

  if (!tokenIn || !tokenOut) {
    console.error("Invalid token symbols provided for swap.")
    return { success: false, errorCode: "INVALID_TOKEN_SYMBOLS" }
  }

  try {
    const swapParams: SwapParams["input"] = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
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
      await loadTpfBalance(walletAddress) // Considerar tornar isto dinâmico com base em tokenOut
      console.log("Swap successful!")
      return { success: true } // Explicitamente retornar sucesso
    } else {
      console.error("Swap failed: ", result)
      return { success: false, errorCode: result.errorCode || "UNKNOWN_SWAP_ERROR", error: result }
    }
  } catch (error: any) {
    console.error("Swap failed:", error)
    return { success: false, errorCode: error.message || "EXCEPTION_CAUGHT", error: error }
  }
}

// Example usage (uncomment and fill in real values to test):
// doSwap({ walletAddress: "0x...", quote: { ... }, amountIn: "1.0", tokenInSymbol: "WLD", tokenOutSymbol: "TPF" })
