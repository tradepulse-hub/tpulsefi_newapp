"use client"
import { useEffect, useState } from "react"
import { ArrowLeft, Crown, Loader2, CheckCircle, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"
import { useMiniKit } from "../../hooks/use-minikit"
import { BackgroundEffect } from "@/components/background-effect"

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations
const translations = {
  en: {
    title: "TPulseFi Membership",
    subtitle: "Join our exclusive premium membership",
    back: "Back",
    getMembership: "Get Membership",
    processing: "Processing...",
    connectWalletFirst: "Connect Wallet First",
    paymentSuccess: "Payment Successful!",
    paymentFailed: "Payment Failed",
    dismiss: "Dismiss",
    membershipDescription:
      "If you subscribe, you are entitled to a part of the transaction fees that TPulseFi earns! And it's not little! What are you waiting for, it's a lifetime payment! It's the best membership in the world, we promise long-term investment recovery.",
    oneTimePayment: "One-time payment",
    emailInstruction: "After payment, send proof to support@tradepulsetoken.com",
    monthlyPayments: "Payments to exclusive members occur every month on the 9th",
    paidToMembersPrefix: "Value paid to early members so far: (By Member)",
    paidToMembersSuffix: "TPF",
  },
  pt: {
    title: "Membros TPulseFi",
    subtitle: "Junte-se à nossa membros premium exclusiva",
    back: "Voltar",
    getMembership: "Obter Membros",
    processing: "Processando...",
    connectWalletFirst: "Conectar Carteira Primeiro",
    paymentSuccess: "Pagamento Bem-sucedido!",
    paymentFailed: "Pagamento Falhou",
    dismiss: "Dispensar",
    membershipDescription:
      "Se assinares tem direito a uma parte das taxas de transações que TPulseFi ganha! E não é pouco! De que estás à espera, é um pagamento para a vida toda! É o melhor membership do mundo, prometemos a recuperação do investido a longo prazo.",
    oneTimePayment: "Pagamento único",
    emailInstruction: "Após pagamento enviar comprovativo para support@tradepulsetoken.com",
    monthlyPayments: "Os pagamentos aos membros exclusivos decorrem todos os meses ao dia 9",
    paidToMembersPrefix: "Valor pago até agora para os primeiros membros (Por Membro):",
    paidToMembersSuffix: "TPF",
  },
  es: {
    title: "Membresía TPulseFi",
    subtitle: "Únete a nuestra membresía premium exclusiva",
    back: "Volver",
    getMembership: "Obtener Membresía",
    processing: "Procesando...",
    connectWalletFirst: "Conectar Billetera Primero",
    paymentSuccess: "¡Pago Exitoso!",
    paymentFailed: "Pago Falló",
    dismiss: "Descartar",
    membershipDescription:
      "¡Si te suscribes tienes derecho a una parte de las tarifas de transacción que gana TPulseFi! ¡Y no es poco! ¿Qué estás esperando? ¡Es un pago de por vida! Es la mejor membresía del mundo, prometemos recuperación de la inversión a largo plazo.",
    oneTimePayment: "Pago único",
    emailInstruction: "Después del pago, envía comprobante a support@tradepulsetoken.com",
    monthlyPayments: "Los pagos a miembros exclusivos ocurren todos los meses el día 9",
    paidToMembersPrefix: "Valor pagado a los primeros miembros hasta ahora (Por Miembro):",
    paidToMembersSuffix: "TPF",
  },
  id: {
    title: "Keanggotaan TPulseFi",
    subtitle: "Bergabunglah dengan keanggotaan premium eksklusif kami",
    back: "Kembali",
    getMembership: "Dapatkan Keanggotaan",
    processing: "Memproses...",
    connectWalletFirst: "Hubungkan Dompet Terlebih Dahulu",
    paymentSuccess: "Pembayaran Berhasil!",
    paymentFailed: "Pembayaran Gagal",
    dismiss: "Tutup",
    membershipDescription:
      "Jika Anda berlangganan, Anda berhak mendapat bagian dari biaya transaksi yang diperoleh TPulseFi! Dan itu tidak sedikit! Apa yang Anda tunggu, ini pembayaran seumur hidup! Ini adalah keanggotaan terbaik di dunia, kami berjanji pemulihan investasi jangka panjang.",
    oneTimePayment: "Pembayaran sekali",
    emailInstruction: "Setelah pembayaran, kirim bukti ke support@tradepulsetoken.com",
    monthlyPayments: "Pembayaran kepada anggota eksklusif terjadi setiap bulan pada tanggal 9",
    paidToMembersPrefix: "Nilai yang dibayarkan kepada anggota awal sejauh ini (Oleh Anggota):",
    paidToMembersSuffix: "TPF",
  },
}

// WLD Token Contract Address on Worldchain
const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"
const MEMBERSHIP_RECIPIENT = "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677"
const MEMBERSHIP_AMOUNT = "30" // 30 WLD

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

export default function MembershipPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useMiniKit()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [animatedValue, setAnimatedValue] = useState(0)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Animation for the paid value
  useEffect(() => {
    const targetValue = 74555
    const duration = 5000 // 5 seconds
    const frameRate = 60 // frames per second
    const totalFrames = (duration / 1000) * frameRate
    const increment = targetValue / totalFrames

    let currentFrame = 0
    let animationFrameId: number

    const animateCount = () => {
      currentFrame++
      const newValue = Math.min(targetValue, Math.round(increment * currentFrame))
      setAnimatedValue(newValue)

      if (newValue < targetValue) {
        animationFrameId = requestAnimationFrame(animateCount)
      }
    }

    animationFrameId = requestAnimationFrame(animateCount)

    return () => {
      cancelAnimationFrame(animationFrameId)
      setAnimatedValue(0) // Reset on unmount
    }
  }, []) // Empty dependency array means it runs once on mount

  // Get translations for current language
  const t = translations[currentLang]

  const handleGetMembership = async () => {
    if (!isAuthenticated) {
      alert(t.connectWalletFirst)
      return
    }

    if (!user?.walletAddress) {
      alert("Wallet address not found")
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log("🚀 Starting membership payment...")
      console.log("WLD Token Address:", WLD_TOKEN_ADDRESS)
      console.log("Recipient Address:", MEMBERSHIP_RECIPIENT)
      console.log("Amount:", MEMBERSHIP_AMOUNT, "WLD")
      console.log("User Address:", user.walletAddress)

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Convert 30 WLD to wei (18 decimals)
      const amountInWei = (BigInt(MEMBERSHIP_AMOUNT) * BigInt(10 ** 18)).toString()
      console.log("Amount in wei:", amountInWei)

      console.log("Calling MiniKit.commandsAsync.sendTransaction...")
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: WLD_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [MEMBERSHIP_RECIPIENT, amountInWei],
          },
        ],
      })

      console.log("MiniKit transaction response:", finalPayload)

      if (finalPayload.status === "error") {
        console.error("Error sending payment:", finalPayload.message)
        throw new Error(finalPayload.message || "Failed to send payment")
      }

      console.log("Payment sent successfully:", finalPayload)
      setPaymentSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setPaymentSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error processing membership payment:", error)
      let errorMessage = t.paymentFailed

      if (error instanceof Error) {
        if (error.message.includes("user_rejected")) {
          errorMessage = "Transaction was rejected by user."
        } else if (error.message.includes("insufficient_funds")) {
          errorMessage = "Insufficient WLD balance to complete this transaction."
        } else {
          errorMessage = error.message
        }
      }

      setPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    console.log("🔙 Back button clicked")
    try {
      // Try to go back in history first
      if (window.history.length > 1) {
        router.back()
      } else {
        // Fallback to home page if no history
        router.push("/")
      }
    } catch (error) {
      console.error("Error navigating back:", error)
      // Final fallback
      router.push("/")
    }
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center pt-6 pb-8">
      {/* Background Effect Component */}
      <BackgroundEffect />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-4 z-20"
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">{t.back}</span>
        </button>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-16 relative z-10"
      >
        <h1 className="text-3xl font-bold tracking-tighter flex items-center justify-center mb-2">
          <Crown className="w-8 h-8 mr-3 text-yellow-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400">
            {t.title}
          </span>
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed px-4">{t.subtitle}</p>
        {/* New: Value paid to early members - ENHANCED with silver background and shine effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center justify-center text-gray-800 text-sm md:text-base font-semibold
                     bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-full
                     px-6 py-3 border border-gray-400/50 shadow-xl animate-pulse-slow"
        >
          <span className="animate-blink">
            {t.paidToMembersPrefix} ({animatedValue} {t.paidToMembersSuffix})
          </span>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="w-full max-w-sm px-4 relative z-10 space-y-4">
        {/* Success Message */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
            >
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 text-xs font-medium mb-1">{t.paymentSuccess}</p>
                  <p className="text-green-300 text-xs">
                    Welcome to our membership program! Your payment of 30 WLD has been processed.
                  </p>
                  <p className="text-green-300 text-xs mt-1">{t.emailInstruction}</p>
                  <div className="flex items-center gap-1 mt-1 p-1.5 bg-gray-800/50 rounded border">
                    <span className="text-xs text-gray-300 font-mono">support@tradepulsetoken.com</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("support@tradepulsetoken.com")
                      }}
                      className="p-0.5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {paymentError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
            >
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0">⚠️</div>
                <div>
                  <p className="text-red-400 text-xs font-medium mb-1">{t.paymentFailed}</p>
                  <p className="text-red-300 text-xs">{paymentError}</p>
                  <button
                    onClick={() => setPaymentError(null)}
                    className="mt-1 text-red-400 text-xs hover:text-red-300"
                  >
                    {t.dismiss}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4 shadow-2xl"
        >
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Premium Membership</h2>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-300 text-xs leading-relaxed text-center">{t.membershipDescription}</p>
          </div>

          {/* Price */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-white mb-0.5">30 WLD</div>
            <div className="text-gray-400 text-xs">{t.oneTimePayment}</div>
          </div>

          {/* Email Instruction */}
          <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-xs text-center leading-relaxed">📧 {t.emailInstruction}</p>
            <div className="flex items-center justify-center gap-1 mt-1 p-1 bg-gray-800/50 rounded">
              <span className="text-xs text-gray-300 font-mono">support@tradepulsetoken.com</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("support@tradepulsetoken.com")
                }}
                className="p-0.5 text-gray-400 hover:text-white transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Monthly Payments Info */}
          <div className="mb-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-300 text-xs text-center leading-relaxed">💰 {t.monthlyPayments}</p>
          </div>

          {/* Get Membership Button */}
          <button
            onClick={handleGetMembership}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              isProcessing
                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{t.processing}</span>
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                <span className="text-sm">{t.getMembership}</span>
              </>
            )}
          </button>

          {!isAuthenticated && <p className="text-center text-gray-400 text-xs mt-2">{t.connectWalletFirst}</p>}
        </motion.div>
      </div>
    </main>
  )
}
