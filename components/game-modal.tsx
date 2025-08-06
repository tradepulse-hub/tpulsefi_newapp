"use client"

import { motion } from "framer-motion"
import { X } from 'lucide-react'
import { allGames } from "@/data/games"
import { useMemo } from "react"

interface GameModalProps {
  gameId: string;
  onClose: () => void;
}

export default function GameModal({ gameId, onClose }: GameModalProps) {
  const gameToRender = useMemo(() => {
    return allGames.find(game => game.id === gameId);
  }, [gameId]);

  if (!gameToRender || !gameToRender.component) {
    return null; // Or render an error/fallback UI
  }

  const GameComponent = gameToRender.component;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl text-center relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
      >
        <X className="w-4 h-4 text-white" />
      </button>
      {/* Render the actual game component inside this modal wrapper */}
      <GameComponent onClose={onClose} />
    </motion.div>
  );
}
