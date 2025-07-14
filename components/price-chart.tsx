"use client"

import { useMemo } from "react"
import type { PriceData } from "@/services/token-price-service"

interface PriceChartProps {
  data: PriceData[]
  color?: string
  height?: number
}

export function PriceChart({ data, color = "#00D4FF", height = 120 }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const prices = data.map((d) => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    const width = 300
    const padding = 20

    // Create SVG path
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding)
      return `${x},${y}`
    })

    const pathData = `M ${points.join(" L ")}`

    // Create area fill path
    const areaPoints = [
      `${padding},${height - padding}`, // Start at bottom left
      ...points,
      `${width - padding},${height - padding}`, // End at bottom right
    ]
    const areaPath = `M ${areaPoints.join(" L ")} Z`

    return {
      linePath: pathData,
      areaPath: areaPath,
      width,
      height,
      minPrice,
      maxPrice,
      points: data.map((point, index) => ({
        x: padding + (index / (data.length - 1)) * (width - 2 * padding),
        y: height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding),
        price: point.price,
        timestamp: point.timestamp,
      })),
    }
  }, [data, height])

  if (!chartData) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-gray-400 text-sm">No chart data available</span>
      </div>
    )
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="w-full relative">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartData.width} ${chartData.height}`}
        className="overflow-visible"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Area fill */}
        <path d={chartData.areaPath} fill={`url(#gradient-${color.replace("#", "")})`} stroke="none" />

        {/* Price line */}
        <path
          d={chartData.linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points with hover effects */}
        {chartData.points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <title>{`${formatTime(point.timestamp)}: ${formatPrice(point.price)}`}</title>
            </circle>
          </g>
        ))}

        {/* Current price indicator (last point) */}
        {chartData.points.length > 0 && (
          <circle
            cx={chartData.points[chartData.points.length - 1].x}
            cy={chartData.points[chartData.points.length - 1].y}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Price range indicators */}
      <div className="absolute top-2 left-2 text-xs text-gray-400">{formatPrice(chartData.maxPrice)}</div>
      <div className="absolute bottom-2 left-2 text-xs text-gray-400">{formatPrice(chartData.minPrice)}</div>

      {/* Time indicators */}
      {data.length > 0 && (
        <>
          <div className="absolute bottom-2 left-6 text-xs text-gray-400">{formatTime(data[0].timestamp)}</div>
          <div className="absolute bottom-2 right-6 text-xs text-gray-400">
            {formatTime(data[data.length - 1].timestamp)}
          </div>
        </>
      )}
    </div>
  )
}
