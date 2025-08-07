"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Play, RotateCcw, Smile, Frown, Trophy } from 'lucide-react'
import { motion } from "framer-motion"
import Image from "next/image"
import { LEVEL_LAYOUTS } from "@/data/brick-layouts" // Importar os layouts dos níveis

interface Position {
  x: number
  y: number
}

interface Paddle extends Position {
  width: number
  height: number
}

interface Ball extends Position {
  radius: number
  dx: number // velocity x
  dy: number // velocity y
}

export interface Brick extends Position { // Exportar Brick para uso em brick-layouts.ts
  width: number
  height: number
  health: number // For multi-hit bricks
  color: string
  isDestroyed: boolean
}

interface GameState {
  paddle: Paddle
  ball: Ball
  bricks: Brick[]
  score: number
  lives: number
  currentLevel: number // Novo estado para o nível atual
  gameStatus: "menu" | "playing" | "gameOver" | "won"
}

interface BrickBreakerGameProps {
  onClose: () => void
}

// Game configuration
const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 480
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 10
const BALL_RADIUS = 5
const INITIAL_BALL_SPEED = 4
const BRICK_ROWS = 5 // These are now max rows/cols for calculation, not fixed for layout
const BRICK_COLS = 7
const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_COLS + 1) * 5) / BRICK_COLS // Adjusted for padding
const BRICK_HEIGHT = 15
const BRICK_PADDING = 5
const INITIAL_LIVES = 3
const BRICK_OFFSET_TOP = 50 // Offset from top for bricks

export default function BrickBreakerGame({ onClose }: BrickBreakerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const lastPaddleXRef = useRef(0)

  const [gameState, setGameState] = useState<GameState>({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 20, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, dx: 0, dy: 0 },
    bricks: [],
    score: 0,
    lives: INITIAL_LIVES,
    currentLevel: 0, // Começa no nível 0 (primeiro nível no array)
    gameStatus: "menu",
  })

  const [highScore, setHighScore] = useState(0)

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("brick-breaker-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Save high score
  useEffect(() => {
    if (gameState.gameStatus === "gameOver" && gameState.score > highScore) {
      setHighScore(gameState.score)
      localStorage.setItem("brick-breaker-high-score", gameState.score.toString())
    }
  }, [gameState.gameStatus, gameState.score, highScore])

  const initializeGame = useCallback((level: number = 0) => {
    const newBricks = LEVEL_LAYOUTS[level](BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP);
    setGameState(prev => ({
      ...prev,
      paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 20, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED },
      bricks: newBricks,
      score: level === 0 ? 0 : prev.score, // Reset score only on first level start
      lives: level === 0 ? INITIAL_LIVES : prev.lives, // Reset lives only on first level start
      currentLevel: level,
      gameStatus: "playing",
    }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStatus: "menu", currentLevel: 0 })) // Reset level to 0 for menu
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== "playing") return prev;

      let newBall = { ...prev.ball };
      let newPaddle = { ...prev.paddle };
      let newBricks = prev.bricks.map(b => ({ ...b }));
      let newScore = prev.score;
      let newLives = prev.lives;
      let newGameStatus = prev.gameStatus;
      let newCurrentLevel = prev.currentLevel;

      // 1. Move ball
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;

      // 2. Ball-wall collision
      if (newBall.x + newBall.radius > CANVAS_WIDTH || newBall.x - newBall.radius < 0) {
        newBall.dx *= -1; // Reverse X direction
      }
      if (newBall.y - newBall.radius < 0) {
        newBall.dy *= -1; // Reverse Y direction (top wall)
      }

      // 3. Ball-paddle collision
      if (
        newBall.y + newBall.radius > newPaddle.y &&
        newBall.x + newBall.radius > newPaddle.x &&
        newBall.x - newBall.radius < newPaddle.x + newPaddle.width &&
        newBall.y - newBall.radius < newPaddle.y + newPaddle.height // Ensure ball is above paddle
      ) {
        // Calculate hit point on paddle (0 to 1, left to right)
        const hitPoint = (newBall.x - newPaddle.x) / newPaddle.width;
        // Adjust ball angle based on hit point
        const angle = hitPoint * Math.PI * 0.8 + Math.PI * 0.1; // From 18 to 162 degrees
        newBall.dx = INITIAL_BALL_SPEED * Math.cos(angle);
        newBall.dy = -INITIAL_BALL_SPEED * Math.sin(angle); // Always go up
      }

      // 4. Ball-bottom collision (lose a life)
      if (newBall.y + newBall.radius > CANVAS_HEIGHT) {
        newLives--;
        if (newLives <= 0) {
          newGameStatus = "gameOver";
        } else {
          // Reset ball and paddle position
          newBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED };
          newPaddle = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 20, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
        }
      }

      // 5. Ball-brick collision
      let allBricksDestroyed = true;
      newBricks.forEach(brick => {
        if (!brick.isDestroyed) {
          allBricksDestroyed = false; // At least one brick is not destroyed

          // Simple AABB collision detection
          if (
            newBall.x + newBall.radius > brick.x &&
            newBall.x - newBall.radius < brick.x + brick.width &&
            newBall.y + newBall.radius > brick.y &&
            newBall.y - newBall.radius < brick.y + brick.height
          ) {
            // Collision detected
            brick.health--;
            if (brick.health <= 0) {
              brick.isDestroyed = true;
              newScore += 10; // Score for destroying a brick
            }

            // Determine which side of the brick was hit to reverse the correct velocity component
            const prevBallX = newBall.x - newBall.dx;
            const prevBallY = newBall.y - newBall.dy;

            const hitFromLeft = prevBallX - newBall.radius <= brick.x && newBall.x - newBall.radius > brick.x;
            const hitFromRight = prevBallX + newBall.radius >= brick.x + brick.width && newBall.x + newBall.radius < brick.x + brick.width;
            const hitFromTop = prevBallY - newBall.radius <= brick.y && newBall.y - newBall.radius > brick.y;
            const hitFromBottom = prevBallY + newBall.radius >= brick.y + brick.height && newBall.y + newBall.radius < brick.y + brick.height;

            if (hitFromLeft || hitFromRight) {
              newBall.dx *= -1;
            } else if (hitFromTop || hitFromBottom) {
              newBall.dy *= -1;
            } else {
              // Corner hit or complex case, just reverse both
              newBall.dx *= -1;
              newBall.dy *= -1;
            }
          }
        }
      });

      // 6. Check win condition for current level or entire game
      if (allBricksDestroyed) {
        if (newCurrentLevel < LEVEL_LAYOUTS.length - 1) {
          // Advance to next level
          newCurrentLevel++;
          // Re-initialize game for the next level
          const nextLevelBricks = LEVEL_LAYOUTS[newCurrentLevel](BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP);
          newBricks = nextLevelBricks;
          newBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED };
          newPaddle = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 20, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
        } else {
          // All levels completed, game won!
          newGameStatus = "won";
        }
      }

      return {
        paddle: newPaddle,
        ball: newBall,
        bricks: newBricks,
        score: newScore,
        lives: newLives,
        currentLevel: newCurrentLevel,
        gameStatus: newGameStatus,
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start/Stop game loop
  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStatus, gameLoop]);

  // Touch controls for paddle movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState.gameStatus !== "playing") return;

      const touchX = e.touches[0].clientX;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;

      let newPaddleX = (touchX - rect.left) * scaleX - gameState.paddle.width / 2;

      // Keep paddle within canvas bounds
      newPaddleX = Math.max(0, Math.min(CANVAS_WIDTH - gameState.paddle.width, newPaddleX));

      setGameState(prev => ({
        ...prev,
        paddle: { ...prev.paddle, x: newPaddleX }
      }));
    };

    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameState.gameStatus, gameState.paddle.width]);

  // Initial game setup for menu
  useEffect(() => {
    if (gameState.gameStatus === "menu") {
      setGameState(prev => ({
        ...prev,
        bricks: LEVEL_LAYOUTS[0](BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP), // Show first level bricks in menu
        ball: { ...prev.ball, dx: 0, dy: 0 }, // Stop ball in menu
      }));
    }
  }, [gameState.gameStatus]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0f0f0f" // Dark background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw bricks
    gameState.bricks.forEach(brick => {
      if (!brick.isDestroyed) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle
    ctx.fillStyle = "#FF4500" // OrangeRed
    ctx.fillRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height)

    // Draw ball
    ctx.fillStyle = "#FFFFFF" // White ball
    ctx.beginPath()
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2)
    ctx.fill()

  }, [gameState.paddle, gameState.ball, gameState.bricks]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full bg-black text-white items-center justify-between rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full p-4 bg-black/70 backdrop-blur-sm border-b border-white/10 z-20 rounded-t-2xl">
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
            <div className="text-lg font-bold text-yellow-300">{gameState.score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Lives</div>
            <div className="text-lg font-bold text-red-400">{gameState.lives}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Level</div>
            <div className="text-lg font-bold text-blue-400">{gameState.currentLevel + 1}</div> {/* Display level + 1 */}
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best</div>
            <div className="text-lg font-bold text-orange-400">{highScore}</div>
          </div>
        </div>
        <button
          onClick={() => initializeGame(0)} // Always start from level 0 when resetting
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-blue-500 rounded-lg shadow-2xl bg-black"
            style={{ touchAction: "none" }} // Prevents default browser touch behavior
          />
        </div>
      </div>

      {/* Game State Overlays */}
      {gameState.gameStatus === "menu" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-white p-6">
            <div className="mb-4">
              <Image
                src="/images/brick-breaker-logo.png"
                alt="Brick Breaker Logo"
                width={100}
                height={100}
                className="mx-auto mb-4"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4">Brick Breaker</h2>
            <p className="text-sm mb-4 text-gray-300">Break all the bricks with the ball!</p>
            <p className="text-xs mb-6 text-gray-400">Drag the paddle to move.</p>
            <button
              onClick={() => initializeGame(0)} // Start from level 0
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameState.gameStatus === "gameOver" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-white p-6">
            <div className="text-3xl mb-4">
              <Frown className="w-12 h-12 mx-auto text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-red-500">Game Over!</h2>
            <p className="text-lg mb-2">You ran out of lives!</p>
            <p className="text-sm text-gray-300">Final Score: {gameState.score}</p>
            <button
              onClick={() => initializeGame(0)} // Start from level 0
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 mt-4"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameState.gameStatus === "won" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-white p-6">
            <div className="text-3xl mb-4">
              <Trophy className="w-12 h-12 mx-auto text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-400">You Won!</h2>
            <p className="text-lg mb-2">All levels completed!</p>
            <p className="text-sm text-gray-300">Final Score: {gameState.score}</p>
            {gameState.score === highScore && gameState.score > 0 && (
              <p className="text-sm text-yellow-400 mt-2">🏆 New High Score!</p>
            )}
            <button
              onClick={() => initializeGame(0)} // Start from level 0
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 mt-4"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameState.gameStatus === "playing" && (
        <div className="w-full p-4 bg-black/70 backdrop-blur-sm border-t border-white/10 z-20 rounded-b-2xl">
          <p className="text-lg text-white/80 text-center max-w-md mx-auto">
            Drag the paddle to move!
          </p>
        </div>
      )}
    </motion.div>
  )
}
