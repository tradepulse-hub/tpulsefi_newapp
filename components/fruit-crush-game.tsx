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
      className="flex flex-col h-full w-full bg-black text-white items-center justify-center p-4"
    >
      <Button
        variant="ghost"
        onClick={onClose}
        className="absolute top-8 left-4 text-white bg-black hover:bg-gray-800 z-20"
      >
        <ChevronLeft className="h-6 w-6" />
        Back
      </Button>

      {/* O título <h1> "Fruit Crush" foi removido daqui. */}

      {/* Score Display */}
      <div className="absolute top-8 right-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-lg font-bold shadow-lg z-20">
        Score: {score}
      </div>

      <CandyCrushBoard board={board} onCandyClick={handleCandyClick} selectedCandy={selectedCandy} />
      <p className="mt-8 text-lg text-white/80 text-center max-w-md">Click on adjacent candies to swap them and make matches of 3 or more!</p>
    </div>
  )
}
