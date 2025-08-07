"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Play, RotateCcw } from 'lucide-react'

interface SimonSaysGameProps {
  onClose: () => void
}

const COLORS = [
  { id: 0, name: "red", bg: "bg-red-500", active: "bg-red-300", sound: "🔴" },
  { id: 1, name: "blue", bg: "bg-blue-500", active: "bg-blue-300", sound: "🔵" },
  { id: 2, name: "green", bg: "bg-green-500", active: "bg-green-300", sound: "🟢" },
  { id: 3, name: "yellow", bg: "bg-yellow-500", active: "bg-yellow-300", sound: "🟡" },
]

export default function SimonSaysGame({ onClose }: SimonSaysGameProps) {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<"menu" | "showing" | "waiting" | "gameOver">("menu")
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("simon-says-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Save high score
  useEffect(() => {
    if (gameState === "gameOver" && score > highScore) {
      setHighScore(score)
      localStorage.setItem("simon-says-high-score", score.toString())
    }
  }, [gameState, score, highScore])

  const addToSequence = useCallback(() => {
    const newColor = Math.floor(Math.random() * 4)
    setSequence(prev => [...prev, newColor])
  }, [])

  const showSequence = useCallback(async () => {
    setGameState("showing")
    setCurrentStep(0)
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setActiveButton(sequence[i])
      await new Promise(resolve => setTimeout(resolve, 600))
      setActiveButton(null)
    }
    
    setGameState("waiting")
    setPlayerSequence([])
  }, [sequence])

  const startGame = useCallback(() => {
    setScore(0)
    setSequence([])
    setPlayerSequence([])
    setCurrentStep(0)
    setActiveButton(null)
    
    // Add first color to sequence
    const firstColor = Math.floor(Math.random() * 4)
    setSequence([firstColor])
    
    // Show sequence after a short delay
    setTimeout(() => {
      setGameState("showing")
      setActiveButton(firstColor)
      setTimeout(() => {
        setActiveButton(null)
        setGameState("waiting")
      }, 600)
    }, 1000)
  }, [])

  const handleButtonClick = useCallback((colorId: number) => {
    if (gameState !== "waiting") return

    const newPlayerSequence = [...playerSequence, colorId]
    setPlayerSequence(newPlayerSequence)

    // Check if correct
    if (sequence[newPlayerSequence.length - 1] !== colorId) {
      setGameState("gameOver")
      return
    }

    // Flash the button
    setActiveButton(colorId)
    setTimeout(() => setActiveButton(null), 200)

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(prev => prev + 1)
      setPlayerSequence([])
      
      // Add new color and show sequence
      setTimeout(() => {
        const newColor = Math.floor(Math.random() * 4)
        const newSequence = [...sequence, newColor]
        setSequence(newSequence)
        
        // Show new sequence
        setTimeout(async () => {
          setGameState("showing")
          for (let i = 0; i < newSequence.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500))
            setActiveButton(newSequence[i])
            await new Promise(resolve => setTimeout(resolve, 600))
            setActiveButton(null)
          }
          setGameState("waiting")
        }, 1000)
      }, 1000)
    }
  }, [gameState, playerSequence, sequence])

  const resetGame = useCallback(() => {
    setGameState("menu")
    setScore(0)
    setSequence([])
    setPlayerSequence([])
    setCurrentStep(0)
    setActiveButton(null)
  }, [])

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-800 to-indigo-900 text-white items-center justify-between rounded-2xl">
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
            <div className="text-lg font-bold text-yellow-300">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best</div>
            <div className="text-lg font-bold text-orange-400">{highScore}</div>
          </div>
        </div>
        <button
          onClick={resetGame}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-2 gap-4 w-80 h-80">
          {COLORS.map((color) => (
            <button
              key={color.id}
              className={`
                w-full h-full rounded-lg border-4 border-white/20 transition-all duration-200 text-4xl
                ${activeButton === color.id ? color.active : color.bg}
                ${gameState === "waiting" ? "hover:scale-105 cursor-pointer" : "cursor-not-allowed"}
                ${activeButton === color.id ? "scale-110 shadow-2xl" : ""}
              `}
              onClick={() => handleButtonClick(color.id)}
              disabled={gameState !== "waiting"}
            >
              {color.sound}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-6 text-center">
          {gameState === "showing" && (
            <p className="text-xl text-yellow-300 animate-pulse">Watch the sequence...</p>
          )}
          {gameState === "waiting" && (
            <p className="text-xl text-green-300">Your turn! Repeat the sequence</p>
          )}
        </div>
      </div>

      {/* Game State Overlays */}
      {gameState === "menu" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-white p-6">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold mb-4">Simon Says</h2>
            <p className="text-sm mb-4 text-gray-300">Watch the sequence and repeat it!</p>
            <p className="text-xs mb-6 text-gray-400">Each round adds one more color to remember</p>
            <button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-white p-6">
            <div className="text-3xl mb-4">💥</div>
            <h2 className="text-xl font-bold mb-4 text-red-400">Game Over!</h2>
            <div className="mb-4">
              <p className="text-lg mb-2">Final Score: {score}</p>
              <p className="text-sm text-gray-300">Sequence Length: {sequence.length}</p>
              {score === highScore && score > 0 && (
                <p className="text-sm text-yellow-400 mt-2">🏆 New High Score!</p>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 block mx-auto"
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

      {/* Instructions */}
      {(gameState === "showing" || gameState === "waiting") && (
        <div className="w-full p-4 bg-black/70 backdrop-blur-sm border-t border-white/10 z-20 rounded-b-2xl">
          <p className="text-lg text-white/80 text-center max-w-md mx-auto">
            {gameState === "showing" ? "Watch carefully..." : "Click the buttons in the same order!"}
          </p>
        </div>
      )}
    </div>
  )
}
