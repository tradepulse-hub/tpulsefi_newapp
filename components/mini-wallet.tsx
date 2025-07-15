"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  Minimize2,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  AlertTriangle,
  History,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import { walletService } from "@/services/wallet-service"
import { doSwap, getRealQuote, TOKENS } from "@/services/swap-service"
import {
  getTokenPrice,
  getCurrentTokenPrice,
  getPriceChange,
  formatPrice,
  type TokenPrice,
} from "@/services/token-price-service"
import { PriceChart } from "@/components/price-chart"
import { DebugConsole } from "@/components/debug-console"

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
    received: "Recebido",
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
    pending: "Pendiente",
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
    insufficientBalance: "Saldo tidak mencukupi",
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

type ViewMode = "main" | "send" | "receive" | "history" | "swap" | "tokenDetail"

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
    tokenFrom: "WLD",
    tokenTo: "TPF",
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

  // Token detail states
  const [selectedTokenState, setSelectedTokenState] = useState<TokenBalance | null>(null)
  const [tokenPrice, setTokenPrice] = useState<TokenPrice | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)

  // Real-time token prices for main view
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({})
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [totalWalletValue, setTotalWalletValue] = useState(0)

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format USD value in the requested format (0.000,00$)
  const formatUSDValue = (value: number): string => {
    if (value === 0) return "0,00$"

    // Convert to string with 2 decimal places
    const formatted = value.toFixed(2)

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = formatted.split(".")

    // Add thousand separators (dots) to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

    // Return in format: 0.000,00$
    return `${formattedInteger},${decimalPart}$`
  }

  // Calculate total wallet value
  const calculateTotalWalletValue = useCallback(() => {
    let total = 0
    balances.forEach((token) => {
      const price = tokenPrices[token.symbol] || 0
      const balance = Number.parseFloat(token.balance.replace(/,/g, ""))
      total += balance * price
    })
    setTotalWalletValue(total)
  }, [balances, tokenPrices])

  // Update total value when balances or prices change
  useEffect(() => {
    calculateTotalWalletValue()
  }, [calculateTotalWalletValue])

  // Load real-time token prices for main view
  const loadTokenPrices = async () => {
    try {
      setLoadingPrices(true)
      console.log("🔄 Loading real token prices via Holdstation SDK...")

      const prices: Record<string, number> = {}
      const changes: Record<string, number> = {}

      await Promise.all(
        TOKENS.map(async (token) => {
          try {
            const [price, change] = await Promise.all([
              getCurrentTokenPrice(token.symbol),
              getPriceChange(token.symbol, "1H"),
            ])
            prices[token.symbol] = price
            changes[token.symbol] = change
            console.log(`✅ Price loaded for ${token.symbol}: $${price}`)
          } catch (error) {
            console.error(`❌ Error fetching data for ${token.symbol}:`, error)
            prices[token.symbol] = 0
            changes[token.symbol] = 0
          }
        }),
      )

      setTokenPrices(prices)
      setPriceChanges(changes)
      console.log("✅ All token prices loaded successfully")
    } catch (error) {
      console.error("❌ Error loading token prices:", error)
    } finally {
      setLoadingPrices(false)
    }
  }

  const loadBalances = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Loading token balances for:", walletAddress)
      const tokenBalances = await walletService.getTokenBalances(walletAddress)
      console.log("✅ Token balances loaded:", tokenBalances)
      setBalances(tokenBalances)
    } catch (error) {
      console.error("❌ Error loading balances:", error)
      setError("Failed to load balances")
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionHistory = async (reset = false) => {
    try {
      if (reset) {
        setLoadingHistory(true)
        setCurrentPage(0)
        setDisplayedTransactions([])
      } else {
        setLoadingMore(true)
      }

      console.log("🔄 Loading transaction history for:", walletAddress)
      const limit = (currentPage + 1) * TRANSACTIONS_PER_PAGE + 5
      const history = await walletService.getTransactionHistory(walletAddress, limit)
      console.log("✅ Transaction history loaded:", history.length, "transactions")

      setAllTransactions(history)

      const newDisplayCount = (currentPage + 1) * TRANSACTIONS_PER_PAGE
      const newDisplayed = history.slice(0, newDisplayCount)

      setDisplayedTransactions(newDisplayed)
      setHasMoreTransactions(history.length > newDisplayCount)
    } catch (error) {
      console.error("❌ Error loading transaction history:", error)
    } finally {
      setLoadingHistory(false)
      setLoadingMore(false)
    }
  }

  const loadMoreTransactions = async () => {
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
  }

  const refreshBalances = async () => {
    setRefreshing(true)
    await Promise.all([loadBalances(), loadTokenPrices()])
    setRefreshing(false)
  }

  const handleSend = async () => {
    if (!sendForm.amount || !sendForm.recipient) return

    setSending(true)
    try {
      console.log("🚀 Starting send transaction:", sendForm)
      const selectedToken = balances.find((t) => t.symbol === sendForm.token)
      const result = await walletService.sendToken({
        to: sendForm.recipient,
        amount: Number.parseFloat(sendForm.amount),
        tokenAddress: selectedToken?.address,
      })

      if (result.success) {
        console.log("✅ Send successful:", result)
        alert(`✅ ${t.sendSuccess} ${sendForm.amount} ${sendForm.token}!`)
        setViewMode("main")
        setSendForm({ token: "TPF", amount: "", recipient: "" })
        await refreshBalances()
        await loadTransactionHistory(true)
      } else {
        console.error("❌ Send failed:", result)
        alert(`❌ ${t.sendFailed}: ${result.error}`)
      }
    } catch (error) {
      console.error("❌ Send error:", error)
      alert(`❌ ${t.sendFailed}. ${t.tryAgain}`)
    } finally {
      setSending(false)
    }
  }

  // Get token info by symbol
  const getTokenBySymbol = (symbol: string) => {
    return TOKENS.find((token) => token.symbol === symbol)
  }

  // Get REAL quote from Holdstation SDK - now supports all token pairs
  const getSwapQuote = useCallback(
    async (amountFrom: string, tokenFromSymbol: string, tokenToSymbol: string) => {
      if (!amountFrom || Number.parseFloat(amountFrom) <= 0 || isNaN(Number.parseFloat(amountFrom))) {
        setSwapQuote(null)
        setSwapForm((prev) => ({ ...prev, amountTo: "" }))
        setQuoteError(null)
        return
      }

      const tokenFrom = getTokenBySymbol(tokenFromSymbol)
      const tokenTo = getTokenBySymbol(tokenToSymbol)

      if (!tokenFrom || !tokenTo) {
        setQuoteError("Invalid token selection")
        return
      }

      setGettingQuote(true)
      setQuoteError(null)

      try {
        console.log(`🔄 Getting quote for: ${amountFrom} ${tokenFromSymbol} to ${tokenToSymbol}`)

        const { quote, outputAmount } = await getRealQuote(amountFrom, tokenFrom.address, tokenTo.address)

        console.log("✅ Quote received:", {
          outputAmount,
          hasData: !!quote.data,
          hasTo: !!quote.to,
        })

        setSwapQuote(quote)
        setSwapForm((prev) => ({
          ...prev,
          amountTo: outputAmount,
        }))

        console.log(`💱 Updated swap form with amount: ${outputAmount} ${tokenToSymbol}`)
      } catch (error) {
        console.error("❌ Error getting quote:", error)

        let errorMessage = t.quoteError
        if (error.message?.includes("timeout")) {
          errorMessage = `${t.networkError}. ${t.tryAgain}`
        } else if (error.message?.includes("Network")) {
          errorMessage = `${t.networkError}. ${t.tryAgain}`
        }

        setQuoteError(errorMessage)
        setSwapQuote(null)
        setSwapForm((prev) => ({ ...prev, amountTo: "" }))
      } finally {
        setGettingQuote(false)
      }
    },
    [t.quoteError, t.networkError, t.tryAgain],
  )

  // Auto-quote effect with debounce - now works with any token pair
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (swapForm.tokenFrom && swapForm.tokenTo && swapForm.tokenFrom !== swapForm.tokenTo) {
        getSwapQuote(swapForm.amountFrom, swapForm.tokenFrom, swapForm.tokenTo)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [swapForm.amountFrom, swapForm.tokenFrom, swapForm.tokenTo, getSwapQuote])

  const handleSwap = async () => {
    if (!swapForm.amountFrom || !swapQuote) return

    const tokenFrom = getTokenBySymbol(swapForm.tokenFrom)
    const tokenTo = getTokenBySymbol(swapForm.tokenTo)

    if (!tokenFrom || !tokenTo) {
      alert("Invalid token selection")
      return
    }

    setSwapping(true)
    try {
      console.log("🚀 Starting swap transaction:", swapForm)

      const result = await doSwap({
        walletAddress,
        quote: swapQuote,
        amountIn: swapForm.amountFrom,
        tokenInAddress: tokenFrom.address,
        tokenOutAddress: tokenTo.address,
      })

      if (result.success) {
        console.log("✅ Swap successful:", result)
        alert(
          `✅ ${t.swapSuccess} ${swapForm.amountFrom} ${swapForm.tokenFrom} to ${swapForm.amountTo} ${swapForm.tokenTo}!`,
        )
        setViewMode("main")
        setSwapForm({ tokenFrom: "WLD", tokenTo: "TPF", amountFrom: "", amountTo: "" })
        setSwapQuote(null)
        await refreshBalances()
        await loadTransactionHistory(true)
      } else {
        console.error("❌ Swap failed:", result)
        alert(`❌ ${t.swapFailed}. ${t.tryAgain}`)
      }
    } catch (error) {
      console.error("❌ Swap error:", error)
      alert(`❌ ${t.swapFailed}. ${t.tryAgain}`)
    } finally {
      setSwapping(false)
    }
  }

  // Load token price for detail view
  const loadTokenPrice = async (symbol: string) => {
    setLoadingPrice(true)
    try {
      console.log(`📊 Loading detailed price data for ${symbol}`)
      const priceData = await getTokenPrice(symbol, "1H")
      setTokenPrice(priceData)
      console.log(`✅ Price data loaded for ${symbol}:`, priceData)
    } catch (error) {
      console.error(`❌ Error loading price for ${symbol}:`, error)
      setTokenPrice(null)
    } finally {
      setLoadingPrice(false)
    }
  }

  // Handle token detail view
  const handleTokenDetail = (token: TokenBalance) => {
    setSelectedTokenState(token)
    setViewMode("tokenDetail")
    loadTokenPrice(token.symbol)
  }

  // Initial load
  useEffect(() => {
    loadBalances()
    loadTokenPrices()
    loadTransactionHistory(true)
  }, [walletAddress])

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (viewMode === "main") {
        loadTokenPrices()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [viewMode])

  // Filter balances to hide zero balances
  const filteredBalances = balances.filter((token) => {
    const balance = Number.parseFloat(token.balance.replace(/,/g, ""))
    return balance > 0
  })

  // Get available balance for selected token in send form
  const getAvailableBalance = (tokenSymbol: string) => {
    const token = balances.find((t) => t.symbol === tokenSymbol)
    return token ? Number.parseFloat(token.balance.replace(/,/g, "")) : 0
  }

  // Check if send amount is valid
  const isSendAmountValid = () => {
    if (!sendForm.amount) return false
    const amount = Number.parseFloat(sendForm.amount)
    const available = getAvailableBalance(sendForm.token)
    return amount > 0 && amount <= available
  }

  // Check if swap amount is valid
  const isSwapAmountValid = () => {
    if (!swapForm.amountFrom) return false
    const amount = Number.parseFloat(swapForm.amountFrom)
    const available = getAvailableBalance(swapForm.tokenFrom)
    return amount > 0 && amount <= available
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50"
      >
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: isMinimized ? 0.8 : 1 }}
        className={`fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 ${
          isMinimized ? "w-64 h-16" : "w-80 max-h-[600px]"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {viewMode === "main" && (
                  <>
                    {t.tokens} {formatUSDValue(totalWalletValue)}
                  </>
                )}
                {viewMode === "send" && t.sendTokens}
                {viewMode === "receive" && t.receiveTokens}
                {viewMode === "swap" && t.swapTokens}
                {viewMode === "history" && t.transactionHistory}
                {viewMode === "tokenDetail" && t.tokenDetails}
              </div>
              <div className="text-xs text-gray-500">
                {t.connected}: {formatAddress(walletAddress)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {viewMode !== "main" && (
              <button
                onClick={() => setViewMode("main")}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={t.back}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={t.minimize}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDisconnect}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t.disconnect}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="overflow-y-auto max-h-[500px]">
            <AnimatePresence mode="wait">
              {/* Main View */}
              {viewMode === "main" && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <button
                      onClick={() => setViewMode("send")}
                      className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5 text-blue-600 mb-1" />
                      <span className="text-xs text-blue-600">{t.send}</span>
                    </button>
                    <button
                      onClick={() => setViewMode("receive")}
                      className="flex flex-col items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <ArrowDownLeft className="w-5 h-5 text-green-600 mb-1" />
                      <span className="text-xs text-green-600">{t.receive}</span>
                    </button>
                    <button
                      onClick={() => setViewMode("swap")}
                      className="flex flex-col items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <ArrowLeftRight className="w-5 h-5 text-purple-600 mb-1" />
                      <span className="text-xs text-purple-600">{t.swap}</span>
                    </button>
                    <button
                      onClick={() => setViewMode("history")}
                      className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <History className="w-5 h-5 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-600">{t.history}</span>
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowBalances(!showBalances)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={refreshBalances}
                      disabled={refreshing}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                      <span>{t.refreshBalances}</span>
                    </button>
                  </div>

                  {/* Token List */}
                  <div className="space-y-2">
                    {filteredBalances.map((token) => {
                      const price = tokenPrices[token.symbol] || 0
                      const change = priceChanges[token.symbol] || 0
                      const balance = Number.parseFloat(token.balance.replace(/,/g, ""))
                      const usdValue = balance * price

                      return (
                        <div
                          key={token.symbol}
                          onClick={() => handleTokenDetail(token)}
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {token.icon ? (
                                <Image
                                  src={token.icon || "/placeholder.svg"}
                                  alt={token.symbol}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-600">{token.symbol[0]}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{token.symbol}</div>
                              <div className="text-sm text-gray-500">{token.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {showBalances ? token.formattedBalance : "••••"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {showBalances && price > 0 ? (
                                <div className="flex items-center space-x-1">
                                  <span>{formatUSDValue(usdValue)}</span>
                                  {change !== 0 && (
                                    <span className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {change >= 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              ) : loadingPrices ? (
                                t.loadingPrice
                              ) : (
                                t.priceUnavailable
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {filteredBalances.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No tokens with balance found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Send View */}
              {viewMode === "send" && (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  <div className="space-y-4">
                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.token}</label>
                      <select
                        value={sendForm.token}
                        onChange={(e) => setSendForm({ ...sendForm, token: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {balances
                          .filter((token) => Number.parseFloat(token.balance.replace(/,/g, "")) > 0)
                          .map((token) => (
                            <option key={token.symbol} value={token.symbol}>
                              {token.symbol} - {t.available}: {token.formattedBalance}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.amount}</label>
                      <input
                        type="number"
                        value={sendForm.amount}
                        onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {sendForm.amount && !isSendAmountValid() && (
                        <p className="text-sm text-red-600 mt-1">{t.insufficientBalance}</p>
                      )}
                    </div>

                    {/* Recipient Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.recipientAddress}</label>
                      <input
                        type="text"
                        value={sendForm.recipient}
                        onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                        placeholder="0x..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Warning */}
                    <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">{t.networkWarning}</p>
                        <p>{t.sendWarning}</p>
                      </div>
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={sending || !isSendAmountValid() || !sendForm.recipient}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
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
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  <div className="text-center space-y-4">
                    <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-xs text-gray-500 p-4 break-all font-mono">{walletAddress}</div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t.yourWalletAddress}</p>
                      <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-mono text-gray-600">{formatAddress(walletAddress)}</span>
                        <button
                          onClick={copyAddress}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{t.networkWarning}</p>
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
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  <div className="space-y-4">
                    {/* From Token */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.from}</label>
                      <div className="space-y-2">
                        <select
                          value={swapForm.tokenFrom}
                          onChange={(e) => setSwapForm({ ...swapForm, tokenFrom: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {TOKENS.map((token) => {
                            const balance = getAvailableBalance(token.symbol)
                            return (
                              <option key={token.symbol} value={token.symbol}>
                                {token.symbol} - {t.available}: {balance.toFixed(4)}
                              </option>
                            )
                          })}
                        </select>
                        <input
                          type="number"
                          value={swapForm.amountFrom}
                          onChange={(e) => setSwapForm({ ...swapForm, amountFrom: e.target.value })}
                          placeholder="0.00"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {swapForm.amountFrom && !isSwapAmountValid() && (
                          <p className="text-sm text-red-600">{t.insufficientBalance}</p>
                        )}
                      </div>
                    </div>

                    {/* Swap Direction Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          setSwapForm({
                            tokenFrom: swapForm.tokenTo,
                            tokenTo: swapForm.tokenFrom,
                            amountFrom: "",
                            amountTo: "",
                          })
                        }
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <ArrowLeftRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* To Token */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.to}</label>
                      <div className="space-y-2">
                        <select
                          value={swapForm.tokenTo}
                          onChange={(e) => setSwapForm({ ...swapForm, tokenTo: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {TOKENS.filter((token) => token.symbol !== swapForm.tokenFrom).map((token) => (
                            <option key={token.symbol} value={token.symbol}>
                              {token.symbol}
                            </option>
                          ))}
                        </select>
                        <div className="relative">
                          <input
                            type="text"
                            value={swapForm.amountTo}
                            readOnly
                            placeholder={gettingQuote ? t.gettingQuote : t.enterAmount}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                          />
                          {gettingQuote && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quote Error */}
                    {quoteError && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800">{quoteError}</p>
                      </div>
                    )}

                    {/* Quote Info */}
                    {swapQuote && swapForm.amountTo && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <p>
                            {t.youWillReceive}: {swapForm.amountTo} {swapForm.tokenTo}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Swap Button */}
                    <button
                      onClick={handleSwap}
                      disabled={swapping || !isSwapAmountValid() || !swapQuote || gettingQuote}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
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
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{t.loading}</span>
                      </div>
                    </div>
                  ) : displayedTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {displayedTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === "sent"
                                  ? "bg-red-100 text-red-600"
                                  : tx.type === "received"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {tx.type === "sent" ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {tx.type === "sent" ? t.sent : t.received} {tx.amount} {tx.token}
                              </div>
                              <div className="text-sm text-gray-500">
                                {tx.type === "sent" ? t.to : t.from}: {formatAddress(tx.address)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-medium ${
                                tx.status === "confirmed"
                                  ? "text-green-600"
                                  : tx.status === "pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {tx.status === "confirmed" ? t.confirmed : tx.status === "pending" ? t.pending : t.failed}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}

                      {hasMoreTransactions && (
                        <button
                          onClick={loadMoreTransactions}
                          disabled={loadingMore}
                          className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
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
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t.noTransactions}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Token Detail View */}
              {viewMode === "tokenDetail" && selectedTokenState && (
                <motion.div
                  key="tokenDetail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  <div className="space-y-4">
                    {/* Token Header */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {selectedTokenState.icon ? (
                          <Image
                            src={selectedTokenState.icon || "/placeholder.svg"}
                            alt={selectedTokenState.symbol}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-medium text-gray-600">{selectedTokenState.symbol[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedTokenState.symbol}</h3>
                        <p className="text-gray-600">{selectedTokenState.name}</p>
                        <p className="text-sm text-gray-500">
                          {t.available}: {selectedTokenState.formattedBalance}
                        </p>
                      </div>
                    </div>

                    {/* Price Info */}
                    {loadingPrice ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t.loadingPrice}</span>
                        </div>
                      </div>
                    ) : tokenPrice ? (
                      <div className="space-y-4">
                        {/* Current Price */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">{t.currentPrice}</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(tokenPrice.currentPrice, selectedTokenState.symbol)}
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">{t.priceChange24h}</div>
                            <div
                              className={`text-lg font-bold ${
                                tokenPrice.changePercent24h >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {tokenPrice.changePercent24h >= 0 ? "+" : ""}
                              {tokenPrice.changePercent24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        {/* Price Chart */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t.priceChart}</h4>
                          <PriceChart
                            symbol={selectedTokenState.symbol}
                            color={TOKENS.find((t) => t.symbol === selectedTokenState.symbol)?.color || "#00D4FF"}
                            height={200}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t.priceUnavailable}</p>
                        <button
                          onClick={() => loadTokenPrice(selectedTokenState.symbol)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {t.refreshPrice}
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setSendForm({ ...sendForm, token: selectedTokenState.symbol })
                          setViewMode("send")
                        }}
                        className="flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>{t.send}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSwapForm({ ...swapForm, tokenFrom: selectedTokenState.symbol })
                          setViewMode("swap")
                        }}
                        className="flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        <span>{t.swap}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Debug Console */}
      <DebugConsole />
    </>
  )
}
