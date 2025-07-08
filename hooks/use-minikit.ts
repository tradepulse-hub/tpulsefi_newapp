"use client"

import { useState, useEffect, useCallback } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

interface User {
  walletAddress: string
  username?: string
}

export function useMiniKit() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/session")
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setUser(data.user)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()
  }, [])

  const connectWallet = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit not available. Please use World App.")
    }

    setIsLoading(true)
    try {
      // Get nonce from backend
      const nonceResponse = await fetch("/api/nonce")
      const { nonce } = await nonceResponse.json()

      // Execute wallet auth
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "Sign in to TPF Airdrop Platform",
        requestId: crypto.randomUUID(),
      })

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.message || "Wallet authentication failed")
      }

      // Verify the signature on backend
      const verifyResponse = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResult.isValid) {
        throw new Error("Signature verification failed")
      }

      // Set user data
      const userData = {
        walletAddress: finalPayload.address,
        username: MiniKit.user?.username,
      }

      setUser(userData)
      setIsAuthenticated(true)

      return userData
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnectWallet = useCallback(async () => {
    try {
      console.log("🔌 Disconnecting wallet...")

      // Clear local state
      setUser(null)
      setIsAuthenticated(false)

      // Clear localStorage
      localStorage.removeItem("minikit-user")
      localStorage.removeItem("worldid-verification")

      // Call logout API to clear server session
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("✅ Wallet disconnected successfully")
    } catch (error) {
      console.error("❌ Error disconnecting wallet:", error)
      // Even if there's an error, clear local state
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem("minikit-user")
      localStorage.removeItem("worldid-verification")
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    connectWallet,
    disconnectWallet,
  }
}
