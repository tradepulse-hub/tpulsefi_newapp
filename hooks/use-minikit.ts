"use client"

import { useState, useEffect, useCallback } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useToast } from "./use-toast" // Import useToast

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
  logs: string[] // Adicionado para depuração
  clearLogs: () => void // Adicionado para depuração
}

export function useMiniKit(): MiniKitContext {
  const [user, setUser] = useState<MiniKitUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([]) // Estado para logs
  const { toast } = useToast() // Usar o hook useToast

  const addLog = useCallback((message: string, type: "info" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prevLogs) => [`[${timestamp}] [${type.toUpperCase()}] ${message}`, ...prevLogs].slice(0, 50)) // Limita a 50 logs
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Função para verificar a sessão no backend
  const checkSession = useCallback(async () => {
    addLog("Checking session...")
    try {
      const res = await fetch("/api/session")
      const data = await res.json()

      if (data.authenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        addLog(`Session active for: ${data.user.walletAddress}`)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        addLog("No active session found.")
      }
    } catch (error) {
      addLog(`Error checking session: ${error instanceof Error ? error.message : String(error)}`, "error")
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [addLog])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const connectWallet = useCallback(async () => {
    addLog("Connect wallet initiated...")
    setIsLoading(true)
    try {
      if (!MiniKit.isInstalled()) {
        addLog("MiniKit not installed. Attempting to install...")
        MiniKit.install({
          appId: process.env.NEXT_PUBLIC_APP_ID || "app_staging_b8e2b5b5c6b8e2b5b5c6b8e2",
          enableTelemetry: true,
        })
        addLog("MiniKit installed.")
      }

      addLog("Fetching nonce from /api/nonce...")
      const nonceRes = await fetch("/api/nonce")
      if (!nonceRes.ok) {
        throw new Error(`Failed to fetch nonce: ${nonceRes.statusText}`)
      }
      const { nonce } = await nonceRes.json()
      addLog(`Nonce received: ${nonce}`)

      addLog("Calling MiniKit.commandsAsync.walletAuth...")
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "This is my statement and here is a link https://worldcoin.com/apps",
      })
      addLog(`WalletAuth finalPayload status: ${finalPayload.status}`)

      if (finalPayload.status === "error") {
        throw new Error(`WalletAuth failed: ${finalPayload.message || "Unknown error"}`)
      }

      addLog("Sending payload to /api/complete-siwe...")
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
        addLog("SIWE verification successful. Session established.")
        toast({
          title: "Conectado!",
          description: "A sua carteira foi conectada com sucesso.",
          variant: "default",
        })
        await checkSession() // Re-check session to update user state
      } else {
        throw new Error(`SIWE verification failed: ${completeSiweData.message || "Invalid message"}`)
      }
    } catch (error) {
      addLog(`Connect wallet error: ${error instanceof Error ? error.message : String(error)}`, "error")
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
  }, [addLog, checkSession, toast])

  const disconnectWallet = useCallback(async () => {
    addLog("Disconnect wallet initiated...")
    setIsLoading(true)
    try {
      const res = await fetch("/api/logout", { method: "POST" })
      if (!res.ok) {
        throw new Error(`Logout failed: ${res.statusText}`)
      }
      addLog("Logout successful.")
      toast({
        title: "Desconectado!",
        description: "A sua carteira foi desconectada.",
        variant: "default",
      })
      setUser(null)
      setIsAuthenticated(false)
      if (MiniKit.isInstalled()) {
        MiniKit.disconnect()
        addLog("MiniKit disconnected.")
      }
    } catch (error) {
      addLog(`Disconnect wallet error: ${error instanceof Error ? error.message : String(error)}`, "error")
      toast({
        title: "Erro ao Desconectar",
        description: error instanceof Error ? error.message : "Não foi possível desconectar a carteira.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [addLog, toast])

  const closeMiniKitUI = useCallback(() => {
    if (MiniKit.isInstalled()) {
      MiniKit.close()
      addLog("MiniKit UI closed.")
    }
  }, [addLog])

  return {
    user,
    isAuthenticated,
    isLoading,
    connectWallet,
    disconnectWallet,
    closeMiniKitUI,
    logs,
    clearLogs,
  }
}
