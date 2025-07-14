"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, Clock } from "lucide-react"
import { getPriceData, getPriceChange, formatPrice, formatTimestamp } from "../services/token-price-service"

interface PriceChartProps {
  symbol: string
  color: string
}

interface ChartData {
  timestamp: number
  price: number
  formattedTime: string
}

const INTERVAL_BUTTONS = [
  { key: "1m", label: "1M" },
  { key: "5m", label: "5M" },
  { key: "15m", label: "15M" },
  { key: "1h", label: "1H" },
  { key: "4h", label: "4H" },
  { key: "8h", label: "8H" },
  { key: "1d", label: "1D" },
]

export default function PriceChart({ symbol, color }: PriceChartProps) {
  const [selectedInterval, setSelectedInterval] = useState("1h")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [priceChange, setPriceChange] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Update chart data when symbol or interval changes
  useEffect(() => {
    setIsLoading(true)

    const updateChart = () => {
      const rawData = getPriceData(symbol, selectedInterval)
      const formattedData = rawData.map((point) => ({
        timestamp: point.timestamp,
        price: point.price,
        formattedTime: formatTimestamp(point.timestamp, selectedInterval),
      }))

      setChartData(formattedData)
      setPriceChange(getPriceChange(symbol, selectedInterval))
      setIsLoading(false)
    }

    updateChart()

    // Set up auto-refresh for short intervals
    let refreshInterval: NodeJS.Timeout | null = null
    if (selectedInterval === "1m" || selectedInterval === "5m") {
      refreshInterval = setInterval(updateChart, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [symbol, selectedInterval])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-sm text-gray-300">{data.formattedTime}</p>
          <p className="text-lg font-semibold" style={{ color }}>
            {formatPrice(data.price, symbol)}
          </p>
        </div>
      )
    }
    return null
  }

  const isPositive = priceChange >= 0
  const currentPrice = chartData[chartData.length - 1]?.price || 0

  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg p-4">
      {/* Header with price and change */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold text-gray-900">{formatPrice(currentPrice, symbol)}</div>
          <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Interval selection buttons */}
      <div className="flex space-x-1 mb-4">
        {INTERVAL_BUTTONS.map((interval) => (
          <button
            key={interval.key}
            onClick={() => setSelectedInterval(interval.key)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              selectedInterval === interval.key
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {interval.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-40">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="formattedTime"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7280" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - dataMin * 0.01", "dataMax + dataMax * 0.01"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickFormatter={(value) => formatPrice(value, symbol)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
