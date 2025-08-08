"use client"
import { useEffect, useState } from "react"
import { ArrowLeft, Crown, Loader2, CheckCircle, Copy } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from 'next/image' // Adicionado para usar a imagem
import { BackgroundEffect } from "../../components/background-effect" // Import the new BackgroundEffect

// Placeholder para useMiniKit (mantido como no ficheiro original fornecido)
// Em uma aplicação real, você integraria o MiniKit de forma adequada.
function useMiniKit() {
  const [user, setUser] = useState<{ walletAddress: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Simula o status de autenticação do MiniKit
    const mockUser = { walletAddress: "0x1234567890abcdef1234567890abcdef12345678" }
    setUser(mockUser)
    setIsAuthenticated(true)
  }, [])

  return { user, isAuthenticated }
}

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
    emailInstruction: "After payment, send proof and wallet address to support@tradepulsetoken.com",
    monthlyPayments: "Payments to exclusive members occur every month on the 9th",
    paidToMembersPrefix: "Value paid to early members so far: (By Member)",
    paidToMembersSuffix: "TPF",
    countdownPrefix: "Price increases in:",
    countdownExpired: "Price has increased!",
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
    emailInstruction: "Após pagamento, enviar comprovativo e endereço da carteira para support@tradepulsetoken.com",
    monthlyPayments: "Os pagamentos aos membros exclusivos decorrem todos os meses ao dia 9",
    paidToMembersPrefix: "Valor pago até agora para os primeiros membros (Por Membro):",
    paidToMembersSuffix: "TPF",
    countdownPrefix: "O preço aumenta em:",
    countdownExpired: "O preço aumentou!",
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
    emailInstruction: "Después del pago, envía comprobante y dirección de la billetera a support@tradepulsetoken.com",
    monthlyPayments: "Los pagos a miembros exclusivos ocurren todos los meses el día 9",
    paidToMembersPrefix: "Valor pagado a los primeros miembros hasta ahora (Por Miembro):",
    paidToMembersSuffix: "TPF",
    countdownPrefix: "El precio aumenta en:",
    countdownExpired: "¡El precio ha aumentado!",
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
    emailInstruction: "Setelah pembayaran, kirim bukti dan alamat dompet ke support@tradepulsetoken.com",
    monthlyPayments: "Pembayaran kepada anggota eksklusif terjadi setiap bulan pada tanggal 9",
    paidToMembersPrefix: "Nilai yang dibayarkan kepada anggota awal sejauh ini (Oleh Anggota):",
    paidToMembersSuffix: "TPF",
    countdownPrefix: "Harga naik dalam:",
    countdownExpired: "Harga telah naik!",
  },
}

// WLD Token Contract Address on Worldchain
const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"
const MEMBERSHIP_RECIPIENT = "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677"
const INITIAL_MEMBERSHIP_AMOUNT = "30" // 30 WLD
const INCREASED_MEMBERSHIP_AMOUNT = "50" // 50 WLD

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

// Data de início da promoção (9 de setembro de 2025)
const PROMOTION_START_DATE = new Date('2025-09-09T00:00:00Z');
const PROMOTION_DURATION_DAYS = 30;
const PROMOTION_END_DATE = new Date(PROMOTION_START_DATE.getTime() + PROMOTION_DURATION_DAYS * 24 * 60 * 60 * 1000);


export default function MembershipPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useMiniKit()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [animatedValue, setAnimatedValue] = useState(0)

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [currentMembershipAmount, setCurrentMembershipAmount] = useState(INITIAL_MEMBERSHIP_AMOUNT);

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Animation for the paid value
  useEffect(() => {
    const targetValue = 160539 // 74555 + 85984 = 160539
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

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.total <= 0) {
        setCurrentMembershipAmount(INCREASED_MEMBERSHIP_AMOUNT);
        clearInterval(timer);
      } else {
        setCurrentMembershipAmount(INITIAL_MEMBERSHIP_AMOUNT);
      }
    }, 1000);

    // Initial check on mount
    const initialTimeLeft = calculateTimeLeft();
    if (initialTimeLeft.total <= 0) {
      setCurrentMembershipAmount(INCREASED_MEMBERSHIP_AMOUNT);
    } else {
      setCurrentMembershipAmount(INITIAL_MEMBERSHIP_AMOUNT);
    }

    return () => clearInterval(timer);
  }, []);

  function calculateTimeLeft() {
    const now = new Date();
    const difference = PROMOTION_END_DATE.getTime() - now.getTime();

    let timeLeft = {
      total: difference,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        total: difference,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

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
      console.log("Amount:", currentMembershipAmount, "WLD") // Usando o valor dinâmico
      console.log("User Address:", user.walletAddress)

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Convert currentMembershipAmount to wei (18 decimals)
      const amountInWei = (BigInt(currentMembershipAmount) * BigInt(10 ** 18)).toString()
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
                    Welcome to our membership program! Your payment of {currentMembershipAmount} WLD has been processed.
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

        {/* Membership Content (formerly "Card") */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          // Removidas as classes de fundo, borda, blur e sombra
          className="w-full flex flex-col items-center text-center p-4 space-y-6" // Ajustado padding e espaçamento
        >
          {/* Removido o div com a coroa */}
          <h2 className="text-2xl font-bold text-white mb-2">Premium Membership</h2>

          {/* Countdown Timer */}
          <div className="text-center text-gray-300 text-sm">
            {timeLeft.total > 0 ? (
              <p className="text-yellow-400 font-semibold">
                {t.countdownPrefix} {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </p>
            ) : (
              <p className="text-red-400 font-semibold">{t.countdownExpired}</p>
            )}
          </div>

          {/* Price - Image on left, 30/50 on right, larger size, moved down and left */}
          <div className="flex items-center justify-center gap-2 mt-4 -translate-x-5">
            <Image
              src="/images/wldlogo3D.png"
              alt="WLD Logo"
              width={240}
              height={240}
              className="object-contain"
            />
            <div className="text-5xl font-extrabold text-white">{currentMembershipAmount}</div>
          </div>
          <div className="text-gray-400 text-sm">{t.oneTimePayment}</div>

          {/* Get Membership Button */}
          <div className="relative w-full"> {/* Adicionado um div pai para posicionamento relativo */}
            <button
              onClick={handleGetMembership}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                isProcessing
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600 text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-base">{t.processing}</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <span className="text-base">{t.getMembership}</span>
                </>
              )}
            </button>

            {/* Finger Click Icon */}
            <AnimatePresence>
              {!isProcessing && isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: -20 }}
                  animate={{
                    opacity: 1,
                    y: [0, -10, 0], // Move up and down
                    x: [0, -5, 0], // Move left and right slightly
                    transition: {
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut",
                      delay: 1 // Start animation after a short delay
                    }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute -top-10 right-1/2 translate-x-1/2 z-20" // Ajuste a posição conforme necessário
                >
                  <Image
                    src="/images/finger-click-icon.png"
                    alt="Click here"
                    width={50}
                    height={50}
                    className="transform rotate-12" // Rotaciona ligeiramente o dedo
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {!isAuthenticated && <p className="text-center text-gray-400 text-xs mt-2">{t.connectWalletFirst}</p>}

          {/* Description - Moved below the button */}
          <div className="w-full">
            <p className="text-gray-300 text-sm leading-relaxed">{t.membershipDescription}</p>
          </div>

          {/* Email Instruction */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg w-full">
            <p className="text-blue-300 text-xs leading-relaxed">📧 {t.emailInstruction}</p>
            <div className="flex items-center justify-center gap-1 mt-2 p-1 bg-gray-800/50 rounded">
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
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg w-full">
            <p className="text-green-300 text-xs leading-relaxed">💰 {t.monthlyPayments}</p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
