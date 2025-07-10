"use client"

import { useState, useEffect } from "react"
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
  ChevronDown,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
import { walletService } from "@/services/wallet-service"
import { doSwap, TOKENS, getSwapQuote } from "@/services/swap-service"
import { ethers } from "ethers"

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
    tokenFrom: "TPF",
    tokenTo: "WLD",
    amountFrom: "",
    amountTo: "",
  })
  const [sending, setSending] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [gettingQuote, setGettingQuote] = useState(false)
  const [swapQuote, setSwapQuote] = useState<any>(null)
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
      const tokenBalances = await walletService.getTokenBalances(walletAddress)
      setBalances(tokenBalances)
    } catch (error) {
      console.error("Error loading balances:", error)
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

      // Load more transactions than we need to check if there are more
      const limit = (currentPage + 1) * TRANSACTIONS_PER_PAGE + 5
      const history = await walletService.getTransactionHistory(walletAddress, limit)

      setAllTransactions(history)

      // Calculate how many to display
      const newDisplayCount = (currentPage + 1) * TRANSACTIONS_PER_PAGE
      const newDisplayed = history.slice(0, newDisplayCount)

      setDisplayedTransactions(newDisplayed)
      setHasMoreTransactions(history.length > newDisplayCount)
    } catch (error) {
      console.error("Error loading transaction history:", error)
    } finally {
      setLoadingHistory(false)
      setLoadingMore(false)
    }
  }

  const loadMoreTransactions = async () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)

    // Check if we already have enough transactions loaded
    const newDisplayCount = (nextPage + 1) * TRANSACTIONS_PER_PAGE

    if (allTransactions.length >= newDisplayCount) {
      // We have enough transactions, just update displayed
      const newDisplayed = allTransactions.slice(0, newDisplayCount)
      setDisplayedTransactions(newDisplayed)
      setHasMoreTransactions(allTransactions.length > newDisplayCount)
    } else {
      // Need to load more from the service
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
      const selectedToken = balances.find((t) => t.symbol === sendForm.token)
      const result = await walletService.sendToken({
        to: sendForm.recipient,
        amount: Number.parseFloat(sendForm.amount),
        tokenAddress: selectedToken?.address,
      })

      if (result.success) {
        alert(`✅ ${t.sendSuccess} ${sendForm.amount} ${sendForm.token}!`)
        setViewMode("main")
        setSendForm({ token: "TPF", amount: "", recipient: "" })
        await refreshBalances()
        await loadTransactionHistory(true) // Refresh history after sending
      } else {
        alert(`❌ ${t.sendFailed}: ${result.error}`)
      }
    } catch (error) {
      console.error("Send error:", error)
      alert(`❌ ${t.sendFailed}. Please try again.`)
    } finally {
      setSending(false)
    }
  }

  const handleGetQuote = async () => {
    if (!swapForm.amountFrom || swapForm.tokenFrom === swapForm.tokenTo) return

    setGettingQuote(true)
    try {
      const tokenFromData = TOKENS.find((t) => t.symbol === swapForm.tokenFrom)
      const tokenToData = TOKENS.find((t) => t.symbol === swapForm.tokenTo)

      if (!tokenFromData || !tokenToData) {
        throw new Error("Token not found")
      }

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(swapForm.amountFrom, tokenFromData.decimals)

      // Use the new getSwapQuote function
      const quote = await getSwapQuote({
        tokenInAddress: tokenFromData.address,
        tokenOutAddress: tokenToData.address,
        amountIn: amountInWei.toString(),
      })

      setSwapQuote(quote)

      // Format the output amount
      const amountOutFormatted = ethers.formatUnits(quote.amountOut || "0", tokenToData.decimals)
      setSwapForm((prev) => ({
        ...prev,
        amountTo: amountOutFormatted,
      }))
    } catch (error) {
      console.error("Error getting quote:", error)
      alert("Failed to get quote. Please try again.")
    } finally {
      setGettingQuote(false)
    }
  }

  const handleSwap = async () => {
    if (!swapQuote || !swapForm.amountFrom) return

    setSwapping(true)
    try {
      const tokenFromData = TOKENS.find((t) => t.symbol === swapForm.tokenFrom)
      const tokenToData = TOKENS.find((t) => t.symbol === swapForm.tokenTo)

      if (!tokenFromData || !tokenToData) {
        throw new Error("Token not found")
      }

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(swapForm.amountFrom, tokenFromData.decimals)

      const result = await doSwap({
        walletAddress,
        quote: swapQuote,
        amountIn: amountInWei.toString(),
        tokenInAddress: tokenFromData.address,
        tokenOutAddress: tokenToData.address,
      })

      if (result?.success) {
        alert(
          `✅ ${t.swapSuccess} ${swapForm.amountFrom} ${swapForm.tokenFrom} for ${swapForm.amountTo} ${swapForm.tokenTo}!`,
        )
        setViewMode("main")
        setSwapForm({ tokenFrom: "TPF", tokenTo: "WLD", amountFrom: "", amountTo: "" })
        setSwapQuote(null)
        await refreshBalances()
        await loadTransactionHistory(true)
      } else {
        alert(`❌ ${t.swapFailed}: ${result?.error}`)
      }
    } catch (error) {
      console.error("Swap error:", error)
      alert(`❌ ${t.swapFailed}. Please try again.`)
    } finally {
      setSwapping(false)
    }
  }

  const handleBackToMain = () => {
    setViewMode("main")
    setSendForm({ token: "TPF", amount: "", recipient: "" })
    setSwapForm({ tokenFrom: "TPF", tokenTo: "WLD", amountFrom: "", amountTo: "" })
    setSwapQuote(null)
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
      loadBalances()
      loadTransactionHistory(true)
    }
  }, [walletAddress])

  const formatBalance = (balance: string): string => {
    const num = Number.parseFloat(balance)
    if (num === 0) return "0"
    if (num < 0.0001) return "<0.0001"
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black/60 backdrop-blur-xl border border-cyan-400/30 rounded-full p-3 shadow-2xl"
      >
        <button onClick={() => setIsMinimized(false)} className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-cyan-400" />
          <span className="text-white text-sm font-medium">{formatAddress(walletAddress)}</span>
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl min-w-[320px] max-w-[380px] overflow-hidden fixed top-20 right-4 z-50"
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
              <div className="w-16" /> {/* Spacer for centering */}
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

        {/* Swap View */}
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
              <div className="w-16" /> {/* Spacer for centering */}
            </div>

            <div className="space-y-4">
              {/* From Token */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.from}</label>
                <div className="space-y-2">
                  <select
                    value={swapForm.tokenFrom}
                    onChange={(e) => setSwapForm({ ...swapForm, tokenFrom: e.target.value })}
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    {TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
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
                      const selectedToken = balances.find((t) => t.symbol === swapForm.tokenFrom)
                      return selectedToken ? formatBalance(selectedToken.balance) : "0"
                    })()} {swapForm.tokenFrom}
                  </div>
                </div>
              </div>

              {/* Swap Direction Indicator */}
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-orange-600/20 border border-orange-500/30 rounded-full flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                </div>
              </div>

              {/* To Token */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.to}</label>
                <div className="space-y-2">
                  <select
                    value={swapForm.tokenTo}
                    onChange={(e) => setSwapForm({ ...swapForm, tokenTo: e.target.value })}
                    className="w-full bg-gray-800/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    {TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={swapForm.amountTo}
                    readOnly
                    placeholder="0.00"
                    className="w-full bg-gray-700/50 border border-white/10 rounded-lg px-3 py-2 text-gray-300 cursor-not-allowed"
                  />
                  {swapQuote && (
                    <div className="text-xs text-green-400">
                      {t.youWillReceive}: {swapForm.amountTo} {swapForm.tokenTo}
                    </div>
                  )}
                </div>
              </div>

              {/* Get Quote Button */}
              {!swapQuote && (
                <button
                  onClick={handleGetQuote}
                  disabled={gettingQuote || !swapForm.amountFrom || swapForm.tokenFrom === swapForm.tokenTo}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {gettingQuote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-l-transparent border-b-white rounded-full animate-spin" />
                      <span>{t.gettingQuote}</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>{t.getQuote}</span>
                    </>
                  )}
                </button>
              )}

              {/* Swap Button */}
              {swapQuote && (
                <button
                  onClick={handleSwap}
                  disabled={swapping}
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
                      <span>{t.swap}</span>
                    </>
                  )}
                </button>
              )}
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
              <div className="w-16" /> {/* Spacer for centering */}
            </div>

            <div className="text-center space-y-4">
              {/* Address Display */}
              <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowDownLeft className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-300 text-sm mb-3">{t.yourWalletAddress}</p>
                <div className="bg-gray-800/50 border border-white/20 rounded-lg p-3 flex items-center justify-between">
                  <code className="text-white text-sm font-mono break-all">{walletAddress}</code>
                  <button onClick={copyAddress} className="ml-2 p-1 text-gray-400 hover:text-white transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Warning Message for Receive */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-300 text-xs leading-relaxed">{t.networkWarning}</p>
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
            className="p-4 max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
              <div className="w-16" /> {/* Spacer for centering */}
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                  <span className="text-gray-400 text-sm">{t.loading}</span>
                </div>
              ) : displayedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">{t.noTransactions}</p>
                </div>
              ) : (
                displayedTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-2 hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            tx.type === "sent" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {tx.type === "sent" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="text-white font-medium text-xs truncate">
                              {tx.type === "sent" ? t.sent : t.received} {Number.parseFloat(tx.amount).toFixed(4)}{" "}
                              {tx.token}
                            </p>
                            <span
                              className={`text-xs px-1 py-0.5 rounded ${getStatusColor(tx.status)} bg-current/10 flex-shrink-0`}
                            >
                              {tx.status === "confirmed" ? "✓" : tx.status === "pending" ? "⏳" : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-xs truncate">{formatAddress(tx.address)}</p>
                            <p className="text-gray-500 text-xs flex-shrink-0 ml-2">{formatTimestamp(tx.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openTransactionInExplorer(tx.hash)}
                        className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10 flex-shrink-0"
                        title={t.viewOnExplorer}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Load More Button */}
            {hasMoreTransactions && !loadingHistory && (
              <div className="mt-3 pt-3 border-t border-white/10 flex-shrink-0">
                <button
                  onClick={loadMoreTransactions}
                  disabled={loadingMore}
                  className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg py-2 px-3 text-purple-300 hover:text-purple-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">{t.loading}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{t.loadMore}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
