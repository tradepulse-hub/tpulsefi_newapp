"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from 'lucide-react'
import { useCandyCrushGame } from "@/hooks/use-candy-crush-game"
import CandyCrushBoard from "@/components/candy-crush-board"

interface FruitCrushGameProps {
  onClose: () => void; // Reintroduce onClose prop
}

export default function FruitCrushGame({ onClose }: FruitCrushGameProps) {
  const { board, handleCandyClick, selectedCandy, score } = useCandyCrushGame()

  return (
    <div
      className="relative flex h-screen overflow-hidden flex-col items-center justify-center p-4 text-white"
      style={{
        backgroundImage: 'url("/images/map-background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Button
        variant="ghost"
        onClick={onClose} // Call onClose prop
        className="absolute top-4 left-4 text-white bg-black hover:bg-gray-800 z-20"
      >
        <ChevronLeft className="h-6 w-6" />
        Back
      </Button>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg z-10">
        Fruit Crush
      </h1>

      {/* Score Display */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-lg font-bold shadow-lg z-20">
        Score: {score}
      </div>

      <CandyCrushBoard board={board} onCandyClick={handleCandyClick} selectedCandy={selectedCandy} />
      <p className="mt-8 text-lg text-white/80 text-center max-w-md">Click on adjacent candies to swap them and make matches of 3 or more!</p>
    </div>
  )
}
