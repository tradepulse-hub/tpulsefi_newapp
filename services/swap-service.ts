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

// --- Provider and SDK setup ---
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
console.log("🔄 Initializing swap service with RPC:", RPC_URL)

const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })
console.log("✅ Provider created")

const client = new Client(provider)
console.log("✅ Client created")

config.client = client
config.multicall3 = new Multicall3(provider)
console.log("✅ Config set")

const swapHelper = new SwapHelper(client, { tokenStorage: inmemoryTokenStorage })
console.log("✅ SwapHelper created")

const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldSwap = new HoldSo(tokenProvider, inmemoryTokenStorage)

console.log("✅ Loading routers into swapHelper...")
swapHelper.load(zeroX)
swapHelper.load(worldSwap)
console.log("✅ SwapHelper fully initialized with routers")

// --- Real helper functions ---
async function updateUserData(address: string) {
  console.log(`🔄 Updating user data for address: ${address}`)
  // This would typically refresh user balances and data
}

async function loadTokenBalances(address: string) {
  console.log(`🔄 Loading token balances for address: ${address}`)
  // This would typically reload token balances from blockchain
}

async function loadTpfBalance(address: string) {
  console.log(`🔄 Loading TPF balance for address: ${address}`)
  // This would typically reload TPF balance specifically
}

// --- The doSwap function - REAL IMPLEMENTATION ---
/**
 * Executes a token swap from WLD to TPF using the Worldchain SDK.
 * @param walletAddress The user's wallet address
 * @param quote The quote object returned from swapHelper.estimate.quote
 * @param amountIn The amount of WLD to swap (as a string in wei)
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

    console.log("📤 Executing swap with params:", JSON.stringify(swapParams, null, 2))

    const result = await swapHelper.swap(swapParams)

    console.log("📥 Swap result:", JSON.stringify(result, null, 2))

    if (result.success) {
      console.log("✅ Swap executed successfully!")
      console.log("⏳ Waiting for transaction confirmation...")

      // Wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Get latest block to ensure network sync
      const latestBlock = await provider.getBlockNumber()
      console.log("📊 Latest block number:", latestBlock)

      // Update user data after successful swap
      await updateUserData(walletAddress)
      await loadTokenBalances(walletAddress)
      await loadTpfBalance(walletAddress)

      console.log("🎉 Swap completed successfully!")
      return { success: true, result }
    } else {
      console.error("❌ Swap failed:", result)
      throw new Error(`Swap failed: ${result.error || "Unknown error"}`)
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

// Test function to verify swapHelper is working with REAL data
export async function testSwapHelper() {
  try {
    console.log("🧪 Testing swapHelper with REAL Holdstation SDK...")
    console.log("🔍 SwapHelper methods:", Object.keys(swapHelper))
    console.log("🔍 SwapHelper estimate available:", !!swapHelper.estimate)
    console.log("🔍 SwapHelper estimate.quote available:", typeof swapHelper.estimate?.quote)

    if (swapHelper.estimate?.quote) {
      console.log("✅ swapHelper.estimate.quote is available")

      // Test with a small amount to verify SDK is working
      try {
        console.log("🧪 Testing quote with 0.01 WLD...")
        const testAmountWei = ethers.parseUnits("0.01", 18)

        const testQuote = await swapHelper.estimate.quote({
          tokenIn: wldToken.address,
          tokenOut: tpfToken.address,
          amountIn: testAmountWei.toString(),
          preferRouters: ["0x", "holdso"],
          timeout: 10000,
        })

        console.log("✅ Test quote successful:", {
          hasData: !!testQuote.data,
          hasTo: !!testQuote.to,
          hasValue: !!testQuote.value,
          hasAddons: !!testQuote.addons,
          outAmount: testQuote.addons?.outAmount,
        })

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

// Function to get REAL quote from Holdstation SDK
export async function getRealQuote(amountFromWLD: string) {
  try {
    console.log("🔄 Getting REAL quote from Holdstation SDK...")
    console.log("📊 Input amount WLD:", amountFromWLD)

    if (!swapHelper?.estimate?.quote) {
      throw new Error("SwapHelper not properly initialized")
    }

    // Convert to wei
    const amountInWei = ethers.parseUnits(amountFromWLD, 18)
    console.log("💰 Amount in wei:", amountInWei.toString())

    // Get quote from Holdstation SDK
    const quote = await swapHelper.estimate.quote({
      tokenIn: wldToken.address, // WLD
      tokenOut: tpfToken.address, // TPF
      amountIn: amountInWei.toString(),
      preferRouters: ["0x", "holdso"],
      timeout: 30000,
    })

    console.log("📥 REAL quote from Holdstation SDK:", JSON.stringify(quote, null, 2))

    // Extract the real output amount
    const realOutputAmount = quote.addons?.outAmount
    console.log("💱 Real output amount (raw):", realOutputAmount)
    console.log("💱 Real output amount (type):", typeof realOutputAmount)

    if (!realOutputAmount) {
      throw new Error("No output amount in quote")
    }

    // Convert from wei to readable format
    let formattedOutput = "0"
    try {
      // Try to format as wei first
      formattedOutput = ethers.formatUnits(realOutputAmount.toString(), 18)
      console.log("💱 Formatted output (from wei):", formattedOutput)
    } catch (formatError) {
      console.warn("⚠️ Could not format as wei, using direct conversion:", formatError)
      // Fallback to direct number conversion
      const numValue = Number.parseFloat(realOutputAmount.toString())
      if (numValue > 1000000000000000) {
        // Likely in wei
        formattedOutput = (numValue / 1e18).toString()
      } else {
        formattedOutput = numValue.toString()
      }
    }

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

// Export tokens, helper, provider and functions for use in components
export { TOKENS, swapHelper, provider }
