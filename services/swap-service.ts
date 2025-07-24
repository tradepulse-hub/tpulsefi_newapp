import { walletService } from "@/services/wallet-service"
import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6"
import { config, HoldSo, inmemoryTokenStorage, SwapHelper, TokenProvider, ZeroX } from "@holdstation/worldchain-sdk"
import { ethers } from "ethers"

// Definindo TOKENS para corresponder ao serviço de swap
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
  {
    address: "0x5fa570E9c8514cdFaD81DB6ce0A327D55251fBD4",
    symbol: "KPP", // Assuming KPP as symbol for KeplerPay
    name: "KeplerPay",
    decimals: 18, // Assuming 18 decimals
    logo: "/images/keplerpay-logo.png",
    color: "#6A0DAD", // Deep purple color
  },
]

// Configuração do SDK Holdstation (mantida aqui para a função de cotação)
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })
const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)
const swapHelper = new SwapHelper(client, {
  tokenStorage: inmemoryTokenStorage,
})
const tokenProvider = new TokenProvider({
  client,
  multicall3: config.multicall3,
})
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldSwap = new HoldSo(tokenProvider, inmemoryTokenStorage)
swapHelper.load(zeroX)
swapHelper.load(worldSwap)

interface SwapParams {
  walletAddress: string
  quote: any
  amountIn: string
  tokenInSymbol: string
  tokenOutSymbol: string
}

export async function doSwap(params: SwapParams): Promise<{ success: boolean; error?: any; errorCode?: string }> {
  try {
    const { walletAddress, quote, amountIn, tokenInSymbol, tokenOutSymbol } = params

    const tokenInObj = TOKENS.find((t) => t.symbol === tokenInSymbol)
    const tokenOutObj = TOKENS.find((t) => t.symbol === tokenOutSymbol)

    if (!tokenInObj || !tokenOutObj) {
      throw new Error("Invalid token selection.")
    }

    const signer = await walletService.getSigner()

    if (!signer) {
      throw new Error("Signer not available.")
    }

    const tx = await signer.sendTransaction({
      to: quote.to,
      data: quote.data,
      value: quote.value,
      gasLimit: quote.gas,
    })

    if (!tx) {
      throw new Error("Transaction failed to send.")
    }

    await tx.wait()

    return { success: true }
  } catch (error: any) {
    console.error("❌ Swap execution error:", error)

    let errorCode = "UNKNOWN_ERROR"

    if (error.message?.includes("user rejected transaction")) {
      errorCode = "USER_REJECTED"
    } else if (error.message?.includes("insufficient funds")) {
      errorCode = "INSUFFICIENT_FUNDS"
    } else if (error.message?.includes("gas required exceeds allowance")) {
      errorCode = "GAS_LIMIT_REACHED"
    } else if (error.message?.includes("Network")) {
      errorCode = "NETWORK_ERROR"
    } else if (error.message?.includes("timeout")) {
      errorCode = "TIMEOUT_ERROR"
    }

    return { success: false, error, errorCode }
  }
}
