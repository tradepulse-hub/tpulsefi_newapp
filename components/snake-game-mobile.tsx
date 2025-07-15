"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react"

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

// Translations for the game
const gameTranslations = {
  en: {
    title: "Snake Game",
    score: "Score",
    highScore: "High Score",
    gameOver: "Game Over!",
    finalScore: "Final Score",
    snakeLength: "Snake Length",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    swipeToMove: "Swipe to move the snake",
    collectFood: "Collect red food to grow!",
    tapToStart: "Tap to Start",
    paused: "Paused",
  },
  pt: {
    title: "Jogo da Cobra",
    score: "Pontuação",
    highScore: "Melhor Pontuação",
    gameOver: "Fim de Jogo!",
    finalScore: "Pontuação Final",
    snakeLength: "Tamanho da Cobra",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Continuar",
    swipeToMove: "Desliza para mover a cobra",
    collectFood: "Coleta comida vermelha para crescer!",
    tapToStart: "Toca para Começar",
    paused: "Pausado",
  },
  es: {
    title: "Juego de la Serpiente",
    score: "Puntuación",
    highScore: "Mejor Puntuación",
    gameOver: "¡Fin del Juego!",
    finalScore: "Puntuación Final",
    snakeLength: "Longitud de la Serpiente",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Continuar",
    swipeToMove: "Desliza para mover la serpiente",
    collectFood: "¡Recoge comida roja para crecer!",
    tapToStart: "Toca para Empezar",
    paused: "Pausado",
  },
  id: {
    title: "Game Ular",
    score: "Skor",
    highScore: "Skor Tertinggi",
    gameOver: "Game Over!",
    finalScore: "Skor Akhir",
    snakeLength: "Panjang Ular",
    restart: "Mulai Ulang",
    pause: "Jeda",
    resume: "Lanjut",
    swipeToMove: "Geser untuk menggerakkan ular",
    collectFood: "Kumpulkan makanan merah untuk tumbuh!",
    tapToStart: "Ketuk untuk Mulai",
    paused: "Dijeda",
  },
}

export default function SnakeGameMobile({ onClose }: SnakeGameMobileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<NodeJS.Timeout>()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [currentLang, setCurrentLang] = useState<keyof typeof gameTranslations>("en")
  const [highScore, setHighScore] = useState(0)

  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 0, y: 0 },
    gameOver: false,
    score: 0,
    gameStarted: false,
    isPaused: false,
  })

  // Load saved language and high score
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as keyof typeof gameTranslations
    if (savedLanguage && gameTranslations[savedLanguage]) {
      setCurrentLang(savedLanguage)
    }

    const savedHighScore = localStorage.getItem("snake-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  const t = gameTranslations[currentLang]

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
      direction: { x: 1, y: 0 },
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
        // Tap to start or pause
        if (!gameState.gameStarted) {
          startGame()
        } else if (!gameState.gameOver) {
          togglePause()
        }
        return
      }

      if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) return

      setGameState((prev) => {
        let newDirection = prev.direction

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && prev.direction.x === 0) {
            newDirection = { x: 1, y: 0 } // Right
          } else if (deltaX < 0 && prev.direction.x === 0) {
            newDirection = { x: -1, y: 0 } // Left
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && prev.direction.y === 0) {
            newDirection = { x: 0, y: 1 } // Down
          } else if (deltaY < 0 && prev.direction.y === 0) {
            newDirection = { x: 0, y: -1 } // Up
          }
        }

        return { ...prev, direction: newDirection }
      })

      touchStartRef.current = null
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame, togglePause])

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
          const newScore = prev.score + 10

          // Update high score
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("snake-high-score", newScore.toString())
          }

          return {
            ...prev,
            snake: newSnake,
            food: generateFood(),
            score: newScore,
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
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, generateFood, highScore])

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
      const isHead = index === 0
      ctx.fillStyle = isHead ? "#22c55e" : "#16a34a"
      ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)

      // Add eyes to head
      if (isHead) {
        ctx.fillStyle = "#ffffff"
        const eyeSize = 2
        const eyeOffset = 3

        // Determine eye position based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2
        if (gameState.direction.x === 1) {
          // Moving right
          eyeX1 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset
          eyeY1 = segment.y * GRID_SIZE + eyeOffset
          eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset
          eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset
        } else if (gameState.direction.x === -1) {
          // Moving left
          eyeX1 = segment.x * GRID_SIZE + eyeOffset
          eyeY1 = segment.y * GRID_SIZE + eyeOffset
          eyeX2 = segment.x * GRID_SIZE + eyeOffset
          eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset
        } else if (gameState.direction.y === -1) {
          // Moving up
          eyeX1 = segment.x * GRID_SIZE + eyeOffset
          eyeY1 = segment.y * GRID_SIZE + eyeOffset
          eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset
          eyeY2 = segment.y * GRID_SIZE + eyeOffset
        } else {
          // Moving down or stationary
          eyeX1 = segment.x * GRID_SIZE + eyeOffset
          eyeY1 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset
          eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset
          eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset
        }

        ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize)
        ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize)
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

    // Add highlight to food
    ctx.fillStyle = "#fca5a5"
    ctx.beginPath()
    ctx.arc(
      gameState.food.x * GRID_SIZE + GRID_SIZE / 2 - 3,
      gameState.food.y * GRID_SIZE + GRID_SIZE / 2 - 3,
      3,
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
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold text-white">{t.title}</h1>
          <div className="text-sm text-green-100">
            {t.score}: {gameState.score} | {t.highScore}: {highScore}
          </div>
        </div>

        <div className="flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              {gameState.isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </button>
          )}

          <button
            onClick={resetGame}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center bg-slate-900 p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-green-500 rounded-lg shadow-2xl"
            style={{ touchAction: "none" }}
          />

          {/* Start Screen */}
          {!gameState.gameStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="text-center text-white p-6">
                <div className="text-6xl mb-4">🐍</div>
                <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
                <p className="text-sm mb-2 text-gray-300">{t.swipeToMove}</p>
                <p className="text-sm mb-6 text-gray-300">{t.collectFood}</p>
                <div className="text-green-400 text-lg font-semibold animate-pulse">{t.tapToStart}</div>
              </div>
            </motion.div>
          )}

          {/* Pause Screen */}
          {gameState.isPaused && gameState.gameStarted && !gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="text-center text-white">
                <Pause className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold mb-4">{t.paused}</h2>
                <p className="text-green-400 text-lg font-semibold animate-pulse">Tap to {t.resume}</p>
              </div>
            </motion.div>
          )}

          {/* Game Over Screen */}
          {gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="text-center text-white p-6">
                <div className="text-4xl mb-4">💀</div>
                <h2 className="text-2xl font-bold mb-4 text-red-400">{t.gameOver}</h2>
                <div className="space-y-2 mb-6">
                  <p className="text-lg">
                    {t.finalScore}: <span className="text-green-400 font-bold">{gameState.score}</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    {t.snakeLength}: {gameState.snake.length}
                  </p>
                  {gameState.score === highScore && gameState.score > 0 && (
                    <p className="text-yellow-400 text-sm font-semibold">🏆 New High Score!</p>
                  )}
                </div>
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.restart}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 p-3 text-center">
        <p className="text-gray-300 text-xs">{gameState.gameStarted ? t.swipeToMove : t.tapToStart}</p>
      </div>
    </motion.div>
  )
}
