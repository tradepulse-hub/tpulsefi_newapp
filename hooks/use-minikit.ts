"use client"

import { useCallback, useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

interface UseMiniKitResult {
  isConnecting: boolean
  isConnected: boolean
  address?: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  close: () => void
}

/**
 * Lightweight replacement for the old `useMiniKit` hook that wrapped
 * `@worldcoin/minikit-react`.
 * We interact directly with the MiniKit singleton from `@worldcoin/minikit-js`.
 */
export function useMiniKit(): UseMiniKitResult {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined
    return (MiniKit as any)?.walletAddress
  })

  const isConnected = !!address

  /**
   * Starts the Wallet Auth (SIWE) flow:
   *  1. GET /api/nonce  -> receives nonce & cookie
   *  2. MiniKit.commandsAsync.walletAuth({ nonce, … })
   *  3. POST /api/complete-siwe with the signed payload
   */
  const connect = useCallback(async () => {
    if (isConnecting || typeof window === "undefined") return
    if (!MiniKit.isInstalled()) {
      alert("MiniKit is not installed in World App")
      return
    }

    setIsConnecting(true)
    try {
      // 1. ask backend for the nonce
      const nonceRes = await fetch("/api/nonce")
      const { nonce } = await nonceRes.json()

      // 2. run walletAuth in World App
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(Date.now() - 60 * 1000),
      })

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.message || "User rejected signature")
      }

      // 3. send the signed message back to our backend
      const verifyRes = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      })

      const verifyJson = await verifyRes.json()
      if (!verifyJson.isValid) {
        throw new Error("SIWE signature verification failed")
      }

      // success 🎉
      setAddress(finalPayload.address)
    } catch (err) {
      console.error("Wallet connect error:", err)
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting])

  /**
   * Logs out: clears cookie on the backend and local MiniKit state.
   */
  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } catch (e) {
      console.warn("Logout API failed:", e)
    }
    // MiniKit exposes disconnect only inside World App
    ;(MiniKit as any)?.disconnect?.()
    setAddress(undefined)
  }, [])

  /**
   * Closes any open MiniKit drawer (if available)
   */
  const close = useCallback(() => {
    ;(MiniKit as any)?.close?.()
  }, [])

  /**
   * Keep address in sync if user reconnects outside React.
   */
  useEffect(() => {
    const id = setInterval(() => {
      // poll every 1 s – MiniKit doesn't provide a listener today
      const current = (MiniKit as any)?.walletAddress
      setAddress((prev) => (prev !== current ? current : prev))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return { isConnecting, isConnected, address, connect, disconnect, close }
}
