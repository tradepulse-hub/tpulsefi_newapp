"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react"

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  food: Position
  direction: Position
  gameOver: boolean
  score: number
  gameStarted: boolean
  isPaused: boolean
}

// Mobile optimized settings
const GRID_SIZE = 15
const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 400
const GAME_SPEED = 200

interface SnakeGameMobileProps {
  onClose: () => void
}

export default function SnakeGameMobile({ onClose }: SnakeGameMobileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<NodeJS.Timeout>()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 0, y: 0 },
    gameOver: false,
    score: 0,
    gameStarted: false,
    isPaused: false,
  })

  const generateFood = useCallback((): Position => {
    const maxX = Math.floor(CANVAS_WIDTH / GRID_SIZE)
    const maxY = Math.floor(CANVAS_HEIGHT / GRID_SIZE)
    return {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    }
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: generateFood(),
      direction: { x: 0, y: 0 },
      gameOver: false,
      score: 0,
      gameStarted: true,
      isPaused: false,
    })
  }, [generateFood])

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameStarted: true,
      direction: { x: 0, y: 1 }, // Start moving down
      isPaused: false,
    }))
  }, [])

  const togglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }))
  }, [])

  // Touch/Swipe controls
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const minSwipeDistance = 30

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          setGameState((prev) => {
            if (prev.direction.x === 0) {
              return {
                ...prev,
                direction: deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 },
              }
            }
            return prev
          })
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          setGameState((prev) => {
            if (prev.direction.y === 0) {
              return {
                ...prev,
                direction: deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 },
              }
            }
            return prev
          })
        }
      }

      touchStartRef.current = null
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused])

  // Game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
      return
    }

    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.direction.x === 0 && prev.direction.y === 0) return prev

        const head = prev.snake[0]
        const newHead = {
          x: head.x + prev.direction.x,
          y: head.y + prev.direction.y,
        }

        // Check wall collision
        const maxX = Math.floor(CANVAS_WIDTH / GRID_SIZE)
        const maxY = Math.floor(CANVAS_HEIGHT / GRID_SIZE)

        if (newHead.x < 0 || newHead.x >= maxX || newHead.y < 0 || newHead.y >= maxY) {
          return { ...prev, gameOver: true }
        }

        // Check self collision
        if (prev.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          return { ...prev, gameOver: true }
        }

        const newSnake = [newHead, ...prev.snake]

        // Check food collision
        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
          return {
            ...prev,
            snake: newSnake,
            food: generateFood(),
            score: prev.score + 10,
          }
        }

        // Remove tail if no food eaten
        newSnake.pop()

        return {
          ...prev,
          snake: newSnake,
        }
      })
    }, GAME_SPEED)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, generateFood])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_WIDTH, i)
      ctx.stroke()
    }

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        ctx.fillStyle = "#10b981"
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)

        // Head border
        ctx.strokeStyle = "#059669"
        ctx.lineWidth = 2
        ctx.strokeRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)

        // Eyes
        ctx.fillStyle = "#ffffff"
        const eyeSize = 2
        ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 3, eyeSize, eyeSize)
        ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 5, segment.y * GRID_SIZE + 3, eyeSize, eyeSize)
      } else {
        // Snake body
        ctx.fillStyle = "#22c55e"
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
      }
    })

    // Draw food
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(
      gameState.food.x * GRID_SIZE + GRID_SIZE / 2,
      gameState.food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      2 * Math.PI,
    )
    ctx.fill()

    // Food highlight
    ctx.fillStyle = "#fca5a5"
    ctx.beginPath()
    ctx.arc(
      gameState.food.x * GRID_SIZE + GRID_SIZE / 2 - 2,
      gameState.food.y * GRID_SIZE + GRID_SIZE / 2 - 2,
      2,
      0,
      2 * Math.PI,
    )
    ctx.fill()
  }, [gameState])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-2xl">🐍</div>
          <div>
            <h1 className="text-lg font-bold text-white">Snake Game</h1>
            <p className="text-sm text-green-400">Score: {gameState.score}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              {gameState.isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </button>
          )}

          {gameState.gameOver && (
            <button
              onClick={resetGame}
              className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-900">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-600 rounded-lg shadow-2xl touch-none"
            style={{ touchAction: "none" }}
          />

          {/* Start Screen */}
          {!gameState.gameStarted && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="text-6xl mb-4">🐍</div>
                <h2 className="text-2xl font-bold mb-4">Snake Game</h2>
                <p className="text-sm mb-4 text-gray-300">Swipe to control the snake!</p>
                <p className="text-xs mb-6 text-gray-400">
                  👆 Swipe up
                  <br />👇 Swipe down
                  <br />👈 Swipe left
                  <br />👉 Swipe right
                </p>
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}

          {/* Pause Screen */}
          {gameState.isPaused && gameState.gameStarted && !gameState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">⏸️</div>
                <h2 className="text-xl font-bold mb-4">Game Paused</h2>
                <button
                  onClick={togglePause}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState.gameOver && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="text-4xl mb-4">💀</div>
                <h2 className="text-2xl font-bold mb-4 text-red-500">Game Over!</h2>
                <p className="text-lg mb-2">Final Score: {gameState.score}</p>
                <p className="text-sm mb-6 text-gray-300">Snake Length: {gameState.snake.length}</p>
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {gameState.gameStarted && !gameState.gameOver && !gameState.isPaused && (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            Swipe to control • Length: {gameState.snake.length} • Score: {gameState.score}
          </p>
        </div>
      )}
    </motion.div>
  )
}
