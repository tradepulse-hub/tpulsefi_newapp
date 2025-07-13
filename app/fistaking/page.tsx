"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, Gift, Loader2, CheckCircle, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"
import { useMiniKit } from "../../hooks/use-minikit"
import Image from "next/image"

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations
const translations = {
  en: {
    title: "FiStaking",
    subtitle:
      "Just for having TPulseFi you are entitled to passive earnings from other tokens, the more TPF you have, the more you earn!",
    back: "Back",
    claim: "Claim",
    claiming: "Claiming...",
    soon: "Soon",
    claimSuccess: "Claim Successful!",
    claimFailed: "Claim Failed",
    connectWalletFirst: "Connect your wallet first",
    pendingRewards: "Pending Rewards",
    dismiss: "Dismiss",
  },
  pt: {
    title: "FiStaking",
    subtitle:
      "Só por teres TPulseFi tens direito a ganhos passivos de outros tokens, quanto mais TPF tiveres, mais ganhas!",
    back: "Voltar",
    claim: "Reclamar",
    claiming: "Reclamando...",
    soon: "Em Breve",
    claimSuccess: "Reclamação Bem-sucedida!",
    claimFailed: "Reclamação Falhou",
    connectWalletFirst: "Conecte sua carteira primeiro",
    pendingRewards: "Recompensas Pendentes",
    dismiss: "Dispensar",
  },
  es: {
    title: "FiStaking",
    subtitle:
      "¡Solo por tener TPulseFi tienes derecho a ganancias pasivas de otros tokens, cuanto más TPF tengas, más ganas!",
    back: "Volver",
    claim: "Reclamar",
    claiming: "Reclamando...",
    soon: "Pronto",
    claimSuccess: "¡Reclamación Exitosa!",
    claimFailed: "Reclamación Falló",
    connectWalletFirst: "Conecta tu billetera primero",
    pendingRewards: "Recompensas Pendientes",
    dismiss: "Descartar",
  },
  id: {
    title: "FiStaking",
    subtitle:
      "Hanya dengan memiliki TPulseFi Anda berhak mendapat penghasilan pasif dari token lain, semakin banyak TPF yang Anda miliki, semakin banyak yang Anda peroleh!",
    back: "Kembali",
    claim: "Klaim",
    claiming: "Mengklaim...",
    soon: "Segera",
    claimSuccess: "Klaim Berhasil!",
    claimFailed: "Klaim Gagal",
    connectWalletFirst: "Hubungkan dompet Anda terlebih dahulu",
    pendingRewards: "Hadiah Tertunda",
    dismiss: "Tutup",
  },
}

// Staking contracts configuration
const STAKING_CONTRACTS = {
  WDD: {
    name: "Drachma",
    symbol: "WDD",
    address: "0xc4F3ae925E647aa2623200901a43BF65e8542c23",
    image: "/images/drachma-token.png",
  },
  TPT: {
    name: "TradePulse Token",
    symbol: "TPT",
    address: "0x4c1f9CF3c5742c73a00864a32048988b87121e2f",
    image: "/images/logo-tpf.png",
  },
  RFX: {
    name: "Roflex MemeToken",
    symbol: "RFX",
    address: "0x9FA697Ece25F4e2A94d7dEb99418B2b0c4b96FE2",
    image: "/images/roflex-token.png",
  },
  RCC: {
    name: "RoseChana Coin",
    symbol: "RCC",
    address: "0xA8785DABbc9902173b819f488e5A6A0Dbc45A9dF",
    image: "/images/rosechana-coin.png",
  },
  EDEN: {
    name: "Project Eden Token",
    symbol: "EDEN",
    address: "0x5B9EE20cef5540264Be906eDD4624F685292a6f1",
    image: "/images/eden-logo.png",
  },
}

// Staking contract ABI (updated with the provided ABI)
const STAKING_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_tpfToken", type: "address" },
      { internalType: "address", name: "_rewardToken", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "oldAPY", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newAPY", type: "uint256" },
    ],
    name: "APYUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "tpfBalance", type: "uint256" },
    ],
    name: "RewardsClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "RewardsDeposited",
    type: "event",
  },
  {
    inputs: [],
    name: "BASIS_POINTS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SECONDS_PER_YEAR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "apyRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "calculatePendingRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRewardsClaimed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tpfToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "uint256", name: "lastClaimTime", type: "uint256" },
      { internalType: "uint256", name: "totalClaimed", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

interface StakingInfo {
  pendingRewards: string
  canClaim: boolean
}

export default function FiStakingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useMiniKit()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")
  const [stakingData, setStakingData] = useState<Record<string, StakingInfo>>({})
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Get translations for current language
  const t = translations[currentLang]

  const handleClaim = async (tokenKey: string) => {
    const contract = STAKING_CONTRACTS[tokenKey as keyof typeof STAKING_CONTRACTS]
    if (!contract.address || !user?.walletAddress) return

    setClaiming(tokenKey)
    setClaimError(null)

    try {
      console.log(`🎁 Claiming ${contract.symbol} rewards...`)

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit not available. Please use World App.")
      }

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: contract.address,
            abi: STAKING_ABI,
            functionName: "claimRewards",
            args: [],
          },
        ],
      })

      console.log("Final payload:", finalPayload)

      if (finalPayload.status === "error") {
        throw new Error(`Transaction failed: ${finalPayload.message || "Unknown error"}`)
      }

      if (finalPayload.status === "success") {
        console.log(`✅ ${contract.symbol} rewards claimed successfully!`)
        setClaimSuccess(tokenKey)

        // Reset success message after 3 seconds
        setTimeout(() => {
          setClaimSuccess(null)
        }, 3000)
      }
    } catch (error) {
      console.error(`❌ ${contract.symbol} claim failed:`, error)
      let errorMessage = t.claimFailed

      if (error instanceof Error) {
        errorMessage = error.message
      }

      if (errorMessage.includes("simulation_failed")) {
        errorMessage = "Transaction simulation failed. You may not have enough tokens or rewards to claim."
      } else if (errorMessage.includes("user_rejected")) {
        errorMessage = "Transaction was rejected by user."
      }

      setClaimError(errorMessage)
    } finally {
      setClaiming(null)
    }
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center pt-6 pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={`h-line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse"
            style={{
              top: `${8 + i * 8}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight 4s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={`v-line-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"
            style={{
              left: `${10 + i * 10}%`,
              top: "-100%",
              height: "200%",
              animation: `moveDown 5s linear infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={`d-line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45"
            style={{
              top: `${15 + i * 12}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight 6s linear infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute w-80 h-80 bg-cyan-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-64 h-64 bg-blue-400/15 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute w-48 h-48 bg-white/20 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-72 h-72 border border-white/10 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute w-80 h-80 border border-cyan-400/15 rounded-full animate-spin"
          style={{ animationDuration: "25s", animationDirection: "reverse" }}
        />
        <div
          className="absolute w-64 h-64 border border-blue-400/20 rounded-full animate-spin"
          style={{ animationDuration: "15s" }}
        />
      </div>

      {[...Array(25)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full animate-ping"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            backgroundColor:
              i % 3 === 0 ? "rgba(255,255,255,0.8)" : i % 3 === 1 ? "rgba(34,211,238,0.6)" : "rgba(59,130,246,0.4)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${1 + Math.random() * 3}s`,
          }}
        />
      ))}

      {[...Array(8)].map((_, i) => (
        <div
          key={`beam-${i}`}
          className="absolute bg-gradient-to-r from-transparent via-white/20 to-transparent h-px animate-pulse"
          style={{
            top: "50%",
            left: "50%",
            width: "200px",
            transformOrigin: "0 0",
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: "2s",
          }}
        />
      ))}

      <style jsx>{`
        @keyframes moveRight {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        
        @keyframes moveDown {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-4 z-20"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t.back}</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 relative z-10"
      >
        <h1 className="text-3xl font-bold tracking-tighter flex items-center justify-center">
          <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-300">
            {t.title}
          </span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{t.subtitle}</p>
      </motion.div>

      <div className="w-full max-w-md px-4 relative z-10 space-y-4">
        {/* Success Message */}
        <AnimatePresence>
          {claimSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 text-sm font-medium mb-1">{t.claimSuccess}</p>
                  <p className="text-green-300 text-xs">
                    {STAKING_CONTRACTS[claimSuccess as keyof typeof STAKING_CONTRACTS]?.symbol} rewards claimed
                    successfully
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {claimError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0">⚠️</div>
                <div>
                  <p className="text-red-400 text-sm font-medium mb-1">{t.claimFailed}</p>
                  <p className="text-red-300 text-xs">{claimError}</p>
                  <button onClick={() => setClaimError(null)} className="mt-2 text-red-400 text-xs hover:text-red-300">
                    {t.dismiss}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center"
          >
            <p className="text-blue-400 text-sm">{t.connectWalletFirst}</p>
          </motion.div>
        ) : (
          <>
            {/* Staking Tokens */}
            {Object.entries(STAKING_CONTRACTS).map(([key, contract], index) => {
              const isClaimingThis = claiming === key
              const isRCC = key === "RCC"

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={contract.image || "/placeholder.svg"}
                        alt={contract.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-white font-medium text-lg">{contract.symbol}</h3>
                        <p className="text-gray-400 text-sm">{contract.name}</p>
                      </div>
                    </div>

                    {/* Claim Button */}
                    <button
                      onClick={() => !isRCC && handleClaim(key)}
                      disabled={isClaimingThis || isRCC}
                      className={`py-2 px-6 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                        isRCC
                          ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                          : isClaimingThis
                            ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      }`}
                    >
                      {isRCC ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>{t.soon}</span>
                        </>
                      ) : isClaimingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t.claiming}</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>{t.claim}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </>
        )}
      </div>
    </main>
  )
}
