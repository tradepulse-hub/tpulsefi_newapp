"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Zap, Heart, Target, Sparkles, Car, Trophy, Puzzle, Brain, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useRouter } from "next/navigation"
import Image from "next/image"
import CategoryMenu from "@/components/category-menu"
import SearchBar from "@/components/search-bar"
import GameModal from "@/components/game-modal" // Import the new GameModal
import { allGames, Game } from "@/data/games"

// Game categories (now hardcoded to English)
const gameCategories = [
  { id: "action", name: "Action", icon: Zap, gradient: "from-red-500 to-orange-500", emoji: "⚡", playable: true },
  { id: "animals", name: "Animals", icon: Heart, gradient: "from-green-500 to-emerald-500", emoji: "🐾", playable: false },
  { id: "adventure", name: "Adventure", icon: Target, gradient: "from-purple-500 to-violet-500", emoji: "🗺️", playable: false },
  { id: "bubbles", name: "Bubbles", icon: Sparkles, gradient: "from-cyan-500 to-blue-500", emoji: "🫧", playable: false },
  { id: "racing", name: "Racing", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️", playable: false },
  { id: "sports", name: "Sports", icon: Trophy, gradient: "from-blue-500 to-indigo-500", emoji: "⚽", playable: false },
  { id: "skill", name: "Skill", icon: Target, gradient: "from-pink-500 to-rose-500", emoji: "🎯", playable: true },
  { id: "mahjong", name: "Mahjong", icon: Puzzle, gradient: "from-red-500 to-orange-500", emoji: "🀄", playable: true },
  { id: "match3", name: "Match 3", icon: Sparkles, gradient: "from-orange-500 to-yellow-500", emoji: "🍬", playable: true },
  { id: "girls", name: "Girls", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧", playable: false },
  { id: "logic", name: "Logic", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠", playable: false },
  { id: "arcade", name: "Arcade", icon: Play, gradient: "from-purple-500 to-pink-500", emoji: "🕹️", playable: true },
]

// Featured games for slideshow
const featuredGamesIds = ["space-shooter", "snake-game", "mahjong-solitaire", "fruit-crush", "flappy-bird"] // Added flappy-bird

export default function FiGamesPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all") // Default to "all"
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [gameLoading, setGameLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingGame, setLoadingGame] = useState<Game | null>(null)
  const [activeGameId, setActiveGameId] = useState<string | null>(null) // Changed to store game ID

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredGamesIds.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const categories = gameCategories.filter(cat => allGames.some(game => game.category === cat.id && game.playable)); // Only show categories with playable games
  const featuredGames = useMemo(() => featuredGamesIds.map(id => allGames.find(game => game.id === id && game.playable)).filter(Boolean) as Game[], []);

  const filteredGames = useMemo(() => {
    let games = allGames.filter(game => game.playable && game.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory !== "all") {
      games = games.filter(game => game.category === selectedCategory);
    }
    return games;
  }, [selectedCategory, searchQuery]);


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredGames.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredGames.length) % featuredGames.length)
  }

  const handlePlayGame = (game: Game) => {
    if (!game.playable) {
      console.warn("Attempted to play a non-playable game:", game.id);
      return;
    }

    // For all games, open as a modal
    if (game.component) {
      setLoadingGame(game)
      setGameLoading(true)
      setLoadingProgress(0)

      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setGameLoading(false)
            setActiveGameId(game.id); // Set the ID of the game to be active
            return 100
          }
          return prev + Math.random() * 15 + 5
        })
      }, 100)
    } else {
      console.warn("Game has no component:", game.id);
    }
  }

  const handleCloseGame = () => {
    setActiveGameId(null) // Clear the active game ID
    setLoadingGame(null)
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full animate-ping"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              backgroundColor:
                i % 4 === 0
                  ? "rgba(255,255,255,0.6)"
                  : i % 4 === 1
                    ? "rgba(34,211,238,0.4)"
                    : i % 4 === 2
                      ? "rgba(59,130,246,0.4)"
                      : "rgba(147,51,234,0.4)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-transparent to-pink-900/10" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">Back</span>
          </button>
        </div>

        {/* Intro Video */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8 md:mb-12 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-white/10"
        >
          <video
            className="w-full h-auto"
            src="/videos/figames.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            aria-label="Game portal introduction video"
          >
            Your browser does not support the video tag.
          </video>
        </motion.div>

        {/* Featured Games Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Featured Games</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {featuredGames[currentSlide] && (
                  <motion.div
                    key={featuredGames[currentSlide].id}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-r ${
                      gameCategories.find(cat => cat.id === featuredGames[currentSlide]?.category)?.gradient || "from-gray-600 to-gray-800"
                    }`}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 h-full flex items-center justify-between p-4 md:p-8">
                      <div className="flex-1">
                        <h3 className="text-xl md:text-3xl font-bold mb-2">{featuredGames[currentSlide].title}</h3>
                        <p className="text-sm md:text-lg text-gray-200 mb-4">
                          {featuredGames[currentSlide].description}
                        </p>
                        <button
                          onClick={() => handlePlayGame(featuredGames[currentSlide])}
                          className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 md:px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm md:text-base`}
                        >
                          <Play className="w-4 h-4" />
                          <span>Play Now</span>
                        </button>
                      </div>
                      <div className="w-24 h-16 md:w-48 md:h-32 bg-white/10 rounded-lg flex items-center justify-center ml-4 md:ml-8 overflow-hidden">
                        <Image
                          src={featuredGames[currentSlide].image || "/placeholder.svg"}
                          alt={featuredGames[currentSlide].title}
                          width={192}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {featuredGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Menu */}
      <CategoryMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Search Bar */}
      <div className="relative z-10 p-4 md:p-6 pt-0">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search games..."
        />

        {/* Game Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
            {selectedCategory === "all" ? "All games" : gameCategories.find(cat => cat.id === selectedCategory)?.name || "All games"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 max-w-6xl mx-auto">
            {filteredGames.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => handlePlayGame(game)}
                className={`group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center`}
              >
                {/* Game Image/Icon */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden mb-2 md:mb-3 flex items-center justify-center bg-white/5">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">{game.title}</span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </motion.button>
            ))}
            {filteredGames.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-10">
                No games found for this category or search query.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Game Loading Modal */}
      <AnimatePresence>
        {gameLoading && loadingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={loadingGame.image || "/placeholder.svg"}
                  alt={`${loadingGame.title} Logo`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">Loading Game...</h3>

              {/* Loading Bar */}
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    gameCategories.find(cat => cat.id === loadingGame.category)?.gradient || "bg-gray-500"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div
                className={`text-lg font-semibold ${
                  gameCategories.find(cat => cat.id === loadingGame.category)?.gradient.split(' ')[0].replace('from-', 'text-').replace('-500', '-400') || "text-gray-400"
                }`}
              >
                {Math.round(loadingProgress)}%
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Game Component Modal */}
      <AnimatePresence>
        {activeGameId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <GameModal gameId={activeGameId} onClose={handleCloseGame} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
