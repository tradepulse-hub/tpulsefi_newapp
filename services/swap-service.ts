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
  // Placeholder for reloading ANI balance after swap
  console.log(`TPF balance loaded for address: ${address}`)
}

// --- The doSwap function ---
/**
 * Executes a token swap from WLD to TPF using the Worldchain SDK.
 * @param walletAddress The user's wallet address
 * @param quote The quote object returned from swapHelper.estimate.quote
 * @param amountIn The amount of WLD to swap (as a string)
 */
export async function doSwap({
  walletAddress,
  quote,
  amountIn,
}: {
  walletAddress: string
  quote: any
  amountIn: string
}) {
  if (!walletAddress || !quote || !amountIn) return
  try {
    const swapParams: SwapParams["input"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
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
      await loadTpfBalance(walletAddress)
      console.log("Swap successful!")
    } else {
      console.error("Swap failed: ", result)
    }
  } catch (error) {
    console.error("Swap failed:", error)
  }
}

// Example usage (uncomment and fill in real values to test):
// doSwap({ walletAddress: "0x...", quote: { ... }, amountIn: "1.0" })
