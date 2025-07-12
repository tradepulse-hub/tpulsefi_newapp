import { ethers } from "ethers"

// Holdstation SDK configuration with correct contract
const HOLDSTATION_CONFIG = {
  baseURL: "https://api.holdstation.exchange",
  partnerCode: "24568", // TPulseFi partner code
  contractAddress: "0x43222f934ea5c593a060a6d46772fdbdc2e2cff0", // Contract from Holdstation dev portal
  chainId: 480, // Worldchain
  timeout: 30000,
}

// Token addresses on Worldchain
const TOKEN_ADDRESSES = {
  WLD: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // Worldcoin on Worldchain
  TPF: "0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C", // TPulseFi token
}

// Holdstation API endpoints
const ENDPOINTS = {
  quote: "/api/v1/quote",
  swap: "/api/v1/swap",
  allowance: "/api/v1/allowance",
  approve: "/api/v1/approve",
}

interface SwapQuote {
  data: string
  to: string
  value: string
  gasPrice: string
  gasLimit: string
  outputAmount: string
  priceImpact: string
  route: any[]
}

interface SwapParams {
  walletAddress: string
  quote: SwapQuote
  amountIn: string
}

interface SwapResult {
  success: boolean
  transactionId?: string
  error?: string
}

// Validate contract addresses
export async function validateContracts(): Promise<void> {
  console.log("🔗 Validating contract addresses...")
  console.log("🔗 Holdstation contract:", HOLDSTATION_CONFIG.contractAddress)

  try {
    // Check if addresses are valid
    for (const [symbol, address] of Object.entries(TOKEN_ADDRESSES)) {
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid address for ${symbol}: ${address}`)
      }
      console.log(`✅ ${symbol} address valid:`, address)
    }

    // Validate Holdstation contract
    if (!ethers.isAddress(HOLDSTATION_CONFIG.contractAddress)) {
      throw new Error(`Invalid Holdstation contract: ${HOLDSTATION_CONFIG.contractAddress}`)
    }

    console.log("✅ All contract addresses are valid")
  } catch (error) {
    console.error("❌ Contract validation failed:", error)
    throw error
  }
}

// Test Holdstation SDK helper
export async function testSwapHelper(): Promise<boolean> {
  console.log("🧪 Testing Holdstation SDK...")
  console.log("🧪 Using contract:", HOLDSTATION_CONFIG.contractAddress)

  try {
    const response = await fetch(`${HOLDSTATION_CONFIG.baseURL}/api/v1/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      console.log("✅ Holdstation API is accessible")
      return true
    } else {
      console.error("❌ Holdstation API returned error:", response.status)
      return false
    }
  } catch (error) {
    console.error("❌ Holdstation SDK test failed:", error)
    return false
  }
}

// Get real quote from Holdstation
export async function getRealQuote(amountIn: string): Promise<{ quote: SwapQuote; outputAmount: string }> {
  console.log("🔄 Getting quote from Holdstation for:", amountIn, "WLD")
  console.log("🔄 Using contract address:", HOLDSTATION_CONFIG.contractAddress)

  try {
    // Convert amount to wei
    const amountInWei = ethers.parseUnits(amountIn, 18)
    console.log("💰 Amount in wei:", amountInWei.toString())

    const quoteParams = {
      tokenIn: TOKEN_ADDRESSES.WLD,
      tokenOut: TOKEN_ADDRESSES.TPF,
      amountIn: amountInWei.toString(),
      slippage: "0.5", // 0.5% slippage
      partnerCode: HOLDSTATION_CONFIG.partnerCode,
      chainId: HOLDSTATION_CONFIG.chainId,
      contractAddress: HOLDSTATION_CONFIG.contractAddress, // Include contract address
    }

    console.log("🔄 Quote request params:", quoteParams)

    const response = await fetch(`${HOLDSTATION_CONFIG.baseURL}${ENDPOINTS.quote}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(quoteParams),
      signal: AbortSignal.timeout(HOLDSTATION_CONFIG.timeout),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Quote API error:", response.status, errorText)
      throw new Error(`Quote API error: ${response.status} - ${errorText}`)
    }

    const quoteData = await response.json()
    console.log("✅ Quote response received:", quoteData)

    if (!quoteData.data || !quoteData.to) {
      console.error("❌ Invalid quote data:", quoteData)
      throw new Error("Invalid quote data received")
    }

    // Format output amount
    const outputAmountWei = quoteData.outputAmount || "0"
    const outputAmount = ethers.formatUnits(outputAmountWei, 18)

    console.log("💱 Quote details:", {
      inputAmount: amountIn,
      outputAmount: outputAmount,
      priceImpact: quoteData.priceImpact,
      gasEstimate: quoteData.gasLimit,
      contractTo: quoteData.to,
    })

    return {
      quote: quoteData as SwapQuote,
      outputAmount: outputAmount,
    }
  } catch (error) {
    console.error("❌ Error getting quote:", error)
    throw error
  }
}

// Execute swap using Holdstation
export async function doSwap(params: SwapParams): Promise<SwapResult> {
  console.log("🚀 Starting swap execution...")
  console.log("🚀 Using Holdstation contract:", HOLDSTATION_CONFIG.contractAddress)
  console.log("🔄 Swap params:", {
    walletAddress: params.walletAddress,
    amountIn: params.amountIn,
    hasQuoteData: !!params.quote.data,
    quoteTo: params.quote.to,
  })

  try {
    // Validate inputs
    if (!params.walletAddress || !ethers.isAddress(params.walletAddress)) {
      throw new Error("Invalid wallet address")
    }

    if (!params.quote.data || !params.quote.to) {
      throw new Error("Invalid quote data")
    }

    if (!params.amountIn || params.amountIn === "0") {
      throw new Error("Invalid amount")
    }

    console.log("✅ Input validation passed")

    // Prepare swap transaction with correct contract
    const swapParams = {
      walletAddress: params.walletAddress,
      tokenIn: TOKEN_ADDRESSES.WLD,
      tokenOut: TOKEN_ADDRESSES.TPF,
      amountIn: params.amountIn,
      data: params.quote.data,
      to: params.quote.to,
      value: params.quote.value || "0",
      gasPrice: params.quote.gasPrice,
      gasLimit: params.quote.gasLimit,
      partnerCode: HOLDSTATION_CONFIG.partnerCode,
      chainId: HOLDSTATION_CONFIG.chainId,
      contractAddress: HOLDSTATION_CONFIG.contractAddress, // Include contract address
    }

    console.log("🔄 Executing swap with params:", swapParams)

    const response = await fetch(`${HOLDSTATION_CONFIG.baseURL}${ENDPOINTS.swap}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(swapParams),
      signal: AbortSignal.timeout(HOLDSTATION_CONFIG.timeout),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Swap API error:", response.status, errorText)
      throw new Error(`Swap API error: ${response.status} - ${errorText}`)
    }

    const swapResult = await response.json()
    console.log("✅ Swap response received:", swapResult)

    if (swapResult.success && swapResult.transactionHash) {
      console.log("🎯 Swap completed successfully!")
      console.log("🔗 Transaction hash:", swapResult.transactionHash)

      return {
        success: true,
        transactionId: swapResult.transactionHash,
      }
    } else {
      console.error("❌ Swap failed:", swapResult)
      throw new Error(swapResult.error || "Swap execution failed")
    }
  } catch (error) {
    console.error("❌ Swap execution error:", error)
    return {
      success: false,
      error: error.message || "Unknown swap error",
    }
  }
}

// Get token allowance
export async function getTokenAllowance(
  walletAddress: string,
  tokenAddress: string,
  spenderAddress: string,
): Promise<string> {
  console.log("🔄 Checking token allowance...")
  console.log("🔄 Spender contract:", spenderAddress)

  try {
    const response = await fetch(`${HOLDSTATION_CONFIG.baseURL}${ENDPOINTS.allowance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        tokenAddress,
        spenderAddress: HOLDSTATION_CONFIG.contractAddress, // Use correct contract
        chainId: HOLDSTATION_CONFIG.chainId,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`Allowance check failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Allowance checked:", result.allowance)

    return result.allowance || "0"
  } catch (error) {
    console.error("❌ Error checking allowance:", error)
    return "0"
  }
}

// Approve token spending
export async function approveToken(walletAddress: string, tokenAddress: string, amount: string): Promise<SwapResult> {
  console.log("🔄 Approving token spending...")
  console.log("🔄 Approving for contract:", HOLDSTATION_CONFIG.contractAddress)

  try {
    const response = await fetch(`${HOLDSTATION_CONFIG.baseURL}${ENDPOINTS.approve}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        tokenAddress,
        spenderAddress: HOLDSTATION_CONFIG.contractAddress, // Use correct contract
        amount,
        chainId: HOLDSTATION_CONFIG.chainId,
        partnerCode: HOLDSTATION_CONFIG.partnerCode,
      }),
      signal: AbortSignal.timeout(HOLDSTATION_CONFIG.timeout),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Approval failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Token approval completed:", result)

    return {
      success: true,
      transactionId: result.transactionHash,
    }
  } catch (error) {
    console.error("❌ Token approval error:", error)
    return {
      success: false,
      error: error.message || "Approval failed",
    }
  }
}

// Debug function to test contract interaction
export async function debugContractInteraction() {
  console.log("🔍 DEBUGGING CONTRACT INTERACTION")
  console.log("🔍 Holdstation contract:", HOLDSTATION_CONFIG.contractAddress)
  console.log("🔍 Partner code:", HOLDSTATION_CONFIG.partnerCode)
  console.log("🔍 Chain ID:", HOLDSTATION_CONFIG.chainId)

  try {
    // Test if contract exists on chain
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
    const contractCode = await provider.getCode(HOLDSTATION_CONFIG.contractAddress)

    console.log("🔍 Contract code exists:", contractCode !== "0x")
    console.log("🔍 Contract code length:", contractCode.length)

    if (contractCode === "0x") {
      console.error("❌ Contract not found on Worldchain!")
    } else {
      console.log("✅ Contract exists on Worldchain")
    }
  } catch (error) {
    console.error("❌ Contract debug failed:", error)
  }
}

// Export token addresses for use in other components
export { TOKEN_ADDRESSES, HOLDSTATION_CONFIG }
