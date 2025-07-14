"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import {
  getPriceHistory,
  getPriceChange,
  formatPrice,
  formatTime,
  type TimeInterval,
} from "@/services/token-price-service"

interface PriceChartProps {
  symbol: string
  color: string
}

const TIME_INTERVALS: TimeInterval[] = ["1M", "5M", "15M", "1H", "4H", "8H", "1D"]

export function PriceChart({ symbol, color }: PriceChartProps) {
  const [data, setData] = useState<Array<{ time: number; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("1H")
  const [priceChange, setPriceChange] = useState<number>(0)

  const fetchData = async (interval: TimeInterval) => {
    try {
      setLoading(true)
      const [historyData, changePercent] = await Promise.all([
        getPriceHistory(symbol, interval),
        getPriceChange(symbol, interval),
      ])

      setData(historyData)
      setPriceChange(changePercent)
    } catch (error) {
      console.error("Error fetching chart data:", error)
      setData([])
      setPriceChange(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedInterval)

    // Auto-refresh for short intervals
    let refreshInterval: NodeJS.Timeout | null = null
    if (selectedInterval === "1M" || selectedInterval === "5M") {
      refreshInterval = setInterval(() => {
        fetchData(selectedInterval)
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [symbol, selectedInterval])

  const handleIntervalChange = (interval: TimeInterval) => {
    setSelectedInterval(interval)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].value
      const time = formatTime(label, selectedInterval)

      return (
        <div className="bg-black/90 text-white p-2 rounded-lg border border-gray-600 text-sm">
          <p className="font-medium">{formatPrice(price, symbol)}</p>
          <p className="text-gray-300">{time}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Interval Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {TIME_INTERVALS.map((interval) => (
            <button
              key={interval}
              onClick={() => handleIntervalChange(interval)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedInterval === interval ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {interval}
            </button>
          ))}
        </div>

        {/* Price Change Indicator */}
        <div
          className={`flex items-center space-x-1 text-sm font-medium ${
            priceChange >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          <span>{priceChange >= 0 ? "↗" : "↘"}</span>
          <span>{Math.abs(priceChange).toFixed(2)}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(time) => formatTime(time, selectedInterval)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#666" }}
              />
              <YAxis
                domain={["dataMin - 0.01", "dataMax + 0.01"]}
                tickFormatter={(price) => formatPrice(price, symbol)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#666" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "white" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  )
}
