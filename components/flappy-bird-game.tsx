"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react'
import Image from "next/image"

interface FlappyBirdGameProps {
  onClose: () => void
}

interface Bird {
  x: number
  y: number
  velocity: number
}

interface Pipe {
  x: number
  y: number // Top of the bottom pipe
  width: number
  gap: number
  passed: boolean
}

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 480
const BIRD_SIZE = 30
const GRAVITY = 0.5
const FLAP_STRENGTH = -8
const PIPE_WIDTH = 50
const PIPE_GAP = 120 // Gap between top and bottom pipes
const PIPE_SPEED = 2
const PIPE_INTERVAL = 1500 // Milliseconds between new pipes

export default function FlappyBirdGame({ onClose }: FlappyBirdGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const lastPipeSpawnTimeRef = useRef(0)

  const [bird, setBird] = useState<Bird>({ x: 50, y: CANVAS_HEIGHT / 2 - BIRD_SIZE / 2, velocity: 0 })
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("flappy-bird-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Save high score when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score)
      localStorage.setItem("flappy-bird-high-score", score.toString())
    }
  }, [gameOver, score, highScore])

  const resetGame = useCallback(() => {
    setBird({ x: 50, y: CANVAS_HEIGHT / 2 - BIRD_SIZE / 2, velocity: 0 })
    setPipes([])
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
    setIsPaused(false)
    lastPipeSpawnTimeRef.current = Date.now() // Reset pipe spawn timer
  }, [])

  const startGame = useCallback(() => {
    setGameStarted(true)
    resetGame()
  }, [resetGame])

  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setIsPaused((prev) => !prev)
    }
  }, [gameStarted, gameOver])

  const flap = useCallback(() => {
    if (!gameStarted || gameOver || isPaused) return
    setBird((prev) => ({ ...prev, velocity: FLAP_STRENGTH }))
  }, [gameStarted, gameOver, isPaused])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop) // Keep requesting to draw game over/paused screen
      return
    }

    setBird((prevBird) => {
      const newVelocity = prevBird.velocity + GRAVITY
      let newY = prevBird.y + newVelocity

      // Check ground/ceiling collision
      if (newY + BIRD_SIZE > CANVAS_HEIGHT || newY < 0) {
        setGameOver(true)
        return { ...prevBird, y: Math.max(0, Math.min(newY, CANVAS_HEIGHT - BIRD_SIZE)) }
      }

      return { ...prevBird, y: newY, velocity: newVelocity }
    })

    setPipes((prevPipes) => {
      const now = Date.now()
      const newPipes = prevPipes
        .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter((pipe) => pipe.x + pipe.width > 0) // Remove pipes off-screen

      // Spawn new pipes
      if (now - lastPipeSpawnTimeRef.current > PIPE_INTERVAL) {
        const minPipeY = CANVAS_HEIGHT * 0.2 // 20% from top
        const maxPipeY = CANVAS_HEIGHT * 0.8 // 80% from top
        const randomY = Math.random() * (maxPipeY - minPipeY - PIPE_GAP) + minPipeY + PIPE_GAP // Bottom pipe top Y
        newPipes.push({
          x: CANVAS_WIDTH,
          y: randomY,
          width: PIPE_WIDTH,
          gap: PIPE_GAP,
          passed: false,
        })
        lastPipeSpawnTimeRef.current = now
      }
      return newPipes
    })

    // Check collisions and update score
    setBird((currentBird) => {
      let currentScore = score
      let currentGameOver = gameOver

      setPipes((currentPipes) => {
        const updatedPipes = currentPipes.map((pipe) => {
          // Check collision with pipes
          const birdRight = currentBird.x + BIRD_SIZE
          const birdBottom = currentBird.y + BIRD_SIZE
          const pipeRight = pipe.x + pipe.width

          const collidedWithBottomPipe =
            birdRight > pipe.x &&
            currentBird.x < pipeRight &&
            birdBottom > pipe.y

          const collidedWithTopPipe =
            birdRight > pipe.x &&
            currentBird.x < pipeRight &&
            currentBird.y < pipe.y - pipe.gap

          if (collidedWithBottomPipe || collidedWithTopPipe) {
            currentGameOver = true
          }

          // Check if bird passed pipe
          if (currentBird.x > pipeRight && !pipe.passed) {
            currentScore += 1
            return { ...pipe, passed: true }
          }
          return pipe
        })

        setScore(currentScore)
        setGameOver(currentGameOver)
        return updatedPipes
      })

      return currentBird
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameOver, isPaused, score])

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, isPaused, gameLoop])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#70c5ce" // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw ground
    ctx.fillStyle = "#ded895" // Ground color
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50)
    ctx.strokeStyle = "#5a4e3a" // Ground border
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - 50)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 50)
    ctx.stroke()

    // Draw pipes
    pipes.forEach((pipe) => {
      ctx.fillStyle = "#74bf2e" // Pipe green
      ctx.strokeStyle = "#538d22" // Pipe border
      ctx.lineWidth = 2

      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.y, pipe.width, CANVAS_HEIGHT - pipe.y)
      ctx.strokeRect(pipe.x, pipe.y, pipe.width, CANVAS_HEIGHT - pipe.y)

      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.y - pipe.gap)
      ctx.strokeRect(pipe.x, 0, pipe.width, pipe.y - pipe.gap)
    })

    // Draw bird
    ctx.fillStyle = "#ffeb3b" // Bird yellow
    ctx.strokeStyle = "#c5a000" // Bird border
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(bird.x + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Bird eye
    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.arc(bird.x + BIRD_SIZE * 0.7, bird.y + BIRD_SIZE * 0.3, BIRD_SIZE * 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Bird beak
    ctx.fillStyle = "#ff9800"
    ctx.beginPath()
    ctx.moveTo(bird.x + BIRD_SIZE, bird.y + BIRD_SIZE * 0.4)
    ctx.lineTo(bird.x + BIRD_SIZE + 10, bird.y + BIRD_SIZE * 0.5)
    ctx.lineTo(bird.x + BIRD_SIZE, bird.y + BIRD_SIZE * 0.6)
    ctx.fill()
  }, [bird, pipes])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full bg-black text-white items-center justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full p-4 bg-black/90 backdrop-blur-sm border-b border-white/10 z-20">
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
            <div className="text-lg font-bold text-yellow-400">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best</div>
            <div className="text-lg font-bold text-green-400">{highScore}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {gameStarted && !gameOver && (
            <button
              onClick={togglePause}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
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

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-600 rounded-lg shadow-2xl bg-blue-300"
            onClick={flap}
            style={{ touchAction: "none" }} // Prevent default touch actions
          />

          {/* Start Screen */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="mb-4">
                  <Image
                    src="/images/flappybird-logo.png"
                    alt="Flappy Bird Logo"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-4">Flappy Bird</h2>
                <p className="text-sm mb-4 text-gray-300">Tap to make the bird fly!</p>
                <p className="text-xs mb-6 text-gray-400">Avoid the pipes!</p>
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}

          {/* Pause Screen */}
          {isPaused && gameStarted && !gameOver && (
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
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="text-3xl mb-4">💀</div>
                <h2 className="text-xl font-bold mb-4 text-red-500">Game Over!</h2>
                <div className="mb-4">
                  <p className="text-lg mb-2">Final Score: {score}</p>
                  {score === highScore && score > 0 && (
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

      {/* Instructions */}
      {gameStarted && !gameOver && !isPaused && (
        <div className="w-full p-4 bg-black/90 backdrop-blur-sm border-t border-white/10 z-20">
          <p className="text-lg text-white/80 text-center max-w-md mx-auto">Tap anywhere to flap!</p>
        </div>
      )}
    </motion.div>
  )
}
