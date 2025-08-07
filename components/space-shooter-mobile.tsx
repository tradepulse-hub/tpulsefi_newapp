"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw, Pause } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface GameObject extends Position {
  width: number
  height: number
}

interface Bullet extends GameObject {
  id: number
  velocity: number
}

interface Enemy extends GameObject {
  id: number
  velocity: number
}

interface Player extends GameObject {
  health: number
}

interface SpaceShooterMobileProps {
  onClose: () => void
}

const GAME_WIDTH = 350
const GAME_HEIGHT = 600
const BULLET_SPEED = 6
const ENEMY_SPEED = 1.5

export default function SpaceShooterMobile({ onClose }: SpaceShooterMobileProps) {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver" | "paused">("menu")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [player, setPlayer] = useState<Player>({
    x: GAME_WIDTH / 2 - 25,
    y: GAME_HEIGHT - 80,
    width: 50,
    height: 50,
    health: 3,
  })
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [lastTouchPos, setLastTouchPos] = useState<Position>({ x: 0, y: 0 })
  const [isTouching, setIsTouching] = useState(false)
  const gameLoopRef = useRef<number>()
  const bulletIdRef = useRef(0)
  const enemyIdRef = useRef(0)
  const lastEnemySpawnRef = useRef(0)
  const lastShotRef = useRef(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const SHOT_COOLDOWN = 300

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("space-shooter-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Save high score when game ends
  useEffect(() => {
    if (gameState === "gameOver" && score > highScore) {
      setHighScore(score)
      localStorage.setItem("space-shooter-high-score", score.toString())
    }
  }, [gameState, score, highScore])

  // Touch controls
  const getRelativePosition = (clientX: number, clientY: number) => {
    if (!gameAreaRef.current) return { x: 0, y: 0 }
    const rect = gameAreaRef.current.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const pos = getRelativePosition(touch.clientX, touch.clientY)
    setLastTouchPos(pos)
    setIsTouching(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      if (!isTouching || gameState !== "playing") return
      const touch = e.touches[0]
      const currentPos = getRelativePosition(touch.clientX, touch.clientY)
      const deltaX = currentPos.x - lastTouchPos.x
      const deltaY = currentPos.y - lastTouchPos.y
      setPlayer((prev) => {
        let newX = prev.x + deltaX
        let newY = prev.y + deltaY
        newX = Math.max(0, Math.min(GAME_WIDTH - prev.width, newX))
        newY = Math.max(0, Math.min(GAME_HEIGHT - prev.height, newY))
        return { ...prev, x: newX, y: newY }
      })
      setLastTouchPos(currentPos)
    },
    [isTouching, lastTouchPos, gameState],
  )

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    setIsTouching(false)
  }, [])

  useEffect(() => {
    const gameArea = gameAreaRef.current
    if (gameArea) {
      gameArea.addEventListener("touchstart", handleTouchStart, { passive: false })
      gameArea.addEventListener("touchmove", handleTouchMove, { passive: false })
      gameArea.addEventListener("touchend", handleTouchEnd, { passive: false })
      return () => {
        gameArea.removeEventListener("touchstart", handleTouchStart)
        gameArea.removeEventListener("touchmove", handleTouchMove)
        gameArea.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Game functions
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    )
  }

  const shoot = useCallback(() => {
    setBullets((prev) => [
      ...prev,
      {
        id: bulletIdRef.current++,
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        velocity: -BULLET_SPEED,
      },
    ])
  }, [player.x, player.y, player.width])

  const spawnEnemy = useCallback(() => {
    setEnemies((prev) => [
      ...prev,
      {
        id: enemyIdRef.current++,
        x: Math.random() * (GAME_WIDTH - 50),
        y: -50,
        width: 50,
        height: 50,
        velocity: ENEMY_SPEED + Math.random() * 1,
      },
    ])
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return

    // Auto shoot
    const now = Date.now()
    if (now - lastShotRef.current > SHOT_COOLDOWN) {
      shoot()
      lastShotRef.current = now
    }

    // Update bullets
    setBullets((prev) =>
      prev
        .map((bullet) => ({ ...bullet, y: bullet.y + bullet.velocity }))
        .filter((bullet) => bullet.y > -bullet.height && bullet.y < GAME_HEIGHT),
    )

    // Spawn enemies
    const nowEnemy = Date.now()
    if (nowEnemy - lastEnemySpawnRef.current > 2000) {
      spawnEnemy()
      lastEnemySpawnRef.current = nowEnemy
    }

    // Update enemies
    setEnemies((prev) =>
      prev
        .map((enemy) => ({ ...enemy, y: enemy.y + enemy.velocity }))
        .filter((enemy) => enemy.y < GAME_HEIGHT + enemy.height),
    )

    // Check bullet-enemy collisions
    setBullets((prevBullets) => {
      setEnemies((prevEnemies) => {
        const remainingBullets: Bullet[] = []
        const remainingEnemies: Enemy[] = []
        let newScore = 0

        prevBullets.forEach((bullet) => {
          let bulletHit = false
          prevEnemies.forEach((enemy) => {
            if (!bulletHit && checkCollision(bullet, enemy)) {
              bulletHit = true
              newScore += 10
            }
          })
          if (!bulletHit) {
            remainingBullets.push(bullet)
          }
        })

        prevEnemies.forEach((enemy) => {
          let enemyHit = false
          prevBullets.forEach((bullet) => {
            if (checkCollision(bullet, enemy)) {
              enemyHit = true
            }
          })
          if (!enemyHit) {
            remainingEnemies.push(enemy)
          }
        })

        if (newScore > 0) {
          setScore((prev) => prev + newScore)
        }
        setEnemies(remainingEnemies)
        return remainingBullets
      })
      return prevBullets.filter((bullet) => {
        return !enemies.some((enemy) => checkCollision(bullet, enemy))
      })
    })

    // Check player-enemy collisions
    setEnemies((prevEnemies) => {
      const collidingEnemies = prevEnemies.filter((enemy) => checkCollision(player, enemy))
      if (collidingEnemies.length > 0) {
        setPlayer((prev) => {
          const newHealth = prev.health - 1
          if (newHealth <= 0) {
            setGameState("gameOver")
          }
          return { ...prev, health: newHealth }
        })
        return prevEnemies.filter((enemy) => !checkCollision(player, enemy))
      }
      return prevEnemies
    })

    // Check escaped enemies
    setEnemies((prevEnemies) => {
      const escapedEnemies = prevEnemies.filter((enemy) => enemy.y >= GAME_HEIGHT)
      if (escapedEnemies.length > 0) {
        setPlayer((prev) => {
          const newHealth = prev.health - 1
          if (newHealth <= 0) {
            setGameState("gameOver")
          }
          return { ...prev, health: newHealth }
        })
      }
      return prevEnemies.filter((enemy) => enemy.y < GAME_HEIGHT)
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, player, enemies, shoot, spawnEnemy])

  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameLoop, gameState])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setPlayer({
      x: GAME_WIDTH / 2 - 25,
      y: GAME_HEIGHT - 80,
      width: 50,
      height: 50,
      health: 3,
    })
    setBullets([])
    setEnemies([])
    setIsTouching(false)
    lastEnemySpawnRef.current = Date.now()
    lastShotRef.current = Date.now()
  }

  const togglePause = () => {
    if (gameState === "playing") {
      setGameState("paused")
    } else if (gameState === "paused") {
      setGameState("playing")
    }
  }

  const resetGame = () => {
    setGameState("menu")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Adjusted class to fit within GameModal
      className="flex flex-col h-full w-full bg-black text-white"
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
            <div className="text-lg font-bold text-blue-400">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best</div>
            <div className="text-lg font-bold text-yellow-400">{highScore}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {gameState === "playing" && (
            <button
              onClick={togglePause}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <Pause className="w-5 h-5" />
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
          {/* Game Canvas */}
          <div
            ref={gameAreaRef}
            className="relative bg-gradient-to-b from-purple-900 via-blue-900 to-black border-2 border-blue-500 touch-none select-none rounded-lg overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Background stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: Math.random() * 3 + 1,
                    height: Math.random() * 3 + 1,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                  }}
                />
              ))}
            </div>
            {gameState === "playing" && (
              <>
                {/* Player spaceship */}
                <div
                  className="absolute transition-all duration-75"
                  style={{
                    left: player.x,
                    top: player.y,
                    width: player.width,
                    height: player.height,
                  }}
                >
                  {/* Main body */}
                  <div
                    className="absolute bg-gradient-to-t from-blue-600 to-blue-300 rounded-t-full"
                    style={{
                      left: "20%",
                      top: "0%",
                      width: "60%",
                      height: "70%",
                      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), 0 0 10px rgba(59,130,246,0.5)",
                    }}
                  />
                  {/* Cockpit */}
                  <div
                    className="absolute bg-gradient-to-t from-cyan-400 to-cyan-200 rounded-full"
                    style={{
                      left: "35%",
                      top: "10%",
                      width: "30%",
                      height: "25%",
                      boxShadow: "0 0 8px rgba(0,255,255,0.8)",
                    }}
                  />
                  {/* Wings */}
                  <div
                    className="absolute bg-gradient-to-r from-blue-700 to-blue-500"
                    style={{
                      left: "0%",
                      top: "40%",
                      width: "25%",
                      height: "35%",
                      clipPath: "polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)",
                    }}
                  />
                  <div
                    className="absolute bg-gradient-to-l from-blue-700 to-blue-500"
                    style={{
                      right: "0%",
                      top: "40%",
                      width: "25%",
                      height: "35%",
                      clipPath: "polygon(100% 0%, 0% 20%, 0% 80%, 100% 100%)",
                    }}
                  />
                  {/* Engines */}
                  <div
                    className="absolute bg-gradient-to-t from-orange-500 to-yellow-300 rounded-b-full animate-pulse"
                    style={{
                      left: "15%",
                      top: "75%",
                      width: "15%",
                      height: "25%",
                      boxShadow: "0 0 8px rgba(255,165,0,0.9)",
                    }}
                  />
                  <div
                    className="absolute bg-gradient-to-t from-orange-500 to-yellow-300 rounded-b-full animate-pulse"
                    style={{
                      right: "15%",
                      top: "75%",
                      width: "15%",
                      height: "25%",
                      boxShadow: "0 0 8px rgba(255,165,0,0.9)",
                    }}
                  />
                  <div
                    className="absolute bg-gradient-to-t from-red-500 to-orange-300 rounded-b-full animate-pulse"
                    style={{
                      left: "40%",
                      top: "70%",
                      width: "20%",
                      height: "30%",
                      boxShadow: "0 0 12px rgba(255,69,0,1)",
                    }}
                  />
                </div>
                {/* Bullets */}
                {bullets.map((bullet) => (
                  <div
                    key={bullet.id}
                    className="absolute bg-gradient-to-t from-yellow-600 to-yellow-200 rounded-full"
                    style={{
                      left: bullet.x,
                      top: bullet.y,
                      width: bullet.width,
                      height: bullet.height,
                      boxShadow: "0 0 6px rgba(255,255,0,0.8)",
                    }}
                  />
                ))}
                {/* Enemies */}
                {enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className="absolute"
                    style={{
                      left: enemy.x,
                      top: enemy.y,
                      width: enemy.width,
                      height: enemy.height,
                    }}
                  >
                    {/* Enemy body */}
                    <div
                      className="absolute bg-gradient-to-b from-red-600 to-red-400 rounded-b-full"
                      style={{
                        left: "20%",
                        top: "30%",
                        width: "60%",
                        height: "70%",
                        boxShadow: "inset 0 -2px 4px rgba(255,255,255,0.2), 0 0 8px rgba(239,68,68,0.6)",
                      }}
                    />
                    {/* Enemy cockpit */}
                    <div
                      className="absolute bg-gradient-to-b from-orange-400 to-orange-200 rounded-full"
                      style={{
                        left: "35%",
                        top: "65%",
                        width: "30%",
                        height: "25%",
                        boxShadow: "0 0 6px rgba(255,165,0,0.8)",
                      }}
                    />
                    {/* Enemy wings */}
                    <div
                      className="absolute bg-gradient-to-r from-red-700 to-red-500"
                      style={{
                        left: "0%",
                        top: "25%",
                        width: "25%",
                        height: "35%",
                        clipPath: "polygon(0% 100%, 100% 80%, 100% 20%, 0% 0%)",
                      }}
                    />
                    <div
                      className="absolute bg-gradient-to-l from-red-700 to-red-500"
                      style={{
                        right: "0%",
                        top: "25%",
                        width: "25%",
                        height: "35%",
                        clipPath: "polygon(100% 100%, 0% 80%, 0% 20%, 100% 0%)",
                      }}
                    />
                    {/* Enemy engines */}
                    <div
                      className="absolute bg-gradient-to-b from-purple-500 to-blue-300 rounded-t-full animate-pulse"
                      style={{
                        left: "15%",
                        top: "0%",
                        width: "15%",
                        height: "25%",
                        boxShadow: "0 0 6px rgba(138,43,226,0.8)",
                      }}
                    />
                    <div
                      className="absolute bg-gradient-to-b from-purple-500 to-blue-300 rounded-t-full animate-pulse"
                      style={{
                        right: "15%",
                        top: "0%",
                        width: "15%",
                        height: "25%",
                        boxShadow: "0 0 6px rgba(138,43,226,0.8)",
                      }}
                    />
                  </div>
                ))}
                {/* Touch indicator */}
                {isTouching && (
                  <div
                    className="absolute w-3 h-3 bg-cyan-400 rounded-full opacity-70 animate-ping"
                    style={{
                      left: lastTouchPos.x - 6,
                      top: lastTouchPos.y - 6,
                    }}
                  />
                )}
                {/* HUD */}
                <div className="absolute top-4 left-4 right-4 flex justify-between text-white text-sm">
                  <div>Score: {score}</div>
                  <div>Lives: {Array.from({ length: player.health }, () => "❤️").join("")}</div>
                </div>
              </>
            )}
          </div>
          {/* Game States */}
          {gameState === "menu" && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold mb-4">Super Space Shooter</h2>
                <div className="space-y-2 mb-6 text-gray-300 text-sm">
                  <p>🚀 Drag to move your spaceship</p>
                  <p>💥 Auto-fire destroys enemies</p>
                  <p>❤️ You have 3 lives</p>
                  <p>⭐ 10 points per enemy destroyed</p>
                  <p>⚠️ Don't let enemies escape!</p>
                </div>
                <button
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
          {gameState === "paused" && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <div className="text-3xl mb-4">⏸️</div>
                <h2 className="text-xl font-bold mb-4">Game Paused</h2>
                <button
                  onClick={togglePause}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
          {gameState === "gameOver" && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg">
              <div className="text-center text-white p-6">
                <div className="text-3xl mb-4">💥</div>
                <h2 className="text-xl font-bold mb-4 text-red-500">Game Over!</h2>
                <div className="mb-4">
                  <p className="text-lg mb-2">Final Score: {score}</p>
                  <p className="text-sm text-gray-300">Enemies Destroyed: {Math.floor(score / 10)}</p>
                  {score === highScore && score > 0 && (
                    <p className="text-sm text-yellow-400 mt-2">🏆 New High Score!</p>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={startGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Instructions */}
      <div className="p-4 text-center text-gray-400 text-sm border-t border-white/10">
        <p>Drag to move spaceship • Auto-fire • Destroy all enemies!</p>
      </div>
    </motion.div>
  )
}
