"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, TrendingUp, Clock, Award, CheckCircle, AlertCircle } from "lucide-react"
import { useMiniKit } from "@/hooks/use-minikit"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from "next/image"
import { useI18n } from "@/lib/i18n/context"

// Configuração dos contratos de staking
const STAKING_CONTRACTS = {
  WDD: {
    name: "World Drachma",
    symbol: "WDD",
    address: "0x1234567890123456789012345678901234567890",
    logo: "/images/drachma-token.png",
    apy: "12.5%",
  },
  TPT: {
    name: "TradePulse Token",
    symbol: "TPT",
    address: "0x0987654321098765432109876543210987654321",
    logo: "/images/logo-tpf.png",
    apy: "15.0%",
  },
  RFX: {
    name: "Roflex MemeToken",
    symbol: "RFX",
    address: "0x9FA697Ece25F4e2A94d7dEb99418B2b0c4b96FE2",
    logo: "/images/roflex-token.png",
    apy: "0.01%",
  },
}

// ABI do contrato de staking
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
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
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

interface StakingData {
  pendingRewards: string
  totalClaimed: string
  lastClaimTime: number
  isLoading: boolean
}

export default function FiStaking() {
  const { user, isAuthenticated } = useMiniKit()
  const { t } = useI18n()
  const [stakingData, setStakingData] = useState<Record<string, StakingData>>({})
  const [claimingToken, setClaimingToken] = useState<string | null>(null)

  // Inicializar dados de staking para todos os tokens
  useEffect(() => {
    const initialData: Record<string, StakingData> = {}
    Object.keys(STAKING_CONTRACTS).forEach((token) => {
      initialData[token] = {
        pendingRewards: "0.00",
        totalClaimed: "0.00",
        lastClaimTime: 0,
        isLoading: false,
      }
    })
    setStakingData(initialData)
  }, [])

  // Carregar dados de staking para um token específico
  const loadStakingData = async (tokenSymbol: string) => {
    if (!isAuthenticated || !user?.walletAddress) return

    setStakingData((prev) => ({
      ...prev,
      [tokenSymbol]: { ...prev[tokenSymbol], isLoading: true },
    }))

    try {
      const contract = STAKING_CONTRACTS[tokenSymbol as keyof typeof STAKING_CONTRACTS]

      // Simular dados de staking (em produção, chamar o contrato real)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData = {
        pendingRewards: (Math.random() * 10).toFixed(4),
        totalClaimed: (Math.random() * 100).toFixed(2),
        lastClaimTime: Date.now() - Math.random() * 86400000, // Último claim nas últimas 24h
        isLoading: false,
      }

      setStakingData((prev) => ({
        ...prev,
        [tokenSymbol]: mockData,
      }))
    } catch (error) {
      console.error(`Error loading ${tokenSymbol} staking data:`, error)
      setStakingData((prev) => ({
        ...prev,
        [tokenSymbol]: { ...prev[tokenSymbol], isLoading: false },
      }))
    }
  }

  // Carregar dados para todos os tokens quando autenticado
  useEffect(() => {
    if (isAuthenticated && user?.walletAddress) {
      Object.keys(STAKING_CONTRACTS).forEach((token) => {
        loadStakingData(token)
      })
    }
  }, [isAuthenticated, user?.walletAddress])

  // Função para fazer claim de rewards
  const handleClaimRewards = async (tokenSymbol: string) => {
    if (!isAuthenticated || !user?.walletAddress) return

    setClaimingToken(tokenSymbol)

    try {
      const contract = STAKING_CONTRACTS[tokenSymbol as keyof typeof STAKING_CONTRACTS]

      // Preparar transação para o contrato de staking
      const transaction = {
        to: contract.address,
        data: "0x372500ab", // claimRewards() function selector
        value: "0x0",
      }

      // Executar transação via MiniKit
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction,
        description: `Claim ${tokenSymbol} staking rewards`,
      })

      if (finalPayload.status === "success") {
        // Atualizar dados após claim bem-sucedido
        await loadStakingData(tokenSymbol)

        // Mostrar feedback de sucesso
        console.log(`${tokenSymbol} rewards claimed successfully!`)
      } else {
        throw new Error(finalPayload.message || "Transaction failed")
      }
    } catch (error) {
      console.error(`Error claiming ${tokenSymbol} rewards:`, error)
      // Mostrar erro para o usuário
    } finally {
      setClaimingToken(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("auth_required")}</h2>
            <p className="text-gray-600 text-center">{t("connect_wallet_to_access")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{t("fi_staking")}</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("stake_tokens_earn_rewards")}</p>
        </div>

        {/* Staking Cards */}
        <div className="space-y-6">
          {Object.entries(STAKING_CONTRACTS).map(([symbol, contract]) => {
            const data = stakingData[symbol] || {
              pendingRewards: "0.00",
              totalClaimed: "0.00",
              lastClaimTime: 0,
              isLoading: false,
            }

            return (
              <Card key={symbol} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Image
                          src={contract.logo || "/placeholder.svg"}
                          alt={contract.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{contract.name}</CardTitle>
                        <p className="text-blue-100">{symbol}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      APY {contract.apy}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Pending Rewards */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Coins className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">{t("pending_rewards")}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {data.isLoading ? "..." : data.pendingRewards} {symbol}
                      </p>
                    </div>

                    {/* Total Claimed */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Award className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">{t("total_claimed")}</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {data.isLoading ? "..." : data.totalClaimed} {symbol}
                      </p>
                    </div>

                    {/* Last Claim */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-purple-800">{t("last_claim")}</span>
                      </div>
                      <p className="text-sm font-semibold text-purple-900">
                        {data.lastClaimTime > 0 ? new Date(data.lastClaimTime).toLocaleDateString() : t("never")}
                      </p>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <Button
                    onClick={() => handleClaimRewards(symbol)}
                    disabled={
                      data.isLoading || claimingToken === symbol || Number.parseFloat(data.pendingRewards) === 0
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    {claimingToken === symbol ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {t("claiming")}...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t("claim_rewards")}
                      </>
                    )}
                  </Button>

                  {/* Contract Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">{t("contract")}:</span>{" "}
                      <span className="font-mono">{contract.address}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("how_staking_works")}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• {t("staking_info_1")}</p>
              <p>• {t("staking_info_2")}</p>
              <p>• {t("staking_info_3")}</p>
              <p>• {t("staking_info_4")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
