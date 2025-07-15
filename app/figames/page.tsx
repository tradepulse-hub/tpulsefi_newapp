"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Zap,
  Heart,
  Target,
  Sparkles,
  Car,
  Trophy,
  Puzzle,
  Brain,
  ChevronLeft,
  ChevronRight,
  X,
  Gamepad2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import SnakeGameMobile from "@/components/snake-game-mobile"

// Game categories with translations
const gameCategories = {
  en: [
    { id: "action", name: "Action", icon: Zap, gradient: "from-red-500 to-orange-500", emoji: "⚡" },
    { id: "animals", name: "Animals", icon: Heart, gradient: "from-green-500 to-emerald-500", emoji: "🐾" },
    { id: "adventure", name: "Adventure", icon: Target, gradient: "from-purple-500 to-violet-500", emoji: "🗺️" },
    { id: "bubbles", name: "Bubbles", icon: Sparkles, gradient: "from-cyan-500 to-blue-500", emoji: "🫧" },
    { id: "racing", name: "Racing", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️" },
    { id: "sports", name: "Sports", icon: Trophy, gradient: "from-blue-500 to-indigo-500", emoji: "⚽" },
    { id: "skill", name: "Skill", icon: Target, gradient: "from-pink-500 to-rose-500", emoji: "🎯" },
    { id: "mahjong", name: "Mahjong", icon: Puzzle, gradient: "from-amber-500 to-yellow-500", emoji: "🀄" },
    { id: "girls", name: "Girls", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧" },
    { id: "logic", name: "Logic", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠" },
  ],
  pt: [
    { id: "action", name: "Acção", icon: Zap, gradient: "from-red-500 to-orange-500", emoji: "⚡" },
    { id: "animals", name: "Animais", icon: Heart, gradient: "from-green-500 to-emerald-500", emoji: "🐾" },
    { id: "adventure", name: "Aventura", icon: Target, gradient: "from-purple-500 to-violet-500", emoji: "🗺️" },
    { id: "bubbles", name: "Bubbles", icon: Sparkles, gradient: "from-cyan-500 to-blue-500", emoji: "🫧" },
    { id: "racing", name: "Corridas", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️" },
    { id: "sports", name: "Desporto", icon: Trophy, gradient: "from-blue-500 to-indigo-500", emoji: "⚽" },
    { id: "skill", name: "Habilidade", icon: Target, gradient: "from-pink-500 to-rose-500", emoji: "🎯" },
    { id: "mahjong", name: "Mahjong", icon: Puzzle, gradient: "from-amber-500 to-yellow-500", emoji: "🀄" },
    { id: "girls", name: "Meninas", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧" },
    { id: "logic", name: "Raciocínio", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠" },
  ],
  es: [
    { id: "action", name: "Acción", icon: Zap, gradient: "from-red-500 to-orange-500", emoji: "⚡" },
    { id: "animals", name: "Animales", icon: Heart, gradient: "from-green-500 to-emerald-500", emoji: "🐾" },
    { id: "adventure", name: "Aventura", icon: Target, gradient: "from-purple-500 to-violet-500", emoji: "🗺️" },
    { id: "bubbles", name: "Burbujas", icon: Sparkles, gradient: "from-cyan-500 to-blue-500", emoji: "🫧" },
    { id: "racing", name: "Carreras", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️" },
    { id: "sports", name: "Deportes", icon: Trophy, gradient: "from-blue-500 to-indigo-500", emoji: "⚽" },
    { id: "skill", name: "Habilidad", icon: Target, gradient: "from-pink-500 to-rose-500", emoji: "🎯" },
    { id: "mahjong", name: "Mahjong", icon: Puzzle, gradient: "from-amber-500 to-yellow-500", emoji: "🀄" },
    { id: "girls", name: "Chicas", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧" },
    { id: "logic", name: "Lógica", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠" },
  ],
  id: [
    { id: "action", name: "Aksi", icon: Zap, gradient: "from-red-500 to-orange-500", emoji: "⚡" },
    { id: "animals", name: "Hewan", icon: Heart, gradient: "from-green-500 to-emerald-500", emoji: "🐾" },
    { id: "adventure", name: "Petualangan", icon: Target, gradient: "from-purple-500 to-violet-500", emoji: "🗺️" },
    { id: "bubbles", name: "Gelembung", icon: Sparkles, gradient: "from-cyan-500 to-blue-500", emoji: "🫧" },
    { id: "racing", name: "Balap", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️" },
    { id: "sports", name: "Olahraga", icon: Trophy, gradient: "from-blue-500 to-indigo-500", emoji: "⚽" },
    { id: "skill", name: "Keterampilan", icon: Target, gradient: "from-pink-500 to-rose-500", emoji: "🎯" },
    { id: "mahjong", name: "Mahjong", icon: Puzzle, gradient: "from-amber-500 to-yellow-500", emoji: "🀄" },
    { id: "girls", name: "Gadis", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧" },
    { id: "logic", name: "Logika", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠" },
  ],
}

// Featured games for slideshow
const featuredGames = [
  {
    id: 1,
    title: "Snake Game",
    description: "Classic snake game with swipe controls!",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-green-600 to-emerald-600",
    category: "action",
    gameComponent: "snake",
    icon: "🐍",
  },
  {
    id: 2,
    title: "Racing Thunder",
    description: "High-speed racing action with amazing graphics!",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-yellow-600 to-red-600",
    category: "racing",
  },
  {
    id: 3,
    title: "Bubble Pop",
    description: "Match and pop colorful bubbles in this fun puzzle!",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-cyan-600 to-teal-600",
    category: "bubbles",
  },
  {
    id: 4,
    title: "Animal Kingdom",
    description: "Take care of cute animals in this simulation!",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-green-600 to-emerald-600",
    category: "animals",
  },
  {
    id: 5,
    title: "Brain Teaser",
    description: "Challenge your mind with these logic puzzles!",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-indigo-600 to-purple-600",
    category: "logic",
  },
]

// Translations
const translations = {
  en: {
    title: "Fi Games",
    subtitle: "Play and have fun!",
    back: "Back",
    categories: "Game Categories",
    featured: "Featured Games",
    comingSoon: "Coming Soon",
    comingSoonDesc: "This game category will be available soon. Stay tuned!",
    close: "Close",
    playNow: "Play Now",
  },
  pt: {
    title: "Fi Games",
    subtitle: "Play and have fun!",
    back: "Voltar",
    categories: "Categorias de Jogos",
    featured: "Jogos em Destaque",
    comingSoon: "Em Breve",
    comingSoonDesc: "Esta categoria de jogos estará disponível em breve. Fique atento!",
    close: "Fechar",
    playNow: "Jogar Agora",
  },
  es: {
    title: "Fi Games",
    subtitle: "Play and have fun!",
    back: "Atrás",
    categories: "Categorías de Juegos",
    featured: "Juegos Destacados",
    comingSoon: "Próximamente",
    comingSoonDesc: "Esta categoría de juegos estará disponible pronto. ¡Mantente atento!",
    close: "Cerrar",
    playNow: "Jugar Ahora",
  },
  id: {
    title: "Fi Games",
    subtitle: "Play and have fun!",
    back: "Kembali",
    categories: "Kategori Game",
    featured: "Game Unggulan",
    comingSoon: "Segera Hadir",
    comingSoonDesc: "Kategori game ini akan tersedia segera. Nantikan!",
    close: "Tutup",
    playNow: "Main Sekarang",
  },
}

export default function FiGamesPage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showGame, setShowGame] = useState(false)
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [gameLoading, setGameLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as keyof typeof translations
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Auto-advance slideshow every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredGames.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const t = translations[currentLang]
  const categories = gameCategories[currentLang]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredGames.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredGames.length) % featuredGames.length)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowComingSoon(true)
  }

  const handleGameClick = (gameComponent: string) => {
    if (gameComponent === "snake") {
      setSelectedGame(gameComponent)
      setGameLoading(true)
      setLoadingProgress(0)

      // Simulate loading progress
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setGameLoading(false)
            setShowGame(true)
            return 100
          }
          return prev + Math.random() * 15 + 5
        })
      }, 100)
    }
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
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 font-light"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Featured Games Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">{t.featured}</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-64 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-r ${featuredGames[currentSlide].gradient} rounded-2xl`}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 h-full flex items-center justify-between p-8">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-2">{featuredGames[currentSlide].title}</h3>
                      <p className="text-lg text-gray-200 mb-4">{featuredGames[currentSlide].description}</p>
                      <button
                        onClick={() => handleGameClick(featuredGames[currentSlide].gameComponent)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-lg transition-all duration-300"
                      >
                        {t.playNow}
                      </button>
                    </div>
                    <div className="w-48 h-32 bg-white/10 rounded-lg flex items-center justify-center ml-8">
                      <Image
                        src={featuredGames[currentSlide].image || "/placeholder.svg"}
                        alt={featuredGames[currentSlide].title}
                        width={192}
                        height={128}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {featuredGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Game Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">{t.categories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCategoryClick(category.id)}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="text-3xl">{category.emoji}</div>
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${category.gradient} rounded-full flex items-center justify-center`}
                  >
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">{category.name}</span>
                </div>

                {/* Hover Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-10 rounded-xl blur-xl transition-opacity duration-300`}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.comingSoon}</h3>
                <p className="text-gray-300 mb-6">{t.comingSoonDesc}</p>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
                >
                  {t.close}
                </button>
              </div>

              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`modal-particle-${i}`}
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: `${2 + Math.random() * 2}px`,
                    height: `${2 + Math.random() * 2}px`,
                    backgroundColor: i % 2 === 0 ? "rgba(168,85,247,0.6)" : "rgba(236,72,153,0.4)",
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Loading Modal */}
      <AnimatePresence>
        {gameLoading && (
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
              <div className="text-6xl mb-4">🐍</div>
              <h3 className="text-2xl font-bold mb-4">Loading Snake Game</h3>

              {/* Loading Bar */}
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="text-lg font-semibold text-green-400">{Math.round(loadingProgress)}%</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snake Game Modal */}
      <AnimatePresence>
        {showGame && selectedGame === "snake" && <SnakeGameMobile onClose={() => setShowGame(false)} />}
      </AnimatePresence>
    </div>
  )
}
