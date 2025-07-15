"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  ArrowLeft,
  Gamepad2,
  Zap,
  Target,
  Car,
  Trophy,
  Puzzle,
  Heart,
  Brain,
  Sparkles,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Game categories with icons and colors
const GAME_CATEGORIES = [
  {
    id: "action",
    name: { pt: "Acção", en: "Action", es: "Acción", id: "Aksi" },
    icon: Zap,
    color: "from-red-500 to-orange-500",
    bgColor: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
  },
  {
    id: "animals",
    name: { pt: "Animais", en: "Animals", es: "Animales", id: "Hewan" },
    icon: Heart,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
  },
  {
    id: "adventure",
    name: { pt: "Aventura", en: "Adventure", es: "Aventura", id: "Petualangan" },
    icon: Target,
    color: "from-purple-500 to-violet-500",
    bgColor: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: "bubbles",
    name: { pt: "Bubbles", en: "Bubbles", es: "Burbujas", id: "Gelembung" },
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    bgColor: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
  },
  {
    id: "racing",
    name: { pt: "Corridas", en: "Racing", es: "Carreras", id: "Balap" },
    icon: Car,
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/30",
  },
  {
    id: "sports",
    name: { pt: "Desporto", en: "Sports", es: "Deportes", id: "Olahraga" },
    icon: Trophy,
    color: "from-blue-500 to-indigo-500",
    bgColor: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: "skill",
    name: { pt: "Habilidade", en: "Skill", es: "Habilidad", id: "Keterampilan" },
    icon: Target,
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
  },
  {
    id: "mahjong",
    name: { pt: "Mahjong", en: "Mahjong", es: "Mahjong", id: "Mahjong" },
    icon: Puzzle,
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/30",
  },
  {
    id: "girls",
    name: { pt: "Meninas", en: "Girls", es: "Chicas", id: "Gadis" },
    icon: Heart,
    color: "from-pink-500 to-purple-500",
    bgColor: "from-pink-500/20 to-purple-500/20",
    borderColor: "border-pink-500/30",
  },
  {
    id: "logic",
    name: { pt: "Raciocínio", en: "Logic", es: "Lógica", id: "Logika" },
    icon: Brain,
    color: "from-teal-500 to-cyan-500",
    bgColor: "from-teal-500/20 to-cyan-500/20",
    borderColor: "border-teal-500/30",
  },
]

// Featured games for slideshow
const FEATURED_GAMES = [
  {
    id: 1,
    title: "TPF Racing Championship",
    category: "racing",
    image: "/placeholder.svg?height=200&width=300",
    description: "High-speed racing with TPF rewards",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: 2,
    title: "Crypto Bubble Pop",
    category: "bubbles",
    image: "/placeholder.svg?height=200&width=300",
    description: "Pop bubbles and earn crypto rewards",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: 3,
    title: "DeFi Adventure Quest",
    category: "adventure",
    image: "/placeholder.svg?height=200&width=300",
    description: "Explore the DeFi world and collect tokens",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    id: 4,
    title: "Brain Training Pro",
    category: "logic",
    image: "/placeholder.svg?height=200&width=300",
    description: "Train your mind with logic puzzles",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    id: 5,
    title: "Animal Kingdom",
    category: "animals",
    image: "/placeholder.svg?height=200&width=300",
    description: "Care for virtual pets and earn rewards",
    gradient: "from-green-500 to-emerald-500",
  },
]

// Translations
const translations = {
  en: {
    title: "Fi Games",
    subtitle: "Play, Earn, and Have Fun",
    featuredGames: "Featured Games",
    categories: "Game Categories",
    playNow: "Play Now",
    comingSoon: "Coming Soon",
    back: "Back",
  },
  pt: {
    title: "Fi Games",
    subtitle: "Joga, Ganha e Diverte-te",
    featuredGames: "Jogos em Destaque",
    categories: "Categorias de Jogos",
    playNow: "Jogar Agora",
    comingSoon: "Em Breve",
    back: "Voltar",
  },
  es: {
    title: "Fi Games",
    subtitle: "Juega, Gana y Diviértete",
    featuredGames: "Juegos Destacados",
    categories: "Categorías de Juegos",
    playNow: "Jugar Ahora",
    comingSoon: "Próximamente",
    back: "Atrás",
  },
  id: {
    title: "Fi Games",
    subtitle: "Main, Menang, dan Bersenang-senang",
    featuredGames: "Game Unggulan",
    categories: "Kategori Game",
    playNow: "Main Sekarang",
    comingSoon: "Segera Hadir",
    back: "Kembali",
  },
}

export default function FiGamesPage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as keyof typeof translations
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Auto slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_GAMES.length)
    }, 2000) // 2 seconds as requested

    return () => clearInterval(interval)
  }, [])

  const t = translations[currentLang]
  const currentGame = FEATURED_GAMES[currentSlide]

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Here you would navigate to the specific category page
    // For now, we'll just show a coming soon message
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_GAMES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_GAMES.length) % FEATURED_GAMES.length)
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Moving particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full animate-ping"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              backgroundColor: i % 2 === 0 ? "rgba(34,211,238,0.4)" : "rgba(168,85,247,0.4)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-400 text-sm">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Featured Games Slideshow */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>{t.featuredGames}</span>
          </h2>

          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative h-48 flex items-center"
              >
                {/* Game Image */}
                <div className="w-1/3 h-full relative">
                  <Image
                    src={currentGame.image || "/placeholder.svg"}
                    alt={currentGame.title}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${currentGame.gradient} opacity-20`} />
                </div>

                {/* Game Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`px-2 py-1 bg-gradient-to-r ${currentGame.gradient} rounded-full text-xs font-medium`}
                    >
                      {GAME_CATEGORIES.find((cat) => cat.id === currentGame.category)?.name[currentLang]}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{currentGame.title}</h3>
                  <p className="text-gray-300 mb-4">{currentGame.description}</p>
                  <button
                    className={`bg-gradient-to-r ${currentGame.gradient} hover:opacity-80 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2`}
                  >
                    <Play className="w-4 h-4" />
                    <span>{t.playNow}</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {FEATURED_GAMES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Game Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <span>{t.categories}</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {GAME_CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`group relative bg-gradient-to-br ${category.bgColor} backdrop-blur-sm border ${category.borderColor} rounded-xl p-4 hover:scale-105 transition-all duration-300`}
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm text-center">{category.name[currentLang]}</span>
                  <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t.comingSoon}
                  </div>
                </div>

                {/* Hover particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Coming Soon Modal */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedCategory(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.comingSoon}</h3>
                <p className="text-gray-300 mb-6">
                  {GAME_CATEGORIES.find((cat) => cat.id === selectedCategory)?.name[currentLang]} games are coming soon!
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  OK
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
