"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react'
import Image from "next/image" // Import Image component

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

  const [highScore, setHighScore] = useState(0)

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("snake-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Save high score when game ends
  useEffect(() => {
    if (gameState.gameOver && gameState.score > highScore) {
      setHighScore(gameState.score)
      localStorage.setItem("snake-high-score", gameState.score.toString())
    }
  }, [gameState.gameOver, gameState.score, highScore])

  const generateFood = useCallback((): Position => {
    const maxX = Math.floor(CANVAS_WIDTH / GRID_SIZE)
    const maxY = Math.floor(CANVAS_HEIGHT / GRID_SIZE)
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
      }
    } while (
      gameState.snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    )
    return newFood
  }, [gameState.snake])

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
      direction: { x: 1, y: 0 }, // Initial direction
      isPaused: false,
    }))
  }, [])

  const togglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }))
  }, [])

  // Touch controls for swipe detection
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
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const minSwipeDistance = 30

      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        // Tap detected - start game or toggle pause
        if (!gameState.gameStarted) {
          startGame()
        } else if (!gameState.gameOver) {
          togglePause()
        }
        touchStartRef.current = null
        return
      }

      // Only process swipes if game is running
      if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
        touchStartRef.current = null
        return
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && gameState.direction.x === 0) {
          setGameState((prev) => ({ ...prev, direction: { x: 1, y: 0 } }))
        } else if (deltaX < 0 && gameState.direction.x === 0) {
          setGameState((prev) => ({ ...prev, direction: { x: -1, y: 0 } }))
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && gameState.direction.y === 0) {
          setGameState((prev) => ({ ...prev, direction: { x: 0, y: 1 } }))
        } else if (deltaY < 0 && gameState.direction.y === 0) {
          setGameState((prev) => ({ ...prev, direction: { x: 0, y: -1 } }))
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
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame, togglePause, gameState.direction])

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
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, generateFood, gameState.direction])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0f0f0f"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 1
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
        // Snake head with eyes
        ctx.fillStyle = "#22c55e"
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)

        // Eyes
        ctx.fillStyle = "#000"
        const eyeSize = 2
        const eyeOffset = 3

        if (gameState.direction.x === 1) {
          // Moving right
          ctx.fillRect(
            segment.x * GRID_SIZE + GRID_SIZE - eyeOffset,
            segment.y * GRID_SIZE + eyeOffset,
            eyeSize,
            eyeSize,
          )
          ctx.fillRect(
            segment.x * GRID_SIZE + GRID_SIZE - eyeOffset,
            segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
            eyeSize,
            eyeSize,
          )
        } else if (gameState.direction.x === -1) {
          // Moving left
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize)
          ctx.fillRect(
            segment.x * GRID_SIZE + eyeOffset - eyeSize,
            segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
            eyeSize,
            eyeSize,
          )
        } else if (gameState.direction.y === -1) {
          // Moving up
          ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize)
          ctx.fillRect(
            segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
            segment.y * GRID_SIZE + eyeOffset - eyeSize,
            eyeSize,
            eyeSize,
          )
        } else if (gameState.direction.y === 1) {
          // Moving down
          ctx.fillRect(
            segment.x * GRID_SIZE + eyeOffset,
            segment.y * GRID_SIZE + GRID_SIZE - eyeOffset,
            eyeSize,
            eyeSize,
          )
          ctx.fillRect(
            segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
            segment.y * GRID_SIZE + GRID_SIZE - eyeOffset,
            eyeSize,
            eyeSize,
          )
        }
      } else {
        // Snake body
        ctx.fillStyle = "#16a34a"
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
      }
    })

    // Draw food with pulsing effect
    const time = Date.now() * 0.005
    const pulseSize = Math.sin(time) * 2 + GRID_SIZE / 2 - 2
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(
      gameState.food.x * GRID_SIZE + GRID_SIZE / 2,
      gameState.food.y * GRID_SIZE + GRID_SIZE / 2,
      pulseSize,
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Removed fixed inset-0 bg-black z-50 to allow it to render within GameModal
      className="flex flex-col h-full w-full" // Ensure it fills the modal space
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Score</div>
            <div className="text-lg font-bold text-green-400">{gameState.score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best</div>
            <div className="text-lg font-bold text-yellow-400">{highScore}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
            >
              {gameState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={resetGame}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Area - Adjusted to be higher */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative"> {/* Removed mt-[-160px] */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-600 rounded-lg shadow-2xl"
            style={{ touchAction: "none" }}
          />

          {/* Start Screen */}
          {!gameState.gameStarted && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="mb-4">
                  <Image
                    src="/images/snakegame-logo.jpg" // Added Snake Game Logo
                    alt="Snake Game Logo"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-4">Snake Game</h2>
                <p className="text-sm mb-4 text-gray-300">Swipe to control the snake</p>
                <p className="text-xs mb-6 text-gray-400">Collect red food to grow!</p>
                <div className="space-y-3">
                  <button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
                  >
                    Start Game
                  </button>
                  <p className="text-green-400 text-sm animate-pulse">or tap anywhere on the screen</p>
                </div>
              </div>
            </div>
          )}

          {/* Pause Screen */}
          {gameState.isPaused && gameState.gameStarted && !gameState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <div className="text-3xl mb-4">⏸️</div>
                <h2 className="text-xl font-bold mb-4">Game Paused</h2>
                <button
                  onClick={togglePause}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="text-3xl mb-4">💀</div>
                <h2 className="text-xl font-bold mb-4 text-red-500">Game Over!</h2>
                <div className="mb-4">
                  <p className="text-lg mb-2">Final Score: {gameState.score}</p>
                  <p className="text-sm text-gray-300">Snake Length: {gameState.snake.length}</p>
                  {gameState.score === highScore && gameState.score > 0 && (
                    <p className="text-sm text-yellow-400 mt-2">🎉 New High Score!</p>
                  )}
                </div>
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Swipe Instructions */}
      {gameState.gameStarted && !gameState.gameOver && !gameState.isPaused && (
        <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10">
          <div className="text-center text-gray-400 text-sm">Swipe to control: ⬅️ ➡️ ⬆️ ⬇️</div>
        </div>
      )}
    </motion.div>
  )
}
