"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowUpDown, Wallet, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getRealQuote,
  doSwap,
  validateContracts,
  testSwapHelper,
  debugHoldstationSDK,
  TOKENS,
} from "@/services/swap-service"

interface MiniWalletProps {
  walletAddress?: string
  balance?: string
}

function safeFormatNumber(value: string | number, decimals = 18): string {
  try {
    if (!value || value === "0") return "0"

    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(numValue) || numValue === 0) return "0"

    // For very small numbers, use more precision
    if (numValue < 0.000001) {
      return numValue.toExponential(6)
    }

    // For normal numbers, use appropriate decimal places
    if (numValue < 1) {
      return numValue.toFixed(8).replace(/\.?0+$/, "")
    }

    return numValue.toFixed(6).replace(/\.?0+$/, "")
  } catch (error) {
    console.error("Error formatting number:", error)
    return "0"
  }
}

export default function MiniWallet({ walletAddress, balance }: MiniWalletProps) {
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSwapping, setIsSwapping] = useState(false)

  const wldToken = TOKENS.find((t) => t.symbol === "WLD")!
  const tpfToken = TOKENS.find((t) => t.symbol === "TPF")!

  // Debug functions
  const handleDebug = async () => {
    console.log("🔍 Starting debug...")
    try {
      await debugHoldstationSDK()
      await validateContracts()
      await testSwapHelper()
    } catch (error) {
      console.error("Debug failed:", error)
    }
  }

  // Get quote
  const handleGetQuote = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🔍 Getting quote for:", fromAmount, "WLD")

      const result = await getRealQuote(fromAmount)

      console.log("📊 Quote result:", result)

      if (result.quote && result.outputAmount) {
        setQuote(result.quote)
        const formattedOutput = safeFormatNumber(result.outputAmount, 18)
        setToAmount(formattedOutput)
        setSuccess(`Quote obtained: ${formattedOutput} TPF`)
      } else {
        throw new Error("Invalid quote response")
      }
    } catch (error: any) {
      console.error("❌ Quote error:", error)
      setError(`Failed to get quote: ${error.message}`)
      setToAmount("")
      setQuote(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Execute swap
  const handleSwap = async () => {
    if (!walletAddress) {
      setError("Wallet not connected")
      return
    }

    if (!quote || !fromAmount) {
      setError("Please get a quote first")
      return
    }

    // Check balance
    const userBalance = Number.parseFloat(balance || "0")
    const swapAmount = Number.parseFloat(fromAmount)

    if (userBalance < swapAmount) {
      setError(`Insufficient balance. You have ${userBalance} WLD but trying to swap ${swapAmount} WLD`)
      return
    }

    setIsSwapping(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🔄 Executing swap...")
      console.log("📊 Wallet:", walletAddress)
      console.log("📊 Amount:", fromAmount)
      console.log("📊 Quote:", quote)

      const result = await doSwap({
        walletAddress,
        quote,
        amountIn: fromAmount,
      })

      console.log("✅ Swap completed:", result)

      if (result.success) {
        setSuccess(`Swap successful! Transaction ID: ${result.transactionId}`)
        setFromAmount("")
        setToAmount("")
        setQuote(null)
      } else {
        throw new Error("Swap failed")
      }
    } catch (error: any) {
      console.error("❌ Swap error:", error)
      setError(`Swap failed: ${error.message}`)
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Mini Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Info */}
        {walletAddress && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <strong>Address:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
            <div className="text-sm text-gray-600">
              <strong>WLD Balance:</strong> {balance || "0"} WLD
            </div>
          </div>
        )}

        <Separator />

        {/* Swap Interface */}
        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">From</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wldToken.color }} />
                {wldToken.symbol}
              </Badge>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              disabled={isLoading || isSwapping}
            />
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">To</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tpfToken.color }} />
                {tpfToken.symbol}
              </Badge>
            </div>
            <Input type="text" placeholder="0.0" value={toAmount} readOnly disabled />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={handleGetQuote} disabled={isLoading || isSwapping || !fromAmount} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              "Get Quote"
            )}
          </Button>

          <Button
            onClick={handleSwap}
            disabled={!quote || isSwapping || !walletAddress}
            className="w-full"
            variant="default"
          >
            {isSwapping ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              "Execute Swap"
            )}
          </Button>

          <Button onClick={handleDebug} variant="outline" size="sm" className="w-full bg-transparent">
            Debug SDK
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Quote Info */}
        {quote && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Quote valid for swap</div>
            <div>Slippage: 0.3%</div>
            <div>Fee: 0.2%</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
