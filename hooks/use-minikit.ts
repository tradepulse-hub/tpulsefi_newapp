"use client"

import { useState, useEffect, useCallback } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useToast } from "./use-toast"

interface MiniKitUser {
  walletAddress: string
  username?: string
}

interface MiniKitContext {
  user: MiniKitUser | null
  isAuthenticated: boolean
  isLoading: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  closeMiniKitUI: () => void
}

export function useMiniKit(): MiniKitContext {
  const [user, setUser] = useState<MiniKitUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const checkSession = useCallback(async () => {
    console.log("[MiniKit] Checking session...")
    try {
      const res = await fetch("/api/session")
      const data = await res.json()

      if (data.authenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        console.log(`[MiniKit] Session active for: ${data.user.walletAddress}`)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        console.log("[MiniKit] No active session found.")
      }
    } catch (error) {
      console.error(`[MiniKit] Error checking session: ${error instanceof Error ? error.message : String(error)}`)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const connectWallet = useCallback(async () => {
    console.log("[MiniKit] Connect wallet initiated...")
    setIsLoading(true)
    try {
      if (!MiniKit.isInstalled()) {
        console.log("[MiniKit] MiniKit not installed. Attempting to install...")
        MiniKit.install({
          appId: process.env.NEXT_PUBLIC_APP_ID || "app_staging_b8e2b5b5c6b8e2b5b5c6b8e2",
          enableTelemetry: true,
        })
        console.log("[MiniKit] MiniKit installed.")
      }

      console.log("[MiniKit] Fetching nonce from /api/nonce...")
      const nonceRes = await fetch("/api/nonce")
      if (!nonceRes.ok) {
        throw new Error(`Failed to fetch nonce: ${nonceRes.statusText}`)
      }
      const { nonce } = await nonceRes.json()
      console.log(`[MiniKit] Nonce received: ${nonce}`)

      console.log("[MiniKit] Calling MiniKit.commandsAsync.walletAuth...")
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "This is my statement and here is a link https://worldcoin.com/apps",
      })
      console.log(`[MiniKit] WalletAuth finalPayload status: ${finalPayload.status}`)

      if (finalPayload.status === "error") {
        throw new Error(`WalletAuth failed: ${finalPayload.message || "Unknown error"}`)
      }

      console.log("[MiniKit] Sending payload to /api/complete-siwe...")
      const completeSiweRes = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      if (!completeSiweRes.ok) {
        const errorData = await completeSiweRes.json()
        throw new Error(`SIWE completion failed: ${errorData.message || completeSiweRes.statusText}`)
      }

      const completeSiweData = await completeSiweRes.json()
      if (completeSiweData.isValid) {
        console.log("[MiniKit] SIWE verification successful. Session established.")
        toast({
          title: "Conectado!",
          description: "A sua carteira foi conectada com sucesso.",
          variant: "default",
        })
        await checkSession()
      } else {
        throw new Error(`SIWE verification failed: ${completeSiweData.message || "Invalid message"}`)
      }
    } catch (error) {
      console.error(`[MiniKit] Connect wallet error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Erro na Conexão",
        description: error instanceof Error ? error.message : "Não foi possível conectar a carteira.",
        variant: "destructive",
      })
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [checkSession, toast])

  const disconnectWallet = useCallback(async () => {
    console.log("[MiniKit] Disconnect wallet initiated...")
    setIsLoading(true)
    try {
      const res = await fetch("/api/logout", { method: "POST" })
      if (!res.ok) {
        throw new Error(`Logout failed: ${res.statusText}`)
      }
      console.log("[MiniKit] Logout successful.")
      toast({
        title: "Desconectado!",
        description: "A sua carteira foi desconectada.",
        variant: "default",
      })
      setUser(null)
      setIsAuthenticated(false)
      if (MiniKit.isInstalled()) {
        MiniKit.disconnect()
        console.log("[MiniKit] MiniKit disconnected.")
      }
    } catch (error) {
      console.error(`[MiniKit] Disconnect wallet error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Erro ao Desconectar",
        description: error instanceof Error ? error.message : "Não foi possível desconectar a carteira.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const closeMiniKitUI = useCallback(() => {
    if (MiniKit.isInstalled()) {
      MiniKit.close()
      console.log("[MiniKit] MiniKit UI closed.")
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    connectWallet,
    disconnectWallet,
    closeMiniKitUI,
  }
}
