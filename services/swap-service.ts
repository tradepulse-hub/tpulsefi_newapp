import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6"
import {
  config,
  HoldSo,
  inmemoryTokenStorage,
  SwapHelper,
  type SwapParams,
  TokenProvider,
  ZeroX,
} from "@holdstation/worldchain-sdk"
import { ethers } from "ethers"
import { Mutex } from "async-mutex"
import NodeCache from "node-cache"
import BigNumber from "bignumber.js"

// Setup do Holdstation seguindo o código antigo
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(
  RPC_URL,
  {
    chainId: 480,
    name: "worldchain",
  },
  {
    staticNetwork: true,
  },
)

const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)

const swapHelper = new SwapHelper(client, {
  tokenStorage: inmemoryTokenStorage,
})

const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldswap = new HoldSo(tokenProvider, inmemoryTokenStorage)

swapHelper.load(zeroX)
swapHelper.load(worldswap)

// Tokens do código antigo (corretos)
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

// Partner code do código antigo
const PARTNER_CODE = "24568"

// Configuração do teste de slippage máximo
const SWAP_CONFIG = {
  maxSlippage: 15, // 🧪 TESTE: Slippage máximo de 15%
  maxRetries: 2,
  retryDelays: [3000, 8000], // 3s, 8s
  cacheTimeout: 30, // 30 segundos
  minAmount: "0.001", // Quantidade mínima para swap
}

// Cache e controle de concorrência
const swapCache = new NodeCache({ stdTTL: SWAP_CONFIG.cacheTimeout })
const swapMutex = new Mutex()

// Rate limiter
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 15
  private readonly windowMs = 60000 // 1 minuto

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      console.log(`🚫 RATE LIMIT: ${this.requests.length}/${this.maxRequests} requests - BLOCKED`)
      return false
    }

    this.requests.push(now)
    console.log(`✅ RATE LIMIT: ${this.requests.length}/${this.maxRequests} requests`)
    return true
  }

  getStatus() {
    const now = Date.now()
    const activeRequests = this.requests.filter((time) => now - time < this.windowMs)
    return {
      activeRequests: activeRequests.length,
      maxRequests: this.maxRequests,
      canMakeRequest: this.canMakeRequest(),
      windowMs: this.windowMs,
    }
  }
}

const rateLimiter = new RateLimiter()

// Interfaces
interface HoldstationSwapParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  userAddress: string
  slippage?: number
}

interface HoldstationSwapResult {
  success: boolean
  transactionHash?: string
  transactionId?: string
  outputAmount?: string
  gasUsed?: string
  error?: string
  errorCode?: string
  details?: any
}

interface TokenDetails {
  address: string
  name: string
  symbol: string
  decimals: number
  balance?: string
}

// Helper function para obter símbolo do token
function getTokenSymbol(address: string): string {
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())
  return token?.symbol || "UNKNOWN"
}

// Helper function para obter detalhes do token
function getTokenDetails(address: string): (typeof TOKENS)[0] | null {
  return TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase()) || null
}

// Classe principal do Holdstation Swap Service
export class HoldstationSwapService {
  private initialized = false
  private logs: string[] = []

  constructor() {
    console.log("🏗️ HOLDSTATION: Inicializando Holdstation Swap Service...")
    console.log(`🤝 HOLDSTATION: Partner code: ${PARTNER_CODE}`)
    console.log(`🧪 HOLDSTATION: Modo de teste com slippage máximo: ${SWAP_CONFIG.maxSlippage}%`)
  }

  private log(message: string, level: "info" | "warn" | "error" = "info", data?: any): void {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [HOLDSTATION-${level.toUpperCase()}] ${message}`

    this.logs.push(logEntry)

    if (data) {
      console.log(logEntry, data)
    } else {
      console.log(logEntry)
    }

    // Manter apenas os últimos 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.log("🔄 Inicializando conexão com Worldchain...")

      // Verificar conectividade
      const blockNumber = await provider.getBlockNumber()
      this.log(`✅ Conectado à Worldchain - Block: ${blockNumber}`)

      // Verificar se SwapHelper está disponível
      if (!swapHelper?.estimate?.quote) {
        throw new Error("SwapHelper não está disponível")
      }

      // Verificar se TokenProvider está disponível
      if (!tokenProvider?.details) {
        throw new Error("TokenProvider não está disponível")
      }

      this.log("✅ SwapHelper e TokenProvider inicializados")

      // Validar contratos dos tokens
      await this.validateTokenContracts()

      this.initialized = true
      this.log("✅ Holdstation Swap Service inicializado com sucesso")
    } catch (error) {
      this.log("❌ Erro na inicialização", "error", error)
      throw error
    }
  }

  private async validateTokenContracts(): Promise<void> {
    this.log("🔍 Validando contratos dos tokens...")

    for (const token of TOKENS) {
      try {
        const code = await provider.getCode(token.address)
        if (code === "0x") {
          throw new Error(`Contrato do token ${token.symbol} não encontrado em ${token.address}`)
        }
        this.log(`✅ Token ${token.symbol} validado: ${token.address}`)
      } catch (error) {
        this.log(`❌ Erro ao validar token ${token.symbol}`, "error", error)
        throw error
      }
    }

    this.log("✅ Todos os contratos de tokens validados")
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private validateSwapParams(params: HoldstationSwapParams): string | null {
    if (!params.tokenIn || !ethers.isAddress(params.tokenIn)) {
      return "Token de entrada inválido"
    }

    if (!params.tokenOut || !ethers.isAddress(params.tokenOut)) {
      return "Token de saída inválido"
    }

    if (!params.userAddress || !ethers.isAddress(params.userAddress)) {
      return "Endereço do usuário inválido"
    }

    if (params.tokenIn.toLowerCase() === params.tokenOut.toLowerCase()) {
      return "Não é possível trocar o mesmo token"
    }

    const amount = new BigNumber(params.amountIn)
    if (amount.isNaN() || amount.lte(0)) {
      return "Quantidade inválida"
    }

    if (amount.lt(SWAP_CONFIG.minAmount)) {
      return `Quantidade muito pequena (mínimo: ${SWAP_CONFIG.minAmount})`
    }

    // Verificar se os tokens são suportados
    const tokenInDetails = getTokenDetails(params.tokenIn)
    const tokenOutDetails = getTokenDetails(params.tokenOut)

    if (!tokenInDetails) {
      return `Token de entrada não suportado: ${params.tokenIn}`
    }

    if (!tokenOutDetails) {
      return `Token de saída não suportado: ${params.tokenOut}`
    }

    return null
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenDetails> {
    try {
      await this.initialize()

      this.log(`🔍 Buscando informações do token: ${tokenAddress}`)

      // Primeiro, verificar se é um token conhecido
      const knownToken = getTokenDetails(tokenAddress)
      if (knownToken) {
        this.log(`✅ Token conhecido encontrado: ${knownToken.symbol}`)
        return {
          address: knownToken.address,
          name: knownToken.name,
          symbol: knownToken.symbol,
          decimals: knownToken.decimals,
        }
      }

      // Se não for conhecido, buscar via TokenProvider
      const tokenInfo = await tokenProvider.details(tokenAddress)

      const details: TokenDetails = {
        address: tokenAddress,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
      }

      this.log(`✅ Token encontrado via provider: ${details.symbol}`, "info", details)
      return details
    } catch (error) {
      this.log(`❌ Erro ao buscar token ${tokenAddress}`, "error", error)
      throw error
    }
  }

  async getQuote(params: Omit<HoldstationSwapParams, "userAddress">): Promise<any> {
    try {
      await this.initialize()

      // 🧪 TESTE: Forçar slippage máximo
      const testSlippage = SWAP_CONFIG.maxSlippage / 100 // Converter para decimal (0.15)
      this.log(`🧪 TESTE DE SLIPPAGE: Forçando ${SWAP_CONFIG.maxSlippage}% (${testSlippage})`)

      const tokenInSymbol = getTokenSymbol(params.tokenIn)
      const tokenOutSymbol = getTokenSymbol(params.tokenOut)

      this.log(`🔍 Buscando quote: ${params.amountIn} ${tokenInSymbol} → ${tokenOutSymbol}`)

      // Verificar rate limiting
      if (!rateLimiter.canMakeRequest()) {
        throw new Error("Rate limit excedido. Aguarde antes de tentar novamente.")
      }

      // Cache key
      const cacheKey = `quote_${params.tokenIn}_${params.tokenOut}_${params.amountIn}_${testSlippage}`
      const cachedQuote = swapCache.get(cacheKey)

      if (cachedQuote) {
        this.log("📦 Quote encontrada no cache")
        return cachedQuote
      }

      // Preparar parâmetros do quote
      const quoteParams: SwapParams["quoteInput"] = {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        slippage: testSlippage.toString(), // Usar slippage máximo
        fee: "0.2",
      }

      this.log("📋 Parâmetros do quote:", "info", quoteParams)

      // Buscar quote com retry
      let quote
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= SWAP_CONFIG.maxRetries; attempt++) {
        try {
          this.log(`🔄 Tentativa ${attempt}/${SWAP_CONFIG.maxRetries} - Buscando quote...`)

          quote = await swapHelper.estimate.quote(quoteParams)

          if (quote && quote.data && quote.to) {
            this.log(`✅ Quote obtida na tentativa ${attempt}`, "info", {
              hasData: !!quote.data,
              hasTo: !!quote.to,
              outAmount: quote.addons?.outAmount,
              feeAmountOut: quote.addons?.feeAmountOut,
            })
            break
          } else {
            throw new Error("Quote inválida - dados incompletos")
          }
        } catch (error: any) {
          lastError = error
          this.log(`❌ Tentativa ${attempt} falhou`, "error", {
            error: error.message,
            stack: error.stack?.split("\n").slice(0, 3),
          })

          if (attempt < SWAP_CONFIG.maxRetries) {
            const delay = SWAP_CONFIG.retryDelays[attempt - 1] || 5000
            this.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
            await this.delay(delay)
          }
        }
      }

      if (!quote) {
        const errorMsg = `Falha ao obter quote após ${SWAP_CONFIG.maxRetries} tentativas. Último erro: ${lastError?.message || "Desconhecido"}`
        this.log(errorMsg, "error")
        throw new Error(errorMsg)
      }

      // Cache o quote
      swapCache.set(cacheKey, quote)

      this.log(`✅ Quote gerada com sucesso`, "info", {
        outputAmount: quote.addons?.outAmount,
        feeAmountOut: quote.addons?.feeAmountOut,
        slippage: testSlippage,
      })

      return quote
    } catch (error) {
      this.log(`❌ Erro ao buscar quote`, "error", error)
      throw error
    }
  }

  async executeSwap(params: HoldstationSwapParams): Promise<HoldstationSwapResult> {
    return swapMutex.runExclusive(async () => {
      const startTime = Date.now()

      try {
        await this.initialize()

        // 🧪 TESTE: Forçar slippage máximo
        const testSlippage = SWAP_CONFIG.maxSlippage / 100 // 0.15
        this.log(
          `🧪 TESTE DE SLIPPAGE MÁXIMO: Forçando ${SWAP_CONFIG.maxSlippage}% (ignorando ${params.slippage || 0.5}%)`,
        )

        // Validar parâmetros
        const validation = this.validateSwapParams(params)
        if (validation) {
          this.log(`❌ Validação falhou: ${validation}`, "error")
          return { success: false, error: validation }
        }

        // Verificar rate limiting
        if (!rateLimiter.canMakeRequest()) {
          const error = "Rate limit excedido. Aguarde antes de tentar novamente."
          this.log(`🚫 ${error}`, "warn")
          return { success: false, error }
        }

        const tokenInSymbol = getTokenSymbol(params.tokenIn)
        const tokenOutSymbol = getTokenSymbol(params.tokenOut)

        this.log(`🚀 Iniciando swap: ${params.amountIn} ${tokenInSymbol} → ${tokenOutSymbol}`, "info", {
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          amountIn: params.amountIn,
          userAddress: params.userAddress,
          slippage: testSlippage,
          partnerCode: PARTNER_CODE,
        })

        // Cache key
        const cacheKey = `swap_${params.tokenIn}_${params.tokenOut}_${params.amountIn}_${testSlippage}`
        const cachedResult = swapCache.get<HoldstationSwapResult>(cacheKey)

        if (cachedResult) {
          this.log("📦 Resultado encontrado no cache")
          return cachedResult
        }

        // Executar swap com retry
        let lastError: Error | null = null

        for (let attempt = 1; attempt <= SWAP_CONFIG.maxRetries; attempt++) {
          try {
            this.log(`🔄 Tentativa ${attempt}/${SWAP_CONFIG.maxRetries} - Executando swap...`)

            // Primeiro, obter quote
            const quoteParams: SwapParams["quoteInput"] = {
              tokenIn: params.tokenIn,
              tokenOut: params.tokenOut,
              amountIn: params.amountIn,
              slippage: testSlippage.toString(),
              fee: "0.2",
            }

            const quoteResponse = await swapHelper.estimate.quote(quoteParams)

            if (!quoteResponse || !quoteResponse.data || !quoteResponse.to) {
              throw new Error("Quote inválida para swap")
            }

            this.log("✅ Quote obtida para swap", "info", {
              hasData: !!quoteResponse.data,
              hasTo: !!quoteResponse.to,
              outAmount: quoteResponse.addons?.outAmount,
            })

            // Preparar parâmetros do swap
            const swapParams: SwapParams["input"] = {
              tokenIn: params.tokenIn,
              tokenOut: params.tokenOut,
              amountIn: params.amountIn,
              tx: {
                data: quoteResponse.data,
                to: quoteResponse.to,
                value: quoteResponse.value,
              },
              partnerCode: PARTNER_CODE,
              feeAmountOut: quoteResponse.addons?.feeAmountOut,
              fee: "0.2",
              feeReceiver: ethers.ZeroAddress,
            }

            this.log("📋 Parâmetros do swap preparados", "info", {
              tokenIn: swapParams.tokenIn,
              tokenOut: swapParams.tokenOut,
              amountIn: swapParams.amountIn,
              partnerCode: swapParams.partnerCode,
              hasTransactionData: !!swapParams.tx.data,
            })

            // Executar swap
            const result = await swapHelper.swap(swapParams)

            this.log("📦 Resultado do swap recebido", "info", {
              success: result.success,
              hasTransactionId: !!result.transactionId,
              errorCode: result.errorCode,
            })

            if (result.success) {
              const swapResult: HoldstationSwapResult = {
                success: true,
                transactionHash: result.transactionId,
                transactionId: result.transactionId,
                outputAmount: quoteResponse.addons?.outAmount || "0",
                details: {
                  tokenIn: tokenInSymbol,
                  tokenOut: tokenOutSymbol,
                  slippage: testSlippage,
                  attempt,
                  duration: Date.now() - startTime,
                  partnerCode: PARTNER_CODE,
                },
              }

              // Cache o resultado
              swapCache.set(cacheKey, swapResult)

              const duration = Date.now() - startTime
              this.log(`✅ Swap executado com sucesso em ${duration}ms`, "info", {
                transactionId: result.transactionId,
                outputAmount: swapResult.outputAmount,
                slippage: testSlippage,
                attempt,
              })

              return swapResult
            } else {
              const errorMsg = `Swap falhou: ${result.errorCode || "Erro desconhecido"}`
              throw new Error(errorMsg)
            }
          } catch (error: any) {
            lastError = error

            this.log(`❌ Tentativa ${attempt} falhou`, "error", {
              error: error.message,
              stack: error.stack?.split("\n").slice(0, 3),
              slippage: testSlippage,
            })

            // Verificar se é erro não-retriável
            const isNonRetryable =
              error.message.includes("Rate limit") ||
              error.message.includes("inválido") ||
              error.message.includes("não suportado") ||
              error.message.includes("simulation_failed")

            if (isNonRetryable) {
              this.log(`🚫 Erro não-retriável detectado: ${error.message}`, "error")
              break
            }

            // Aguardar antes da próxima tentativa
            if (attempt < SWAP_CONFIG.maxRetries) {
              const delay = SWAP_CONFIG.retryDelays[attempt - 1] || 5000
              this.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
              await this.delay(delay)
            }
          }
        }

        // Todas as tentativas falharam
        const duration = Date.now() - startTime
        const finalError = lastError?.message || "Erro desconhecido"

        // Mensagem especial para teste de slippage
        if (finalError.includes("simulation") || finalError.includes("failed") || finalError.includes("reverted")) {
          const testMessage = `🧪 TESTE DE SLIPPAGE: Swap falhou mesmo com ${SWAP_CONFIG.maxSlippage}% de slippage máximo! Isso prova que o problema NÃO é relacionado ao slippage. Possíveis causas: liquidez insuficiente, problemas no contrato do token, ou questões de rede.`

          this.log(testMessage, "error")

          return {
            success: false,
            error: `${testMessage} Erro original: ${finalError}`,
            errorCode: "SLIPPAGE_TEST_FAILED",
            details: {
              attempts: SWAP_CONFIG.maxRetries,
              duration,
              slippage: testSlippage,
              lastError: finalError,
            },
          }
        }

        this.log(`❌ Swap falhou após ${SWAP_CONFIG.maxRetries} tentativas`, "error", {
          error: finalError,
          duration,
          slippage: testSlippage,
        })

        return {
          success: false,
          error: `Swap falhou após ${SWAP_CONFIG.maxRetries} tentativas com ${SWAP_CONFIG.maxSlippage}% de slippage. Último erro: ${finalError}`,
          errorCode: "MAX_RETRIES_EXCEEDED",
          details: {
            attempts: SWAP_CONFIG.maxRetries,
            duration,
            slippage: testSlippage,
            lastError: finalError,
          },
        }
      } catch (error: any) {
        const duration = Date.now() - startTime
        this.log(`💥 Erro crítico no swap`, "error", {
          error: error.message,
          stack: error.stack?.split("\n").slice(0, 5),
          duration,
        })

        return {
          success: false,
          error: `Erro crítico: ${error.message}`,
          errorCode: "CRITICAL_ERROR",
          details: {
            duration,
            error: error.message,
          },
        }
      }
    })
  }

  // Métodos utilitários
  getLogs(): string[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
    this.log("🧹 Logs limpos")
  }

  getCacheStats() {
    return {
      keys: swapCache.keys().length,
      stats: swapCache.getStats(),
    }
  }

  getRateLimitStatus() {
    return rateLimiter.getStatus()
  }

  getConfig() {
    return {
      ...SWAP_CONFIG,
      partnerCode: PARTNER_CODE,
      tokens: TOKENS,
      rateLimitStatus: this.getRateLimitStatus(),
    }
  }

  clearCache(): void {
    swapCache.flushAll()
    this.log("🧹 Cache limpo")
  }

  // Método para testar conectividade
  async testConnection(): Promise<boolean> {
    try {
      await this.initialize()
      this.log("✅ Teste de conectividade passou")
      return true
    } catch (error) {
      this.log("❌ Teste de conectividade falhou", "error", error)
      return false
    }
  }

  // Método para testar SwapHelper
  async testSwapHelper(): Promise<boolean> {
    try {
      await this.initialize()

      this.log("🧪 Testando SwapHelper...")

      const testParams: SwapParams["quoteInput"] = {
        tokenIn: TOKENS[0].address, // WLD
        tokenOut: TOKENS[1].address, // TPF
        amountIn: SWAP_CONFIG.minAmount,
        slippage: "0.3",
        fee: "0.2",
      }

      const testQuote = await swapHelper.estimate.quote(testParams)

      this.log("✅ Teste do SwapHelper passou", "info", {
        hasData: !!testQuote.data,
        hasTo: !!testQuote.to,
        outAmount: testQuote.addons?.outAmount,
      })

      return true
    } catch (error) {
      this.log("❌ Teste do SwapHelper falhou", "error", error)
      return false
    }
  }

  // Método para debug completo
  async debugSystem(): Promise<void> {
    try {
      this.log("🔍 INICIANDO DEBUG COMPLETO DO SISTEMA")

      // Teste de conectividade
      const blockNumber = await provider.getBlockNumber()
      this.log(`📋 Provider conectado, block: ${blockNumber}`)

      // Verificar componentes
      this.log(`📋 SwapHelper disponível: ${!!swapHelper}`)
      this.log(`📋 TokenProvider disponível: ${!!tokenProvider}`)
      this.log(`📋 Partner code: ${PARTNER_CODE}`)

      // Testar token details
      for (const token of TOKENS.slice(0, 2)) {
        // Testar apenas os primeiros 2
        try {
          const tokenDetails = await tokenProvider.details(token.address)
          this.log(`📋 Token ${token.symbol} details:`, "info", tokenDetails)
        } catch (error) {
          this.log(`❌ Erro ao buscar ${token.symbol}`, "error", error)
        }
      }

      // Testar SwapHelper
      await this.testSwapHelper()

      this.log("✅ DEBUG COMPLETO FINALIZADO")
    } catch (error) {
      this.log("❌ Debug falhou", "error", error)
    }
  }
}

// Instância singleton
export const holdstationSwapService = new HoldstationSwapService()

// Exportar tipos e constantes
export type { HoldstationSwapParams, HoldstationSwapResult, TokenDetails }
export { PARTNER_CODE, SWAP_CONFIG }

// Exportar funções utilitárias
export { getTokenSymbol, getTokenDetails }

// Exportar provider e swapHelper para compatibilidade
export { provider, swapHelper, tokenProvider }
