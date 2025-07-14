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
  ExternalLink,
  ArrowLeftRight,
} from "lucide-react"
import Image from "next/image"
import { walletService } from "@/services/wallet-service"
import {
  doSwap,
  testSwapHelper,
  getRealQuote,
  validateContracts,
  debugContractInteraction,
  TOKENS,
} from "@/services/swap-service"
import { ethers } from "ethers"
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
    token: "Token",
    amount: "Amount",
    recipientAddress: "Recipient Address",
    sending: "Sending...",
    swapping: "Swapping...",
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
    token: "Token",
    amount: "Quantidade",
    recipientAddress: "Endereço do Destinatário",
    sending: "Enviando...",
    swapping: "Trocando...",
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
    token: "Token",
    amount: "Cantidad",
    recipientAddress: "Dirección del Destinatario",
    sending: "Enviando...",
    swapping: "Intercambiando...",
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
    token: "Token",
    amount: "Jumlah",
    recipientAddress: "Alamat Penerima",
    sending: "Mengirim...",
    swapping: "Menukar...",
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
  },
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
    await loadBalances()
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
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [swapForm.amountFrom, swapForm.tokenFrom, swapForm.tokenTo, getSwapQuote])

  const handleSwap = async () => {
    if (!swapQuote || !swapForm.amountFrom) return

    const tokenFrom = getTokenBySymbol(swapForm.tokenFrom)
    const tokenTo = getTokenBySymbol(swapForm.tokenTo)

    if (!tokenFrom || !tokenTo) {
      alert("Invalid token selection")
      return
    }

    setSwapping(true)
    try {
      console.log("🚀 Starting swap transaction:", swapForm)

      // Check balance for the FROM token
      const fromTokenBalance = balances.find((t) => t.symbol === swapForm.tokenFrom)
      if (!fromTokenBalance || Number.parseFloat(fromTokenBalance.balance) < Number.parseFloat(swapForm.amountFrom)) {
        throw new Error(
          `${t.insufficientBalance}. Available: ${fromTokenBalance?.balance || "0"}, Required: ${swapForm.amountFrom}`,
        )
      }

      // Validate quote
      if (!swapQuote.data || !swapQuote.to) {
        throw new Error("Invalid swap quote")
      }

      // Convert amount to wei using the correct decimals for the FROM token
      const amountInWei = ethers.parseUnits(swapForm.amountFrom, tokenFrom.decimals)
      console.log("💰 Swap amount in wei:", amountInWei.toString())

      const result = await doSwap({
        walletAddress,
        quote: swapQuote,
        amountIn: amountInWei.toString(),
        tokenInAddress: tokenFrom.address,
        tokenOutAddress: tokenTo.address,
      })

      console.log("✅ Swap completed:", result)

      if (result.success) {
        alert(
          `✅ ${t.swapSuccess} ${swapForm.amountFrom} ${swapForm.tokenFrom} for ${swapForm.amountTo} ${swapForm.tokenTo}!`,
        )
        if (result.transactionId) {
          console.log("🎯 Transaction ID:", result.transactionId)
        }

        setViewMode("main")
        setSwapForm({ tokenFrom: "WLD", tokenTo: "TPF", amountFrom: "", amountTo: "" })
        setSwapQuote(null)
        await refreshBalances()
        await loadTransactionHistory(true)
      } else {
        throw new Error("Swap completed but returned success: false")
      }
    } catch (error) {
      console.error("❌ Swap error:", error)

      let errorMessage = t.swapFailed
      if (error.message?.includes("Insufficient") || error.message?.includes("insuficiente")) {
        errorMessage = `${t.swapFailed}: ${t.insufficientBalance}`
      } else if (error.message?.includes("timeout")) {
        errorMessage = `${t.swapFailed}: ${t.networkError}. ${t.tryAgain}`
      } else if (error.message?.includes("Network")) {
        errorMessage = `${t.swapFailed}: ${t.networkError}. ${t.tryAgain}`
      }

      alert(`❌ ${errorMessage}`)
    } finally {
      setSwapping(false)
    }
  }

  const handleBackToMain = () => {
    setViewMode("main")
    setSendForm({ token: "TPF", amount: "", recipient: "" })
    setSwapForm({ tokenFrom: "WLD", tokenTo: "TPF", amountFrom: "", amountTo: "" })
    setSwapQuote(null)
    setQuoteError(null)
  }

  const openTransactionInExplorer = (hash: string) => {
    const explorerUrl = walletService.getExplorerTransactionUrl(hash)
    window.open(explorerUrl, "_blank")
  }

  const formatTimestamp = (timestamp: number) => {
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
  }

  const getStatusColor = (status: string) => {
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
  }

  useEffect(() => {
    if (walletAddress) {
      console.log("🔗 Wallet connected:", walletAddress)
      loadBalances()
      loadTransactionHistory(true)
    }
  }, [walletAddress])

  // Test Holdstation SDK on component mount with contract debugging
  useEffect(() => {
    const testSDK = async () => {
      console.log("🧪 Testing Holdstation SDK on component mount...")

      try {
        // Debug contract interaction first
        await debugContractInteraction()

        await validateContracts()
        console.log("✅ Contracts validated successfully")

        const isWorking = await testSwapHelper()
        if (!isWorking) {
          console.error("❌ Holdstation SDK is not working properly")
          setQuoteError("SDK initialization failed")
        } else {
          console.log("✅ Holdstation SDK is working correctly")
        }
      } catch (error) {
        console.error("❌ SDK validation failed:", error)
        setQuoteError(`SDK error: ${error.message}`)
      }
    }

    testSDK()
  }, [])

  const formatBalance = (balance: string): string => {
    const num = Number.parseFloat(balance)
    if (num === 0) return "0"
    if (num < 0.0001) return "<0.0001"
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }

  // Get available tokens for swap (excluding the currently selected token)
  const getAvailableTokensForSwap = (excludeSymbol: string) => {
    return TOKENS.filter((token) => token.symbol !== excludeSymbol)
  }

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
        <DebugConsole />
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
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
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
                      className="space-y-2"
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
                        balances.map((token, index) => (
                          <motion.div
                            key={token.symbol}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/5 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
                                  {token.icon ? (
                                    <Image
                                      src={token.icon || "/placeholder.svg"}
                                      alt={token.name}
                                      width={32}
                                      height={32}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">{token.symbol.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{token.symbol}</p>
                                  <p className="text-gray-400 text-xs">{token.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-medium text-sm">
                                  {showBalances ? formatBalance(token.balance) : "••••"}
                                </p>
                                <p className="text-gray-400 text-xs">{token.symbol}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
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
                    <ArrowUpRight className="w-4 h-4" />
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
              {/* Header with Back Button */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Send className="w-5 h-5 mr-2 text-blue-400" />
                  {t.sendTokens}
                </h3>
                <div className="w-16" />
              </div>

              {/* Warning Message for Send */}
              <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-300 text-xs leading-relaxed">{t.sendWarning}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.token}</label>
                  <select
                    value={sendForm.token}
                    onChange={(e) => setSendForm({ ...sendForm, token: e.target.value })}
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {balances.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount with Available Balance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">{t.amount}</label>
                    <span className="text-xs text-gray-400">
                      {t.available}: {(() => {
                        const selectedToken = balances.find((t) => t.symbol === sendForm.token)
                        return selectedToken ? formatBalance(selectedToken.balance) : "0"
                      })()} {sendForm.token}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.recipientAddress}</label>
                  <input
                    type="text"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                    placeholder="0x..."
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={sending || !sendForm.amount || !sendForm.recipient}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-l-transparent border-b-white rounded-full animate-spin" />
                      <span>{t.sending}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {t.send} {sendForm.token}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Swap View - Now supports all token pairs */}
          {viewMode === "swap" && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              {/* Header with Back Button */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <ArrowLeftRight className="w-5 h-5 mr-2 text-orange-400" />
                  {t.swapTokens}
                </h3>
                <div className="w-16" />
              </div>

              <div className="space-y-4">
                {/* From Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.from}</label>
                  <div className="space-y-2">
                    <select
                      value={swapForm.tokenFrom}
                      onChange={(e) => {
                        const newTokenFrom = e.target.value
                        setSwapForm((prev) => ({
                          ...prev,
                          tokenFrom: newTokenFrom,
                          // If the new FROM token is the same as TO token, swap them
                          tokenTo: newTokenFrom === prev.tokenTo ? prev.tokenFrom : prev.tokenTo,
                          amountTo: "", // Reset amount
                        }))
                        setSwapQuote(null) // Reset quote
                      }}
                      className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      {TOKENS.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol} ({token.name})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={swapForm.amountFrom}
                      onChange={(e) => setSwapForm({ ...swapForm, amountFrom: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                    <div className="text-xs text-gray-400">
                      {t.available}: {(() => {
                        const fromToken = balances.find((t) => t.symbol === swapForm.tokenFrom)
                        return fromToken ? formatBalance(fromToken.balance) : "0"
                      })()} {swapForm.tokenFrom}
                    </div>
                  </div>
                </div>

                {/* Swap Direction Indicator with Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setSwapForm((prev) => ({
                        ...prev,
                        tokenFrom: prev.tokenTo,
                        tokenTo: prev.tokenFrom,
                        amountFrom: "",
                        amountTo: "",
                      }))
                      setSwapQuote(null)
                    }}
                    className="w-8 h-8 bg-orange-600/20 border border-orange-500/30 rounded-full flex items-center justify-center hover:bg-orange-600/30 transition-colors"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                  </button>
                </div>

                {/* To Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.to}</label>
                  <div className="space-y-2">
                    <select
                      value={swapForm.tokenTo}
                      onChange={(e) => {
                        const newTokenTo = e.target.value
                        setSwapForm((prev) => ({
                          ...prev,
                          tokenTo: newTokenTo,
                          // If the new TO token is the same as FROM token, swap them
                          tokenFrom: newTokenTo === prev.tokenFrom ? prev.tokenTo : prev.tokenFrom,
                          amountTo: "", // Reset amount
                        }))
                        setSwapQuote(null) // Reset quote
                      }}
                      className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      {TOKENS.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol} ({token.name})
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <input
                        type="number"
                        value={swapForm.amountTo}
                        readOnly
                        placeholder="0.00"
                        className="w-full bg-gray-700/50 border border-white/10 rounded-lg px-3 py-2 text-gray-300 cursor-not-allowed pr-8"
                      />
                      {gettingQuote && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Quote Status Messages */}
                    {!swapForm.amountFrom && <div className="text-xs text-gray-400">{t.enterAmount}</div>}
                    {swapForm.tokenFrom === swapForm.tokenTo && (
                      <div className="text-xs text-red-400 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Please select different tokens
                      </div>
                    )}
                    {gettingQuote && (
                      <div className="text-xs text-orange-400 flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        {t.gettingQuote}
                      </div>
                    )}
                    {quoteError && (
                      <div className="text-xs text-red-400 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {quoteError}
                      </div>
                    )}
                    {swapQuote && swapForm.amountTo && (
                      <div className="text-xs text-green-400">
                        {t.youWillReceive} ~{formatBalance(swapForm.amountTo)} {swapForm.tokenTo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={
                    swapping ||
                    !swapQuote ||
                    !swapForm.amountFrom ||
                    swapForm.tokenFrom === swapForm.tokenTo ||
                    (() => {
                      const fromTokenBalance = balances.find((t) => t.symbol === swapForm.tokenFrom)
                      return (
                        !fromTokenBalance ||
                        Number.parseFloat(fromTokenBalance.balance) < Number.parseFloat(swapForm.amountFrom || "0")
                      )
                    })()
                  }
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {swapping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-l-transparent border-b-white rounded-full animate-spin" />
                      <span>{t.swapping}</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>
                        {(() => {
                          if (swapForm.tokenFrom === swapForm.tokenTo) {
                            return "Select different tokens"
                          }
                          const fromTokenBalance = balances.find((t) => t.symbol === swapForm.tokenFrom)
                          if (
                            !fromTokenBalance ||
                            Number.parseFloat(fromTokenBalance.balance) < Number.parseFloat(swapForm.amountFrom || "0")
                          ) {
                            return t.insufficientBalance
                          }
                          return `${t.swap} ${swapForm.tokenFrom} → ${swapForm.tokenTo}`
                        })()}
                      </span>
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
              {/* Header with Back Button */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <ArrowDownLeft className="w-5 h-5 mr-2 text-green-400" />
                  {t.receiveTokens}
                </h3>
                <div className="w-16" />
              </div>

              {/* Warning Message */}
              <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-300 text-xs leading-relaxed">{t.networkWarning}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t.yourWalletAddress}</label>
                  <div className="bg-gray-800/50 border border-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono text-sm break-all">{walletAddress}</span>
                      <button
                        onClick={copyAddress}
                        className="ml-2 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
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
              {/* Header with Back Button */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToMain}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.back}</span>
                </button>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <History className="w-5 h-5 mr-2 text-purple-400" />
                  {t.transactionHistory}
                </h3>
                <div className="w-16" />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                    <span className="text-gray-400">{t.loading}</span>
                  </div>
                ) : displayedTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 text-gray-500 mx-auto mb-2" />
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
                        className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/5 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
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
                              <div className="flex items-center space-x-2">
                                <p className="text-white font-medium text-sm">
                                  {tx.type === "sent" ? t.sent : t.received} {tx.token}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                                  {tx.status === "confirmed"
                                    ? t.confirmed
                                    : tx.status === "pending"
                                      ? t.pending
                                      : t.failed}
                                </span>
                              </div>
                              <p className="text-gray-400 text-xs">{formatAddress(tx.address)}</p>
                              <p className="text-gray-500 text-xs">{formatTimestamp(tx.timestamp)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium text-sm ${
                                tx.type === "sent" ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {tx.type === "sent" ? "-" : "+"}
                              {formatBalance(tx.amount)}
                            </p>
                            <button
                              onClick={() => openTransactionInExplorer(tx.hash)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title={t.viewOnExplorer}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Load More Button */}
                    {hasMoreTransactions && (
                      <button
                        onClick={loadMoreTransactions}
                        disabled={loadingMore}
                        className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center space-x-2"
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
      <DebugConsole />
    </>
  )
}
