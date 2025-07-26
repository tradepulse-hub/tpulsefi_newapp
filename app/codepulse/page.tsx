"use client"

import Image from "next/image"
import { ArrowLeft, Info, Hammer, Flame } from "lucide-react" // Re-adicionado Info, Flame
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button" // Re-adicionado Button
import { motion, AnimatePresence } from "framer-motion"
import { MiniKit } from "@worldcoin/minikit-js"
import { ethers } from "ethers"
import { useMiniKit } from "../../hooks/use-minikit"
import { TechGlobe } from "../../components/tech-globe" // Re-adicionado TechGlobe
import { BackgroundEffect } from "../../components/background-effect" // Re-adicionado BackgroundEffect

// Endereço da carteira morta (burn address)
const DEAD_WALLET = "0x000000000000000000000000000000000000dEaD"

// ABI simplificado para tokens ERC20 (apenas para a função transfer e balanceOf)
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
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

// Endereço do contrato PSC (Placeholder - Substitua pelo endereço real do seu token PSC)
const PSC_CONTRACT_ADDRESS = "0x2e4e589aa22649a3c739Cc729E8C12918DD27B0E"

// New constants for SoftStaking contract
const SOFT_STAKING_CONTRACT_ADDRESS = "0xb2972f15e2665aF621c3B96E85397BDC99D7d231"
const SOFT_STAKING_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_pscToken", type: "address" },
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
      { indexed: false, internalType: "uint256", name: "pscBalance", type: "uint256" },
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
  { inputs: [], name: "claimRewards", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "depositRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "emergencyWithdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getCalculationDetails",
    outputs: [
      { internalType: "uint256", name: "pscBalance", type: "uint256" },
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
      { internalType: "address", name: "pscTokenAddress", type: "address" },
      { internalType: "address", name: "rewardTokenAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserInfo",
    outputs: [
      { internalType: "uint256", name: "pscBalance", type: "uint256" },
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
    name: "pscToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
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
]

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations for the PulseCode page
const pageTranslations = {
  en: {
    common: {
      back: "Back",
      minikitNotInstalled: "MiniKit is not installed",
      transactionFailed: "Transaction failed",
      walletNotConnected: "Wallet not connected",
      errorFetchingData: "Error fetching data",
      hash: "Hash",
      close_verb: "CLOSE",
    },
    pulsecode: {
      title: "PulseCode: The Project Unifier",
      subtitle: "Innovation and Growth in the Web3 Ecosystem",
      description:
        "PulseCode is an initiative dedicated to driving the development of innovative projects within the WorldApp. Through a unique funding model, we ensure the sustainability and continuous growth of our ecosystem.",
      ourMissionTitle: "Our Mission",
      ourMissionDescription:
        "Our goal is to create a virtuous cycle of value: 50% of development fees are allocated to liquidity, and the remaining 50% for token buybacks, progressively increasing the value of PulseCode (PSC) and benefiting the entire community.",
      footer: {
        projectsTitle: "Our Projects",
        projectsSubtitle: "Discover the initiatives we are developing for the future of Web3.",
        projectsInDevelopment: "Projects in Development",
        keplerPay: "KeplerPay (KPP)",
        keplerPayDescription: "A decentralized payment platform for the Web3 ecosystem.",
      },
    },
    furnace: {
      title: "Furnace",
      subtitle: "Burn PSC tokens and contribute to token stability",
      totalBurned: "Total burned",
      invalidBurnAmount: "Invalid amount for burning",
      burnCompleted: "Burn Completed!",
      lastTransaction: "Last Transaction",
      burning: "Burning...",
      openFurnace: "Open Furnace",
      startBurn: "Start Burn",
      instructions: "Click the button to open the furnace",
      amountToBurn: "Amount of PSC to burn",
      furnaceInfo: "Furnace Information",
      deflation:
        "Deflation: Each token burned is sent to a dead wallet (0x000...dEaD) and permanently removed from circulation.",
    },
    staking: {
      claimFailed: "Failed to claim rewards.",
    },
  },
  pt: {
    common: {
      back: "Voltar",
      minikitNotInstalled: "MiniKit não está instalado",
      transactionFailed: "Transação falhou",
      walletNotConnected: "Carteira não conectada",
      errorFetchingData: "Erro ao buscar dados",
      hash: "Hash",
      close_verb: "FECHAR",
    },
    pulsecode: {
      title: "PulseCode: O Unificador de Projetos",
      subtitle: "Inovação e Crescimento no Ecossistema Web3",
      description:
        "A PulseCode é uma iniciativa dedicada a impulsionar o desenvolvimento de projetos inovadores dentro da WorldApp. Através de um modelo de financiamento único, garantimos a sustentabilidade e o crescimento contínuo do nosso ecossistema.",
      ourMissionTitle: "A Nossa Missão",
      ourMissionDescription:
        "O nosso objetivo é criar um ciclo virtuoso de valor: 50% das taxas de desenvolvimento são alocadas para liquidez, e os restantes 50% para recompra de tokens, aumentando progressivamente o valor do PulseCode (PSC) e beneficiando toda a comunidade.",
      footer: {
        projectsTitle: "Nossos Projetos",
        projectsSubtitle: "Descubra as iniciativas que estamos a desenvolver para o futuro da Web3.",
        projectsInDevelopment: "Projetos em Desenvolvimento",
        keplerPay: "KeplerPay (KPP)",
        keplerPayDescription: "Uma plataforma de pagamentos descentralizada para o ecossistema Web3.",
      },
    },
    furnace: {
      title: "Fornalha",
      subtitle: "Queime tokens PSC e contribua para a estabilidade do token",
      totalBurned: "Total queimado",
      invalidBurnAmount: "Quantidade inválida para queima",
      burnCompleted: "Queima Concluída!",
      lastTransaction: "Última Transação",
      burning: "Queimando...",
      openFurnace: "Abrir a Fornalha",
      startBurn: "Iniciar Queima",
      instructions: "Clique no botão para abrir a fornalha",
      amountToBurn: "Quantidade de PSC para queimar",
      furnaceInfo: "Informações sobre a Fornalha",
      deflation:
        "Deflação: Cada token queimado é enviado para uma carteira morta (0x000...dEaD) e removido permanentemente da circulação.",
    },
    staking: {
      claimFailed: "Falha ao reivindicar recompensas.",
    },
  },
  es: {
    common: {
      back: "Volver",
      minikitNotInstalled: "MiniKit no está instalado",
      transactionFailed: "Transacción fallida",
      walletNotConnected: "Billetera no conectada",
      errorFetchingData: "Error al obtener datos",
      hash: "Hash",
      close_verb: "CERRAR",
    },
    pulsecode: {
      title: "PulseCode: El Unificador de Proyectos",
      subtitle: "Innovación y Crecimiento en el Ecosistema Web3",
      description:
        "PulseCode es una iniciativa dedicada a impulsar el desarrollo de proyectos innovadores dentro de WorldApp. A través de un modelo de financiación único, aseguramos la sostenibilidad y el crecimiento continuo de nuestro ecosistema.",
      ourMissionTitle: "Nuestra Misión",
      ourMissionDescription:
        "Nuestro objetivo es crear un ciclo virtuoso de valor: el 50% de las tarifas de desarrollo se asignan a la liquidez, y el 50% restante para la recompra de tokens, aumentando progresivamente el valor de PulseCode (PSC) y beneficiando a toda la comunidad.",
      footer: {
        projectsTitle: "Nuestros Proyectos",
        projectsSubtitle: "Descubre las iniciativas que estamos desarrollando para el futuro de Web3.",
        projectsInDevelopment: "Proyectos en Desarrollo",
        keplerPay: "KeplerPay (KPP)",
        keplerPayDescription: "Una plataforma de pagos descentralizada para el ecosistema Web3.",
      },
    },
    furnace: {
      title: "Horno",
      subtitle: "Quema tokens PSC y contribuye a la estabilidad del token",
      totalBurned: "Total quemado",
      invalidBurnAmount: "Cantidad inválida para quemar",
      burnCompleted: "¡Quema Completada!",
      lastTransaction: "Última Transacción",
      burning: "Quemando...",
      openFurnace: "Abrir el Horno",
      startBurn: "Iniciar Quema",
      instructions: "Haz clic en el botón para abrir el horno",
      amountToBurn: "Cantidad de PSC a quemar",
      furnaceInfo: "Información del Horno",
      deflation:
        "Deflación: Cada token quemado se envía a una billetera muerta (0x000...dEaD) y se elimina permanentemente de la circulación.",
    },
    staking: {
      claimFailed: "No se pudieron reclamar las recompensas.",
    },
  },
  id: {
    common: {
      back: "Kembali",
      minikitNotInstalled: "MiniKit tidak terinstal",
      transactionFailed: "Transaksi gagal",
      walletNotConnected: "Dompet tidak terhubung",
      errorFetchingData: "Gagal mengambil data",
      hash: "Hash",
      close_verb: "TUTUP",
    },
    pulsecode: {
      title: "PulseCode: Penyatuan Proyek",
      subtitle: "Inovasi dan Pertumbuhan dalam Ekosistem Web3",
      description:
        "PulseCode adalah inisiatif yang didedikasikan untuk mendorong pengembangan proyek-proyek inovatif di dalam WorldApp. Melalui model pendanaan yang unik, kami memastikan keberlanjutan dan pertumbuhan ekosistem kami yang berkelanjutan.",
      ourMissionTitle: "Misi Kami",
      ourMissionDescription:
        "Tujuan kami adalah menciptakan siklus nilai yang baik: 50% dari biaya pengembangan dialokasikan untuk likuiditas, dan 50% sisanya untuk pembelian kembali token, secara progresif meningkatkan nilai PulseCode (PSC) dan menguntungkan seluruh komunitas.",
      footer: {
        projectsTitle: "Proyek Kami",
        projectsSubtitle: "Mengembangkan inisiatif untuk masa depan Web3.",
        projectsInDevelopment: "Proyek dalam Pengembangan",
        keplerPay: "KeplerPay (KPP)",
        keplerPayDescription: "Platform pembayaran terdesentralisasi untuk ekosistem Web3.",
      },
    },
    furnace: {
      title: "Tungku",
      subtitle: "Bakar token PSC dan berkontribusi pada stabilitas token",
      totalBurned: "Total dibakar",
      invalidBurnAmount: "Jumlah pembakaran tidak valid",
      burnCompleted: "Pembakaran Selesai!",
      lastTransaction: "Transaksi Terakhir",
      burning: "Membakar...",
      openFurnace: "Buka Tungku",
      startBurn: "Mulai Pembakaran",
      instructions: "Klik tombol untuk membuka tungku",
      amountToBurn: "Jumlah PSC yang akan dibakar",
      furnaceInfo: "Informasi Tungku",
      deflation:
        "Deflasi: Setiap token yang dibakar dikirim ke dompet mati (0x000...dEaD) e dihapus secara permanen dari peredaran.",
    },
    staking: {
      claimFailed: "Gagal mengklaim hadiah.",
    },
  },
}

export default function PulseCodePage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")

  // Use useMiniKit hook
  const { address: userAddress, isConnected: isAuthenticated, isConnecting } = useMiniKit()

  // Furnace states and refs
  const [amount, setAmount] = useState<string>("0")
  const [isBurning, setIsBurning] = useState(false)
  const [burnComplete, setBurnComplete] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [doorOpen, setDoorOpen] = useState(false)
  const [tokenPosition, setTokenPosition] = useState({ x: 0, y: 0 })
  const [fireIntensity, setFireIntensity] = useState(1)
  const [burnTxHash, setBurnTxHash] = useState<string | null>(null)
  const [totalBurned, setTotalBurned] = useState<string>("0")
  const furnaceRef = useRef<HTMLDivElement>(null)

  // Staking states (these states are no longer directly used for rendering the tab, but might be used by other logic)
  const [pscBalance, setPscBalance] = useState<string>("0")
  const [pendingRewards, setPendingRewards] = useState<string>("0")
  const [totalClaimedRewards, setTotalClaimedRewards] = useState<string>("0")
  const [stakingAPY, setStakingAPY] = useState<string>("0")
  const [contractRewardBalance, setContractRewardBalance] = useState<string>("0")
  const [isClaiming, setIsClaiming] = useState(false)
  const [isLoadingStakingData, setIsLoadingStakingData] = useState(true)
  const [stakingError, setStakingError] = useState<string | null>(null)
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)

  // Translations
  const [translations, setTranslations] = useState(pageTranslations[currentLang])

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    const initialLang = savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : "en"
    setCurrentLang(initialLang)
    setTranslations(pageTranslations[initialLang]) // Set translations based on initialLang

    // No need for a custom event listener if language is managed via localStorage and component state
    // The parent component (Presentation) will handle setting the localStorage item,
    // and this component will react to changes in localStorage on mount/remount or if a global state was used.
    // For simplicity, we'll rely on the initial load from localStorage.
  }, []) // Empty dependency array means this runs once on mount

  const t = translations

  // State for active footer tab
  const [activeFooterTab, setActiveFooterTab] = useState<"about" | "projects" | "burn">("about")

  useEffect(() => {
    if (doorOpen) {
      const timer = setTimeout(() => {
        setFireIntensity(2)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setFireIntensity(1)
    }
  }, [doorOpen])

  useEffect(() => {
    const savedTotal = localStorage.getItem("psc_total_burned")
    if (savedTotal) {
      setTotalBurned(savedTotal)
    }
  }, [])

  const sendTokensToBurnAddress = async (amountToBurn: string) => {
    try {
      if (!MiniKit.isInstalled()) {
        throw new Error(t.common?.minikitNotInstalled || "MiniKit is not installed")
      }

      const burnAmount = Number.parseFloat(amountToBurn)
      if (isNaN(burnAmount) || burnAmount <= 0) {
        throw new Error(t.furnace?.invalidBurnAmount || "Invalid amount for burning")
      }

      const amountInWei = ethers.parseUnits(amountToBurn, 18).toString()

      console.log("Enviando", amountToBurn, "PSC para queima")
      console.log("Endereço da carteira morta:", DEAD_WALLET)
      console.log("Valor em wei:", amountInWei)

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: PSC_CONTRACT_ADDRESS,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [DEAD_WALLET, amountInWei],
          },
        ],
      })

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.message || t.common?.transactionFailed || "Transaction failed")
      }

      console.log("Transação enviada com sucesso:", finalPayload)

      setBurnTxHash(finalPayload.transaction_id)

      const newTotal = (Number.parseFloat(totalBurned) + burnAmount).toString()
      setTotalBurned(newTotal)
      localStorage.setItem("psc_total_burned", newTotal)

      return {
        success: true,
        txHash: finalPayload.transaction_id,
      }
    } catch (error) {
      console.error("Erro ao queimar tokens:", error)
      throw error
    }
  }

  const handleBurn = async () => {
    if (Number(amount) <= 0 || isBurning || !doorOpen) return

    setIsBurning(true)

    if (furnaceRef.current) {
      const rect = furnaceRef.current.getBoundingClientRect()
      setTokenPosition({
        x: rect.width / 2,
        y: rect.height / 2 - 20,
      })
    }

    try {
      const result = await sendTokensToBurnAddress(amount)

      setFireIntensity(3)

      setTimeout(() => {
        setIsBurning(false)
        setBurnComplete(true)

        console.log(`${amount} PSC ${t.furnace?.burnCompleted || "Burn Completed!"}`)
        console.log(`${t.furnace?.lastTransaction || "Last Transaction"}: ${result.txHash.substring(0, 10)}...`)

        setTimeout(() => {
          setDoorOpen(false)
          setBurnComplete(false)
          setAmount("0")
          setFireIntensity(1)
        }, 3000)
      }, 3000)
    } catch (error) {
      console.error("Erro na queima:", error)
      setIsBurning(false)

      console.error(
        t.common?.transactionFailed || "Falha ao queimar tokens",
        error instanceof Error ? error.message : "Erro desconhecido",
      )
    }
  }

  const fetchStakingData = useCallback(async () => {
    setIsLoadingStakingData(true)
    setStakingError(null)

    console.log(
      "fetchStakingData called. isAuthenticated:",
      isAuthenticated,
      "userAddress:",
      userAddress,
      "isConnecting:",
      isConnecting,
      "isLoadingStakingData:",
      isLoadingStakingData,
    )

    if (isConnecting) {
      console.log("MiniKit is still connecting. Waiting to fetch staking data.")
      setIsLoadingStakingData(true) // Keep loading true while connecting
      return // Do not proceed if MiniKit is still connecting
    }

    if (!MiniKit.isInstalled()) {
      console.log("MiniKit is NOT installed. Cannot fetch staking data.")
      setStakingError(t.common?.minikitNotInstalled || "MiniKit is not installed.")
      setIsLoadingStakingData(false)
      return
    }

    if (!isAuthenticated || !userAddress) {
      console.log("Wallet is NOT connected or userAddress is null. Cannot fetch staking data.")
      setStakingError(t.common?.walletNotConnected || "Wallet not connected.")
      setIsLoadingStakingData(false)
      return
    }

    try {
      console.log("Attempting to fetch staking data for address:", userAddress)

      const { finalPayload: pscBalancePayload } = await MiniKit.commandsAsync.readContract({
        address: PSC_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [userAddress],
      })
      const pscBalanceWei = pscBalancePayload.result.toString()
      setPscBalance(ethers.formatUnits(pscBalanceWei, 18))
      console.log("PSC Balance (Wei):", pscBalanceWei, "Formatted:", ethers.formatUnits(pscBalanceWei, 18))

      const { finalPayload: userInfoPayload } = await MiniKit.commandsAsync.readContract({
        address: SOFT_STAKING_CONTRACT_ADDRESS,
        abi: SOFT_STAKING_ABI,
        functionName: "getUserInfo",
        args: [userAddress],
      })
      const pendingRewardsWei = userInfoPayload.result[1].toString()
      const totalClaimedWei = userInfoPayload.result[3].toString()
      setPendingRewards(ethers.formatUnits(pendingRewardsWei, 18))
      setTotalClaimedRewards(ethers.formatUnits(totalClaimedWei, 18))
      console.log("Pending Rewards (Wei):", pendingRewardsWei, "Formatted:", ethers.formatUnits(pendingRewardsWei, 18))
      console.log("Total Claimed (Wei):", totalClaimedWei, "Formatted:", ethers.formatUnits(totalClaimedWei, 18))

      const { finalPayload: apyPayload } = await MiniKit.commandsAsync.readContract({
        address: SOFT_STAKING_CONTRACT_ADDRESS,
        abi: SOFT_STAKING_ABI,
        functionName: "getCurrentAPY",
        args: [],
      })
      setStakingAPY((Number(apyPayload.result) / 100).toFixed(2))
      console.log(
        "Current APY (Basis Points):",
        apyPayload.result,
        "Formatted:",
        (Number(apyPayload.result) / 100).toFixed(2),
      )

      const { finalPayload: contractBalancePayload } = await MiniKit.commandsAsync.readContract({
        address: SOFT_STAKING_CONTRACT_ADDRESS,
        abi: SOFT_STAKING_ABI,
        functionName: "getRewardBalance",
        args: [],
      })
      const contractRewardBalanceWei = contractBalancePayload.result.toString()
      setContractRewardBalance(ethers.formatUnits(contractRewardBalanceWei, 18))
      console.log(
        "Contract Reward Balance (Wei):",
        contractRewardBalanceWei,
        "Formatted:",
        ethers.formatUnits(contractRewardBalanceWei, 18),
      )
      console.log("Staking data fetched successfully.")
    } catch (err: any) {
      console.error("Error during staking data fetch:", err)
      setStakingError(t.common?.errorFetchingData || `Error fetching staking data: ${err.message || err.toString()}`)
    } finally {
      setIsLoadingStakingData(false)
      console.log("Finished fetching staking data. isLoadingStakingData set to false.")
    }
  }, [t, PSC_CONTRACT_ADDRESS, SOFT_STAKING_CONTRACT_ADDRESS, isAuthenticated, userAddress, isConnecting])

  useEffect(() => {
    console.log(
      "Main useEffect running. isAuthenticated:",
      isAuthenticated,
      "userAddress:",
      userAddress,
      "isConnecting:",
      isConnecting,
      "isLoadingStakingData:",
      isLoadingStakingData,
    )
    let interval: NodeJS.Timeout | undefined

    // Trigger fetchStakingData whenever connection status changes
    // The fetchStakingData useCallback itself contains the logic to prevent fetching if not ready
    fetchStakingData()

    // Set up interval only if authenticated and userAddress is available
    if (isAuthenticated && userAddress) {
      interval = setInterval(fetchStakingData, 15000)
    } else {
      // If not authenticated, ensure loading is false and error is set, unless still connecting
      if (!isConnecting) {
        setIsLoadingStakingData(false)
        setStakingError(t.common?.walletNotConnected || "Wallet not connected.")
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [fetchStakingData, activeFooterTab, isAuthenticated, userAddress, isConnecting, t])

  const handleClaimRewards = async () => {
    if (!userAddress || Number(pendingRewards) <= 0 || isClaiming) return

    setIsClaiming(true)
    setStakingError(null)
    setClaimSuccess(null)
    setClaimError(null)

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: SOFT_STAKING_CONTRACT_ADDRESS,
            abi: SOFT_STAKING_ABI,
            functionName: "claimRewards",
            args: [],
          },
        ],
      })

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.message || t.staking?.claimFailed || "Failed to claim rewards.")
      }

      console.log("Rewards claimed successfully:", finalPayload)
      setClaimSuccess("PSC")
      fetchStakingData()

      setTimeout(() => {
        setClaimSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error("Error claiming rewards:", err)
      let errorMessage = t.staking?.claimFailed || `Failed to claim rewards: ${err.message || err.toString()}`

      if (errorMessage.includes("simulation_failed")) {
        errorMessage = "Transaction simulation failed. You may not have enough tokens or rewards to claim."
      } else if (errorMessage.includes("user_rejected")) {
        errorMessage = "Transaction was rejected by user."
      } else if (errorMessage.includes("No PSC tokens")) {
        errorMessage = "You need PSC tokens in your wallet to claim rewards."
      } else if (errorMessage.includes("No rewards to claim")) {
        errorMessage = "No rewards available to claim at this time."
      } else if (errorMessage.includes("Insufficient reward balance")) {
        errorMessage = "Contract has insufficient reward balance. Please try again later."
      }

      setClaimError(errorMessage)
    } finally {
      setIsClaiming(false)
    }
  }

  const renderContent = () => {
    console.log(
      "Rendering CodeStaking tab. isAuthenticated:",
      isAuthenticated,
      "userAddress:",
      userAddress,
      "isConnecting:",
      isConnecting,
      "isLoadingStakingData:",
      isLoadingStakingData,
    )

    switch (activeFooterTab) {
      case "about":
        return <></>
      case "projects":
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-wider">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                {t.pulsecode?.footer?.projectsTitle || "Nossos Projetos"}
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {t.pulsecode?.footer?.projectsSubtitle ||
                "Descubra as iniciativas que estamos a desenvolver para o futuro da Web3."}
            </p>
            <div className="w-full h-px bg-gray-700/50 my-6" /> {/* Separador visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 max-w-md w-full overflow-hidden relative group"
              whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.5)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <h3 className="text-2xl font-bold mb-4 text-cyan-300 relative z-10">
                {t.pulsecode?.footer?.projectsInDevelopment || "Projetos em Desenvolvimento"}
              </h3>
              <div className="flex items-center justify-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 relative z-10">
                <Image
                  src="/images/keplerpay-logo.png"
                  alt="KeplerPay Logo"
                  width={60}
                  height={60}
                  className="rounded-full shadow-lg"
                />
                <div className="text-left">
                  <span className="text-2xl font-semibold text-gray-100 block">
                    {t.pulsecode?.footer?.keplerPay || "KeplerPay (KPP)"}
                  </span>
                  <p className="text-sm text-gray-400">
                    {t.pulsecode?.footer?.keplerPayDescription ||
                      "Uma plataforma de pagamentos descentralizada para o ecossistema Web3."}
                  </p>
                </div>
                <Hammer className="w-8 h-8 ml-auto text-cyan-400 animate-hammer" />
              </div>
            </motion.div>
          </div>
        )
      case "burn":
        return (
          <main className="relative flex min-h-[500px] flex-col items-center pt-4 pb-20 overflow-hidden w-full">
            {" "}
            {/* Adjusted min-h */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-3 relative z-10"
            >
              <h1 className="text-2xl font-bold tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-300">
                  {t.furnace?.title || "Fornalha"}
                </span>
              </h1>
              <p className="text-gray-400 text-xs mt-1">
                {t.furnace?.subtitle || "Queime tokens PSC e contribua para a substabilidade do token"}{" "}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 text-center"
            >
              <p className="text-xs text-gray-400">{t.furnace?.totalBurned || "Total queimado"}</p>
              <p className="text-xl font-bold text-orange-500">
                {Number.parseFloat(totalBurned).toLocaleString()} PSC
              </p>{" "}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-xs relative z-10 px-4" // Changed max-w-sm to max-w-xs
            >
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden">
                <div className="relative p-4 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700/50">
                  <div className="absolute top-4 right-4 w-8 h-24 bg-gray-800 rounded-full border border-gray-700 overflow-hidden">
                    <motion.div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-b-full"
                      animate={{ height: `${20 + fireIntensity * 25}%` }}
                      transition={{ duration: 1 }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full h-px bg-gray-600" />
                      ))}
                    </div>
                    <div className="absolute inset-0 border border-gray-700 rounded-full pointer-events-none" />
                  </div>

                  <div
                    ref={furnaceRef}
                    className="relative w-full h-48 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700/50"
                  >
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 gap-1 p-1 opacity-70">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-sm border border-gray-900/50"
                            style={{
                              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.2)",
                            }}
                          />
                        ))}
                      </div>

                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`stain-${i}`}
                          className="absolute rounded-full bg-black/20"
                          style={{
                            width: `${20 + Math.random() * 30}px`,
                            height: `${20 + Math.random() * 30}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                            opacity: 0.2 + Math.random() * 0.3,
                          }}
                        />
                      ))}
                    </div>

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28">
                      {" "}
                      {/* Adjusted w-32 h-32 to w-28 h-28 */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-700 shadow-inner">
                        {[
                          { top: "10%", left: "10%" },
                          { top: "10%", right: "10%" },
                          { bottom: "10%", left: "10%" },
                          { bottom: "10%", right: "10%" },
                        ].map((pos, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-gray-500 rounded-full border border-gray-600"
                            style={pos as any}
                          />
                        ))}
                      </div>
                      <motion.div
                        className="absolute inset-0 origin-left bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-md overflow-hidden"
                        animate={{
                          rotateY: doorOpen ? 70 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-gray-700" />
                              <div className="h-full w-0.5 bg-gray-700" />
                            </div>

                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-orange-600/60 via-orange-500/40 to-yellow-400/20"
                              animate={{
                                opacity: fireIntensity * 0.3,
                              }}
                              transition={{
                                duration: 2,
                                delay: 2,
                              }}
                            />
                          </div>
                        </div>

                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full border border-gray-600">
                          <div className="absolute inset-0 flex flex-col justify-center items-center gap-1">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="w-2 h-0.5 bg-gray-800 rounded-full" />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                      <div className="absolute inset-0 -z-10 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-40">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-sm"
                                style={{
                                  boxShadow:
                                    "inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.2)",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1/3">
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-red-900/50 to-transparent" />
                          <div className="absolute inset-0">
                            {Array.from({ length: 15 }).map((_, i) => (
                              <motion.div
                                key={`ember-${i}`}
                                className="absolute rounded-full bg-gradient-to-br from-red-600 to-red-800"
                                style={{
                                  width: `${3 + Math.random() * 5}px`,
                                  height: `${3 + Math.random() * 5}px`,
                                  left: `${Math.random() * 100}%`,
                                  top: `${50 + Math.random() * 50}%`,
                                }}
                                animate={{
                                  opacity: [0.4, 0.8, 0.4],
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 1 + Math.random() * 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatType: "reverse",
                                  delay: Math.random() * 2,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-2/3 overflow-hidden">
                          <motion.div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16 bg-orange-600 rounded-full blur-xl"
                            animate={{
                              opacity: [0.5, 0.7, 0.5],
                              scale: [1, 1.1, 1],
                              width: [20 * fireIntensity, 24 * fireIntensity, 20 * fireIntensity],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "reverse",
                            }}
                          />

                          {Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute bottom-0 bg-gradient-to-t from-orange-600 via-orange-500 to-yellow-300"
                              style={{
                                width: `${3 + i * 1}px`,
                                height: `${25 + i * 3}px`,
                                left: `calc(50% + ${(i - 4) * 4}px)`,
                                filter: "blur(1px)",
                                opacity: 0.8 - i * 0.03,
                                zIndex: 10 - i,
                              }}
                              animate={{
                                height: [
                                  `${(25 + i * 3) * fireIntensity}px`,
                                  `${(35 + i * 3) * fireIntensity}px`,
                                  `${(25 + i * 3) * fireIntensity}px`,
                                ],
                                width: [
                                  `${(3 + i * 1) * fireIntensity}px`,
                                  `${(4 + i * 1) * fireIntensity}px`,
                                  `${(3 + i * 1) * fireIntensity}px`,
                                ],
                              }}
                              transition={{
                                duration: 0.5 + i * 0.1,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                                delay: i * 0.05,
                              }}
                            />
                          ))}

                          {Array.from({ length: 10 }).map((_, i) => (
                            <motion.div
                              key={`particle-${i}`}
                              className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 rounded-full"
                              style={{
                                left: `calc(50% + ${(Math.random() - 0.5) * 30}px)`,
                                background: i % 2 === 0 ? "#fbbf24" : "#f97316",
                                opacity: 0,
                              }}
                              animate={{
                                y: [0, -40 - Math.random() * 20 * fireIntensity],
                                x: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 25],
                                opacity: [0, 0.8, 0],
                                scale: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1 + Math.random() * 1,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: Math.random() * 2,
                              }}
                            />
                          ))}

                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                              key={`smoke-${i}`}
                              className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-gray-500/20 rounded-full blur-md"
                              style={{
                                left: `calc(50% + ${(Math.random() - 0.5) * 20}px)`,
                              }}
                              animate={{
                                y: [-10, -50 - Math.random() * 20],
                                x: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 20],
                                opacity: [0, 0.3, 0],
                                scale: [1, 2 + Math.random() * 1, 3],
                              }}
                              transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: Math.random() * 2,
                              }}
                            />
                          ))}
                        </div>

                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-orange-600/0 via-orange-500/10 to-transparent mix-blend-overlay"
                          animate={{
                            opacity: [0.3, 0.5, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                        />

                        <motion.div
                          className="absolute inset-0 bg-orange-500/10"
                          animate={{
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isBurning && (
                        <motion.div
                          className="absolute z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                          initial={{ x: -80, y: 100, opacity: 0, rotateZ: 0 }}
                          animate={{
                            x: tokenPosition.x - 24,
                            y: tokenPosition.y,
                            opacity: [1, 1, 0],
                            rotateZ: 360,
                            scale: [1, 1, 0.5],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 4,
                            times: [0, 0.7, 1],
                          }}
                        >
                          <Image
                            src="/images/codepulse-logo.png"
                            alt="PSC Token"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-orange-500/0"
                            animate={{
                              backgroundColor: ["rgba(249, 115, 22, 0)", "rgba(249, 115, 22, 0.3)"],
                              boxShadow: ["0 0 0 0 rgba(249, 115, 22, 0)", "0 0 10px 5px rgba(249, 115, 22, 0.5)"],
                            }}
                            transition={{
                              duration: 2,
                              delay: 2,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-orange-600/0 via-orange-500/0 to-transparent mix-blend-overlay pointer-events-none"
                      animate={{
                        opacity: fireIntensity * 0.15,
                      }}
                      transition={{ duration: 1 }}
                    />

                    <motion.div
                      className="absolute -inset-10 bg-orange-500/0 rounded-full blur-3xl pointer-events-none"
                      animate={{
                        backgroundColor: `rgba(249, 115, 22, ${0.05 * fireIntensity})`,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  <div className="flex justify-between mt-3 gap-2">
                    <motion.button
                      className={`flex-1 h-12 rounded-md relative ${
                        doorOpen ? "bg-red-600" : "bg-gradient-to-br from-red-600 to-red-800"
                      } border-2 border-gray-700 shadow-lg`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => !isBurning && !burnComplete && setDoorOpen(!doorOpen)}
                      disabled={isBurning || burnComplete}
                    >
                      <div className="absolute inset-1 rounded-md bg-gradient-to-br from-red-500 to-red-700 shadow-inner" />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                        {doorOpen ? t.common?.close_verb || "FECHAR" : t.furnace?.openFurnace || "ABRIR"}
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-md bg-white/10"
                        animate={{
                          opacity: doorOpen ? [0.2, 0.4, 0.2] : 0,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: doorOpen ? Number.POSITIVE_INFINITY : 0,
                          repeatType: "reverse",
                        }}
                      />
                    </motion.button>

                    <div className="h-12 w-12 bg-gray-800 rounded-md border-2 border-gray-700 relative overflow-hidden">
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-b-md transition-all duration-1000">
                        <motion.div
                          className="w-full h-full"
                          animate={{
                            height: `${20 + fireIntensity * 25}%`,
                          }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white font-mono text-xs">{Math.round(300 * fireIntensity)}°</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-800/80 bg-gray-900/50">
                  {doorOpen && !isBurning && !burnComplete ? (
                    <div className="mb-3">
                      <label htmlFor="amount" className="block text-xs font-medium text-gray-300 mb-1">
                        {t.furnace?.amountToBurn || "Quantidade de PSC para queimar"}{" "}
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          disabled={isBurning || burnComplete}
                          className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-l-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <div className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-r-md text-gray-300 text-sm">
                          PSC
                        </div>{" "}
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={doorOpen ? handleBurn : () => setDoorOpen(true)}
                    disabled={doorOpen && (Number(amount) <= 0 || isBurning || burnComplete)}
                    className={`w-full py-2 rounded-md font-medium text-white text-sm relative overflow-hidden ${
                      isBurning
                        ? "bg-orange-600 cursor-not-allowed"
                        : doorOpen && Number(amount) > 0 && !burnComplete
                          ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                          : doorOpen
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                    }`}
                  >
                    {isBurning ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t.furnace?.burning || "Queimando..."}
                      </div>
                    ) : burnComplete ? (
                      t.furnace?.burnCompleted || "Queima Concluída!"
                    ) : !doorOpen ? (
                      t.furnace?.openFurnace || "Abrir a Fornalha"
                    ) : (
                      t.furnace?.startBurn || "Iniciar Queima"
                    )}
                  </button>

                  {!doorOpen && !isBurning && !burnComplete && (
                    <div className="mt-2 text-center text-xs text-gray-400">
                      {t.furnace?.instructions || "Clique no botão para abrir a fornalha"}
                    </div>
                  )}
                  {doorOpen && !isBurning && !burnComplete && (
                    <div className="mt-2 text-center text-xs text-gray-400">
                      {t.furnace?.amountToBurn && t.furnace?.startBurn
                        ? `${t.furnace.amountToBurn} e ${t.furnace.startBurn.toLowerCase()}`
                        : 'Insira a quantidade e clique em "Iniciar Queima"'}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-800/80 bg-gray-900/50">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full flex items-center justify-between text-gray-300 hover:text-white"
                  >
                    <span className="font-medium text-sm">
                      {t.furnace?.furnaceInfo || "Informações sobre a Fornalha"}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`w-4 h-4 transition-transform ${showInfo ? "rotate-180" : ""}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2">
                          <p className="text-gray-300 text-xs">
                            {t.furnace?.deflation ||
                              "A Fornalha permite que você queime tokens PSC e contribua para o crescimento do TPulseFi a longo prazo."}{" "}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-start">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 text-orange-500 mr-1.5 flex-shrink-0"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div className="text-xs text-gray-300">
                                <strong className="text-white">
                                  {t.furnace?.deflation?.split(":")[0] || "Deflação"}:
                                </strong>
                                {t.furnace?.deflation?.split(":")[1] ||
                                  " Cada token queimado é enviado para uma carteira morta (0x000...dEaD) e removido permanentemente da circulação."}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            {burnTxHash && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-4 w-full max-w-xs px-4"
              >
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-800/50 p-3">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    {t.furnace?.lastTransaction || "Última Transação"}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{t.common?.hash || "Hash"}:</span>
                    <a
                      href={`https://worldscan.org/tx/${burnTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 truncate max-w-[200px]"
                    >
                      {burnTxHash.substring(0, 10)}...{burnTxHash.substring(burnTxHash.length - 8)}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect (z-index: 0) */}
      <BackgroundEffect />

      {/* 3D Globe Container (z-index: 1) */}
      <div className="absolute inset-0 z-10 flex items-center justify-start pl-32">
        {" "}
        {/* Adjusted: justify-start and pl-32 */}
        <div className="relative w-[250px] h-[250px]">{activeFooterTab === "about" && <TechGlobe />}</div>
      </div>

      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg font-medium">{t.common?.back || "Back"}</span>
      </button>
      {/* Removed the motion.div wrapper around renderContent() */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">{renderContent()}</div>
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs bg-black/70 backdrop-blur-md border border-white/10 rounded-full p-2 z-50">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "about" ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
            }`}
            onClick={() => setActiveFooterTab("about")}
          >
            <Info className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "projects" ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
            }`}
            onClick={() => setActiveFooterTab("projects")}
          >
            <Hammer className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "burn" ? "text-orange-400" : "text-gray-400 hover:text-orange-400"
            }`}
            onClick={() => setActiveFooterTab("burn")}
          >
            <Flame className="w-6 h-6" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
