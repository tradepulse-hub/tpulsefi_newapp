"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Gift, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"
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
    subtitle: "Stake your TPF tokens and earn rewards",
    back: "Back",
    claimRewards: "Claim Rewards",
    claiming: "Claiming...",
    connectWalletFirst: "Connect Wallet First",
    claimSuccess: "Rewards Claimed!",
    claimFailed: "Claim Failed",
    dismiss: "Dismiss",
    noRewards: "No rewards available",
    stakingDescription: "Hold TPF tokens in your wallet to earn rewards from these staking contracts.",
    totalClaimed: "Total Claimed",
    currentAPY: "Current APY",
    stakingDuration: "Staking Duration",
    rewardCalculator: "Reward Calculator",
    enterAmount: "Enter TPF amount",
    estimatedRewards: "Estimated daily rewards",
    calculate: "Calculate",
  },
  pt: {
    title: "FiStaking",
    subtitle: "Faça stake dos seus tokens TPF e ganhe recompensas",
    back: "Voltar",
    claimRewards: "Reivindicar Recompensas",
    claiming: "Reivindicando...",
    connectWalletFirst: "Conectar Carteira Primeiro",
    claimSuccess: "Recompensas Reivindicadas!",
    claimFailed: "Falha na Reivindicação",
    dismiss: "Dispensar",
    noRewards: "Sem recompensas disponíveis",
    stakingDescription: "Mantenha tokens TPF na sua carteira para ganhar recompensas destes contratos de staking.",
    totalClaimed: "Total Reivindicado",
    currentAPY: "APY Atual",
    stakingDuration: "Duração do Staking",
    rewardCalculator: "Calculadora de Recompensas",
    enterAmount: "Digite a quantidade de TPF",
    estimatedRewards: "Recompensas diárias estimadas",
    calculate: "Calcular",
  },
  es: {
    title: "FiStaking",
    subtitle: "Haz stake de tus tokens TPF y gana recompensas",
    back: "Volver",
    claimRewards: "Reclamar Recompensas",
    claiming: "Reclamando...",
    connectWalletFirst: "Conectar Billetera Primero",
    claimSuccess: "¡Recompensas Reclamadas!",
    claimFailed: "Reclamo Falló",
    dismiss: "Descartar",
    noRewards: "Sin recompensas disponibles",
    stakingDescription: "Mantén tokens TPF en tu billetera para ganar recompensas de estos contratos de staking.",
    totalClaimed: "Total Reclamado",
    currentAPY: "APY Actual",
    stakingDuration: "Duración del Staking",
    rewardCalculator: "Calculadora de Recompensas",
    enterAmount: "Ingresa cantidad de TPF",
    estimatedRewards: "Recompensas diarias estimadas",
    calculate: "Calcular",
  },
  id: {
    title: "FiStaking",
    subtitle: "Stake token TPF Anda dan dapatkan hadiah",
    back: "Kembali",
    claimRewards: "Klaim Hadiah",
    claiming: "Mengklaim...",
    connectWalletFirst: "Hubungkan Dompet Terlebih Dahulu",
    claimSuccess: "Hadiah Diklaim!",
    claimFailed: "Klaim Gagal",
    dismiss: "Tutup",
    noRewards: "Tidak ada hadiah tersedia",
    stakingDescription: "Simpan token TPF di dompet Anda untuk mendapatkan hadiah dari kontrak staking ini.",
    totalClaimed: "Total Diklaim",
    currentAPY: "APY Saat Ini",
    stakingDuration: "Durasi Staking",
    rewardCalculator: "Kalkulator Hadiah",
    enterAmount: "Masukkan jumlah TPF",
    estimatedRewards: "Perkiraan hadiah harian",
    calculate: "Hitung",
  },
}

// Staking contracts configuration
const STAKING_CONTRACTS = {
  WDD: {
    name: "Drachma",
    symbol: "WDD",
    contractAddress: "0x123...", // Replace with actual contract address
    rewardTokenAddress: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
    logo: "/images/drachma-token.png",
    color: "#FFD700",
    apy: "12.5%",
  },
  TPT: {
    name: "TradePulse Token",
    symbol: "TPT",
    contractAddress: "0x456...", // Replace with actual contract address
    rewardTokenAddress: "0x868D08798F91ba9D6AC126148fdE8bBdfb6354D5",
    logo: "/images/logo-tpf.png",
    color: "#FF6B35",
    apy: "15.2%",
  },
  RFX: {
    name: "Roflex MemeToken",
    symbol: "RFX",
    contractAddress: "0x789...", // Replace with actual contract address
    rewardTokenAddress: "0xABC...", // Replace with actual token address
    logo: "/images/roflex-token.png",
    color: "#00FF00",
    apy: "8.7%",
  },
  RCC: {
    name: "RoseChana Coin",
    symbol: "RCC",
    contractAddress: "0xA8785DABbc9902173b819f488e5A6A0Dbc45A9dF",
    rewardTokenAddress: "0xA8785DABbc9902173b819f488e5A6A0Dbc45A9dF",
    logo: "/images/rosechana-coin.png",
    color: "#FF69B4",
    apy: "10.0%",
  },
  EDEN: {
    name: "Project Eden Token",
    symbol: "EDEN",
    contractAddress: "0x5B9EE20cef5540264Be906eDD4624F685292a6f1",
    rewardTokenAddress: "0x5B9EE20cef5540264Be906eDD4624F685292a6f1",
    logo: "/images/eden-logo.png",
    color: "#22C55E",
    apy: "0.01%",
  },
}

// Soft Staking ABI
const SOFT_STAKING_ABI = [
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

export default function FiStakingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useMiniKit()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")
  const [claimingStates, setClaimingStates] = useState<Record<string, boolean>>({})
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [calculatorAmount, setCalculatorAmount] = useState("")
  const [estimatedRewards, setEstimatedRewards] = useState<Record<string, string>>({})

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Get translations for current language
  const t = translations[currentLang]

  const handleBack = () => {
    try {
      console.log("Attempting to navigate back...")
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back()
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Navigation error:", error)
      router.push("/")
    }
  }

  const handleClaimRewards = async (contractKey: string) => {
    if (!isAuthenticated || !user?.walletAddress) {
      setClaimError(t.connectWalletFirst)
      return
    }

    const contract = STAKING_CONTRACTS[contractKey as keyof typeof STAKING_CONTRACTS]
    if (!contract) return

    setClaimingStates((prev) => ({ ...prev, [contractKey]: true }))
    setClaimError(null)

    try {
      console.log(`🚀 Claiming rewards for ${contract.name}...`)

      const result = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: contract.contractAddress,
            abi: SOFT_STAKING_ABI,
            functionName: "claimRewards",
            args: [],
          },
        ],
      })

      if (result.finalTxHash) {
        console.log(`✅ Claim successful for ${contract.name}:`, result.finalTxHash)
        setClaimSuccess(`${contract.name} ${t.claimSuccess}`)
        setTimeout(() => setClaimSuccess(null), 3000)
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      console.error(`❌ Claim failed for ${contract.name}:`, error)
      setClaimError(`${contract.name} ${t.claimFailed}`)
    } finally {
      setClaimingStates((prev) => ({ ...prev, [contractKey]: false }))
    }
  }

  const calculateRewards = () => {
    if (!calculatorAmount || isNaN(Number(calculatorAmount))) return

    const amount = Number(calculatorAmount)
    const newEstimatedRewards: Record<string, string> = {}

    Object.entries(STAKING_CONTRACTS).forEach(([key, contract]) => {
      const apyPercent = Number.parseFloat(contract.apy.replace("%", ""))
      const dailyReward = (amount * apyPercent) / 100 / 365
      newEstimatedRewards[key] = dailyReward.toFixed(6)
    })

    setEstimatedRewards(newEstimatedRewards)
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center pt-6 pb-8">
      {/* Same animated background as other pages */}
      <div className="absolute inset-0">
        {/* Horizontal Moving Lines */}
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

        {/* Vertical Moving Lines */}
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

        {/* Diagonal Moving Lines */}
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

      {/* Static Grid for Reference */}
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

      {/* Central Glow Effect */}
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

      {/* Rotating Rings */}
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

      {/* Enhanced Floating Particles */}
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

      {/* Energy Beams */}
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
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        @keyframes moveDown {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
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
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-4xl font-bold tracking-tighter flex items-center justify-center mb-2">
          <Gift className="w-8 h-8 mr-3 text-green-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-200 via-green-400 to-emerald-400">
            {t.title}
          </span>
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed px-4">{t.subtitle}</p>
      </motion.div>

      {/* Main Content */}
      <div className="w-full max-w-md px-4 relative z-10 space-y-4">
        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 shadow-2xl"
        >
          <p className="text-blue-200 text-sm leading-relaxed">{t.stakingDescription}</p>
        </motion.div>

        {/* Reward Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl"
        >
          <h3 className="text-purple-300 font-semibold text-sm mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {t.rewardCalculator}
          </h3>
          <div className="space-y-3">
            <div>
              <input
                type="number"
                placeholder={t.enterAmount}
                value={calculatorAmount}
                onChange={(e) => setCalculatorAmount(e.target.value)}
                className="w-full bg-purple-900/30 border border-purple-500/40 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300/60 focus:outline-none focus:border-purple-400"
              />
            </div>
            <button
              onClick={calculateRewards}
              className="w-full bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 rounded-lg px-4 py-2 text-purple-300 text-sm font-medium transition-colors"
            >
              {t.calculate}
            </button>
          </div>
        </motion.div>

        {/* Staking Contracts */}
        <div className="space-y-3">
          {Object.entries(STAKING_CONTRACTS).map(([key, contract], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={contract.logo || "/placeholder.svg"}
                      alt={contract.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{contract.name}</h3>
                    <p className="text-gray-400 text-xs">{contract.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold text-sm">{contract.apy}</div>
                  <div className="text-gray-400 text-xs">{t.currentAPY}</div>
                </div>
              </div>

              {estimatedRewards[key] && (
                <div className="mb-3 p-2 bg-purple-500/20 rounded-lg">
                  <div className="text-purple-300 text-xs">{t.estimatedRewards}</div>
                  <div className="text-purple-200 font-semibold text-sm">
                    {estimatedRewards[key]} {contract.symbol}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleClaimRewards(key)}
                disabled={claimingStates[key] || !isAuthenticated}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  !isAuthenticated
                    ? "bg-gray-600/30 text-gray-400 cursor-not-allowed"
                    : claimingStates[key]
                      ? "bg-yellow-600/30 text-yellow-300 cursor-not-allowed"
                      : "bg-green-600/30 hover:bg-green-600/40 text-green-300 border border-green-500/40"
                }`}
              >
                {claimingStates[key] ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.claiming}</span>
                  </>
                ) : !isAuthenticated ? (
                  <span>{t.connectWalletFirst}</span>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>{t.claimRewards}</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {claimSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-600/90 backdrop-blur-xl border border-green-500/50 rounded-xl p-4 shadow-2xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span className="text-green-100 text-sm font-medium">{claimSuccess}</span>
              <button
                onClick={() => setClaimSuccess(null)}
                className="text-green-300 hover:text-green-100 transition-colors"
              >
                <span className="text-xs">{t.dismiss}</span>
              </button>
            </div>
          </motion.div>
        )}

        {claimError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-600/90 backdrop-blur-xl border border-red-500/50 rounded-xl p-4 shadow-2xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
              <span className="text-red-100 text-sm font-medium">{claimError}</span>
              <button onClick={() => setClaimError(null)} className="text-red-300 hover:text-red-100 transition-colors">
                <span className="text-xs">{t.dismiss}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
