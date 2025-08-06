"use client"

import Image from "next/image"
import { CANDY_IMAGES, BOARD_SIZE } from "@/data/candy-types"
import { motion } from "framer-motion"

interface CandyCrushBoardProps {
  board: number[][]
  onCandyClick: (row: number, col: number) => void
  selectedCandy: { row: number; col: number } | null
}

export default function CandyCrushBoard({ board, onCandyClick, selectedCandy }: CandyCrushBoardProps) {
  return (
    <div
      className="grid gap-1 p-2 rounded-lg shadow-lg border-4 border-purple-700 bg-purple-900/80 backdrop-blur-sm"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        width: 'min(90vw, 400px)', // Responsive board size
        height: 'min(90vw, 400px)',
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((candyType, colIndex) => (
          <motion.button
            key={`${rowIndex}-${colIndex}`}
            className={`relative w-full h-full flex items-center justify-center rounded-md transition-all duration-100 ease-out
              ${selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex ? "scale-110 ring-4 ring-yellow-400 z-10" : ""}
              ${candyType === 0 ? "opacity-0" : "opacity-100"}
            `}
            onClick={() => onCandyClick(rowIndex, colIndex)}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.2 }}
          >
            {candyType !== 0 && (
              <Image
                src={CANDY_IMAGES[candyType] || "/placeholder.svg"}
                alt={`Candy ${candyType}`}
                width={50}
                height={50}
                className="w-full h-full object-contain"
                draggable={false}
              />
            )}
          </motion.button>
        ))
      )}
    </div>
  )
}
