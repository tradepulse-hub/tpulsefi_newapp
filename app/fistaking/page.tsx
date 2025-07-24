"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, Gift, Loader2, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"
import { useMiniKit } from "../../hooks/use-minikit"
import Image from "next/image"
import { BackgroundEffect } from "@/components/background-effect" // Import BackgroundEffect

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
    powerActivated: "Power Activated",
    instructionText: "Blue button - TPF Holders, Green button - PSC Holders.",
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
    powerActivated: "Energia Ativada",
    instructionText: "Botão azul - Holders TPF, Botão verde - Holders PSC.",
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
    powerActivated: "Energía Activada",
    instructionText: "Botón azul - Holders TPF, Botón verde - Holders PSC.",
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
    powerActivated: "Daya Diaktifkan",
    instructionText: "Tombol biru - Pemegang TPF, Tombol hijau - Pemegang PSC.",
  },
}

interface StakingButton {
  key: string
  name: string
  address: string
  holderType: "tpf_holder" | "psc_holder"
}

interface StakingGroup {
  name: string
  symbol: string
  image: string
  isGroup: true
  buttons: StakingButton[]
}

interface StakingContract {
  name: string
  symbol: string
  address: string
  image: string
  holderType: "tpf_holder" | "psc_holder" // Added to differentiate for styling
}

// Staking contracts configuration
const STAKING_CONTRACTS: Record<string, StakingContract | StakingGroup> = {
  PSC_GROUP: {
    name: "PulseCode Token",
    symbol: "PSC",
    image: "/images/codepulse-logo.png", // Assuming this is the PulseCode logo
    isGroup: true,
    buttons: [
      {
        key: "TPF_HOLDERS",
        name: "TPF Holders",
        address: "0x1bF1fa24aCaa6b2D5e41827d5FaF2e68cCf17360",
        holderType: "tpf_holder", // Blue
      },
      {
        key: "PSC_HOLDERS",
        name: "PSC Holders",
        address: "0xb1a6165a91d44A1b835490F1cA2104421Cfe7c5E",
        holderType: "psc_holder", // Green
      },
    ],
  },
  WDD: {
    name: "Drachma",
    symbol: "WDD",
    address: "0xc4F3ae925E647aa2623200901a43BF65e8542c23",
    image: "/images/drachma-token.png",
    holderType: "psc_holder",
  },
  RFX: {
    name: "Roflex MemeToken",
    symbol: "RFX",
    address: "0x9FA697Ece25F4e2A94d7dEb99418B2b0c4b96FE2",
    image: "/images/roflex-token.png",
    holderType: "psc_holder",
  },
  RCC: {
    name: "RoseChana Coin",
    symbol: "RCC",
    address: "0xA8785DABbc9902173b819f488e5A6A0Dbc45A9dF",
    image: "/images/rosechana-coin.png",
    holderType: "psc_holder",
  },
  EDEN: {
    name: "Project Eden Token",
    symbol: "EDEN",
    address: "0x6BAD88b93d67590656c83371d65DCB35d17deC87",
    image: "/images/eden-logo.png",
    holderType: "psc_holder",
  },
  KPP: {
    name: "KeplerPay",
    symbol: "KPP",
    address: "0x2aaeC7df37AA5799a9E721A1B338aa2d591acd64",
    image: "/images/keplerpay-logo.png",
    holderType: "psc_holder",
  },
}

// Standard ABI for all contracts (including RCC)
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
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "calculateRewardsPerDay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "calculateRewardsPerSecond",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "canClaim",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
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
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "depositRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getCalculationDetails",
    outputs: [
      { internalType: "uint256", name: "tpfBalance", type: "uint256" },
      { internalType: "uint256", name: "timeStaked", type: "uint256" },
      { internalType: "uint256", name: "apyRateUsed", type: "uint256" },
      { internalType: "uint256", name: "basisPoints", type: "uint256" },
      { internalType: "uint256", name: "secondsPerYear", type: "uint256" },
      { internalType: "uint256", name: "calculatedRewards", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentAPY",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRewardBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStats",
    outputs: [
      { internalType: "uint256", name: "totalUsers", type: "uint256" },
      { internalType: "uint256", name: "totalRewards", type: "uint256" },
      { internalType: "uint256", name: "contractRewardBalance", type: "uint256" },
      { internalType: "uint256", name: "currentAPY", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getTimeToNextClaim",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenAddresses",
    outputs: [
      { internalType: "address", name: "tpfTokenAddress", type: "address" },
      { internalType: "address", name: "rewardTokenAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserInfo",
    outputs: [
      { internalType: "uint256", name: "tpfBalance", type: "uint256" },
      { internalType: "uint256", name: "pendingRewards", type: "uint256" },
      { internalType: "uint256", name: "lastClaimTime", type: "uint256" },
      { internalType: "uint256", name: "totalClaimed", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "uint256" }],
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
    inputs: [{ internalType: "uint256", name: "_newAPY", type: "uint256" }],
    name: "setAPY",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "_days", type: "uint256" },
    ],
    name: "simulateRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
    inputs: [{ internalType: "address", name: "_newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
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

// Battery Component
function BatteryIndicator({ currentLang }: { currentLang: SupportedLanguage }) {
  const [batteryLevel, setBatteryLevel] = useState(0)
  const t = translations[currentLang]

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev >= 100) return 0
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center">
      {/* Battery */}
      <div className="relative w-8 h-4 border border-green-400 rounded-sm bg-black/50">
        {/* Battery tip */}
        <div className="absolute -right-1 top-1 w-1 h-2 bg-green-400 rounded-r-sm"></div>
        {/* Battery fill */}
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-sm transition-all duration-100"
          style={{ width: `${batteryLevel}%` }}
        ></div>
        {/* Battery percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[6px] font-bold text-white drop-shadow-sm">{batteryLevel}%</span>
        </div>
      </div>
      {/* Power Activated text */}
      <div className="text-green-400 text-[8px] font-medium mt-1 text-center">{t.powerActivated}</div>
    </div>
  )
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

  const handleClaim = async (tokenGroupKey: string, buttonKey?: string) => {
    let contractAddress: string
    let contractName: string

    const entry = STAKING_CONTRACTS[tokenGroupKey]

    if ("isGroup" in entry && entry.isGroup && buttonKey) {
      const button = entry.buttons.find((b) => b.key === buttonKey)
      if (!button) return
      contractAddress = button.address
      contractName = `${entry.symbol} (${button.name})`
    } else if (!("isGroup" in entry)) {
      contractAddress = entry.address
      contractName = entry.symbol
    } else {
      return // Should not happen if logic is correct
    }

    if (!contractAddress || !user?.walletAddress) return

    setClaiming(`${tokenGroupKey}-${buttonKey || ""}`) // Use combined key for claiming state
    setClaimError(null)

    try {
      console.log(`🎁 Claiming ${contractName} rewards...`)
      console.log(`Contract address: ${contractAddress}`)
      console.log(`User wallet: ${user.walletAddress}`)

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit not available. Please use World App.")
      }

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: contractAddress,
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
        console.log(`✅ ${contractName} rewards claimed successfully!`)
        setClaimSuccess(`${tokenGroupKey}-${buttonKey || ""}`)

        // Reset success message after 3 seconds
        setTimeout(() => {
          setClaimSuccess(null)
        }, 3000)
      }
    } catch (error) {
      console.error(`❌ ${contractName} claim failed:`, error)
      let errorMessage = t.claimFailed

      if (error instanceof Error) {
        errorMessage = error.message
      }

      if (errorMessage.includes("simulation_failed")) {
        errorMessage = "Transaction simulation failed. You may not have enough tokens or rewards to claim."
      } else if (errorMessage.includes("user_rejected")) {
        errorMessage = "Transaction was rejected by user."
      } else if (errorMessage.includes("No TPF tokens")) {
        errorMessage = "You need TPF tokens in your wallet to claim rewards."
      } else if (errorMessage.includes("No rewards to claim")) {
        errorMessage = "No rewards available to claim at this time."
      } else if (errorMessage.includes("Insufficient reward balance")) {
        errorMessage = "Contract has insufficient reward balance. Please try again later."
      }

      setClaimError(errorMessage)
    } finally {
      setClaiming(null)
    }
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center pt-4 pb-6">
      <BackgroundEffect /> {/* Adicionado BackgroundEffect component */}
      {/* Battery Indicator - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-4 z-20"
      >
        <BatteryIndicator currentLang={currentLang} />
      </motion.div>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 z-20"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="text-xs">{t.back}</span>
        </button>
      </motion.div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-4 relative z-10 pt-20" // Adjusted pt-20 here
      >
        <h1 className="text-2xl font-bold tracking-tighter flex items-center justify-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-300">
            {t.title}
          </span>
        </h1>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed px-4">{t.subtitle}</p>
      </motion.div>
      <div className="w-full max-w-sm px-4 relative z-10 space-y-3">
        {/* Success Message */}
        <AnimatePresence>
          {claimSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
            >
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 text-xs font-medium mb-1">{t.claimSuccess}</p>
                  <p className="text-green-300 text-[10px]">
                    {claimSuccess.includes("PSC_GROUP")
                      ? `PSC (${claimSuccess.split("-")[1]})`
                      : STAKING_CONTRACTS[claimSuccess as keyof typeof STAKING_CONTRACTS]?.symbol}{" "}
                    rewards claimed successfully
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
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
            >
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0">⚠️</div>
                <div>
                  <p className="text-red-400 text-xs font-medium mb-1">{t.claimFailed}</p>
                  <p className="text-red-300 text-[10px]">{claimError}</p>
                  <button
                    onClick={() => setClaimError(null)}
                    className="mt-1 text-red-400 text-[10px] hover:text-red-300"
                  >
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
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center"
          >
            <p className="text-blue-400 text-xs">{t.connectWalletFirst}</p>
          </motion.div>
        ) : (
          <>
            {/* Instruction Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 text-center text-xs text-gray-300 mb-4"
            >
              <p>{t.instructionText}</p>
            </motion.div>

            {/* Staking Tokens - Compact */}
            {Object.entries(STAKING_CONTRACTS).map(([key, entry], index) => {
              if ("isGroup" in entry && entry.isGroup) {
                const group = entry as StakingGroup
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Image
                        src={group.image || "/placeholder.svg"}
                        alt={group.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="text-white font-medium text-sm">{group.symbol}</h3>
                        <p className="text-gray-400 text-[10px]">{group.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {group.buttons.map((button) => {
                        const isClaimingThis = claiming === `${key}-${button.key}`
                        return (
                          <button
                            key={button.key}
                            onClick={() => handleClaim(key, button.key)}
                            disabled={isClaimingThis}
                            className={`py-1.5 px-4 rounded-md font-medium text-xs transition-all duration-300 flex items-center justify-center space-x-1 ${
                              isClaimingThis
                                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                : button.holderType === "tpf_holder"
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" // Blue for TPF holders
                                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" // Green for PSC holders
                            }`}
                          >
                            {isClaimingThis ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{t.claiming}</span>
                              </>
                            ) : (
                              <>
                                <Gift className="w-3 h-3" />
                                <span>
                                  {t.claim} {button.name}
                                </span>
                              </>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              } else {
                const contract = entry as StakingContract
                const isClaimingThis = claiming === key
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={contract.image || "/placeholder.svg"}
                          alt={contract.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <h3 className="text-white font-medium text-sm">{contract.symbol}</h3>
                          <p className="text-gray-400 text-[10px]">{contract.name}</p>
                        </div>
                      </div>

                      {/* Claim Button - Compact */}
                      <button
                        onClick={() => handleClaim(key)}
                        disabled={isClaimingThis}
                        className={`py-1.5 px-4 rounded-md font-medium text-xs transition-all duration-300 flex items-center justify-center space-x-1 ${
                          isClaimingThis
                            ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        }`}
                      >
                        {isClaimingThis ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>{t.claiming}</span>
                          </>
                        ) : (
                          <>
                            <Gift className="w-3 h-3" />
                            <span>{t.claim}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              }
            })}
          </>
        )}
      </div>
    </main>
  )
}
