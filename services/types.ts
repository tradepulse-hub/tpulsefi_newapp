export interface TokenBalance {
  symbol: string
  name: string
  address: string
  balance: string
  decimals: number
  icon?: string
  formattedBalance: string
}

export interface Transaction {
  id: string
  hash: string
  type: "send" | "receive"
  amount: string
  tokenSymbol: string
  tokenAddress: string
  from: string
  to: string
  timestamp: Date
  status: "pending" | "completed" | "failed"
  blockNumber: number
}

export interface SwapQuote {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  priceImpact: string
  fee: string
}
