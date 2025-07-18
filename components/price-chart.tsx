"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { getTokenPrice, type TokenPrice } from "@/services/token-price-service" // Removed TimeInterval import as it's now fixed

interface PriceChartProps {
  symbol: string
  color?: string
  height?: number
}

// Removed TIME_INTERVALS constant as it's no longer needed

export function PriceChart({ symbol, color = "#00D4FF", height = 200 }: PriceChartProps) {
  // Fixed interval to "1d" (24 hours) as requested to "gravar o trajeto"
  const fixedInterval = "1d"
  const [priceData, setPriceData] = useState<TokenPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number; time: number } | null>(null)

  // Fetch price data when symbol changes (interval is now fixed)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`[PriceChart] 📊 Fetching chart data for ${symbol} (${fixedInterval})`)

        // Use the fixed interval
        const data = await getTokenPrice(symbol, fixedInterval)
        setPriceData(data)
        console.log(`[PriceChart] ✅ Chart data loaded for ${symbol}`)
      } catch (err) {
        console.error(`[PriceChart] ❌ Error loading chart data for ${symbol}:`, err)
        setError("Failed to load chart data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Auto-refresh for the fixed interval (e.g., every 30 seconds)
    const interval = setInterval(fetchData, 30000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [symbol]) // Dependency only on symbol, as interval is fixed

  // Draw chart when data changes
  useEffect(() => {
    if (!priceData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const chartHeight = rect.height // Use full height as no interval buttons

    // Clear canvas
    ctx.clearRect(0, 0, width, rect.height)

    const { priceHistory } = priceData
    if (priceHistory.length < 2) return

    // Calculate price range
    const prices = priceHistory.map((p) => p.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    // Padding
    const padding = 20

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * (chartHeight - 2 * padding)) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (i * (width - 2 * padding)) / 6
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, chartHeight - padding)
      ctx.stroke()
    }

    // Draw price line
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    priceHistory.forEach((point, index) => {
      const x = padding + (index * (width - 2 * padding)) / (priceHistory.length - 1)
      const y = padding + ((maxPrice - point.price) * (chartHeight - 2 * padding)) / priceRange

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw gradient fill
    ctx.globalAlpha = 0.1
    ctx.fillStyle = color
    ctx.lineTo(width - padding, chartHeight - padding)
    ctx.lineTo(padding, chartHeight - padding)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1

    // Draw price labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = "10px monospace"
    ctx.textAlign = "right"

    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (i * priceRange) / 4
      const y = padding + (i * (chartHeight - 2 * padding)) / 4
      ctx.fillText(`$${price.toFixed(6)}`, width - 5, y + 3)
    }
  }, [priceData, color])

  // Handle mouse move for tooltip
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!priceData || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const { priceHistory } = priceData
    const padding = 20
    const width = rect.width
    const chartHeight = rect.height // Use full height

    if (x >= padding && x <= width - padding && y >= padding && y <= chartHeight - padding) {
      // Find closest data point
      const dataIndex = Math.round(((x - padding) * (priceHistory.length - 1)) / (width - 2 * padding))
      const point = priceHistory[dataIndex]

      if (point) {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          price: point.price,
          time: point.time,
        })
      }
    } else {
      setTooltip(null)
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  // Format time for the fixed "1d" interval
  const formatTimeForTooltip = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span className="text-sm">Loading chart...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-red-600 text-sm">{error}</span>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Removed Time Interval Buttons */}

      {/* Chart Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border border-gray-200 rounded-lg cursor-crosshair"
          style={{ height }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 30,
            }}
          >
            <div>${tooltip.price.toFixed(6)}</div>
            <div className="text-gray-300">{formatTimeForTooltip(tooltip.time)}</div>
          </div>
        )}
      </div>

      {/* Price Change Indicator */}
      {priceData && (
        <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
          <span>
            Change:
            <span className={`ml-1 ${priceData.changePercent24h >= 0 ? "text-green-600" : "text-red-600"}`}>
              {priceData.changePercent24h >= 0 ? "+" : ""}
              {priceData.changePercent24h.toFixed(2)}%
            </span>
          </span>
          <span>Volume: ${(priceData.volume24h || 0).toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}
