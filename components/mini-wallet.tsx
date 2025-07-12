"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowUpDown, Wallet, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { useMiniKit } from "@/hooks/use-minikit"
import {
  getRealQuote,
  doSwap,
  validateContracts,
  testSwapHelper,
  debugHoldstationSDK,
  TOKENS,
} from "@/services/swap-service"

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logo: string
  color: string
}

interface SwapState {
  fromAmount: string
  toAmount: string
  isLoading: boolean
  error: string | null
  success: string | null
  quote: any
  isSwapping: boolean
}

function safeFormatNumber(value: string | number, decimals = 6): string {
  try {
    const num = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(num) || num === 0) return "0"

    // For very small numbers, use more decimal places
    if (num < 0.000001) {
      return num.toExponential(3)
    }

    // For small numbers, use up to 8 decimal places
    if (num < 1) {
      return num.toFixed(8).replace(/\.?0+$/, "")
    }

    // For larger numbers, use fewer decimal places
    return num.toFixed(decimals).replace(/\.?0+$/, "")
  } catch (error) {
    console.error("Error formatting number:", error)
    return "0"
  }
}

export default function MiniWallet() {
  const { isConnected, walletAddress, balance, connectWallet, paymentStatus } = useMiniKit()

  const [fromToken] = useState<Token>(TOKENS.find((t) => t.symbol === "WLD")!)
  const [toToken] = useState<Token>(TOKENS.find((t) => t.symbol === "TPF")!)

  const [swapState, setSwapState] = useState<SwapState>({
    fromAmount: "",
    toAmount: "",
    isLoading: false,
    error: null,
    success: null,
    quote: null,
    isSwapping: false,
  })

  const [balanceInfo, setBalanceInfo] = useState({
    wld: "0",
    tpf: "0",
    isLoading: false,
  })

  // Clear messages after 5 seconds
  useEffect(() => {
    if (swapState.error || swapState.success) {
      const timer = setTimeout(() => {
        setSwapState((prev) => ({ ...prev, error: null, success: null }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [swapState.error, swapState.success])

  // Update balance when wallet connects
  useEffect(() => {
    if (isConnected && balance) {
      setBalanceInfo((prev) => ({
        ...prev,
        wld: balance,
      }))
    }
  }, [isConnected, balance])

  const handleGetQuote = async () => {
    if (!swapState.fromAmount || Number.parseFloat(swapState.fromAmount) <= 0) {
      setSwapState((prev) => ({ ...prev, error: "Please enter a valid amount" }))
      return
    }

    setSwapState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      success: null,
      toAmount: "",
      quote: null,
    }))

    try {
      console.log("🔄 Getting quote for:", swapState.fromAmount, "WLD")

      const result = await getRealQuote(swapState.fromAmount)

      console.log("✅ Quote received:", result)

      setSwapState((prev) => ({
        ...prev,
        toAmount: safeFormatNumber(result.outputAmount),
        quote: result.quote,
        success: `Quote received: ${safeFormatNumber(result.outputAmount)} TPF`,
        isLoading: false,
      }))
    } catch (error) {
      console.error("❌ Quote error:", error)
      setSwapState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to get quote",
        isLoading: false,
      }))
    }
  }

  const handleSwap = async () => {
    if (!isConnected) {
      setSwapState((prev) => ({ ...prev, error: "Please connect your wallet first" }))
      return
    }

    if (!swapState.quote) {
      setSwapState((prev) => ({ ...prev, error: "Please get a quote first" }))
      return
    }

    // Check if user has sufficient balance
    const userBalance = Number.parseFloat(balanceInfo.wld)
    const swapAmount = Number.parseFloat(swapState.fromAmount)

    if (userBalance < swapAmount) {
      setSwapState((prev) => ({
        ...prev,
        error: `Insufficient balance. You have ${safeFormatNumber(userBalance)} WLD but need ${safeFormatNumber(swapAmount)} WLD`,
      }))
      return
    }

    setSwapState((prev) => ({
      ...prev,
      isSwapping: true,
      error: null,
      success: null,
    }))

    try {
      console.log("🚀 Starting swap...")

      const result = await doSwap({
        walletAddress: walletAddress!,
        quote: swapState.quote,
        amountIn: swapState.fromAmount,
      })

      console.log("✅ Swap completed:", result)

      setSwapState((prev) => ({
        ...prev,
        success: `Swap successful! Transaction ID: ${result.transactionId}`,
        isSwapping: false,
        fromAmount: "",
        toAmount: "",
        quote: null,
      }))

      // Refresh balance after successful swap
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("❌ Swap error:", error)
      setSwapState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Swap failed",
        isSwapping: false,
      }))
    }
  }

  const handleTestSDK = async () => {
    try {
      console.log("🧪 Testing SDK...")
      await debugHoldstationSDK()
      await validateContracts()
      await testSwapHelper()
      setSwapState((prev) => ({ ...prev, success: "SDK test completed successfully!" }))
    } catch (error) {
      console.error("❌ SDK test failed:", error)
      setSwapState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "SDK test failed",
      }))
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Mini Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">Connect your wallet to start swapping</div>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
          <Button onClick={handleTestSDK} variant="outline" className="w-full bg-transparent">
            Test SDK
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-5 w-5" />
          Mini Wallet
        </CardTitle>
        <div className="text-center space-y-1">
          <div className="text-sm text-muted-foreground">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </div>
          <Badge variant="secondary">{safeFormatNumber(balanceInfo.wld)} WLD</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {swapState.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{swapState.error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {swapState.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{swapState.success}</AlertDescription>
          </Alert>
        )}

        {/* From Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 flex-1">
              <img src={fromToken.logo || "/placeholder.svg"} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
              <span className="font-medium">{fromToken.symbol}</span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={swapState.fromAmount}
              onChange={(e) =>
                setSwapState((prev) => ({
                  ...prev,
                  fromAmount: e.target.value,
                  toAmount: "",
                  quote: null,
                  error: null,
                  success: null,
                }))
              }
              className="w-32 text-right"
              step="0.000001"
              min="0"
            />
          </div>
          <div className="text-xs text-muted-foreground">Balance: {safeFormatNumber(balanceInfo.wld)} WLD</div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <div className="p-2 rounded-full bg-muted">
            <ArrowUpDown className="h-4 w-4" />
          </div>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 flex-1">
              <img src={toToken.logo || "/placeholder.svg"} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
              <span className="font-medium">{toToken.symbol}</span>
            </div>
            <Input
              type="text"
              placeholder="0.0"
              value={swapState.toAmount}
              readOnly
              className="w-32 text-right bg-muted"
            />
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleGetQuote}
            disabled={swapState.isLoading || !swapState.fromAmount}
            className="w-full bg-transparent"
            variant="outline"
          >
            {swapState.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Quote...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Get Quote
              </>
            )}
          </Button>

          <Button
            onClick={handleSwap}
            disabled={
              swapState.isSwapping ||
              !swapState.quote ||
              Number.parseFloat(balanceInfo.wld) < Number.parseFloat(swapState.fromAmount || "0")
            }
            className="w-full"
          >
            {swapState.isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              "Execute Swap"
            )}
          </Button>
        </div>

        {/* Debug Button */}
        <Button onClick={handleTestSDK} variant="ghost" size="sm" className="w-full">
          Test SDK
        </Button>

        {/* Payment Status */}
        {paymentStatus && (
          <div className="text-xs text-center text-muted-foreground">Payment Status: {paymentStatus}</div>
        )}
      </CardContent>
    </Card>
  )
}
