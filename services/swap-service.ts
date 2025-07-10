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
    address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    symbol: "TPF",
    name: "TPulseFi",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#00D4FF",
  },
  {
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    symbol: "WLD",
    name: "Worldcoin",
    decimals: 18,
    logo: "/images/worldcoin.jpeg",
    color: "#000000",
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

// --- Helper functions ---
async function updateUserData(address: string) {
  // Placeholder for updating user data after swap
  console.log(`User data updated for address: ${address}`)
}

async function loadTokenBalances(address: string) {
  // Placeholder for reloading token balances after swap
  console.log(`Token balances loaded for address: ${address}`)
}

// --- Swap Service Class ---
export class SwapService {
  private initialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    try {
      console.log("🔄 Initializing Swap Service...")
      // SDK is already initialized above
      this.initialized = true
      console.log("✅ Swap Service initialized!")
    } catch (error) {
      console.error("❌ Error initializing Swap Service:", error)
    }
  }

  // Get available tokens for swapping
  getAvailableTokens() {
    return TOKENS
  }

  // Get quote for swap
  async getSwapQuote(tokenInAddress: string, tokenOutAddress: string, amountIn: string) {
    try {
      if (!this.initialized) await this.initialize()

      console.log(`💱 Getting swap quote: ${amountIn} ${tokenInAddress} -> ${tokenOutAddress}`)

      const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === tokenInAddress.toLowerCase())
      const tokenOut = TOKENS.find((t) => t.address.toLowerCase() === tokenOutAddress.toLowerCase())

      if (!tokenIn || !tokenOut) {
        throw new Error("Token not found")
      }

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals)

      // Get quote from swap helper
      const quote = await swapHelper.estimate.quote({
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: amountInWei.toString(),
      })

      console.log("📊 Quote received:", quote)

      return {
        ...quote,
        tokenIn,
        tokenOut,
        amountInFormatted: amountIn,
        amountOutFormatted: ethers.formatUnits(quote.amountOut || "0", tokenOut.decimals),
      }
    } catch (error) {
      console.error("❌ Error getting swap quote:", error)
      throw error
    }
  }

  // Execute swap
  async executeSwap({
    walletAddress,
    tokenInAddress,
    tokenOutAddress,
    amountIn,
    quote,
  }: {
    walletAddress: string
    tokenInAddress: string
    tokenOutAddress: string
    amountIn: string
    quote: any
  }) {
    try {
      if (!this.initialized) await this.initialize()

      console.log("🔄 Executing swap...")

      const swapParams: SwapParams["input"] = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: ethers.parseUnits(amountIn, 18).toString(),
        tx: {
          data: quote.data,
          to: quote.to,
          value: quote.value || "0",
        },
        partnerCode: "14298",
        feeAmountOut: quote.addons?.feeAmountOut,
        fee: "0.2",
        feeReceiver: "0x4bb270ef6dcb052a083bd5cff518e2e019c0f4ee",
      }

      console.log("Swapping with params:", swapParams)
      const result = await swapHelper.swap(swapParams)

      if (result.success) {
        console.log("✅ Swap successful!")

        // Wait for transaction to be confirmed
        await new Promise((res) => setTimeout(res, 2500))
        await provider.getBlockNumber()
        await updateUserData(walletAddress)
        await loadTokenBalances(walletAddress)

        return {
          success: true,
          transactionHash: result.transactionHash,
          result,
        }
      } else {
        console.error("❌ Swap failed:", result)
        return {
          success: false,
          error: result.error || "Swap failed",
        }
      }
    } catch (error) {
      console.error("❌ Error executing swap:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Get token by address
  getTokenByAddress(address: string) {
    return TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  }

  // Get token by symbol
  getTokenBySymbol(symbol: string) {
    return TOKENS.find((t) => t.symbol === symbol)
  }
}

// Export singleton instance
export const swapService = new SwapService()

// --- The doSwap function (legacy compatibility) ---
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
  return swapService.executeSwap({
    walletAddress,
    tokenInAddress,
    tokenOutAddress,
    amountIn,
    quote,
  })
}
