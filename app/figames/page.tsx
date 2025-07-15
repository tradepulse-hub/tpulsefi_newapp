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
  Play,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import SnakeGameMobile from "@/components/snake-game-mobile"
import MahjongGameMobile from "@/components/mahjong-game-mobile"
import SpaceShooterMobile from "@/components/space-shooter-mobile"

// Game categories with translations - Space Shooter now playable in Action
const gameCategories = {
  en: [
    {
      id: "action",
      name: "Action",
      icon: Zap,
      gradient: "from-red-500 to-orange-500",
      emoji: "⚡",
      playable: true,
      hasSpaceShooter: true,
    },
    {
      id: "animals",
      name: "Animals",
      icon: Heart,
      gradient: "from-green-500 to-emerald-500",
      emoji: "🐾",
      playable: false,
    },
    {
      id: "adventure",
      name: "Adventure",
      icon: Target,
      gradient: "from-purple-500 to-violet-500",
      emoji: "🗺️",
      playable: false,
    },
    {
      id: "bubbles",
      name: "Bubbles",
      icon: Sparkles,
      gradient: "from-cyan-500 to-blue-500",
      emoji: "🫧",
      playable: false,
    },
    { id: "racing", name: "Racing", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️", playable: false },
    {
      id: "sports",
      name: "Sports",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-500",
      emoji: "⚽",
      playable: false,
    },
    {
      id: "skill",
      name: "Skill",
      icon: Target,
      gradient: "from-pink-500 to-rose-500",
      emoji: "🎯",
      playable: true,
      hasSnake: true,
    },
    {
      id: "mahjong",
      name: "Mahjong",
      icon: Puzzle,
      gradient: "from-red-500 to-orange-500",
      emoji: "🀄",
      playable: true,
      hasMahjong: true,
    },
    { id: "girls", name: "Girls", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧", playable: false },
    { id: "logic", name: "Logic", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠", playable: false },
  ],
  pt: [
    {
      id: "action",
      name: "Acção",
      icon: Zap,
      gradient: "from-red-500 to-orange-500",
      emoji: "⚡",
      playable: true,
      hasSpaceShooter: true,
    },
    {
      id: "animals",
      name: "Animais",
      icon: Heart,
      gradient: "from-green-500 to-emerald-500",
      emoji: "🐾",
      playable: false,
    },
    {
      id: "adventure",
      name: "Aventura",
      icon: Target,
      gradient: "from-purple-500 to-violet-500",
      emoji: "🗺️",
      playable: false,
    },
    {
      id: "bubbles",
      name: "Bubbles",
      icon: Sparkles,
      gradient: "from-cyan-500 to-blue-500",
      emoji: "🫧",
      playable: false,
    },
    {
      id: "racing",
      name: "Corridas",
      icon: Car,
      gradient: "from-yellow-500 to-orange-500",
      emoji: "🏎️",
      playable: false,
    },
    {
      id: "sports",
      name: "Desporto",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-500",
      emoji: "⚽",
      playable: false,
    },
    {
      id: "skill",
      name: "Habilidade",
      icon: Target,
      gradient: "from-pink-500 to-rose-500",
      emoji: "🎯",
      playable: true,
      hasSnake: true,
    },
    {
      id: "mahjong",
      name: "Mahjong",
      icon: Puzzle,
      gradient: "from-red-500 to-orange-500",
      emoji: "🀄",
      playable: true,
      hasMahjong: true,
    },
    {
      id: "girls",
      name: "Meninas",
      icon: Heart,
      gradient: "from-pink-500 to-purple-500",
      emoji: "👧",
      playable: false,
    },
    {
      id: "logic",
      name: "Raciocínio",
      icon: Brain,
      gradient: "from-teal-500 to-cyan-500",
      emoji: "🧠",
      playable: false,
    },
  ],
  es: [
    {
      id: "action",
      name: "Acción",
      icon: Zap,
      gradient: "from-red-500 to-orange-500",
      emoji: "⚡",
      playable: true,
      hasSpaceShooter: true,
    },
    {
      id: "animals",
      name: "Animales",
      icon: Heart,
      gradient: "from-green-500 to-emerald-500",
      emoji: "🐾",
      playable: false,
    },
    {
      id: "adventure",
      name: "Aventura",
      icon: Target,
      gradient: "from-purple-500 to-violet-500",
      emoji: "🗺️",
      playable: false,
    },
    {
      id: "bubbles",
      name: "Burbujas",
      icon: Sparkles,
      gradient: "from-cyan-500 to-blue-500",
      emoji: "🫧",
      playable: false,
    },
    {
      id: "racing",
      name: "Carreras",
      icon: Car,
      gradient: "from-yellow-500 to-orange-500",
      emoji: "🏎️",
      playable: false,
    },
    {
      id: "sports",
      name: "Deportes",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-500",
      emoji: "⚽",
      playable: false,
    },
    {
      id: "skill",
      name: "Habilidad",
      icon: Target,
      gradient: "from-pink-500 to-rose-500",
      emoji: "🎯",
      playable: true,
      hasSnake: true,
    },
    {
      id: "mahjong",
      name: "Mahjong",
      icon: Puzzle,
      gradient: "from-red-500 to-orange-500",
      emoji: "🀄",
      playable: true,
      hasMahjong: true,
    },
    { id: "girls", name: "Chicas", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧", playable: false },
    { id: "logic", name: "Lógica", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠", playable: false },
  ],
  id: [
    {
      id: "action",
      name: "Aksi",
      icon: Zap,
      gradient: "from-red-500 to-orange-500",
      emoji: "⚡",
      playable: true,
      hasSpaceShooter: true,
    },
    {
      id: "animals",
      name: "Hewan",
      icon: Heart,
      gradient: "from-green-500 to-emerald-500",
      emoji: "🐾",
      playable: false,
    },
    {
      id: "adventure",
      name: "Petualangan",
      icon: Target,
      gradient: "from-purple-500 to-violet-500",
      emoji: "🗺️",
      playable: false,
    },
    {
      id: "bubbles",
      name: "Gelembung",
      icon: Sparkles,
      gradient: "from-cyan-500 to-blue-500",
      emoji: "🫧",
      playable: false,
    },
    { id: "racing", name: "Balap", icon: Car, gradient: "from-yellow-500 to-orange-500", emoji: "🏎️", playable: false },
    {
      id: "sports",
      name: "Olahraga",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-500",
      emoji: "⚽",
      playable: false,
    },
    {
      id: "skill",
      name: "Keterampilan",
      icon: Target,
      gradient: "from-pink-500 to-rose-500",
      emoji: "🎯",
      playable: true,
      hasSnake: true,
    },
    {
      id: "mahjong",
      name: "Mahjong",
      icon: Puzzle,
      gradient: "from-red-500 to-orange-500",
      emoji: "🀄",
      playable: true,
      hasMahjong: true,
    },
    { id: "girls", name: "Gadis", icon: Heart, gradient: "from-pink-500 to-purple-500", emoji: "👧", playable: false },
    { id: "logic", name: "Logika", icon: Brain, gradient: "from-teal-500 to-cyan-500", emoji: "🧠", playable: false },
  ],
}

// Featured games for slideshow - Added Space Shooter
const featuredGames = [
  {
    id: 1,
    title: "Super Space Shooter",
    description: {
      en: "Epic space battles await!",
      pt: "Batalhas espaciais épicas te esperam!",
      es: "¡Te esperan batallas espaciales épicas!",
      id: "Pertempuran luar angkasa epik menanti!",
    },
    image: "/images/spaceshooter-logo.jpg",
    gradient: "from-blue-600 to-purple-600",
    category: "action",
    playable: true,
  },
  {
    id: 2,
    title: "Snake Game",
    description: {
      en: "Test your limits!",
      pt: "Testa o teu limite!",
      es: "¡Pon a prueba tus límites!",
      id: "Uji batasmu!",
    },
    image: "/images/snakegame-logo.jpg",
    gradient: "from-green-600 to-emerald-600",
    category: "skill",
    playable: true,
  },
  {
    id: 3,
    title: "Mahjong Solitaire",
    description: {
      en: "Classic tile matching puzzle!",
      pt: "Puzzle clássico de combinação!",
      es: "¡Rompecabezas clásico de fichas!",
      id: "Puzzle pencocokan ubin klasik!",
    },
    image: "/images/mahjonggame-logo.jpg",
    gradient: "from-red-600 to-orange-600",
    category: "mahjong",
    playable: true,
  },
  {
    id: 4,
    title: "Racing Thunder",
    description: {
      en: "High-speed racing action with amazing graphics!",
      pt: "Ação de corrida em alta velocidade com gráficos incríveis!",
      es: "¡Acción de carreras a alta velocidad con gráficos increíbles!",
      id: "Aksi balap berkecepatan tinggi dengan grafik menakjubkan!",
    },
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-yellow-600 to-red-600",
    category: "racing",
    playable: false,
  },
  {
    id: 5,
    title: "Bubble Pop",
    description: {
      en: "Match and pop colorful bubbles in this fun puzzle!",
      pt: "Combina e estoura bolhas coloridas neste puzzle divertido!",
      es: "¡Combina y revienta burbujas coloridas en este divertido puzzle!",
      id: "Cocokkan dan pecahkan gelembung berwarna dalam puzzle yang menyenangkan ini!",
    },
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-cyan-600 to-teal-600",
    category: "bubbles",
    playable: false,
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
    loading: "Loading Game...",
    spaceShooterAvailable: "Space Shooter Available!",
    snakeAvailable: "Snake Game Available!",
    mahjongAvailable: "Mahjong Available!",
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
    loading: "Carregando Jogo...",
    spaceShooterAvailable: "Space Shooter Disponível!",
    snakeAvailable: "Jogo da Cobra Disponível!",
    mahjongAvailable: "Mahjong Disponível!",
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
    loading: "Cargando Juego...",
    spaceShooterAvailable: "¡Space Shooter Disponible!",
    snakeAvailable: "¡Juego de Serpiente Disponible!",
    mahjongAvailable: "¡Mahjong Disponible!",
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
    loading: "Memuat Game...",
    spaceShooterAvailable: "Space Shooter Tersedia!",
    snakeAvailable: "Game Ular Tersedia!",
    mahjongAvailable: "Game Mahjong Tersedia!",
  },
}

export default function FiGamesPage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showSnakeGame, setShowSnakeGame] = useState(false)
  const [showMahjongGame, setShowMahjongGame] = useState(false)
  const [showSpaceShooterGame, setShowSpaceShooterGame] = useState(false)
  const [gameLoading, setGameLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingGame, setLoadingGame] = useState<string>("")

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as keyof typeof translations
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredGames.length)
    }, 3000)

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
    const category = categories.find((cat) => cat.id === categoryId)
    if (category?.playable) {
      if (category.hasSnake) {
        handlePlaySnake()
      } else if (category.hasMahjong) {
        handlePlayMahjong()
      } else if (category.hasSpaceShooter) {
        handlePlaySpaceShooter()
      }
    } else {
      setSelectedCategory(categoryId)
      setShowComingSoon(true)
    }
  }

  const handlePlaySnake = () => {
    setLoadingGame("snake")
    setGameLoading(true)
    setLoadingProgress(0)

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setGameLoading(false)
          setShowSnakeGame(true)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 100)
  }

  const handlePlayMahjong = () => {
    setLoadingGame("mahjong")
    setGameLoading(true)
    setLoadingProgress(0)

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setGameLoading(false)
          setShowMahjongGame(true)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 100)
  }

  const handlePlaySpaceShooter = () => {
    setLoadingGame("spaceshooter")
    setGameLoading(true)
    setLoadingProgress(0)

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setGameLoading(false)
          setShowSpaceShooterGame(true)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 100)
  }

  const handleFeaturedGameClick = (game: any) => {
    if (game.playable) {
      if (game.category === "skill") {
        handlePlaySnake()
      } else if (game.category === "mahjong") {
        handlePlayMahjong()
      } else if (game.category === "action") {
        handlePlaySpaceShooter()
      }
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
      <div className="relative z-10 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">{t.back}</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 font-light"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Featured Games Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">{t.featured}</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
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
                  <div className="relative z-10 h-full flex items-center justify-between p-4 md:p-8">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-3xl font-bold mb-2">{featuredGames[currentSlide].title}</h3>
                      <p className="text-sm md:text-lg text-gray-200 mb-4">
                        {featuredGames[currentSlide].description[currentLang]}
                      </p>
                      <button
                        onClick={() => handleFeaturedGameClick(featuredGames[currentSlide])}
                        className={`${
                          featuredGames[currentSlide].playable
                            ? "bg-white/20 hover:bg-white/30"
                            : "bg-gray-500/20 cursor-not-allowed"
                        } backdrop-blur-sm border border-white/30 text-white px-4 md:px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm md:text-base`}
                        disabled={!featuredGames[currentSlide].playable}
                      >
                        <Play className="w-4 h-4" />
                        <span>{featuredGames[currentSlide].playable ? t.playNow : t.comingSoon}</span>
                      </button>
                    </div>
                    <div className="w-24 h-16 md:w-48 md:h-32 bg-white/10 rounded-lg flex items-center justify-center ml-4 md:ml-8 overflow-hidden">
                      <Image
                        src={featuredGames[currentSlide].image || "/placeholder.svg"}
                        alt={featuredGames[currentSlide].title}
                        width={192}
                        height={128}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </motion.div>
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

        {/* Game Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">{t.categories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`group relative ${
                  category.playable ? "bg-white/10 hover:bg-white/20" : "bg-white/5 hover:bg-white/10"
                } backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 transition-all duration-300 transform hover:scale-105`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-2 md:space-y-3">
                  <div className="text-2xl md:text-3xl">{category.emoji}</div>
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${category.gradient} rounded-full flex items-center justify-center`}
                  >
                    <category.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-center">{category.name}</span>
                  {category.playable && (
                    <div className="text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-1">
                      {category.hasSnake && <span>🐍</span>}
                      {category.hasMahjong && <span>🀄</span>}
                      {category.hasSpaceShooter && <span>🚀</span>}
                      <Play className="w-3 h-3" />
                    </div>
                  )}
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
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={
                    loadingGame === "snake"
                      ? "/images/snakegame-logo.jpg"
                      : loadingGame === "mahjong"
                        ? "/images/mahjonggame-logo.jpg"
                        : "/images/spaceshooter-logo.jpg"
                  }
                  alt={`${loadingGame} Game Logo`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.loading}</h3>

              {/* Loading Bar */}
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    loadingGame === "snake"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : loadingGame === "mahjong"
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div
                className={`text-lg font-semibold ${
                  loadingGame === "snake"
                    ? "text-green-400"
                    : loadingGame === "mahjong"
                      ? "text-red-400"
                      : "text-blue-400"
                }`}
              >
                {Math.round(loadingProgress)}%
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Modals */}
      <AnimatePresence>{showSnakeGame && <SnakeGameMobile onClose={() => setShowSnakeGame(false)} />}</AnimatePresence>
      <AnimatePresence>
        {showMahjongGame && <MahjongGameMobile onClose={() => setShowMahjongGame(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSpaceShooterGame && <SpaceShooterMobile onClose={() => setShowSpaceShooterGame(false)} />}
      </AnimatePresence>
    </div>
  )
}
