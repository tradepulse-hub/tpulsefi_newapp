import { ethers } from "ethers"
import { MiniKit } from "@worldcoin/minikit-js"
import { blockchainTransactionService } from "./blockchain-transaction-service"

// Configuração da Worldchain
const WORLDCHAIN_CONFIG = {
  chainId: 480,
  name: "World Chain Mainnet",
  shortName: "wc",
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
  blockExplorer: "https://worldscan.org",
}

// ABI para tokens ERC20 (apenas as funções necessárias)
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const

// Informações dos tokens
const TOKENS_INFO = {
  TPF: {
    symbol: "TPF",
    name: "TPulseFi",
    address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    logo: "/images/logo-tpf.png",
    decimals: 18,
  },
  WLD: {
    symbol: "WLD",
    name: "Worldcoin",
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    logo: "/images/worldcoin.jpeg",
    decimals: 18,
  },
  WDD: {
    symbol: "WDD",
    name: "Drachma",
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
    logo: "/images/drachma-token.png",
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    logo: "/images/usdc.png",
    decimals: 6,
  },
  KPP: {
    symbol: "KPP",
    name: "KeplerPay",
    address: "0x5fa570E9c8514cdFaD81DB6ce0A327D55251fBD4",
    logo: "/images/keplerpay-logo.png",
    decimals: 18,
  },
  EDEN: {
    symbol: "EDEN",
    name: "Eden Project",
    address: "0xbF0B23Ec1b8F8505b4F1772517151B2df4A27703", // Novo endereço para EDEN
    logo: "/images/eden-logo.png",
    decimals: 18,
  },
}

interface TokenBalance {
  symbol: string
  name: string
  address: string
  balance: string
  decimals: number
  icon?: string
  formattedBalance: string
}

interface Transaction {
  id: string
  type: "sent" | "received"
  token: string
  amount: string
  address: string
  status: "pending" | "confirmed" | "failed"
  timestamp: number
  hash: string
}

interface SendTokenParams {
  to: string
  amount: number
  tokenAddress?: string
}

interface SendTokenResult {
  success: boolean
  txHash?: string
  transactionId?: string
  error?: string
}

declare global {
  interface Window {
    MiniKit?: {
      sendTransaction: (params: {
        to: string
        value: string
        data: string
      }) => Promise<string>
      isConnected?: () => boolean
      getTokenBalance?: (params: {
        tokenAddress: string
        walletAddress: string
      }) => Promise<{ balance: string }>
    }
  }
}

class WalletService {
  private initialized = false
  private provider: ethers.JsonRpcProvider | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private async initialize() {
    if (this.initialized) return

    console.log("🔄 Initializing Wallet Service...")

    // Inicializar provider para consultas diretas à blockchain
    this.provider = new ethers.JsonRpcProvider(WORLDCHAIN_CONFIG.rpcUrl)

    this.initialized = true
    console.log("✅ Wallet Service initialized!")
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      if (!this.initialized) await this.initialize()

      console.log(`💰 Getting REAL token balances for: ${walletAddress}`)
      console.log("🚫 NO MOCK VALUES - Only real blockchain data")

      const balances: TokenBalance[] = []

      // Para cada token, obter saldo real da blockchain
      for (const [symbol, tokenInfo] of Object.entries(TOKENS_INFO)) {
        try {
          console.log(`🔍 Getting real balance for ${symbol}...`)

          let realBalance = "0"

          // Método 1: Tentar MiniKit primeiro (mais confiável)
          if (window.MiniKit?.getTokenBalance) {
            try {
              console.log(`📱 Trying MiniKit for ${symbol}...`)
              const result = await window.MiniKit.getTokenBalance({
                tokenAddress: tokenInfo.address,
                walletAddress: walletAddress,
              })

              if (result?.balance) {
                realBalance = ethers.formatUnits(result.balance, tokenInfo.decimals)
                console.log(`✅ MiniKit ${symbol}: ${realBalance}`)
              }
            } catch (miniKitError: any) {
              console.log(`⚠️ MiniKit failed for ${symbol}:`, miniKitError.message)
            }
          }

          // Método 2: Se MiniKit falhou, tentar RPC direto
          if (realBalance === "0" && this.provider) {
            try {
              console.log(`🌐 Trying RPC for ${symbol}...`)
              const contract = new ethers.Contract(
                tokenInfo.address,
                ["function balanceOf(address) view returns (uint256)"],
                this.provider,
              )

              const balance = await contract.balanceOf(walletAddress)
              realBalance = ethers.formatUnits(balance, tokenInfo.decimals)
              console.log(`✅ RPC ${symbol}: ${realBalance}`)
            } catch (rpcError: any) {
              console.log(`⚠️ RPC failed for ${symbol}:`, rpcError.message)
            }
          }

          // Adicionar à lista (mesmo que seja 0)
          balances.push({
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            address: tokenInfo.address,
            balance: realBalance,
            decimals: tokenInfo.decimals,
            icon: tokenInfo.logo,
            formattedBalance: realBalance,
          })

          console.log(`📊 Final ${symbol} balance: ${realBalance}`)
        } catch (tokenError) {
          console.error(`❌ Error getting ${symbol} balance:`, tokenError)

          // Adicionar com saldo 0 em caso de erro
          balances.push({
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            address: tokenInfo.address,
            balance: "0",
            decimals: tokenInfo.decimals,
            icon: tokenInfo.logo,
            formattedBalance: "0",
          })
        }
      }

      console.log("✅ Real balances obtained:")
      balances.forEach((b) => {
        console.log(`  ${b.symbol}: ${b.balance}`)
      })

      return balances
    } catch (error) {
      console.error("❌ Error getting real token balances:", error)

      // Em caso de erro total, retornar tokens com saldo 0
      return Object.entries(TOKENS_INFO).map(([symbol, tokenInfo]) => ({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        address: tokenInfo.address,
        balance: "0",
        decimals: tokenInfo.decimals,
        icon: tokenInfo.logo,
        formattedBalance: "0",
      }))
    }
  }

  async getTransactionHistory(walletAddress: string, limit = 20): Promise<Transaction[]> {
    try {
      console.log(`📜 Getting REAL transaction history for: ${walletAddress}`)

      // Use blockchain transaction service for real data
      const transactions = await blockchainTransactionService.getTransactionHistory(walletAddress, limit)

      console.log(`✅ Found ${transactions.length} real transactions`)

      // Convert to the format expected by mini wallet
      return transactions.map((tx) => ({
        id: tx.id,
        type: tx.type === "send" ? "sent" : "received",
        token: tx.tokenSymbol,
        amount: tx.amount,
        address: tx.type === "send" ? tx.to : tx.from,
        status: tx.status === "completed" ? "confirmed" : tx.status,
        timestamp: tx.timestamp.getTime(),
        hash: tx.hash,
      }))
    } catch (error) {
      console.error("❌ Error getting transaction history:", error)
      return []
    }
  }

  async sendToken(params: SendTokenParams): Promise<SendTokenResult> {
    try {
      console.log("🚀 Starting REAL token send with MiniKit...")
      console.log(`📤 Sending ${params.amount} tokens to ${params.to}`)
      console.log(`Token address: ${params.tokenAddress || "ETH"}`)

      // Verificar se MiniKit está disponível
      if (typeof window === "undefined" || !MiniKit) {
        throw new Error("MiniKit not available. Please use World App.")
      }

      // Verificar se MiniKit está instalado
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit not installed. Please use World App.")
      }

      let transactionConfig

      // Se não tem tokenAddress, é ETH nativo
      if (!params.tokenAddress) {
        console.log("💰 Sending native ETH...")
        const amountInWei = ethers.parseEther(params.amount.toString())

        // Para ETH nativo, usar contrato Forward se disponível
        // Ou enviar diretamente para o endereço
        transactionConfig = {
          transaction: [
            {
              address: params.to,
              abi: [],
              functionName: "transfer",
              value: amountInWei.toString(),
              args: [],
            },
          ],
        }
      } else {
        // Para tokens ERC20
        console.log("🪙 Sending ERC20 token...")
        console.log(`Token contract: ${params.tokenAddress}`)

        // Encontrar informações do token
        const tokenInfo = Object.values(TOKENS_INFO).find(
          (token) => token.address.toLowerCase() === params.tokenAddress?.toLowerCase(),
        )

        if (!tokenInfo) {
          throw new Error("Token not supported")
        }

        const amountInWei = ethers.parseUnits(params.amount.toString(), tokenInfo.decimals)
        console.log(`Amount in wei: ${amountInWei.toString()}`)

        transactionConfig = {
          transaction: [
            {
              address: params.tokenAddress,
              abi: ERC20_ABI,
              functionName: "transfer",
              args: [params.to, amountInWei.toString()],
            },
          ],
        }
      }

      console.log("📋 Transaction config:", transactionConfig)
      console.log("🔄 Calling MiniKit.commandsAsync.sendTransaction...")

      // Enviar transação usando MiniKit
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction(transactionConfig)

      console.log("📨 Command payload:", commandPayload)
      console.log("📦 Final payload:", finalPayload)

      // Verificar se a transação foi bem-sucedida
      if (finalPayload.status === "error") {
        console.error("❌ Transaction failed:", finalPayload)
        throw new Error(finalPayload.message || "Transaction failed")
      }

      if (finalPayload.status === "success") {
        console.log("✅ Transaction sent successfully!")
        console.log(`Transaction ID: ${finalPayload.transaction_id}`)

        // Verificar status da transação no backend
        try {
          const verifyResponse = await fetch("/api/transaction/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transaction_id: finalPayload.transaction_id,
            }),
          })

          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json()
            console.log("✅ Transaction verified:", verifyResult)

            return {
              success: true,
              transactionId: finalPayload.transaction_id,
              txHash: verifyResult.hash,
            }
          } else {
            console.warn("⚠️ Transaction verification failed, but transaction was sent")
          }
        } catch (verifyError) {
          console.warn("⚠️ Could not verify transaction:", verifyError)
        }

        return {
          success: true,
          transactionId: finalPayload.transaction_id,
        }
      }

      throw new Error("Unknown transaction status")
    } catch (error) {
      console.error("❌ Error sending token:", error)

      let errorMessage = "Unknown error occurred"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Tratar erros específicos do MiniKit
      if (errorMessage.includes("simulation_failed")) {
        errorMessage = "Transaction simulation failed. Please check your balance and try again."
      } else if (errorMessage.includes("insufficient")) {
        errorMessage = "Insufficient balance to complete this transaction."
      } else if (errorMessage.includes("not available")) {
        errorMessage = "Please use World App to send transactions."
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  getNetworkInfo() {
    return WORLDCHAIN_CONFIG
  }

  getTokensInfo() {
    return TOKENS_INFO
  }

  getExplorerTransactionUrl(hash: string): string {
    return `${WORLDCHAIN_CONFIG.blockExplorer}/tx/${hash}`
  }

  getExplorerAddressUrl(address: string): string {
    return `${WORLDCHAIN_CONFIG.blockExplorer}/address/${address}`
  }

  isInitialized(): boolean {
    return this.initialized
  }

  // Método para verificar se MiniKit está disponível
  isMiniKitAvailable(): boolean {
    return typeof window !== "undefined" && MiniKit && MiniKit.isInstalled()
  }

  // Método para obter informações de debug da transação
  async getTransactionDebugInfo(transactionId: string): Promise<any> {
    try {
      const response = await fetch("/api/transaction/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transactionId,
        }),
      })

      if (response.ok) {
        return await response.json()
      }

      throw new Error("Failed to get debug info")
    } catch (error) {
      console.error("Error getting transaction debug info:", error)
      return null
    }
  }
}

export const walletService = new WalletService()
