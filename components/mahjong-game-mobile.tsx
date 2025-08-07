"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw, Lightbulb, Shuffle } from 'lucide-react'

// Tipos de peças Mahjong com símbolos Unicode e cores
const TILE_TYPES = [
  { symbol: "🀇", color: "#000000", bg: "#f5f5f5" }, // Caracteres
  { symbol: "🀈", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀉", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀊", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀋", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀌", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀍", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀎", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀏", color: "#000000", bg: "#f5f5f5" },
  { symbol: "🀐", color: "#2d5016", bg: "#f0f8e8" }, // Bamboos - verde
  { symbol: "🀑", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀒", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀓", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀔", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀕", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀖", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀗", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀘", color: "#2d5016", bg: "#f0f8e8" },
  { symbol: "🀙", color: "#1e40af", bg: "#eff6ff" }, // Círculos - azul
  { symbol: "🀚", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀛", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀜", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀝", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀞", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀟", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀠", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀡", color: "#1e40af", bg: "#eff6ff" },
  { symbol: "🀀", color: "#7c2d12", bg: "#fef7ed" }, // Ventos - marrom
  { symbol: "🀁", color: "#7c2d12", bg: "#fef7ed" },
  { symbol: "🀂", color: "#7c2d12", bg: "#fef7ed" },
  { symbol: "🀃", color: "#7c2d12", bg: "#fef7ed" },
  { symbol: "🀄", color: "#dc2626", bg: "#fef2f2" }, // Dragões - vermelho
  { symbol: "🀅", color: "#2d5016", bg: "#f0f8e8" }, // Verde
  { symbol: "🀆", color: "#1e40af", bg: "#eff6ff" }, // Azul
]

// Fallback symbols para casos onde Unicode não funciona
const FALLBACK_SYMBOLS = [
  "1万",
  "2万",
  "3万",
  "4万",
  "5万",
  "6万",
  "7万",
  "8万",
  "9万", // Caracteres
  "1筒",
  "2筒",
  "3筒",
  "4筒",
  "5筒",
  "6筒",
  "7筒",
  "8筒",
  "9筒", // Círculos
  "1索",
  "2索",
  "3索",
  "4索",
  "5索",
  "6索",
  "7索",
  "8索",
  "9索", // Bamboos
  "東",
  "南",
  "西",
  "北", // Ventos
  "中",
  "發",
  "白", // Dragões
]

interface Tile {
  id: string
  type: { symbol: string; color: string; bg: string }
  x: number
  y: number
  layer: number
  isBlocked: boolean
  isSelected: boolean
  isMatched: boolean
}

interface GameStats {
  score: number
  time: number
  tilesRemaining: number
}

interface MahjongGameMobileProps {
  onClose: () => void
}

export default function MahjongGameMobile({ onClose }: MahjongGameMobileProps) {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    time: 0,
    tilesRemaining: 0,
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [hint, setHint] = useState<string[]>([])
  const [highScore, setHighScore] = useState(0)

  // Layout do tabuleiro (formato clássico de pirâmide) - simplificado para mobile
  const BOARD_LAYOUT = [
    // Camada 0 (base)
    [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
    ],
    // Camada 1
    [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    // Camada 2 (topo)
    [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  ]

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("mahjong-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Save high score when game ends
  useEffect(() => {
    if (gameWon && gameStats.score > highScore) {
      setHighScore(gameStats.score)
      localStorage.setItem("mahjong-high-score", gameStats.score.toString())
    }
  }, [gameWon, gameStats.score, highScore])

  // Inicializar o jogo
  const initializeGame = useCallback(() => {
    const newTiles: Tile[] = []
    let tileId = 0

    // Criar peças baseadas no layout
    BOARD_LAYOUT.forEach((layer, layerIndex) => {
      layer.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell === 1) {
            const tileType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]
            newTiles.push({
              id: `tile-${tileId++}`,
              type: tileType,
              x: colIndex,
              y: rowIndex,
              layer: layerIndex,
              isBlocked: false,
              isSelected: false,
              isMatched: false,
            })
          }
        })
      })
    })

    // Garantir que há pares suficientes
    for (let i = 0; i < newTiles.length; i += 2) {
      if (i + 1 < newTiles.length) {
        const tileType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]
        newTiles[i].type = tileType
        newTiles[i + 1].type = tileType
      }
    }

    // Calcular bloqueios
    updateTileBlocking(newTiles)
    setTiles(newTiles)
    setGameStats({
      score: 0,
      time: 0,
      tilesRemaining: newTiles.length,
    })
    setSelectedTiles([])
    setGameStarted(true)
    setGameWon(false)
    setHint([])
  }, [])

  // Atualizar bloqueios das peças
  const updateTileBlocking = (tileList: Tile[]) => {
    tileList.forEach((tile) => {
      if (tile.isMatched) return

      // Verificar se está bloqueada por peças acima
      const hasBlockingTileAbove = tileList.some(
        (otherTile) =>
          !otherTile.isMatched &&
          otherTile.layer > tile.layer &&
          Math.abs(otherTile.x - tile.x) <= 1 &&
          Math.abs(otherTile.y - tile.y) <= 1,
      )

      // Verificar se está bloqueada lateralmente
      const leftBlocked = tileList.some(
        (otherTile) =>
          !otherTile.isMatched &&
          otherTile.layer === tile.layer &&
          otherTile.x === tile.x - 1 &&
          otherTile.y === tile.y,
      )
      const rightBlocked = tileList.some(
        (otherTile) =>
          !otherTile.isMatched &&
          otherTile.layer === tile.layer &&
          otherTile.x === tile.x + 1 &&
          otherTile.y === tile.y,
      )

      tile.isBlocked = hasBlockingTileAbove || (leftBlocked && rightBlocked)
    })
  }

  // Selecionar peça
  const selectTile = (tile: Tile) => {
    if (tile.isBlocked || tile.isMatched) return

    if (selectedTiles.length === 0) {
      setSelectedTiles([tile])
      setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, isSelected: true } : t)))
    } else if (selectedTiles.length === 1) {
      if (selectedTiles[0].id === tile.id) {
        // Desselecionar
        setSelectedTiles([])
        setTiles((prev) => prev.map((t) => ({ ...t, isSelected: false })))
      } else if (selectedTiles[0].type.symbol === tile.type.symbol) {
        // Par encontrado!
        const newTiles = tiles.map((t) => {
          if (t.id === selectedTiles[0].id || t.id === tile.id) {
            return { ...t, isMatched: true, isSelected: false }
          }
          return { ...t, isSelected: false }
        })
        updateTileBlocking(newTiles)
        setTiles(newTiles)
        setSelectedTiles([])
        const remaining = newTiles.filter((t) => !t.isMatched).length
        setGameStats((prev) => ({
          ...prev,
          score: prev.score + 10,
          tilesRemaining: remaining,
        }))
        if (remaining === 0) {
          setGameWon(true)
        }
      } else {
        // Tipos diferentes, trocar seleção
        setSelectedTiles([tile])
        setTiles((prev) =>
          prev.map((t) => ({
            ...t,
            isSelected: t.id === tile.id,
          })),
        )
      }
    }
    setHint([])
  }

  // Encontrar dica
  const findHint = () => {
    const availableTiles = tiles.filter((t) => !t.isBlocked && !t.isMatched)
    for (let i = 0; i < availableTiles.length; i++) {
      for (let j = i + 1; j < availableTiles.length; j++) {
        if (availableTiles[i].type.symbol === availableTiles[j].type.symbol) {
          setHint([availableTiles[i].id, availableTiles[j].id])
          return
        }
      }
    }
    setHint([])
  }

  // Embaralhar peças disponíveis
  const shuffleTiles = () => {
    const availableTiles = tiles.filter((t) => !t.isMatched)
    const types = availableTiles.map((t) => t.type)

    // Embaralhar tipos
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[types[i], types[j]] = [types[j], types[i]]
    }

    const newTiles = tiles.map((tile) => {
      if (!tile.isMatched) {
        const availableIndex = availableTiles.findIndex((t) => t.id === tile.id)
        return { ...tile, type: types[availableIndex] }
      }
      return tile
    })
    setTiles(newTiles)
    setHint([])
  }

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setGameStats((prev) => ({ ...prev, time: prev.time + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameWon])

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full bg-black text-white" // Adjusted to fill modal space
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
            <div className="text-lg font-bold text-red-400">{gameStats.score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Time</div>
            <div className="text-lg font-bold text-yellow-400">{formatTime(gameStats.time)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best</div>
            <div className="text-lg font-bold text-green-400">{highScore}</div>
          </div>
        </div>
        <button
          onClick={initializeGame}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
      {/* Game Area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={findHint}
            className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 text-yellow-400 px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Hint</span>
          </button>
          <button
            onClick={shuffleTiles}
            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-blue-400 px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
        {/* Game Board */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="relative" style={{ width: "280px", height: "240px" }}>
              {tiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => selectTile(tile)}
                  disabled={tile.isBlocked || tile.isMatched}
                  className={`
                    absolute w-8 h-10 text-base font-bold border-2 rounded-md shadow-lg transition-all duration-200 flex items-center justify-center
                    ${tile.isMatched ? "opacity-0 pointer-events-none" : ""}
                    ${tile.isBlocked ? "opacity-50 cursor-not-allowed border-gray-500" : "border-gray-400 hover:border-yellow-400"}
                    ${tile.isSelected ? "border-red-400 scale-110 shadow-red-400/50 ring-2 ring-red-400/30" : ""}
                    ${hint.includes(tile.id) ? "animate-pulse border-green-400 ring-2 ring-green-400/50" : ""}
                  `}
                  style={{
                    left: `${tile.x * 32 + tile.layer * 2}px`,
                    top: `${tile.y * 32 + tile.layer * 2}px`,
                    zIndex: tile.layer + 1,
                    backgroundColor: tile.isBlocked ? "#4b5563" : tile.type.bg,
                    color: tile.isBlocked ? "#9ca3af" : tile.type.color,
                  }}
                >
                  <span
                    className="text-lg leading-none select-none"
                    style={{
                      textShadow: "0 0 2px rgba(0,0,0,0.3)",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {tile.type.symbol}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="text-center text-gray-400 text-sm">Tiles Remaining: {gameStats.tilesRemaining}</div>
      </div>
      {/* Start Screen */}
      {!gameStarted && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
          <div className="text-center text-white p-6 max-w-sm">
            <div className="text-6xl mb-4">🀄</div>
            <h2 className="text-2xl font-bold mb-4">Mahjong Solitaire</h2>
            <div className="space-y-2 mb-6 text-gray-300 text-sm">
              <p>• Match identical tiles to remove them</p>
              <p>• Only free tiles can be selected</p>
              <p>• Use hints when stuck</p>
              <p>• Clear all tiles to win!</p>
            </div>
            <button
              onClick={initializeGame}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      {/* Game Won Screen */}
      {gameWon && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
          <div className="text-center text-white p-6 max-w-sm">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-red-400">Congratulations!</h2>
            <div className="mb-4">
              <p className="text-lg mb-2">Final Score: {gameStats.score}</p>
              <p className="text-sm text-gray-300">Time: {formatTime(gameStats.time)}</p>
              {gameStats.score === highScore && gameStats.score > 0 && (
                <p className="text-sm text-yellow-400 mt-2">🏆 New High Score!</p>
              )}
            </div>
            <button
              onClick={initializeGame}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
