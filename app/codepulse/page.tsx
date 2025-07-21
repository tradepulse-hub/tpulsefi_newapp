"use client"

import Image from "next/image"
import { ArrowLeft, Coins, Info, Hammer, Flame } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { MiniKit } from "@worldcoin/minikit-js"
import { ethers } from "ethers"
import { getCurrentLanguage, getTranslations } from "@/lib/i18n"
import { useMiniKit } from "../../hooks/use-minikit" // Import useMiniKit hook

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

export default function PulseCodePage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<string>("en")
  const [activeFooterTab, setActiveFooterTab] = useState<"about" | "codestaking" | "projects" | "burn">("about")

  // Use useMiniKit hook
  const { address: userAddress, isConnected: isAuthenticated } = useMiniKit()

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

  // Staking states
  const [pscBalance, setPscBalance] = useState<string>("0")
  const [pendingRewards, setPendingRewards] = useState<string>("0")
  const [totalClaimedRewards, setTotalClaimedRewards] = useState<string>("0")
  const [stakingAPY, setStakingAPY] = useState<string>("0")
  const [contractRewardBalance, setContractRewardBalance] = useState<string>("0")
  const [isClaiming, setIsClaiming] = useState(false)
  const [isLoadingStakingData, setIsLoadingStakingData] = useState(true)
  const [stakingError, setStakingError] = useState<string | null>(null)

  // Translations
  const [translations, setTranslations] = useState(getTranslations(getCurrentLanguage()))

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setCurrentLang(savedLanguage)
    }

    // Update translations when the language changes
    const handleLanguageChange = () => {
      setTranslations(getTranslations(getCurrentLanguage()))
    }
    window.addEventListener("languageChange", handleLanguageChange)
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange)
    }
  }, [])

  const t = translations

  // Effect to increase fire intensity when the door is open
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

  // Load total burned from localStorage
  useEffect(() => {
    const savedTotal = localStorage.getItem("psc_total_burned")
    if (savedTotal) {
      setTotalBurned(savedTotal)
    }
  }, [])

  // Function to send tokens to the dead wallet
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

  // Simulate burn process
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
        // You can add a more visible notification here if needed, e.g., a simple alert or a custom modal.

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
        t.wallet?.sendToken?.transactionFailed || "Falha ao queimar tokens",
        error instanceof Error ? error.message : "Erro desconhecido",
      )
      // You can add a more visible error notification here if needed.
    }
  }

  // Function to fetch staking data
  const fetchStakingData = useCallback(async () => {
    setIsLoadingStakingData(true) // Set loading true immediately
    setStakingError(null) // Clear any previous errors

    console.log("fetchStakingData called. isAuthenticated:", isAuthenticated, "userAddress:", userAddress)

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

      // Fetch PSC balance
      console.log("Fetching PSC balance...")
      const { finalPayload: pscBalancePayload } = await MiniKit.commandsAsync.readContract({
        address: PSC_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [userAddress],
      })
      const pscBalanceWei = pscBalancePayload.result.toString()
      setPscBalance(ethers.formatUnits(pscBalanceWei, 18))
      console.log("PSC Balance (Wei):", pscBalanceWei, "Formatted:", ethers.formatUnits(pscBalanceWei, 18))

      // Fetch staking contract data
      console.log("Fetching user info from staking contract...")
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

      console.log("Fetching current APY...")
      const { finalPayload: apyPayload } = await MiniKit.commandsAsync.readContract({
        address: SOFT_STAKING_CONTRACT_ADDRESS,
        abi: SOFT_STAKING_ABI,
        functionName: "getCurrentAPY",
        args: [],
      })
      setStakingAPY((Number(apyPayload.result) / 100).toFixed(2)) // Convert basis points to percentage
      console.log(
        "Current APY (Basis Points):",
        apyPayload.result,
        "Formatted:",
        (Number(apyPayload.result) / 100).toFixed(2),
      )

      console.log("Fetching contract reward balance...")
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
  }, [t, PSC_CONTRACT_ADDRESS, SOFT_STAKING_CONTRACT_ADDRESS, isAuthenticated, userAddress]) // Added isAuthenticated and userAddress to dependencies

  useEffect(() => {
    console.log("Main useEffect running. isAuthenticated:", isAuthenticated, "userAddress:", userAddress)
    let interval: NodeJS.Timeout | undefined

    if (isAuthenticated && userAddress) {
      fetchStakingData()
      interval = setInterval(fetchStakingData, 15000) // Refetch every 15 seconds
    } else {
      // If not authenticated or address is null, ensure loading state is false and error is set
      setIsLoadingStakingData(false)
      setStakingError(t.common?.walletNotConnected || "Wallet not connected.")
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [fetchStakingData, activeFooterTab, isAuthenticated, userAddress, t]) // Refetch when tab changes or wallet status changes

  // Handle Claim Rewards
  const handleClaimRewards = async () => {
    if (!userAddress || Number(pendingRewards) <= 0 || isClaiming) return

    setIsClaiming(true)
    setStakingError(null)

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
      // Show success message
      console.log(t.staking?.claimSuccess || "Rewards claimed successfully!")
      fetchStakingData() // Refetch data to update balances
    } catch (err: any) {
      console.error("Error claiming rewards:", err)
      setStakingError(t.staking?.claimFailed || `Failed to claim rewards: ${err.message || err.toString()}`)
    } finally {
      setIsClaiming(false)
    }
  }

  const renderContent = () => {
    switch (activeFooterTab) {
      case "about":
        return (
          <>
            {/* PulseCode Logo - Only visible in About tab */}
            <div className="relative mb-8 flex items-center justify-center">
              <div
                className="absolute w-48 h-48 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                rgba(255,255,255,0.4) 0%,
                rgba(156,163,175,0.3) 30%,
                rgba(107,114,128,0.2) 60%,
                transparent 100%)`,
                  animation: "vibrateAura 0.1s linear infinite, pulse 1s ease-in-out infinite",
                }}
              />
              <div
                className="absolute w-40 h-40 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                rgba(255,255,255,0.6) 0%,
                rgba(229,231,235,0.4) 40%,
                transparent 100%)`,
                  animation: "vibrateAura 0.15s linear infinite, pulse 0.8s ease-in-out infinite",
                  animationDelay: "0.05s",
                }}
              />
              <div
                className="absolute w-32 h-32 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                rgba(243,244,246,0.5) 0%,
                rgba(209,213,219,0.4) 50%,
                transparent 100%)`,
                  animation: "vibrateAura 0.2s linear infinite, pulse 0.6s ease-in-out infinite",
                  animationDelay: "0.1s",
                }}
              />

              <div
                className="absolute w-36 h-36 border-2 border-gray-300/60 rounded-full"
                style={{
                  animation: "vibrateRing 0.1s linear infinite, spin 8s linear infinite",
                  boxShadow: "0 0 20px rgba(255,255,255,0.8), inset 0 0 20px rgba(229,231,235,0.5)",
                }}
              />
              <div
                className="absolute w-30 h-30 border border-gray-400/70 rounded-full"
                style={{
                  animation: "vibrateRing 0.12s linear infinite, spin 6s linear infinite reverse",
                  boxShadow: "0 0 15px rgba(255,255,255,1)",
                }}
              />

              <div
                className="relative w-24 h-24 flex items-center justify-center"
                style={{
                  animation: "vibrateLogo 0.08s linear infinite",
                }}
              >
                <div
                  className="absolute inset-0 bg-white rounded-full shadow-2xl"
                  style={{
                    boxShadow: `
                  0 0 25px rgba(255,255,255,1),
                  0 0 50px rgba(229,231,235,0.8),
                  0 0 75px rgba(209,213,219,0.6),
                  0 0 100px rgba(156,163,175,0.4)
                `,
                    animation: "pulse 0.5s ease-in-out infinite",
                  }}
                />
                <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden bg-white p-1">
                  <Image
                    src="/images/codepulse-logo.png"
                    alt="PulseCode Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    style={{
                      animation: "vibrateLogoImage 0.1s linear infinite",
                    }}
                  />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                {t.pulsecode?.title || "PulseCode: The Project Unifier"}
              </span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {t.pulsecode?.description ||
                "A project focused on helping various projects get developed for a fee of 500 WLD. What do we do with this fee? 50% - Liquidity, 50% - Repurchase, continuously increasing the value of PulseCode (PSC)."}
            </p>
          </>
        )
      case "codestaking":
        return (
          <div className="flex flex-col items-center justify-center text-gray-300 p-4">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300">
              {t.pulsecode?.footer?.codestakingTitle || "CodeStaking"}
            </h2>

            {isLoadingStakingData ? (
              <div className="flex items-center justify-center h-48">
                <svg
                  className="animate-spin h-8 w-8 text-cyan-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-3 text-lg">{t.common?.loading || "Loading..."}</span>
              </div>
            ) : stakingError ? (
              <div className="text-red-500 text-center text-sm">
                {stakingError}
                <Button onClick={fetchStakingData} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {t.common?.retry || "Retry"}
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t.staking?.yourStats || "Your Staking Stats"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.staking?.yourPscBalance || "Your PSC Balance"}:</span>
                      <span className="text-white font-medium">{Number(pscBalance).toLocaleString()} PSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.staking?.pendingRewards || "Pending Rewards"}:</span>
                      <span className="text-yellow-400 font-medium">
                        {Number(pendingRewards).toLocaleString(undefined, {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}{" "}
                        PSC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.staking?.totalClaimed || "Total Claimed"}:</span>
                      <span className="text-green-400 font-medium">
                        {Number(totalClaimedRewards).toLocaleString()} PSC
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleClaimRewards}
                    disabled={isClaiming || Number(pendingRewards) <= 0}
                    className="w-full mt-4 py-2 rounded-md font-medium text-white text-sm relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? (
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
                        {t.staking?.claiming || "Claiming..."}
                      </div>
                    ) : (
                      t.staking?.claimRewards || "Claim Rewards"
                    )}
                  </Button>
                </div>

                <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {t.staking?.contractStats || "Contract Stats"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.staking?.currentAPY || "Current APY"}:</span>
                      <span className="text-white font-medium">{stakingAPY}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t.staking?.contractBalance || "Contract Reward Balance"}:</span>
                      <span className="text-white font-medium">
                        {Number(contractRewardBalance).toLocaleString()} PSC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      case "projects":
        return (
          <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              {t.pulsecode?.footer?.projectsInDevelopment || "Projects in Development"}
            </h2>
            <div className="flex items-center gap-2">
              <Image
                src="/images/keplerpay-logo.png"
                alt="KeplerPay Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span>{t.pulsecode?.footer?.keplerPay || "KeplerPay (KPP)"}</span>
              <Hammer className="w-6 h-6 ml-2 animate-hammer" />
            </div>
          </div>
        )
      case "burn": // Integrated Furnace content
        return (
          <main className="relative flex min-h-[600px] flex-col items-center pt-4 pb-20 overflow-hidden w-full">
            {/* BackgroundEffect is handled by the main PulseCodePage */}

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

            {/* Estatísticas de queima */}
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

            {/* Fornalha Compacta */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-sm relative z-10 px-4"
            >
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden">
                {/* Estrutura externa da fornalha */}
                <div className="relative p-4 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700/50">
                  {/* Medidor de temperatura - mais compacto */}
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

                  {/* Fornalha 3D - mais compacta */}
                  <div
                    ref={furnaceRef}
                    className="relative w-full h-48 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700/50"
                  >
                    {/* Estrutura de tijolos */}
                    <div className="absolute inset-0">
                      {/* Padrão de tijolos */}
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

                      {/* Manchas e desgaste */}
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

                    {/* Porta da fornalha - mais compacta */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32">
                      {/* Moldura da porta */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-700 shadow-inner">
                        {/* Parafusos decorativos */}
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

                      {/* Porta com animação */}
                      <motion.div
                        className="absolute inset-0 origin-left bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-md overflow-hidden"
                        animate={{
                          rotateY: doorOpen ? 70 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      >
                        {/* Visor da porta */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
                            {/* Grade do visor */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-gray-700" />
                              <div className="h-full w-0.5 bg-gray-700" />
                            </div>

                            {/* Brilho do fogo através do visor */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-orange-600/60 via-orange-500/40 to-yellow-400/20"
                              animate={{
                                opacity: fireIntensity * 0.3,
                              }}
                            />
                          </div>
                        </div>

                        {/* Puxador da porta */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full border border-gray-600">
                          <div className="absolute inset-0 flex flex-col justify-center items-center gap-1">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="w-2 h-0.5 bg-gray-800 rounded-full" />
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Interior da fornalha (visível quando a porta está aberta) */}
                      <div className="absolute inset-0 -z-10 rounded-lg overflow-hidden">
                        {/* Fundo da câmara */}
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                          {/* Tijolos refratários */}
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

                        {/* Base de carvão/brasa */}
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
                                  duration: 1 + Math.random() * 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  repeatType: "reverse",
                                  delay: Math.random() * 2,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Fogo animado */}
                        <div className="absolute bottom-0 left-0 right-0 h-2/3 overflow-hidden">
                          {/* Base do fogo */}
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

                          {/* Chamas principais */}
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

                          {/* Partículas de fogo */}
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

                          {/* Fumaça */}
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

                        {/* Reflexo do fogo nas paredes */}
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

                        {/* Brilho pulsante */}
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

                    {/* Token sendo queimado */}
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
                            src="/images/codepulse-logo.png" // Changed to codepulse-logo.png
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

                    {/* Efeito de iluminação ambiente */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-orange-600/0 via-orange-500/0 to-transparent mix-blend-overlay pointer-events-none"
                      animate={{
                        opacity: fireIntensity * 0.15,
                      }}
                      transition={{ duration: 1 }}
                    />

                    {/* Brilho da fornalha no ambiente */}
                    <motion.div
                      className="absolute -inset-10 bg-orange-500/0 rounded-full blur-3xl pointer-events-none"
                      animate={{
                        backgroundColor: `rgba(249, 115, 22, ${0.05 * fireIntensity})`,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  {/* Controles e medidores - mais compactos */}
                  <div className="flex justify-between mt-3 gap-2">
                    {/* Botão de ignição */}
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

                    {/* Medidor de temperatura */}
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

                {/* Controles da fornalha - mais compactos */}
                <div className="p-3 bg-gray-800/50 border-t border-gray-700/30">
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

                  {/* Instruções */}
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

                {/* Painel de informações - mais compacto */}
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

            {/* Histórico de queima */}
            {burnTxHash && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-4 w-full max-w-sm px-4"
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects (similar to presentation page) */}
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

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg font-medium">{t.common?.back || "Back"}</span>
      </button>

      <div className="relative z-10 bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl p-8 max-w-2xl text-center shadow-2xl mb-20">
        {" "}
        {renderContent()}
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

      {/* Bottom Navigation Bar (local to PulseCodePage) */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs bg-black/70 backdrop-blur-md border border-white/10 rounded-full p-2 z-50">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "codestaking" ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
            }`}
            onClick={() => setActiveFooterTab("codestaking")}
          >
            <Coins className="w-6 h-6" />
          </Button>
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
          {/* New Burn Button */}
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

        @keyframes vibrateAura {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(0.5px, 0.5px);
          }
          50% {
            transform: translate(-0.5px, 0.5px);
          }
          75% {
            transform: translate(0.5px, -0.5px);
          }
          100% {
            transform: translate(-0.5px, -0.5px);
          }
        }

        @keyframes vibrateRing {
          0% {
            transform: translate(0) rotate(0deg);
          }
          25% {
            transform: translate(1px, 1px) rotate(90deg);
          }
          50% {
            transform: translate(-1px, 1px) rotate(180deg);
          }
          75% {
            transform: translate(1px, -1px) rotate(270deg);
          }
          100% {
            transform: translate(-1px, -1px) rotate(360deg);
          }
        }

        @keyframes vibrateLogo {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(0.3px, 0.3px);
          }
          50% {
            transform: translate(-0.3px, 0.3px);
          }
          75% {
            transform: translate(0.3px, -0.3px);
          }
          100% {
            transform: translate(-0.3px, -0.3px);
          }
        }

        @keyframes vibrateLogoImage {
          0% {
            transform: translate(0) scale(1);
          }
          25% {
            transform: translate(0.2px, 0.2px) scale(1.01);
          }
          50% {
            transform: translate(-0.2px, 0.2px) scale(0.99);
          }
          75% {
            transform: translate(0.2px, -0.2px) scale(1.01);
          }
          100% {
            transform: translate(-0.2px, -0.2px) scale(0.99);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes hammer {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-20deg);
          }
          50% {
            transform: rotate(0deg);
          }
          75% {
            transform: rotate(20deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-hammer {
          animation: hammer 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
