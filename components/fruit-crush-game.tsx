"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from 'lucide-react'
import { useCandyCrushGame } from "@/hooks/use-candy-crush-game"
import CandyCrushBoard from "@/components/candy-crush-board"
import { useState, useCallback, useEffect } from "react"

interface FruitCrushGameProps {
  onClose: () => void;
}

export default function FruitCrushGame({ onClose }: FruitCrushGameProps) {
  const { board, handleCandyClick, selectedCandy, score } = useCandyCrushGame()

  return (
    <div
      className="flex flex-col h-full w-full bg-black text-white items-center justify-between" // Adjusted to justify-between for header/footer separation
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full p-4 bg-black/90 backdrop-blur-sm border-b border-white/10 z-20">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white bg-black hover:bg-gray-800" // Removed absolute positioning
        >
          <ChevronLeft className="h-6 w-6" />
          Back
        </Button>

        {/* Score Display */}
        <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-lg font-bold shadow-lg"> {/* Removed absolute positioning */}
          Score: {score}
        </div>
      </div>

      {/* Game Board - Centered in the remaining space */}
      <div className="flex-1 flex items-center justify-center p-4">
        <CandyCrushBoard board={board} onCandyClick={handleCandyClick} selectedCandy={selectedCandy} />
      </div>

      {/* Instructions - Moved to a footer-like area */}
      <div className="w-full p-4 bg-black/90 backdrop-blur-sm border-t border-white/10 z-20">
        <p className="text-lg text-white/80 text-center max-w-md mx-auto">Click on adjacent candies to swap them and make matches of 3 or more!</p>
      </div>
    </div>
  )
}
