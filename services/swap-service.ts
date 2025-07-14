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
  console.log(`User data updated for address: ${address}`)
}
async function loadTokenBalances(address: string) {
  console.log(`Token balances loaded for address: ${address}`)
}
async function loadTPFBalance(address: string) {
  console.log(`TPF balance loaded for address: ${address}`)
}
async function loadUSDCBalance(address: string) {
  console.log(`USDC balance loaded for address: ${address}`)
}
async function loadWDDBalance(address: string) {
  console.log(`WDD balance loaded for address: ${address}`)
}

function getTokenSymbol(address: string): string {
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  return token?.symbol || "UNKNOWN"
}

// --- Quote function ---
export async function getRealQuote(amountIn: string, tokenInAddress: string, tokenOutAddress: string) {
  console.log(
    `🔄 Getting real quote: ${amountIn} from ${getTokenSymbol(tokenInAddress)} to ${getTokenSymbol(tokenOutAddress)}`,
  )

  const params: SwapParams["quoteInput"] = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: amountIn,
    slippage: "0.3",
    fee: "0.2",
  }

  const result = await swapHelper.estimate.quote(params)
  console.log("✅ Quote result:", result)

  return {
    quote: result,
    outputAmount: result.addons?.outAmount || "0",
    rawOutputAmount: result.addons?.outAmount || "0",
  }
}

// --- The doSwap function ---
// This is the main swap function, following your specified logic (line 95)
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
      partnerCode: "24568", // Your partner code
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

      // Call specific balance loader based on the output token
      const tokenOutSymbol = getTokenSymbol(tokenOutAddress)
      if (tokenOutSymbol === "TPF") await loadTPFBalance(walletAddress)
      if (tokenOutSymbol === "USDC") await loadUSDCBalance(walletAddress)
      if (tokenOutSymbol === "WDD") await loadWDDBalance(walletAddress)

      console.log("Swap successful!")
    } else {
      console.error("Swap failed: ", result)
    }
  } catch (error) {
    console.error("Swap failed:", error)
  }
}

// --- Default swap function for testing ---
// This function also follows your specified logic (line 138)
export async function swap() {
  console.log("🔄 Executing default swap (WLD to TPF)...")

  const params: SwapParams["quoteInput"] = {
    tokenIn: wldToken.address,
    tokenOut: tpfToken.address,
    amountIn: "2",
    slippage: "0.3",
    fee: "0.2",
  }

  const quote = await swapHelper.estimate.quote(params)
  if (!quote) {
    console.error("Could not get a quote for the default swap.")
    return
  }

  // Using a placeholder wallet address for this example
  const walletAddress = "0x0000000000000000000000000000000000000000"

  try {
    const swapParams: SwapParams["input"] = {
      tokenIn: wldToken.address,
      tokenOut: tpfToken.address,
      amountIn: "2",
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value,
      },
      partnerCode: "24568", // Your partner code
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
      await loadTPFBalance(walletAddress) // Specific for TPF
      console.log("Swap successful!")
    } else {
      console.error("Swap failed: ", result)
    }
  } catch (error) {
    console.error("Swap failed:", error)
  }
}

export { provider, swapHelper }
