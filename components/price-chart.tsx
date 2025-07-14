"use client"

import { useEffect, useRef } from "react"
import type { PricePoint } from "@/services/token-price-service"

interface PriceChartProps {
  data: PricePoint[]
  color?: string
  height?: number
}

export function PriceChart({ data, color = "#00D4FF", height = 100 }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Calculate bounds
    const prices = data.map((d) => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    // Padding
    const padding = 10
    const chartWidth = rect.width - padding * 2
    const chartHeight = height - padding * 2

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (chartWidth / 6) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw price line
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + (1 - (point.price - minPrice) / priceRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, `${color}20`)
    gradient.addColorStop(1, `${color}00`)

    ctx.fillStyle = gradient
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + (1 - (point.price - minPrice) / priceRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(rect.width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw current price point
    if (data.length > 0) {
      const lastPoint = data[data.length - 1]
      const x = padding + chartWidth
      const y = padding + (1 - (lastPoint.price - minPrice) / priceRange) * chartHeight

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()

      // Pulsing effect
      ctx.fillStyle = `${color}40`
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [data, color, height])

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  )
}
