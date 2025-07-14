export interface TokenPrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

export interface PriceAlert {
  id: string
  tokenSymbol: string
  targetPrice: number
  condition: "above" | "below"
  isActive: boolean
  createdAt: Date
}

// Mock price data - in a real app, this would come from an API
const mockPrices: Record<string, TokenPrice> = {
  WLD: {
    symbol: "WLD",
    price: 2.45,
    change24h: 5.2,
    volume24h: 125000000,
    marketCap: 1200000000,
  },
  TPF: {
    symbol: "TPF",
    price: 0.0012,
    change24h: -2.1,
    volume24h: 850000,
    marketCap: 2400000,
  },
  USDC: {
    symbol: "USDC",
    price: 1.0,
    change24h: 0.01,
    volume24h: 2500000000,
    marketCap: 32000000000,
  },
  WDD: {
    symbol: "WDD",
    price: 0.85,
    change24h: 12.5,
    volume24h: 1200000,
    marketCap: 8500000,
  },
}

export class TokenPriceService {
  private static instance: TokenPriceService
  private priceAlerts: PriceAlert[] = []
  private priceHistory: Record<string, number[]> = {}

  static getInstance(): TokenPriceService {
    if (!TokenPriceService.instance) {
      TokenPriceService.instance = new TokenPriceService()
    }
    return TokenPriceService.instance
  }

  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    return mockPrices[symbol] || null
  }

  async getMultipleTokenPrices(symbols: string[]): Promise<TokenPrice[]> {
    const prices = await Promise.all(symbols.map((symbol) => this.getTokenPrice(symbol)))

    return prices.filter((price) => price !== null) as TokenPrice[]
  }

  async getPriceHistory(symbol: string, days = 7): Promise<number[]> {
    // Generate mock historical data
    if (!this.priceHistory[symbol]) {
      const currentPrice = mockPrices[symbol]?.price || 1
      const history = []

      for (let i = days; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
        const price = currentPrice * (1 + variation * (i / days))
        history.push(Math.max(0.001, price))
      }

      this.priceHistory[symbol] = history
    }

    return this.priceHistory[symbol]
  }

  createPriceAlert(tokenSymbol: string, targetPrice: number, condition: "above" | "below"): PriceAlert {
    const alert: PriceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      tokenSymbol,
      targetPrice,
      condition,
      isActive: true,
      createdAt: new Date(),
    }

    this.priceAlerts.push(alert)
    return alert
  }

  getPriceAlerts(): PriceAlert[] {
    return this.priceAlerts.filter((alert) => alert.isActive)
  }

  removePriceAlert(alertId: string): boolean {
    const index = this.priceAlerts.findIndex((alert) => alert.id === alertId)
    if (index !== -1) {
      this.priceAlerts[index].isActive = false
      return true
    }
    return false
  }

  async checkPriceAlerts(): Promise<PriceAlert[]> {
    const triggeredAlerts: PriceAlert[] = []

    for (const alert of this.priceAlerts.filter((a) => a.isActive)) {
      const currentPrice = await this.getTokenPrice(alert.tokenSymbol)

      if (currentPrice) {
        const shouldTrigger =
          (alert.condition === "above" && currentPrice.price >= alert.targetPrice) ||
          (alert.condition === "below" && currentPrice.price <= alert.targetPrice)

        if (shouldTrigger) {
          alert.isActive = false
          triggeredAlerts.push(alert)
        }
      }
    }

    return triggeredAlerts
  }

  calculatePortfolioValue(holdings: Record<string, number>): Promise<number> {
    return new Promise(async (resolve) => {
      let totalValue = 0

      for (const [symbol, amount] of Object.entries(holdings)) {
        const price = await this.getTokenPrice(symbol)
        if (price) {
          totalValue += price.price * amount
        }
      }

      resolve(totalValue)
    })
  }

  // Utility function to format price with appropriate decimals
  formatPrice(price: number): string {
    if (price >= 1) {
      return price.toFixed(2)
    } else if (price >= 0.01) {
      return price.toFixed(4)
    } else {
      return price.toFixed(6)
    }
  }

  // Utility function to format percentage change
  formatPercentageChange(change: number): string {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  // Utility function to format large numbers (market cap, volume)
  formatLargeNumber(num: number): string {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`
    } else {
      return `$${num.toFixed(2)}`
    }
  }
}

// Export singleton instance
export const tokenPriceService = TokenPriceService.getInstance()
