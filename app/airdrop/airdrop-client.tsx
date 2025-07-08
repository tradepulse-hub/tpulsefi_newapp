"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Coins, Gift, Lock, Shield, CheckCircle, ArrowLeft, X, Clock } from "lucide-react"
import { MiniKit, type VerifyCommandInput, VerificationLevel, type ISuccessResult } from "@worldcoin/minikit-js"
import { useI18n } from "@/lib/i18n/context"

export default function AirdropClient() {
  const { t } = useI18n()

  const [chainsBreaking, setChainsBreaking] = useState(false)
  const [chainsBroken, setChainsBroken] = useState(false)
  const [worldIdVerifying, setWorldIdVerifying] = useState(false)
  const [worldIdVerified, setWorldIdVerified] = useState(false)
  const [worldIdFailed, setWorldIdFailed] = useState(false)
  const [boxOpened, setBoxOpened] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [showReward, setShowReward] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownTime, setCountdownTime] = useState(24 * 60 * 60) // 24 hours in seconds
  const [isInCooldown, setIsInCooldown] = useState(false)

  // Check localStorage for existing cooldown on component mount
  useEffect(() => {
    const checkCooldownStatus = () => {
      const lastClaimTime = localStorage.getItem("airdrop_last_claim")
      if (lastClaimTime) {
        const lastClaimTimestamp = Number.parseInt(lastClaimTime)
        const now = Date.now()
        const timeDiff = now - lastClaimTimestamp
        const cooldownPeriod = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        if (timeDiff < cooldownPeriod) {
          // Still in cooldown
          const remainingTime = Math.ceil((cooldownPeriod - timeDiff) / 1000)
          setCountdownTime(remainingTime)
          setShowCountdown(true)
          setIsInCooldown(true)
          setCanClaim(false)
        } else {
          // Cooldown expired, clear localStorage
          localStorage.removeItem("airdrop_last_claim")
          setIsInCooldown(false)
          setShowCountdown(false)
        }
      }
    }

    checkCooldownStatus()
  }, [])

  // Reset World ID verification on component mount to ensure fresh verification each time
  useEffect(() => {
    if (!isInCooldown) {
      setWorldIdVerified(false)
      setWorldIdFailed(false)
      setChainsBroken(false)
      setBoxOpened(false)
      setShowReward(false)
      setCanClaim(false)
    }
  }, [isInCooldown])

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showCountdown && countdownTime > 0) {
      interval = setInterval(() => {
        setCountdownTime((prev) => {
          if (prev <= 1) {
            // Countdown finished
            setShowCountdown(false)
            setIsInCooldown(false)
            setCanClaim(false)
            setBoxOpened(false)
            setShowReward(false)
            setChainsBroken(false)
            setWorldIdVerified(false)
            localStorage.removeItem("airdrop_last_claim")
            return 24 * 60 * 60 // Reset to 24 hours
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showCountdown, countdownTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    }
  }

  const startCooldown = () => {
    const now = Date.now()
    localStorage.setItem("airdrop_last_claim", now.toString())
    setCountdownTime(24 * 60 * 60) // 24 hours
    setShowCountdown(true)
    setIsInCooldown(true)
    setCanClaim(false)
  }

  const handleBoxClick = async () => {
    // Don't allow interaction if in cooldown
    if (isInCooldown || showCountdown) {
      return
    }

    if (!chainsBroken && !chainsBreaking) {
      // First phase: break chains
      setChainsBreaking(true)

      setTimeout(() => {
        setChainsBroken(true)
        setChainsBreaking(false)
        // Start World ID verification
        handleWorldIdVerification()
      }, 1500)
    }
  }

  const proceedAfterVerification = () => {
    setWorldIdVerified(true)
    setWorldIdVerifying(false)
    setWorldIdFailed(false)

    // Open box after verification
    setTimeout(() => {
      setBoxOpened(true)
      setTimeout(() => {
        setShowReward(true)
        setCanClaim(true)
      }, 1000)
    }, 500)
  }

  const failVerification = () => {
    setWorldIdVerified(false)
    setWorldIdVerifying(false)
    setWorldIdFailed(true)
  }

  const handleWorldIdVerification = async () => {
    setWorldIdVerifying(true)
    setWorldIdFailed(false)
    setClaimError(null)

    try {
      if (!MiniKit.isInstalled()) {
        console.log("MiniKit not installed, simulating error...")
        setTimeout(() => {
          proceedAfterVerification() // Se der erro → World ID verificado
        }, 2000)
        return
      }

      const verifyPayload: VerifyCommandInput = {
        action: "world_id",
        signal: `airdrop_${Date.now()}`,
        verification_level: VerificationLevel.Orb,
      }

      try {
        console.log("Starting World ID verification...")

        // Set up a timeout - Se demorar mais de 10 segundos → World ID não verificado
        const verificationTimeout = setTimeout(() => {
          console.log("World ID verification timeout - NOT VERIFIED")
          failVerification()
        }, 10000) // 10 seconds timeout

        const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

        // Clear the timeout since we got a response
        clearTimeout(verificationTimeout)

        console.log("World ID verification response:", finalPayload)

        // Se clicar X (cancelar) → World ID não verificado
        if (finalPayload.status === "error") {
          console.log("World ID verification cancelled by user - NOT VERIFIED")
          failVerification()
          return
        }

        // Try backend verification but don't fail if it doesn't work
        try {
          const verifyResponse = await fetch("/api/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: finalPayload as ISuccessResult,
              action: "world_id",
              signal: verifyPayload.signal,
            }),
          })

          const verifyResponseJson = await verifyResponse.json()
          console.log("Backend verification response:", verifyResponseJson)
        } catch (backendError) {
          console.log("Backend verification error, but continuing anyway:", backendError)
        }

        // Success case
        proceedAfterVerification()
      } catch (verifyError) {
        console.log("World ID verification error - VERIFIED (as per requirements):", verifyError)
        // Se der erro → World ID verificado
        proceedAfterVerification()
      }
    } catch (error) {
      console.log("General error in World ID verification - VERIFIED (as per requirements):", error)
      // Se der erro → World ID verificado
      proceedAfterVerification()
    }
  }

  const handleClaim = async () => {
    if (!canClaim || isClaiming) return

    try {
      setIsClaiming(true)
      setClaimError(null)
      setClaimSuccess(false)

      console.log("Starting claim process...")

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Use the real contract address and ABI
      const contractAddress = "0x993814a0AEc15a7EcFa9Bd26B4Fd3F62cAd07e81"
      const contractABI = [
        {
          inputs: [],
          name: "claimAirdrop",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "dailyAirdropAmount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "lastClaimTime",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ]

      console.log("Calling MiniKit.commandsAsync.sendTransaction...")
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: contractAddress,
            abi: contractABI,
            functionName: "claimAirdrop",
            args: [],
          },
        ],
      })

      console.log("MiniKit transaction response:", finalPayload)

      if (finalPayload.status === "error") {
        console.error("Error claiming airdrop:", finalPayload.message)

        // Check if error is due to already claimed (24h cooldown)
        if (
          finalPayload.message &&
          (finalPayload.message.includes("Wait 24h") ||
            finalPayload.message.includes("24h between claims") ||
            finalPayload.message.includes("already claimed"))
        ) {
          // Start cooldown even on error if it's due to already claimed
          setTimeout(() => {
            setClaimSuccess(false)
            startCooldown()
          }, 2000)
          setClaimError("You have already claimed today. Please wait 24 hours.")
        } else {
          throw new Error(finalPayload.message || "Failed to claim airdrop")
        }
        return
      }

      console.log("Airdrop claimed successfully:", finalPayload)

      setClaimSuccess(true)
      setCanClaim(false)

      // Start cooldown after successful claim
      setTimeout(() => {
        setClaimSuccess(false)
        startCooldown()
      }, 3000)
    } catch (error) {
      console.error("Error claiming airdrop:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      // Check if error is due to already claimed
      if (
        errorMessage.includes("Wait 24h") ||
        errorMessage.includes("24h between claims") ||
        errorMessage.includes("already claimed")
      ) {
        setTimeout(() => {
          setClaimSuccess(false)
          startCooldown()
        }, 2000)
        setClaimError("You have already claimed today. Please wait 24 hours.")
      } else {
        setClaimError(t.airdrop.claimFailed)
      }
    } finally {
      setIsClaiming(false)
    }
  }

  const timeDisplay = formatTime(countdownTime)

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full text-white hover:bg-gray-800/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t.common.back}</span>
        </Link>
      </div>

      {/* Moving Light Lines Background - Same as presentation.tsx */}
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

      {/* Static Grid */}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center px-4">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-300">
              {t.airdrop.title}
            </span>
          </h1>
          <p className="text-gray-400 text-sm">{t.airdrop.everyDayReward}</p>
        </motion.div>

        {/* Countdown Timer - Show if in cooldown */}
        <AnimatePresence>
          {showCountdown && isInCooldown && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="mb-8 relative z-10"
            >
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-medium text-sm">{t.airdrop.nextClaimIn}</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {/* Hours */}
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-bold text-white tabular-nums"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 20px rgba(255,255,255,0.8)",
                          "0 0 10px rgba(255,255,255,0.5)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {timeDisplay.hours}
                    </motion.div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{t.airdrop.hours}</div>
                  </div>

                  <div className="text-2xl text-white font-bold">:</div>

                  {/* Minutes */}
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-bold text-white tabular-nums"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 20px rgba(255,255,255,0.8)",
                          "0 0 10px rgba(255,255,255,0.5)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                    >
                      {timeDisplay.minutes}
                    </motion.div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{t.airdrop.minutes}</div>
                  </div>

                  <div className="text-2xl text-white font-bold">:</div>

                  {/* Seconds */}
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-bold text-white tabular-nums"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 20px rgba(255,255,255,0.8)",
                          "0 0 10px rgba(255,255,255,0.5)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                    >
                      {timeDisplay.seconds}
                    </motion.div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{t.airdrop.seconds}</div>
                  </div>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* World ID Status */}
        <AnimatePresence>
          {worldIdVerifying && !isInCooldown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-t-blue-400 border-blue-700 rounded-full animate-spin" />
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">{t.airdrop.verifying}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {worldIdVerified && !boxOpened && !isInCooldown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">{t.airdrop.verified}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {worldIdFailed && !isInCooldown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <X className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">{t.airdrop.verificationFailed}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Surprise Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 relative"
        >
          <div className="relative w-64 h-64 mx-auto">
            {/* Box Container */}
            <motion.div
              className={`absolute inset-0 ${isInCooldown ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              onClick={handleBoxClick}
              whileHover={{ scale: chainsBroken || isInCooldown ? 1 : 1.05 }}
              whileTap={{ scale: chainsBroken || isInCooldown ? 1 : 0.95 }}
            >
              {/* Box Base */}
              <div className="relative w-full h-full">
                {/* Box Bottom */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-32 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 rounded-lg shadow-2xl border-4 border-yellow-400/50"
                  style={{
                    boxShadow: `
                      0 0 30px rgba(251, 191, 36, 0.5),
                      inset 0 0 20px rgba(255, 255, 255, 0.2)
                    `,
                  }}
                >
                  {/* Box Pattern */}
                  <div className="absolute inset-2 border-2 border-yellow-300/30 rounded" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Gift className="w-8 h-8 text-yellow-200" />
                  </div>
                </motion.div>

                {/* Box Lid - Moved further down from top-12 to top-16 */}
                <AnimatePresence>
                  {!boxOpened && (
                    <motion.div
                      className="absolute top-16 left-1/2 transform -translate-x-1/2 w-48 h-16 bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 rounded-lg shadow-xl border-4 border-yellow-300/50"
                      style={{
                        boxShadow: `
                          0 0 25px rgba(251, 191, 36, 0.4),
                          inset 0 0 15px rgba(255, 255, 255, 0.3)
                        `,
                      }}
                      exit={{
                        rotateX: -120,
                        y: -50,
                        opacity: 0.7,
                        transition: { duration: 0.8, ease: "easeOut" },
                      }}
                    >
                      <div className="absolute inset-2 border-2 border-yellow-200/40 rounded" />
                      {/* Ribbon */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-2 bg-gradient-to-r from-red-500 to-red-600 shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chain - Only Horizontal - Adjusted position to match new lid position */}
                <AnimatePresence>
                  {!chainsBroken && (
                    <motion.div
                      className="absolute top-28 left-1/2 transform -translate-x-1/2 w-52 h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-lg"
                      style={{
                        boxShadow: `
                          0 0 10px rgba(107, 114, 128, 0.8),
                          inset 0 0 5px rgba(255, 255, 255, 0.3)
                        `,
                      }}
                      exit={{
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.5, ease: "easeOut" },
                      }}
                    >
                      {/* Chain Links */}
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={`chain-link-${i}`}
                          className="absolute w-6 h-3 border-2 border-gray-400 rounded-full bg-gradient-to-b from-gray-300 to-gray-500"
                          style={{
                            left: `${i * 20}px`,
                            top: "-5px",
                            boxShadow: "inset 0 0 3px rgba(255,255,255,0.5)",
                          }}
                          animate={
                            chainsBreaking
                              ? {
                                  scale: [1, 0.8, 0],
                                  opacity: [1, 0.5, 0],
                                  y: [0, 10, 20],
                                }
                              : {}
                          }
                          transition={{ delay: i * 0.05 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Padlock - Adjusted position to match new chain position */}
                <AnimatePresence>
                  {!chainsBroken && (
                    <motion.div
                      className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30"
                      exit={{
                        scale: 0,
                        rotate: 180,
                        opacity: 0,
                        transition: { duration: 0.5, ease: "easeOut" },
                      }}
                    >
                      <div className="relative">
                        {/* Padlock Glow */}
                        <div
                          className="absolute inset-0 bg-gray-300 rounded-lg blur-sm"
                          style={{
                            boxShadow: `
                              0 0 20px rgba(156, 163, 175, 0.8),
                              0 0 40px rgba(156, 163, 175, 0.6)
                            `,
                          }}
                        />
                        {/* Padlock Body */}
                        <div className="relative bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 w-10 h-12 rounded-lg border-2 border-gray-200 shadow-xl">
                          {/* Padlock Shackle */}
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 border-4 border-gray-300 rounded-t-full bg-transparent" />
                          {/* Keyhole */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Lock className="w-4 h-4 text-gray-700" />
                          </div>
                          {/* Metallic shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-lg" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chain Breaking Effect */}
                {chainsBreaking && (
                  <>
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={`break-particle-${i}`}
                        className="absolute w-1 h-1 bg-gray-400 rounded-full"
                        initial={{
                          x: 120,
                          y: 120,
                          scale: 1,
                          opacity: 1,
                        }}
                        animate={{
                          x: 120 + (Math.random() - 0.5) * 200,
                          y: 120 + (Math.random() - 0.5) * 200,
                          scale: [1, 0.5, 0],
                          opacity: [1, 0.8, 0],
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Sparkles Effect */}
                {boxOpened && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={`sparkle-${i}`}
                        className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                        initial={{
                          x: 120,
                          y: 120,
                          scale: 0,
                          opacity: 1,
                        }}
                        animate={{
                          x: 120 + Math.cos((i * Math.PI * 2) / 12) * 100,
                          y: 120 + Math.sin((i * Math.PI * 2) / 12) * 100,
                          scale: [0, 1, 0],
                          opacity: [1, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </>
                )}

                {/* TPF Logo Reveal */}
                <AnimatePresence>
                  {showReward && (
                    <motion.div
                      className="absolute top-4 left-1/2 transform -translate-x-1/2"
                      initial={{ y: 50, opacity: 0, scale: 0.5 }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotateY: [0, 360],
                      }}
                      transition={{
                        duration: 1,
                        rotateY: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                      }}
                    >
                      <div className="relative w-24 h-24">
                        {/* Glow Effect */}
                        <div
                          className="absolute inset-0 bg-white rounded-full"
                          style={{
                            boxShadow: `
                              0 0 40px rgba(255, 255, 255, 0.8),
                              0 0 80px rgba(255, 255, 255, 0.6),
                              0 0 120px rgba(255, 255, 255, 0.4)
                            `,
                            animation: "pulse 1s ease-in-out infinite",
                          }}
                        />
                        <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-white p-1">
                          <Image
                            src="/images/logo-tpf.png"
                            alt="TPF Logo"
                            width={88}
                            height={88}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Click instruction */}
          {!chainsBroken && !chainsBreaking && !isInCooldown && (
            <motion.p
              className="text-gray-400 text-sm mt-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {t.airdrop.clickToBreakChain}
            </motion.p>
          )}

          {chainsBreaking && (
            <motion.p
              className="text-yellow-400 text-sm mt-4 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
            >
              {t.airdrop.breakingChain}
            </motion.p>
          )}

          {isInCooldown && (
            <motion.p
              className="text-red-400 text-sm mt-4 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Wait for the countdown to finish
            </motion.p>
          )}
        </motion.div>

        {/* Claim Button */}
        <AnimatePresence>
          {showReward && !showCountdown && !isInCooldown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <button
                className={`w-56 py-3 px-5 rounded-full ${
                  canClaim
                    ? "bg-gradient-to-b from-gray-300 to-gray-400 text-gray-800 hover:from-gray-200 hover:to-gray-300"
                    : "bg-gradient-to-b from-gray-700 to-gray-800 text-gray-400"
                } font-bold text-sm shadow-lg border border-gray-300/30 relative overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200`}
                onClick={handleClaim}
                disabled={!canClaim || isClaiming}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${canClaim ? "from-white/30" : "from-white/10"} to-transparent opacity-70`}
                />
                <div className="relative flex items-center justify-center gap-2">
                  {isClaiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-gray-800 border-gray-400 rounded-full animate-spin" />
                      <span>{t.airdrop.processing}</span>
                    </>
                  ) : canClaim ? (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>{t.airdrop.claim}</span>
                    </>
                  ) : (
                    <span>{t.airdrop.claimed}</span>
                  )}
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {claimSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-center relative z-10"
            >
              <div className="flex items-center justify-center gap-2">
                <Coins className="text-green-400" size={16} />
                <span className="font-medium text-green-400">{t.airdrop.claimSuccessful}!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {claimError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-center relative z-10"
            >
              <span className="text-red-400">{claimError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Particles */}
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
    </div>
  )
}
