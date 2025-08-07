"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Play, RotateCcw, Pause } from 'lucide-react'
import Image from "next/image"
import { motion } from "framer-motion"

interface Position {
x: number
y: number
}

interface GameObject extends Position {
direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE'
nextDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
}

interface PacMan extends GameObject {
lives: number
mouthOpen: number // 0 to 1, for animation
}

interface Ghost extends GameObject {
type: 'BLINKY' | 'PINKY' | 'INKY' | 'CLYDE'
state: 'CHASE' | 'FRIGHTENED' | 'SCATTER' | 'EATEN'
color: string
frightenedTimer: number
originalPos: Position
}

interface Pellet extends Position {
isPower: boolean
}

interface GameState {
pacman: PacMan
ghosts: Ghost[]
pellets: Pellet[]
score: number
highScore: number
gameState: "menu" | "playing" | "gameOver" | "paused" | "won"
maze: number[][]
}

interface PacManGameProps {
onClose: () => void
}

const TILE_SIZE = 15
const MAZE_WIDTH = 21
const MAZE_HEIGHT = 19
const CANVAS_WIDTH = MAZE_WIDTH * TILE_SIZE
const CANVAS_HEIGHT = MAZE_HEIGHT * TILE_SIZE
const PACMAN_RADIUS = TILE_SIZE / 2 - 2
const GHOST_RADIUS = TILE_SIZE / 2 - 1
const PELLET_RADIUS = TILE_SIZE / 8
const POWER_PELLET_RADIUS = TILE_SIZE / 4
const GAME_SPEED = 250 // Milliseconds per game tick (lower is faster)
const FRIGHTENED_DURATION = 7000 // ms

// Maze representation: 0=path, 1=wall, 2=pellet, 3=power pellet, 4=ghost house door
const INITIAL_MAZE = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,2,1,2,1],
[1,3,1,2,2,2,2,1,2,1,2,1,2,2,2,2,1,2,1,3,1],
[1,2,1,2,1,1,2,1,2,1,2,1,2,1,1,2,1,2,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1,2,1],
[1,2,1,2,2,2,2,1,0,0,0,1,2,2,2,2,1,2,1,2,1], // Ghost house area
[1,2,1,2,1,1,2,1,0,0,0,1,2,1,1,2,1,2,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1,2,1],
[1,3,1,2,2,2,2,1,2,1,2,1,2,2,2,2,1,2,1,3,1],
[1,2,1,2,1,1,2,1,2,1,2,1,2,1,1,2,1,2,1,2,1],
[1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const GHOST_COLORS = {
BLINKY: '#FF0000', // Red
PINKY: '#FFB8DE',  // Pink
INKY: '#00FFFF',   // Cyan
CLYDE: '#FFB852',  // Orange
}

export default function PacManGame({ onClose }: PacManGameProps) {
const canvasRef = useRef<HTMLCanvasElement>(null)
const gameLoopRef = useRef<NodeJS.Timeout>()
const touchStartRef = useRef<{ x: number; y: number } | null>(null)
const lastGameTickRef = useRef(0)

const [gameState, setGameState] = useState<GameState>({
  pacman: { x: 0, y: 0, direction: 'NONE', lives: 3, mouthOpen: 0 },
  ghosts: [],
  pellets: [],
  score: 0,
  highScore: 0,
  gameState: "menu",
  maze: INITIAL_MAZE.map(row => [...row]), // Initialize maze with a copy of INITIAL_MAZE
})

// Load high score from localStorage
useEffect(() => {
  const savedHighScore = localStorage.getItem("pac-man-high-score")
  if (savedHighScore) {
    setGameState(prev => ({ ...prev, highScore: Number.parseInt(savedHighScore) }))
  }
}, [])

// Save high score when game ends
useEffect(() => {
  if (gameState.gameState === "gameOver" && gameState.score > gameState.highScore) {
    localStorage.setItem("pac-man-high-score", gameState.score.toString())
  }
}, [gameState.gameState, gameState.score, gameState.highScore])

const initializeGame = useCallback(() => {
  const newMaze = INITIAL_MAZE.map(row => [...row]) // Still create a new copy for game reset
  const newPellets: Pellet[] = []
  let pacmanStart: Position = { x: 0, y: 0 }
  const ghostStarts: { type: Ghost['type'], pos: Position }[] = [
    { type: 'BLINKY', pos: { x: 9, y: 9 } },
    { type: 'PINKY', pos: { x: 10, y: 9 } },
    { type: 'INKY', pos: { x: 8, y: 9 } },
    { type: 'CLYDE', pos: { x: 11, y: 9 } },
  ]

  for (let r = 0; r < MAZE_HEIGHT; r++) {
    for (let c = 0; c < MAZE_WIDTH; c++) {
      if (newMaze[r][c] === 2) {
        newPellets.push({ x: c, y: r, isPower: false })
      } else if (newMaze[r][c] === 3) {
        newPellets.push({ x: c, y: r, isPower: true })
      }
    }
  }
  // Set Pac-Man's initial position (example: bottom center)
  pacmanStart = { x: Math.floor(MAZE_WIDTH / 2), y: MAZE_HEIGHT - 2 }

  setGameState(prev => ({
    ...prev,
    pacman: { x: pacmanStart.x, y: pacmanStart.y, direction: 'NONE', lives: 3, mouthOpen: 0 },
    ghosts: ghostStarts.map(g => ({
      x: g.pos.x, y: g.pos.y, direction: 'NONE', type: g.type, state: 'CHASE',
      color: GHOST_COLORS[g.type], frightenedTimer: 0, originalPos: { ...g.pos }
    })),
    pellets: newPellets,
    score: 0,
    gameState: "playing",
    maze: newMaze, // Ensure maze is updated here too on game start
  }))
}, [])

const resetGame = useCallback(() => {
  setGameState(prev => ({ ...prev, gameState: "menu" }))
}, [])

const togglePause = useCallback(() => {
  setGameState(prev => ({
    ...prev,
    gameState: prev.gameState === "playing" ? "paused" : "playing"
  }))
}, [])

// Helper to get tile type at a given position
const getTileType = useCallback((x: number, y: number) => {
  const gridX = Math.floor(x)
  const gridY = Math.floor(y)
  if (gridX < 0 || gridX >= MAZE_WIDTH || gridY < 0 || gridY >= MAZE_HEIGHT) {
    return 1 // Treat out of bounds as wall
  }
  return gameState.maze[gridY][gridX]
}, [gameState.maze]) // Dependency on gameState.maze is correct

// Check if a move is valid (not a wall)
const isValidMove = useCallback((x: number, y: number, direction: GameObject['direction']) => {
  let targetX = x
  let targetY = y

  if (direction === 'UP') targetY -= 1
  if (direction === 'DOWN') targetY += 1
  if (direction === 'LEFT') targetX -= 1
  if (direction === 'RIGHT') targetX += 1

  const tileType = getTileType(targetX, targetY)
  return tileType !== 1 // 1 is a wall
}, [getTileType])

// Game logic update
const updateGame = useCallback(() => {
  setGameState(prev => {
    if (prev.gameState !== "playing") return prev

    let newPacman = { ...prev.pacman }
    let newGhosts = prev.ghosts.map(g => ({ ...g }))
    let newPellets = [...prev.pellets]
    let newScore = prev.score
    let currentMaze = prev.maze.map(row => [...row])
    let currentGameState = prev.gameState

    // Update Pac-Man's mouth animation
    newPacman.mouthOpen = (newPacman.mouthOpen + 0.1) % (Math.PI / 4); // Simple animation

    // Handle Pac-Man movement
    const movePacman = (p: PacMan) => {
      let moved = false
      let targetX = p.x
      let targetY = p.y

      // Try nextDirection first if available and valid
      if (p.nextDirection && isValidMove(p.x, p.y, p.nextDirection)) {
        p.direction = p.nextDirection
        p.nextDirection = undefined
      }

      if (isValidMove(p.x, p.y, p.direction)) {
        if (p.direction === 'UP') targetY -= 1
        if (p.direction === 'DOWN') targetY += 1
        if (p.direction === 'LEFT') targetX -= 1
        if (p.direction === 'RIGHT') targetX += 1
        moved = true
      }

      // Handle wrapping around the screen
      if (targetX < 0) targetX = MAZE_WIDTH - 1
      if (targetX >= MAZE_WIDTH) targetX = 0

      return { ...p, x: targetX, y: targetY, moved }
    }

    newPacman = movePacman(newPacman)

    // Check pellet collision
    const pelletIndex = newPellets.findIndex(
      p => Math.floor(newPacman.x) === p.x && Math.floor(newPacman.y) === p.y
    )

    if (pelletIndex !== -1) {
      const eatenPellet = newPellets[pelletIndex]
      newPellets.splice(pelletIndex, 1)
      if (eatenPellet.isPower) {
        newScore += 50
        // Frighten ghosts
        newGhosts = newGhosts.map(g => ({
          ...g,
          state: 'FRIGHTENED',
          frightenedTimer: FRIGHTENED_DURATION,
        }))
      } else {
        newScore += 10
      }
    }

    // Check win condition
    if (newPellets.length === 0) {
      currentGameState = "won"
    }

    // Ghost movement (simple AI: random valid move)
    newGhosts = newGhosts.map(ghost => {
      if (ghost.state === 'EATEN') {
        // Move back to ghost house
        const dx = ghost.originalPos.x - ghost.x
        const dy = ghost.originalPos.y - ghost.y
        if (Math.abs(dx) > Math.abs(dy)) {
          ghost.direction = dx > 0 ? 'RIGHT' : 'LEFT'
        } else {
          ghost.direction = dy > 0 ? 'DOWN' : 'UP'
        }
        if (Math.floor(ghost.x) === ghost.originalPos.x && Math.floor(ghost.y) === ghost.originalPos.y) {
          ghost.state = 'CHASE' // Back to normal
        }
      } else if (ghost.state === 'FRIGHTENED') {
        ghost.frightenedTimer -= GAME_SPEED
        if (ghost.frightenedTimer <= 0) {
          ghost.state = 'CHASE'
        }
        // Move away from Pac-Man
        const dx = newPacman.x - ghost.x
        const dy = newPacman.y - ghost.y
        if (Math.abs(dx) > Math.abs(dy)) {
          ghost.direction = dx > 0 ? 'LEFT' : 'RIGHT' // Move opposite
        } else {
          ghost.direction = dy > 0 ? 'UP' : 'DOWN' // Move opposite
        }
      } else { // CHASE or SCATTER
        // Simple chase: move towards Pac-Man
        const dx = newPacman.x - ghost.x
        const dy = newPacman.y - ghost.y
        if (Math.abs(dx) > Math.abs(dy)) {
          ghost.direction = dx > 0 ? 'RIGHT' : 'LEFT'
        } else {
          ghost.direction = dy > 0 ? 'DOWN' : 'UP'
        }
      }

      // Ensure ghost moves to a valid tile
      let validMoves: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = []
      const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT']
      for (const dir of directions) {
        if (isValidMove(ghost.x, ghost.y, dir)) {
          validMoves.push(dir)
        }
      }

      // If current direction is not valid, pick a random valid one
      if (!isValidMove(ghost.x, ghost.y, ghost.direction) || ghost.direction === 'NONE') {
        if (validMoves.length > 0) {
          ghost.direction = validMoves[Math.floor(Math.random() * validMoves.length)]
        }
      } else if (ghost.state === 'FRIGHTENED' && validMoves.length > 1) {
        // In frightened mode, try to pick a random direction different from current
        let newDir = ghost.direction
        while (newDir === ghost.direction) {
          newDir = validMoves[Math.floor(Math.random() * validMoves.length)]
        }
        ghost.direction = newDir
      }

      let targetX = ghost.x
      let targetY = ghost.y
      if (ghost.direction === 'UP') targetY -= 1
      if (ghost.direction === 'DOWN') targetY += 1
      if (ghost.direction === 'LEFT') targetX -= 1
      if (ghost.direction === 'RIGHT') targetX += 1

      // Handle wrapping for ghosts too
      if (targetX < 0) targetX = MAZE_WIDTH - 1
      if (targetX >= MAZE_WIDTH) targetX = 0

      return { ...ghost, x: targetX, y: targetY }
    })

    // Check ghost collision with Pac-Man
    newGhosts.forEach(ghost => {
      if (Math.floor(newPacman.x) === Math.floor(ghost.x) && Math.floor(newPacman.y) === Math.floor(ghost.y)) {
        if (ghost.state === 'FRIGHTENED') {
          // Pac-Man eats ghost
          newScore += 200
          ghost.state = 'EATEN'
          ghost.x = ghost.originalPos.x // Teleport to ghost house
          ghost.y = ghost.originalPos.y
        } else if (ghost.state !== 'EATEN') {
          // Ghost eats Pac-Man
          newPacman.lives -= 1
          if (newPacman.lives <= 0) {
            currentGameState = "gameOver"
          } else {
            // Reset positions after losing a life
            newPacman = { ...prev.pacman, lives: newPacman.lives, x: Math.floor(MAZE_WIDTH / 2), y: MAZE_HEIGHT - 2, direction: 'NONE' }
            newGhosts = prev.ghosts.map(g => ({
              ...g,
              x: g.originalPos.x, y: g.originalPos.y, direction: 'NONE', state: 'CHASE', frightenedTimer: 0
            }))
          }
        }
      }
    })

    return {
      ...prev,
      pacman: newPacman,
      ghosts: newGhosts,
      pellets: newPellets,
      score: newScore,
      gameState: currentGameState,
      maze: currentMaze,
    }
  })
}, [isValidMove, getTileType]) // Dependencies are correct now

// Game loop effect
useEffect(() => {
  if (gameState.gameState === "playing") {
    gameLoopRef.current = setInterval(() => {
      updateGame()
    }, GAME_SPEED)
  } else {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }
  }
  return () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }
  }
}, [gameState.gameState, updateGame])

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
    const minSwipeDistance = 20

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      // Tap detected - start game or toggle pause
      if (gameState.gameState === "menu") {
        initializeGame()
      } else if (gameState.gameState === "playing" || gameState.gameState === "paused") {
        togglePause()
      }
      touchStartRef.current = null
      return
    }

    // Only process swipes if game is running
    if (gameState.gameState !== "playing") {
      touchStartRef.current = null
      return
    }

    setGameState(prev => {
      let newDirection: PacMan['direction'] = prev.pacman.direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        newDirection = deltaX > 0 ? 'RIGHT' : 'LEFT'
      } else {
        // Vertical swipe
        newDirection = deltaY > 0 ? 'DOWN' : 'UP'
      }

      // Set nextDirection if current direction is not NONE or if it's a valid immediate turn
      if (prev.pacman.direction === 'NONE' || isValidMove(prev.pacman.x, prev.pacman.y, newDirection)) {
        return { ...prev, pacman: { ...prev.pacman, direction: newDirection, nextDirection: undefined } }
      } else {
        // Store as nextDirection if current path is blocked or not aligned
        return { ...prev, pacman: { ...prev.pacman, nextDirection: newDirection } }
      }
    })
    touchStartRef.current = null
  }

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
  canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart)
    canvas.removeEventListener("touchend", handleTouchEnd)
  }
}, [gameState.gameState, initializeGame, togglePause, isValidMove])

// Canvas rendering
useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Clear canvas
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Draw maze
  for (let r = 0; r < MAZE_HEIGHT; r++) {
    for (let c = 0; c < MAZE_WIDTH; c++) {
      const tileType = gameState.maze[r][c]
      if (tileType === 1) { // Wall
        ctx.fillStyle = "#0000FF" // Blue walls
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }
  }

  // Draw pellets
  gameState.pellets.forEach(pellet => {
    ctx.fillStyle = "#FFFFFF"
    const centerX = pellet.x * TILE_SIZE + TILE_SIZE / 2
    const centerY = pellet.y * TILE_SIZE + TILE_SIZE / 2
    if (pellet.isPower) {
      // Pulsing effect for power pellets
      const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5 // 0 to 1
      const currentRadius = POWER_PELLET_RADIUS * (0.8 + 0.2 * pulse)
      ctx.beginPath()
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(centerX, centerY, PELLET_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // Draw Pac-Man
  const pacmanX = gameState.pacman.x * TILE_SIZE + TILE_SIZE / 2
  const pacmanY = gameState.pacman.y * TILE_SIZE + TILE_SIZE / 2
  ctx.fillStyle = "#FFFF00" // Yellow Pac-Man
  ctx.beginPath()
  let startAngle = gameState.pacman.mouthOpen
  let endAngle = Math.PI * 2 - gameState.pacman.mouthOpen
  let rotation = 0

  if (gameState.pacman.direction === 'RIGHT') rotation = 0
  if (gameState.pacman.direction === 'LEFT') rotation = Math.PI
  if (gameState.pacman.direction === 'UP') rotation = -Math.PI / 2
  if (gameState.pacman.direction === 'DOWN') rotation = Math.PI / 2

  ctx.arc(pacmanX, pacmanY, PACMAN_RADIUS, startAngle + rotation, endAngle + rotation)
  ctx.lineTo(pacmanX, pacmanY)
  ctx.closePath()
  ctx.fill()

  // Draw Ghosts
  gameState.ghosts.forEach(ghost => {
    const ghostX = ghost.x * TILE_SIZE + TILE_SIZE / 2
    const ghostY = ghost.y * TILE_SIZE + TILE_SIZE / 2

    if (ghost.state === 'FRIGHTENED') {
      ctx.fillStyle = "#0000FF" // Blue when frightened
      if (ghost.frightenedTimer < 2000 && Math.floor(ghost.frightenedTimer / 200) % 2 === 0) {
        ctx.fillStyle = "#FFFFFF" // Flash white
      }
    } else if (ghost.state === 'EATEN') {
      ctx.fillStyle = "#808080" // Grey when eaten
    } else {
      ctx.fillStyle = ghost.color
    }

    // Body
    ctx.beginPath()
    ctx.arc(ghostX, ghostY, GHOST_RADIUS, Math.PI, 0, false)
    ctx.lineTo(ghostX + GHOST_RADIUS, ghostY + GHOST_RADIUS)
    ctx.lineTo(ghostX - GHOST_RADIUS, ghostY + GHOST_RADIUS)
    ctx.closePath()
    ctx.fill()

    // Eyes
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.arc(ghostX - GHOST_RADIUS / 2, ghostY - GHOST_RADIUS / 4, GHOST_RADIUS / 4, 0, Math.PI * 2)
    ctx.arc(ghostX + GHOST_RADIUS / 2, ghostY - GHOST_RADIUS / 4, GHOST_RADIUS / 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000000"
    ctx.beginPath()
    // Pupils look towards Pac-Man (simplified)
    const pupilXOffset = (gameState.pacman.x > ghost.x ? 1 : -1) * GHOST_RADIUS / 8
    const pupilYOffset = (gameState.pacman.y > ghost.y ? 1 : -1) * GHOST_RADIUS / 8
    ctx.arc(ghostX - GHOST_RADIUS / 2 + pupilXOffset, ghostY - GHOST_RADIUS / 4 + pupilYOffset, GHOST_RADIUS / 8, 0, Math.PI * 2)
    ctx.arc(ghostX + GHOST_RADIUS / 2 + pupilXOffset, ghostY - GHOST_RADIUS / 4 + pupilYOffset, GHOST_RADIUS / 8, 0, Math.PI * 2)
    ctx.fill()
  })

  // Request next frame for animation (e.g., pulsing pellets)
  if (gameState.gameState === "playing" || gameState.gameState === "paused") {
    requestAnimationFrame(() => {
      // Only re-render if game is active or paused (for animations)
      if (canvasRef.current) {
        const now = Date.now()
        if (now - lastGameTickRef.current >= GAME_SPEED) {
          // Game logic update happens here
          lastGameTickRef.current = now
        }
        // Redraw for animations
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          // Re-draw only pulsing elements to optimize, or full redraw if simpler
          // For now, let's just ensure the power pellets pulse.
          // The full re-draw is handled by the useEffect when state changes.
          // This rAF is primarily for visual effects that don't change game state.
          // To make power pellets pulse without full state re-renders, we need to draw them here.
          gameState.pellets.forEach(pellet => {
            if (pellet.isPower) {
              ctx.fillStyle = "#FFFFFF"
              const centerX = pellet.x * TILE_SIZE + TILE_SIZE / 2
              const centerY = pellet.y * TILE_SIZE + TILE_SIZE / 2
              const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5 // 0 to 1
              const currentRadius = POWER_PELLET_RADIUS * (0.8 + 0.2 * pulse)
              ctx.beginPath()
              ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)
              ctx.fill()
            }
          })
        }
      }
    })
  }
}, [gameState.maze, gameState.pellets, gameState.pacman, gameState.ghosts, gameState.gameState])


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
          <div className="text-sm text-gray-400">Best</div>
          <div className="text-lg font-bold text-orange-400">{gameState.highScore}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {gameState.gameState === "playing" && (
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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-blue-500 rounded-lg shadow-2xl bg-black"
          style={{ touchAction: "none" }}
        />

        {/* Game State Overlays */}
        {gameState.gameState === "menu" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white p-6">
              <div className="mb-4">
                <Image
                  src="/images/pac-man-logo.png"
                  alt="Pac-Man Logo"
                  width={120}
                  height={120}
                  className="mx-auto mb-4 rounded-full"
                />
              </div>
              <h2 className="text-2xl font-bold mb-4">Pac-Man</h2>
              <p className="text-sm mb-4 text-gray-300">Eat all the pellets, avoid the ghosts!</p>
              <p className="text-xs mb-6 text-gray-400">Eat power pellets to turn ghosts blue and eat them!</p>
              <button
                onClick={initializeGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState.gameState === "paused" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="text-3xl mb-4">⏸️</div>
              <h2 className="text-xl font-bold mb-4">Game Paused</h2>
              <button
                onClick={togglePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {gameState.gameState === "gameOver" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white p-6">
              <div className="text-3xl mb-4">💀</div>
              <h2 className="text-xl font-bold mb-4 text-red-500">Game Over!</h2>
              <div className="mb-4">
                <p className="text-lg mb-2">Final Score: {gameState.score}</p>
                {gameState.score === gameState.highScore && gameState.score > 0 && (
                  <p className="text-sm text-yellow-400 mt-2">🏆 New High Score!</p>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={initializeGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
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

        {gameState.gameState === "won" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white p-6">
              <div className="text-3xl mb-4">🎉</div>
              <h2 className="text-xl font-bold mb-4 text-green-400">You Won!</h2>
              <div className="mb-4">
                <p className="text-lg mb-2">Final Score: {gameState.score}</p>
                {gameState.score === gameState.highScore && gameState.score > 0 && (
                  <p className="text-sm text-yellow-400 mt-2">🏆 New High Score!</p>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={initializeGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
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

    {/* Instructions / Lives */}
    {(gameState.gameState === "playing" || gameState.gameState === "paused") && (
      <div className="w-full p-4 bg-black/70 backdrop-blur-sm border-t border-white/10 z-20 rounded-b-2xl flex justify-between items-center">
        <p className="text-lg text-white/80 text-center max-w-md mx-auto">
          Lives: {Array(gameState.pacman.lives).fill('❤️').join('')}
        </p>
        <p className="text-lg text-white/80 text-center max-w-md mx-auto">
          Swipe to move!
        </p>
      </div>
    )}
  </motion.div>
)
}
