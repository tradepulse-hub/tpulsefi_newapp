"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { getTokenPrice, type TokenPrice, type TimeInterval } from "@/services/token-price-service"

interface PriceChartProps {
  symbol: string
  color?: string
  height?: number
}

const TIME_INTERVALS: { value: TimeInterval; label: string }[] = [
  { value: "1m", label: "1M" },
  { value: "5m", label: "5M" },
  { value: "15m", label: "15M" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "8h", label: "8H" },
  { value: "1d", label: "1D" },
]

export function PriceChart({ symbol, color = "#00D4FF", height = 200 }: PriceChartProps) {
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("1h")
  const [priceData, setPriceData] = useState<TokenPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number; time: number } | null>(null)

  // Fetch price data when symbol or interval changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`📊 Fetching chart data for ${symbol} (${selectedInterval})`)

        const data = await getTokenPrice(symbol, selectedInterval)
        setPriceData(data)
        console.log(`✅ Chart data loaded for ${symbol}`)
      } catch (err) {
        console.error(`❌ Error loading chart data for ${symbol}:`, err)
        setError("Failed to load chart data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Auto-refresh for short intervals
    let interval: NodeJS.Timeout | null = null
    if (selectedInterval === "1m" || selectedInterval === "5m") {
      interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [symbol, selectedInterval])

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
    const chartHeight = rect.height - 40 // Leave space for intervals

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
    const chartHeight = rect.height - 40

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

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    if (selectedInterval === "1m" || selectedInterval === "5m") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (selectedInterval === "15m" || selectedInterval === "1h") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
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
      {/* Time Interval Buttons */}
      <div className="flex justify-center space-x-1 mb-2">
        {TIME_INTERVALS.map((interval) => (
          <button
            key={interval.value}
            onClick={() => setSelectedInterval(interval.value)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedInterval === interval.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {interval.label}
          </button>
        ))}
      </div>

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
            <div className="text-gray-300">{formatTime(tooltip.time)}</div>
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
