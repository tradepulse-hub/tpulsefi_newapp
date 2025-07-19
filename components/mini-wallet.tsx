"use client"

import { doSwap } from "@/services/swap-service" // Importa doSwap do serviço de swap
import { walletService } from "@/services/wallet-service"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  LogOut,
  Minimize2,
  RefreshCw,
  Send,
  Wallet,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

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

const USDC_TOKEN_INFO = TOKENS.find((token) => token.symbol === "USDC")
const USDC_ADDRESS = USDC_TOKEN_INFO?.address

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

interface MiniWalletProps {
  walletAddress: string
  onMinimize: () => void
  onDisconnect: () => void
}

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations for mini wallet
const translations = {
  en: {
    connected: "Connected",
    tokens: "Tokens",
    send: "Send",
    receive: "Receive",
    history: "History",
    swap: "Swap",
    back: "Back",
    sendTokens: "Send Tokens",
    receiveTokens: "Receive Tokens",
    swapTokens: "Swap Tokens",
    transactionHistory: "Transaction History",
    tokenDetails: "Token Details",
    currentPrice: "Current Price",
    priceChange24h: "24h Change",
    priceChart: "Price Chart",
    token: "Token",
    amount: "Amount",
    recipientAddress: "Recipient Address",
    sending: "Sending...",
    swapping: "Swapping...",
    loadingPrice: "Loading price...",
    yourWalletAddress: "Your Wallet Address:",
    networkWarning: "Only send Worldchain network supported tokens to this address.",
    sendWarning:
      "Only send assets supported by the Worldchain network, do not send to exchanges, your sending may result in loss of assets",
    sendSuccess: "Successfully sent",
    sendFailed: "Send failed",
    swapSuccess: "Successfully swapped",
    swapFailed: "Swap failed",
    copyAddress: "Copy Address",
    minimize: "Minimize",
    disconnect: "Disconnect",
    refreshBalances: "Refresh Balances",
    available: "Available",
    noTransactions: "No recent transactions",
    sent: "Sent",
    received: "Received",
    pending: "Pending",
    confirmed: "Confirmed",
    failed: "Failed",
    viewOnExplorer: "View on Explorer",
    loadMore: "Load More",
    loading: "Loading...",
    from: "From",
    to: "To",
    getQuote: "Get Quote",
    gettingQuote: "Getting Quote...",
    youWillReceive: "You will receive",
    priceImpact: "Price Impact",
    swapRate: "Swap Rate",
    selectToken: "Select Token",
    enterAmount: "Enter amount to see quote",
    quoteError: "Failed to get quote",
    insufficientBalance: "Insufficient balance",
    networkError: "Network error",
    tryAgain: "Try again",
    priceUnavailable: "Price data unavailable",
    refreshPrice: "Refresh Price",
  },
  pt: {
    connected: "Conectado",
    tokens: "Tokens",
    send: "Enviar",
    receive: "Receber",
    history: "Histórico",
    swap: "Trocar",
    back: "Voltar",
    sendTokens: "Enviar Tokens",
    receiveTokens: "Receber Tokens",
    swapTokens: "Trocar Tokens",
    transactionHistory: "Histórico de Transações",
    tokenDetails: "Detalhes do Token",
    currentPrice: "Preço Atual",
    priceChange24h: "Mudança 24h",
    priceChart: "Gráfico de Preço",
    token: "Token",
    amount: "Quantidade",
    recipientAddress: "Endereço do Destinatário",
    sending: "Enviando...",
    swapping: "Trocando...",
    loadingPrice: "Carregando preço...",
    yourWalletAddress: "Seu Endereço da Carteira:",
    networkWarning: "Apenas envie para o seu endereço tokens suportados da rede Worldchain.",
    sendWarning:
      "Apenas envia ativos suportados pela rede Worldchain, não envie para exchanges, o seu envio poderá significar a perda dos ativos",
    sendSuccess: "Enviado com sucesso",
    sendFailed: "Falha no envio",
    swapSuccess: "Trocado com sucesso",
    swapFailed: "Falha na troca",
    copyAddress: "Copiar Endereço",
    minimize: "Minimizar",
    disconnect: "Desconectar",
    refreshBalances: "Atualizar Saldos",
    available: "Disponível",
    noTransactions: "Sem transações recentes",
    sent: "Enviado",
    received: "Recibido",
    pending: "Pendente",
    confirmed: "Confirmado",
    failed: "Falhou",
    viewOnExplorer: "Ver no Explorer",
    loadMore: "Carregar Mais",
    loading: "Carregando...",
    from: "De",
    to: "Para",
    getQuote: "Obter Cotação",
    gettingQuote: "Obtendo Cotação...",
    youWillReceive: "Você receberá",
    priceImpact: "Impacto no Preço",
    swapRate: "Taxa de Troca",
    selectToken: "Selecionar Token",
    enterAmount: "Digite o valor para ver a cotação",
    quoteError: "Falha ao obter cotação",
    insufficientBalance: "Saldo insuficiente",
    networkError: "Erro de rede",
    tryAgain: "Tente novamente",
    priceUnavailable: "Dados de preço indisponíveis",
    refreshPrice: "Atualizar Preço",
  },
  es: {
    connected: "Conectado",
    tokens: "Tokens",
    send: "Enviar",
    receive: "Recibir",
    history: "Historial",
    swap: "Intercambiar",
    back: "Volver",
    sendTokens: "Enviar Tokens",
    receiveTokens: "Recibir Tokens",
    swapTokens: "Intercambiar Tokens",
    transactionHistory: "Historial de Transacciones",
    tokenDetails: "Detalles del Token",
    currentPrice: "Precio Actual",
    priceChange24h: "Cambio 24h",
    priceChart: "Gráfico de Precio",
    token: "Token",
    amount: "Cantidad",
    recipientAddress: "Dirección del Destinatario",
    sending: "Enviando...",
    swapping: "Intercambiando...",
    loadingPrice: "Cargando precio...",
    yourWalletAddress: "Tu Dirección de Billetera:",
    networkWarning: "Solo envía tokens soportados por la red Worldchain a esta dirección.",
    sendWarning:
      "Solo envía activos soportados por la red Worldchain, no envíes a exchanges, tu envío podría resultar en la pérdida de activos",
    sendSuccess: "Enviado exitosamente",
    sendFailed: "Envío fallido",
    swapSuccess: "Intercambiado exitosamente",
    swapFailed: "Intercambio fallido",
    copyAddress: "Copiar Dirección",
    minimize: "Minimizar",
    disconnect: "Desconectar",
    refreshBalances: "Actualizar Saldos",
    available: "Disponible",
    noTransactions: "Sin transacciones recientes",
    sent: "Enviado",
    received: "Recibido",
    pending: "Pendente",
    confirmed: "Confirmado",
    failed: "Falló",
    viewOnExplorer: "Ver en Explorer",
    loadMore: "Cargar Más",
    loading: "Cargando...",
    from: "Desde",
    to: "Hacia",
    getQuote: "Obtener Cotización",
    gettingQuote: "Obteniendo Cotización...",
    youWillReceive: "Recibirás",
    priceImpact: "Impacto en el Precio",
    swapRate: "Tasa de Intercambio",
    selectToken: "Seleccionar Token",
    enterAmount: "Ingresa cantidad para ver cotización",
    quoteError: "Error al obtener cotización",
    insufficientBalance: "Saldo insuficiente",
    networkError: "Error de red",
    tryAgain: "Intentar de nuevo",
    priceUnavailable: "Datos de precio no disponibles",
    refreshPrice: "Actualizar Precio",
  },
  id: {
    connected: "Terhubung",
    tokens: "Token",
    send: "Kirim",
    receive: "Terima",
    history: "Riwayat",
    swap: "Tukar",
    back: "Kembali",
    sendTokens: "Kirim Token",
    receiveTokens: "Terima Token",
    swapTokens: "Tukar Token",
    transactionHistory: "Riwayat Transaksi",
    tokenDetails: "Detail Token",
    currentPrice: "Harga Saat Ini",
    priceChange24h: "Perubahan 24j",
    priceChart: "Grafik Harga",
    token: "Token",
    amount: "Jumlah",
    recipientAddress: "Alamat Penerima",
    sending: "Mengirim...",
    swapping: "Menukar...",
    loadingPrice: "Memuat harga...",
    yourWalletAddress: "Alamat Dompet Anda:",
    networkWarning: "Hanya kirim token yang didukung jaringan Worldchain ke alamat ini.",
    sendWarning:
      "Hanya kirim aset yang didukung oleh jaringan Worldchain, jangan kirim ke exchange, pengiriman Anda dapat mengakibatkan kehilangan aset",
    sendSuccess: "Berhasil dikirim",
    sendFailed: "Pengiriman gagal",
    swapSuccess: "Berhasil ditukar",
    swapFailed: "Penukaran gagal",
    copyAddress: "Salin Alamat",
    minimize: "Minimalkan",
    disconnect: "Putuskan",
    refreshBalances: "Perbarui Saldo",
    available: "Tersedia",
    noTransactions: "Tidak ada transaksi terbaru",
    sent: "Dikirim",
    received: "Diterima",
    pending: "Tertunda",
    confirmed: "Dikonfirmasi",
    failed: "Gagal",
    viewOnExplorer: "Lihat di Explorer",
    loadMore: "Muat Lebih Banyak",
    loading: "Memuat...",
    from: "Dari",
    to: "Ke",
    getQuote: "Dapatkan Kutipan",
    gettingQuote: "Mendapatkan Kutipan...",
    youWillReceive: "Anda akan menerima",
    priceImpact: "Dampak Harga",
    swapRate: "Tingkat Tukar",
    selectToken: "Pilih Token",
    enterAmount: "Masukkan jumlah untuk melihat kutipan",
    quoteError: "Gagal mendapatkan kutipan",
    insufficientBalance: "Saldo tidak mencuciente",
    networkError: "Kesalahan jaringan",
    tryAgain: "Coba lagi",
    priceUnavailable: "Data harga tidak tersedia",
    refreshPrice: "Perbarui Harga",
  },
}

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logo: string
  color: string
}

type ViewMode = "main" | "send" | "receive" | "history" | "swap"

export default function MiniWallet({ walletAddress, onMinimize, onDisconnect }: MiniWalletProps) {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")
  const [viewMode, setViewMode] = useState<ViewMode>("main")
  const [copied, setCopied] = useState(false)
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
  const [sendForm, setSendForm] = useState({
    token: "TPF",
    amount: "",
    recipient: "",
  })
  const [swapForm, setSwapForm] = useState({
    tokenFrom: "WLD", // Default to WLD
    tokenTo: "TPF", // Default to TPF
    amountFrom: "",
    amountTo: "",
  })
  const [sending, setSending] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [gettingQuote, setGettingQuote] = useState(false)
  const [swapQuote, setSwapQuote] = useState<any>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  // Remove the line below
  // const [selectedTokenState, setSelectedTokenState] = useState<TokenBalance | null>(null)

  // Remove the lines below
  // const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  // const [priceChanges, setPriceChanges] = useState<Record<string, number>>({})
  // const [loadingPrices, setLoadingPrices] = useState(true)
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [loadingPrices, setLoadingPrices] = useState(true)

  const TRANSACTIONS_PER_PAGE = 5

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Get translations for current language
  const t = translations[currentLang]

  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [walletAddress])

  // Remove the entire loadTokenPrices useCallback function
  // const loadTokenPrices = useCallback(async () => {
  //   try {
  //     setLoadingPrices(true)
  //     // console.log("🔄 Loading real token prices via Holdstation SDK...")

  //     const prices: Record<string, number> = {}
  //     const changes: Record<string, number> = {}

  //     await Promise.all(
  //       TOKENS.map(async (token) => {
  //         try {
  //           const [price, change] = await Promise.all([
  //             getCurrentTokenPrice(token.symbol),
  //             getPriceChange(token.symbol, "1h"),
  //           ])
  //           prices[token.symbol] = price
  //           changes[token.symbol] = change
  //           // console.log(`✅ Price loaded for ${token.symbol}: $${price}`)
  //         } catch (error) {
  //           // console.error(`❌ Error fetching data for ${token.symbol}:`, error)
  //           prices[token.symbol] = 0
  //           changes[token.symbol] = 0
  //         }
  //       }),
  //     )

  //     setTokenPrices(prices)
  //     setPriceChanges(changes)
  //     // console.log("✅ All token prices loaded successfully")
  //   } catch (error) {
  //     // console.error("❌ Error loading token prices:", error)
  //   } finally {
  //     setLoadingPrices(false)
  //   }
  // }, [])

  const loadTokenPrices = useCallback(async () => {
    if (!USDC_ADDRESS) {
      console.error("USDC address is not defined, cannot load token prices.")
      setLoadingPrices(false)
      return
    }

    try {
      setLoadingPrices(true)
      const prices: Record<string, number> = {}

      await Promise.all(
        TOKENS.map(async (token) => {
          if (token.symbol === "USDC") {
            prices[token.symbol] = 1 // USDC price against itself is 1
            return
          }
          try {
            // Get quote for 1 unit of token against USDC
            const quote = await swapHelper.estimate.quote({
              tokenIn: token.address,
              tokenOut: USDC_ADDRESS,
              amountIn: "1", // Get price for 1 unit of the token
              slippage: "0.3",
              fee: "0.2",
              feeReceiver: ethers.ZeroAddress,
            })

            if (quote && quote.outAmount) {
              // The outAmount is already human-readable for the target token (USDC)
              prices[token.symbol] = Number.parseFloat(quote.outAmount.toString())
            } else {
              prices[token.symbol] = 0 // Price unavailable
            }
          } catch (error) {
            console.warn(`⚠️ Failed to get price for ${token.symbol} against USDC:`, error)
            prices[token.symbol] = 0 // Price unavailable
          }
        }),
      )

      setTokenPrices(prices)
    } catch (error) {
      console.error("❌ Error loading token prices:", error)
    } finally {
      setLoadingPrices(false)
    }
  }, [])

  const loadBalances = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // console.log("🔄 Loading token balances for:", walletAddress)
      const tokenBalances = await walletService.getTokenBalances(walletAddress)
      // console.log("✅ Token balances loaded:", tokenBalances)
      setBalances(tokenBalances)
    } catch (error) {
      // console.error("❌ Error loading balances:", error)
      setError("Failed to load balances")
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const loadTransactionHistory = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoadingHistory(true)
          setCurrentPage(0)
          setDisplayedTransactions([])
        } else {
          setLoadingMore(true)
        }

        // console.log("🔄 Loading transaction history for:", walletAddress)
        const limit = (currentPage + 1) * TRANSACTIONS_PER_PAGE + 5
        const history = await walletService.getTransactionHistory(walletAddress, limit)
        // console.log("✅ Transaction history loaded:", history.length, "transactions")

        setAllTransactions(history)

        const newDisplayCount = (currentPage + 1) * TRANSACTIONS_PER_PAGE
        const newDisplayed = history.slice(0, Math.min(history.length, newDisplayCount))

        setDisplayedTransactions(newDisplayed)
        setHasMoreTransactions(allTransactions.length > newDisplayCount)
      } catch (error) {
        // console.error("❌ Error loading transaction history:", error)
      } finally {
        setLoadingHistory(false)
        setLoadingMore(false)
      }
    },
    [walletAddress, currentPage, allTransactions],
  )

  const loadMoreTransactions = useCallback(async () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)

    const newDisplayCount = (nextPage + 1) * TRANSACTIONS_PER_PAGE

    if (allTransactions.length >= newDisplayCount) {
      const newDisplayed = allTransactions.slice(0, newDisplayCount)
      setDisplayedTransactions(newDisplayed)
      setHasMoreTransactions(allTransactions.length > newDisplayCount)
    } else {
      await loadTransactionHistory(false)
    }
  }, [allTransactions, currentPage, loadTransactionHistory])

  const refreshBalances = useCallback(async () => {
    setRefreshing(true)
    await loadBalances()
    setRefreshing(false)
  }, [loadBalances])

  const handleSend = useCallback(async () => {
    if (!sendForm.amount || !sendForm.recipient) return

    setSending(true)
    try {
      // console.log("🚀 Starting send transaction:", sendForm)
      const selectedToken = balances.find((t) => t.symbol === sendForm.token)
      const result = await walletService.sendToken({
        to: sendForm.recipient,
        amount: Number.parseFloat(sendForm.amount),
        tokenAddress: selectedToken?.address,
      })

      if (result.success) {
        // console.log("✅ Send successful:", result)
        alert(`✅ ${t.sendSuccess} ${sendForm.amount} ${sendForm.token}!`)
        setViewMode("main")
        setSendForm({ token: "TPF", amount: "", recipient: "" })
        await refreshBalances()
        await loadTransactionHistory(true)
      } else {
        // console.error("❌ Send failed:", result)
        alert(`❌ ${t.sendFailed}: ${result.error}`)
      }
    } catch (error) {
      // console.error("❌ Send error:", error)
      alert(`❌ ${t.sendFailed}. ${t.tryAgain}`)
    } finally {
      setSending(false)
    }
  }, [sendForm, balances, t.sendSuccess, t.sendFailed, t.tryAgain, refreshBalances, loadTransactionHistory])

  const getSwapQuote = useCallback(
    async (amountFrom: string, tokenFromSymbol: string, tokenToSymbol: string) => {
      if (
        !amountFrom ||
        Number.parseFloat(amountFrom) <= 0 ||
        isNaN(Number.parseFloat(amountFrom)) ||
        tokenFromSymbol === tokenToSymbol
      ) {
        setSwapQuote(null)
        setSwapForm((prev) => ({ ...prev, amountTo: "" }))
        setQuoteError(null)
        return
      }

      setGettingQuote(true)
      setQuoteError(null)

      const tokenInObj = TOKENS.find((t) => t.symbol === tokenFromSymbol)
      const tokenOutObj = TOKENS.find((t) => t.symbol === tokenToSymbol)

      if (!tokenInObj || !tokenOutObj) {
        setQuoteError("Invalid token selection.")
        setGettingQuote(false)
        return
      }

      try {
        // console.log(
        //   `🔄 Getting real quote for: ${amountFrom} ${tokenFromSymbol} to ${tokenToSymbol} via Holdstation SDK`,
        // )
        // console.log(`⚙️ Request parameters:
        // tokenIn: ${tokenInObj.address} (${tokenFromSymbol})
        // tokenOut: ${tokenOutObj.address} (${tokenToSymbol})
        // amountIn: ${amountFrom} (human-readable)
        // partnerCode: "24568"
        // fee: "0.2"
        // feeReceiver: "${ethers.ZeroAddress}"
        // `)

        // Convert input amount to wei using tokenInObj decimals
        const cleanAmount = Number.parseFloat(amountFrom).toFixed(tokenInObj.decimals)
        // console.log(`💰 Input amount (${tokenFromSymbol}): ${cleanAmount}`)

        // Get real quote using the SDK
        const quote = await swapHelper.estimate.quote({
          tokenIn: tokenInObj.address,
          tokenOut: tokenOutObj.address,
          amountIn: cleanAmount,
          slippage: "0.3",

          fee: "0.2",
          feeReceiver: ethers.ZeroAddress,
        })

        // Log do objeto completo da cotação para inspeção
        // console.log("📊 FULL RAW QUOTE RESPONSE FROM HOLDSTATION SDK:", JSON.stringify(quote, null, 2))

        // Validate essential fields in the quote response
        if (!quote || !quote.data || !quote.to || (!quote.outAmount && !quote.addons?.outAmount)) {
          throw new Error("Invalid quote received from SDK: Missing data, to, or outAmount.")
        }

        setSwapQuote(quote)

        // Extract output amount. The SDK's outAmount is already in human-readable format (decimal string).
        let outputAmountString = "0"
        if (quote.outAmount) {
          outputAmountString = quote.outAmount.toString()
        } else if (quote.addons?.outAmount) {
          outputAmountString = quote.addons.outAmount.toString()
        } else {
          throw new Error("Could not determine output amount from quote.")
        }

        // console.log(
        //   `🔍 Extracted raw output amount string (from SDK): "${outputAmountString}" (Type: ${typeof outputAmountString})`,
        // )

        const parsedAmount = Number.parseFloat(outputAmountString)
        // console.log(`🔢 Parsed output amount (number): ${parsedAmount}`)

        const finalAmount = parsedAmount.toFixed(tokenOutObj.decimals > 6 ? 6 : tokenOutObj.decimals) // Limit to 6 decimal places for display or token decimals

        // console.log(`✅ Final formatted amount for display: ${finalAmount} ${tokenToSymbol}`)

        setSwapForm((prev) => ({
          ...prev,
          amountTo: finalAmount,
        }))
      } catch (error) {
        // console.error("❌ Error getting real quote:", error)

        let errorMessage = t.quoteError
        if (error instanceof Error) {
          if (error.message?.includes("timeout")) {
            errorMessage = `${t.networkError}. ${t.tryAgain}`
          } else if (error.message?.includes("Network")) {
            errorMessage = `${t.networkError}. ${t.tryAgain}`
          } else if (error.message?.includes("insufficient")) {
            errorMessage = t.insufficientBalance
          } else {
            errorMessage = `${t.quoteError}: ${error.message}`
          }
        }

        setQuoteError(errorMessage)
        setSwapQuote(null)
        setSwapForm((prev) => ({ ...prev, amountTo: "" }))
      } finally {
        setGettingQuote(false)
      }
    },
    [t.quoteError, t.networkError, t.tryAgain, t.insufficientBalance],
  )

  // Auto-quote effect with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (swapForm.amountFrom && swapForm.tokenFrom && swapForm.tokenTo) {
        getSwapQuote(swapForm.amountFrom, swapForm.tokenFrom, swapForm.tokenTo)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [swapForm.amountFrom, swapForm.tokenFrom, swapForm.tokenTo, getSwapQuote])

  const handleSwap = useCallback(async () => {
    if (!swapQuote || !swapForm.amountFrom || !swapForm.tokenFrom || !swapForm.tokenTo) return

    setSwapping(true)
    try {
      // console.log("🚀 Starting swap transaction using swap service:", swapForm)

      // Check balance of the token being sent
      const tokenFromBalance = balances.find((t) => t.symbol === swapForm.tokenFrom)
      if (!tokenFromBalance || Number.parseFloat(tokenFromBalance.balance) < Number.parseFloat(swapForm.amountFrom)) {
        throw new Error(
          `${t.insufficientBalance}. Available: ${
            tokenFromBalance?.balance || "0"
          }, Required: ${swapForm.amountFrom} ${swapForm.tokenFrom}`,
        )
      }

      // Validate quote
      if (!swapQuote.data || !swapQuote.to) {
        throw new Error("Invalid swap quote")
      }

      // console.log("🔄 Calling doSwap from swap service...")

      const tokenInObj = TOKENS.find((t) => t.symbol === swapForm.tokenFrom)
      if (!tokenInObj) throw new Error("Input token not found.")

      const cleanAmount = Number.parseFloat(swapForm.amountFrom).toFixed(tokenInObj.decimals)

      // Call the doSwap function from the swap service
      const swapResult = await doSwap({
        walletAddress,
        quote: swapQuote,
        amountIn: cleanAmount,
        tokenInSymbol: swapForm.tokenFrom,
        tokenOutSymbol: swapForm.tokenTo,
      })

      // Check if swapResult is defined and indicates success
      if (swapResult && swapResult.success) {
        // console.log("✅ Swap completed successfully via swap service", swapResult)
        alert(
          `✅ ${t.swapSuccess} ${swapForm.amountFrom} ${swapForm.tokenFrom} for ${swapForm.amountTo} ${swapForm.tokenTo}!`,
        )
        setViewMode("main")
        setSwapForm({
          tokenFrom: "WLD",
          tokenTo: "TPF",
          amountFrom: "",
          amountTo: "",
        })
        setSwapQuote(null)
        await refreshBalances()
        await loadTransactionHistory(true)
      } else {
        // console.error("❌ Swap failed via swap service:", swapResult)
        // Provide a generic error message if swapResult is undefined or indicates failure
        let errorMessage = t.swapFailed
        if (swapResult && swapResult.errorCode) {
          errorMessage = `${t.swapFailed}: ${swapResult.errorCode}`
        } else if (swapResult && swapResult.error instanceof Error) {
          errorMessage = `${t.swapFailed}: ${swapResult.error.message}`
        } else if (!swapResult) {
          errorMessage = `${t.swapFailed}: ${t.tryAgain} (No result from swap service)`
        }
        throw new Error(errorMessage) // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      // console.error("❌ Swap error:", error)

      let errorMessage = t.swapFailed
      if (error instanceof Error) {
        if (error.message?.includes("Insufficient") || error.message?.includes("insuficiente")) {
          errorMessage = `${t.swapFailed}: ${t.insufficientBalance}`
        } else if (error.message?.includes("timeout")) {
          errorMessage = `${t.swapFailed}: ${t.networkError}. ${t.tryAgain}`
        } else if (error.message?.includes("Network")) {
          errorMessage = `${t.swapFailed}: ${t.networkError}. ${t.tryAgain}`
        } else if (error.message?.includes("simulation_failed")) {
          // Adicionado tratamento para simulation_failed
          errorMessage = `${t.swapFailed}: Simulation failed. The quote might be invalid or expired.`
        } else {
          errorMessage = `${t.swapFailed}: ${error.message}`
        }
      }

      alert(`❌ ${errorMessage}`)
    } finally {
      setSwapping(false)
    }
  }, [
    swapQuote,
    swapForm,
    balances,
    t.insufficientBalance,
    t.swapSuccess,
    t.swapFailed,
    t.tryAgain,
    t.networkError,
    refreshBalances,
    loadTransactionHistory,
  ])

  const handleBackToMain = useCallback(() => {
    setViewMode("main")
    setSendForm({ token: "TPF", amount: "", recipient: "" })
    setSwapForm({
      tokenFrom: "WLD",
      tokenTo: "TPF",
      amountFrom: "",
      amountTo: "",
    })
    setSwapQuote(null)
    setQuoteError(null)
  }, [])

  const openTransactionInExplorer = useCallback((hash: string) => {
    const explorerUrl = walletService.getExplorerTransactionUrl(hash)
    window.open(explorerUrl, "_blank")
  }, [])

  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }, [])

  useEffect(() => {
    if (walletAddress) {
      // console.log("🔗 Wallet connected:", walletAddress)
      loadBalances()
      loadTransactionHistory(true)
      loadTokenPrices() // Uncomment this line
    }
  }, [walletAddress, loadBalances, loadTransactionHistory, loadTokenPrices]) // Add loadTokenPrices to dependencies

  const formatBalance = useCallback((balance: string): string => {
    const num = Number.parseFloat(balance)
    if (num === 0) return "0"
    if (num < 0.0001) return "<0.0001"
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return `${(num / 1000).toFixed(1)}K`
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }, [])

  const getTokenIcon = useCallback((symbol: string) => {
    const token = TOKENS.find((t) => t.symbol === symbol)
    return token?.logo || "/placeholder.svg?height=32&width=32"
  }, [])

  const getTokenColor = useCallback((symbol: string) => {
    const token = TOKENS.find((t) => t.symbol === symbol)
    return token?.color || "#00D4FF"
  }, [])

  const handleSwapTokens = useCallback(() => {
    setSwapForm((prev) => ({
      ...prev,
      tokenFrom: prev.tokenTo,
      tokenTo: prev.tokenFrom,
      amountFrom: prev.amountTo, // Swap amounts too for better UX
      amountTo: prev.amountFrom,
    }))
    setSwapQuote(null) // Clear quote as tokens changed
    setQuoteError(null)
  }, [setSwapForm, setSwapQuote, setQuoteError])

  if (isMinimized) {
    return (
      <>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/60 backdrop-blur-xl border border-cyan-400/30 rounded-full p-3 shadow-2xl fixed top-20 right-4 z-40"
        >
          <button onClick={() => setIsMinimized(false)} className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <span className="text-white text-sm font-medium">{formatAddress(walletAddress)}</span>
          </button>
        </motion.div>
      </>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl min-w-[320px] max-w-[380px] overflow-hidden fixed top-20 right-4 z-40"
      >
        <AnimatePresence mode="wait">
          {/* Main View */}
          {viewMode === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.connected}</p>
                    <p className="text-gray-400 text-xs">{formatAddress(walletAddress)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={copyAddress}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    title={t.copyAddress}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    title="Minimize to icon"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onDisconnect}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
                    title={t.disconnect}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Balances Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowBalances(!showBalances)}
                      className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                    >
                      {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="text-sm font-medium">{t.tokens}</span>
                    </button>
                  </div>
                  <button
                    onClick={refreshBalances}
                    disabled={refreshing}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 disabled:opacity-50"
                    title={t.refreshBalances}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {showBalances && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 max-h-[280px] overflow-y-auto pr-1" // Added max-height and overflow-y-auto
                    >
                      {loading ? (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                          <span className="text-gray-400 text-sm">{t.loading}</span>
                        </div>
                      ) : error ? (
                        <div className="flex items-center justify-center py-4">
                          <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                          <span className="text-red-400 text-sm">{error}</span>
                        </div>
                      ) : balances.length === 0 ? (
                        <div className="text-center py-4">
                          <span className="text-gray-400 text-sm">No tokens found</span>
                        </div>
                      ) : (
                        // Directly map all balances, let overflow handle scrolling
                        balances.map((token, index) => {
                          // Remove the lines below
                          // const price = tokenPrices[token.symbol] || 0
                          // const change = priceChanges[token.symbol] || 0
                          // const valueInUsdc = Number.parseFloat(token.balance) * price

                          // Add these lines:
                          const price = tokenPrices[token.symbol] || 0
                          const valueInUsdc = Number.parseFloat(token.balance) * price

                          return (
                            <motion.button
                              key={token.symbol}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              // onClick={() => handleTokenClick(token)} // Keep this commented out as per original request
                              className="w-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/5 transition-all duration-200 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
                                    <img
                                      src={getTokenIcon(token.symbol) || "/placeholder.svg"}
                                      alt={token.name}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm text-left">{token.symbol}</p>
                                    <p className="text-gray-400 text-xs text-left">{token.name}</p>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                  <p className="text-white font-medium text-sm">
                                    {showBalances ? formatBalance(token.balance) : "••••"}
                                  </p>
                                  {/* Display the total value in USDC here */}
                                  <div className="flex items-center space-x-1 mt-1">
                                    {loadingPrices ? (
                                      <div className="animate-pulse bg-gray-600 h-3 w-12 rounded"></div>
                                    ) : price > 0 ? (
                                      <span className="text-gray-400 text-xs">{`$${valueInUsdc.toFixed(2)}`}</span>
                                    ) : (
                                      <span className="text-gray-500 text-xs">{t.priceUnavailable}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setViewMode("send")}
                    className="flex flex-col items-center justify-center space-y-1 py-2 px-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-200 text-blue-300 hover:text-blue-200"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.send}</span>
                  </button>
                  <button
                    onClick={() => setViewMode("receive")}
                    className="flex flex-col items-center justify-center space-y-1 py-2 px-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-all duration-200 text-green-300 hover:text-green-200"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.receive}</span>
                  </button>
                  <button
                    onClick={() => setViewMode("swap")}
                    className="flex flex-col items-center justify-center space-y-1 py-2 px-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg transition-all duration-200 text-orange-300 hover:text-orange-200"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.swap}</span>
                  </button>
                  <button
                    onClick={() => setViewMode("history")}
                    className="flex flex-col items-center justify-center space-y-1 py-2 px-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-all duration-200 text-purple-300 hover:text-purple-200"
                  >
                    <History className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.history}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Send View */}
          {viewMode === "send" && (
            <motion.div
              key="send"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="font-semibold text-white">{t.sendTokens}</h3>
                <div className="w-6"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.token}</label>
                  <select
                    value={sendForm.token}
                    onChange={(e) =>
                      setSendForm((prev) => ({
                        ...prev,
                        token: e.target.value,
                      }))
                    }
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {balances.map((token) => (
                      <option key={token.symbol} value={token.symbol} className="bg-black">
                        {token.symbol} ({t.available}: {formatBalance(token.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.amount}</label>
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) =>
                      setSendForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.recipientAddress}</label>
                  <input
                    type="text"
                    value={sendForm.recipient}
                    onChange={(e) =>
                      setSendForm((prev) => ({
                        ...prev,
                        recipient: e.target.value,
                      }))
                    }
                    placeholder="0x..."
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-300 text-xs">{t.sendWarning}</p>
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={sending || !sendForm.amount || !sendForm.recipient}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.sending}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.send}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Receive View */}
          {viewMode === "receive" && (
            <motion.div
              key="receive"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="font-semibold text-white">{t.receiveTokens}</h3>
                <div className="w-6"></div>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="w-32 h-32 mx-auto bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">QR Code</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-300 text-sm mb-2">{t.yourWalletAddress}</p>
                  <div className="bg-black/30 border border-white/20 rounded-lg p-3 break-all">
                    <p className="text-white text-sm font-mono">{walletAddress}</p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="mt-2 flex items-center justify-center space-x-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{t.copyAddress}</span>
                  </button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-300 text-xs">{t.networkWarning}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Swap View */}
          {viewMode === "swap" && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="font-semibold text-white">{t.swapTokens}</h3>
                <div className="w-6"></div>
              </div>

              <div className="space-y-4">
                {/* From Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.from}</label>
                  <div className="bg-black/30 border border-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <img
                          src={getTokenIcon(swapForm.tokenFrom) || "/placeholder.svg"} // Usando <img> tag
                          alt={swapForm.tokenFrom}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                          }}
                        />
                        <select
                          value={swapForm.tokenFrom}
                          onChange={(e) =>
                            setSwapForm((prev) => ({
                              ...prev,
                              tokenFrom: e.target.value,
                              amountTo: "", // Clear amountTo on token change
                              amountFrom: "", // Clear amountFrom on token change
                            }))
                          }
                          className="bg-transparent text-white font-medium focus:outline-none"
                        >
                          {TOKENS.map((token) => (
                            <option key={token.symbol} value={token.symbol} className="bg-black">
                              {token.symbol}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">
                          {t.available}: {balances.find((b) => b.symbol === swapForm.tokenFrom)?.balance || "0"}
                        </p>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={swapForm.amountFrom}
                      onChange={(e) =>
                        setSwapForm((prev) => ({
                          ...prev,
                          amountFrom: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
                    />
                  </div>
                </div>

                {/* Swap Arrow Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSwapTokens}
                    className="p-2 bg-gray-600/50 rounded-full hover:bg-gray-500/50 transition-colors"
                    title="Swap tokens"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* To Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.to}</label>
                  <div className="bg-black/30 border border-white/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={getTokenIcon(swapForm.tokenTo) || "/placeholder.svg"} // Usando <img> tag
                        alt={swapForm.tokenTo}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                        }}
                      />
                      <select
                        value={swapForm.tokenTo}
                        onChange={(e) =>
                          setSwapForm((prev) => ({
                            ...prev,
                            tokenTo: e.target.value,
                            amountTo: "", // Clear amountTo on token change
                            amountFrom: "", // Clear amountFrom on token change
                          }))
                        }
                        className="bg-transparent text-white font-medium focus:outline-none"
                      >
                        {TOKENS.map((token) => (
                          <option key={token.symbol} value={token.symbol} className="bg-black">
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-white text-lg font-medium">
                      {gettingQuote ? (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-gray-400">{t.gettingQuote}</span>
                        </div>
                      ) : swapForm.amountTo ? (
                        swapForm.amountTo
                      ) : (
                        <span className="text-gray-500">{t.enterAmount}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quote Error */}
                {quoteError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-xs">{quoteError}</p>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={
                    swapping ||
                    !swapForm.amountFrom ||
                    !swapForm.amountTo ||
                    !swapQuote ||
                    gettingQuote ||
                    !!quoteError ||
                    swapForm.tokenFrom === swapForm.tokenTo
                  }
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {swapping ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.swapping}</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>{t.swap}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* History View */}
          {viewMode === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="font-semibold text-white">{t.transactionHistory}</h3>
                <div className="w-6"></div>
              </div>

              <div className="space-y-3">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                    <span className="text-gray-400 text-sm">{t.loading}</span>
                  </div>
                ) : displayedTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">{t.noTransactions}</p>
                  </div>
                ) : (
                  <>
                    {displayedTransactions.map((tx, index) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-black/30 border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === "sent" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {tx.type === "sent" ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {tx.type === "sent" ? t.sent : t.received} {tx.token}
                            </p>
                            <p className="text-gray-400 text-xs">{formatAddress(tx.address)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">
                            {tx.type === "sent" ? "-" : "+"}
                            {tx.amount}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs ${getStatusColor(tx.status)}`}>
                              {tx.status === "confirmed" ? t.confirmed : tx.status === "pending" ? t.pending : t.failed}
                            </span>
                            <button
                              onClick={() => openTransactionInExplorer(tx.hash)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title={t.viewOnExplorer}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</div>
                      </motion.div>
                    ))}

                    {hasMoreTransactions && (
                      <button
                        onClick={loadMoreTransactions}
                        disabled={loadingMore}
                        className="w-full bg-gray-600/50 hover:bg-gray-600/70 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {loadingMore ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{t.loading}</span>
                          </>
                        ) : (
                          <span>{t.loadMore}</span>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
