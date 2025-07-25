"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Menu,
  X,
  Wallet,
  Eye,
  Newspaper,
  Users,
  Info,
  Gift,
  TrendingUp,
  Hand,
  Globe,
  ExternalLink,
  Calendar,
  Star,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Gamepad2,
  Code,
  Send,
} from "lucide-react"
import { useMiniKit } from "../../hooks/use-minikit"
import MiniWallet from "../../components/mini-wallet"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { BackgroundEffect } from "../../components/background-effect" // Import the new BackgroundEffect

// Simplified language support
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English", gradient: "from-blue-400 to-blue-600" },
  { code: "pt", name: "Português", flag: "🇧🇷", nativeName: "Português", gradient: "from-green-400 to-green-600" },
  { code: "es", name: "Español", flag: "🇪🇸", nativeName: "Español", gradient: "from-red-400 to-red-600" },
  {
    code: "id",
    name: "Bahasa Indonesia",
    flag: "🇮🇩",
    nativeName: "Bahasa Indonesia",
    gradient: "from-red-400 to-white",
  },
]

// Partnerships data
const PARTNERSHIPS = [
  {
    id: "holdstation",
    name: "HoldStation",
    image: "/images/holdstation-logo.jpg",
    gradient: "from-blue-500 to-purple-600",
    url: "https://world.org/mini-app?app_id=app_0d4b759921490adc1f2bd569fda9b53a&path=/ref/f5S3wA",
  },
  {
    id: "axo",
    name: "AXO",
    image: "/images/axo.jpg",
    gradient: "from-pink-500 to-rose-600",
    url: "https://worldcoin.org/mini-app?app_id=app_8aeb55d57b7be834fb8d67e2f803d258&app_mode=mini-app",
  },
  {
    id: "dropwallet",
    name: "Drop Wallet",
    image: "/images/HUB.png",
    gradient: "from-yellow-500 to-orange-600",
    url: "https://worldcoin.org/mini-app?app_id=app_459cd0d0d3125864ea42bd4c19d1986c&app_mode=mini-app",
  },
  {
    id: "humantap",
    name: "Human Tap",
    image: "/images/human-tap.jpg",
    gradient: "from-green-500 to-emerald-600",
    url: "https://worldcoin.org/mini-app?app_id=app_25cf6ee1d9660721e651d43cf126953a&app_mode=mini-app",
  },
]

// Palavras motivacionais que aparecem entre os botões sociais e parcerias
const MOTIVATIONAL_WORDS = [
  "Confiança",
  "Foco no longo prazo",
  "Compromisso",
  "são palavras que para nós faz sentido",
  "apoia o nosso projeto",
  "convida amigos e familiares",
  "e vamos",
  "dar valor a TPulseFi",
]

// Translations
const translations = {
  en: {
    presentation: {
      tagline: "The Future of Decentralized Finance",
      connectWallet: "Connect Wallet",
    },
    navigation: {
      codepulse: "PulseCode", // Changed from CodePulse
      wallet: "Wallet",
      news: "News",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      membership: "Membership",
      partnerships: "Partnerships",
      about: "About",
    },
    common: {
      wallet: "Wallet",
      loading: "Loading...",
      language: "Language",
      close: "Close",
      back: "Back",
    },
    partnerships: {
      visitApp: "Visit App",
    },
    events: {
      title: "Live Events",
      liveEvent: "LIVE EVENT",
      eventTitle: "FiStaking Boost Event",
      eventDescription: "Until the 20th of next month two FiStaking tokens increased the % gain, take advantage.",
      eventDetails: "The more TPF you have, the more you earn.",
      eventWarning: "Don't miss this limited time opportunity to maximize your FiStaking rewards!",
      eventPeriod: "Event Period",
      eventDates: "July 15, 2025 - August 15, 2025",
      participateNow: "Participate Now",
      termsConditions: "Terms & Conditions",
      eventButton: "Event",
    },
  },
  pt: {
    presentation: {
      tagline: "O Futuro das Finanças Descentralizadas",
      connectWallet: "Conectar Carteira",
    },
    navigation: {
      codepulse: "PulseCode", // Changed from CodePulse
      wallet: "Carteira",
      news: "Notícias",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      membership: "Membros",
      partnerships: "Parcerias",
      about: "Sobre",
    },
    common: {
      wallet: "Carteira",
      loading: "Carregando...",
      language: "Idioma",
      close: "Fechar",
      back: "Voltar",
    },
    partnerships: {
      visitApp: "Visitar App",
    },
    events: {
      title: "Eventos Ao Vivo",
      liveEvent: "EVENTO AO VIVO",
      eventTitle: "Evento de Aumento FiStaking",
      eventDescription: "Até ao dia 20 do próximo mês dois tokens do FiStaking aumentaram a % de ganho, aproveita.",
      eventDetails: "Quanto mais TPF tiveres, mais ganhas.",
      eventWarning: "Não percas esta oportunidade de tempo limitado para maximizar as tuas recompensas FiStaking!",
      eventPeriod: "Período do Evento",
      eventDates: "15 de Julho, 2025 - 15 de Agosto, 2025",
      participateNow: "Participar Agora",
      termsConditions: "Termos e Condições",
      eventButton: "Evento",
    },
  },
  es: {
    presentation: {
      tagline: "El Futuro de las Finanças Descentralizadas",
      connectWallet: "Conectar Billetera",
    },
    navigation: {
      codepulse: "PulseCode", // Changed from CodePulse
      wallet: "Billetera",
      news: "Noticias",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      membership: "Membresía",
      partnerships: "Asociaciones",
      about: "Acerca de",
    },
    common: {
      wallet: "Billetera",
      loading: "Cargando...",
      language: "Idioma",
      close: "Cerrar",
      back: "Atrás",
    },
    partnerships: {
      visitApp: "Visitar App",
    },
    events: {
      title: "Eventos En Vivo",
      liveEvent: "EVENTO EN VIVO",
      eventTitle: "Evento de Impulso FiStaking",
      eventDescription:
        "Hasta el día 20 del próximo mes dos tokens de FiStaking aumentaron el % de ganancia, aprovecha.",
      eventDetails: "Cuanto más TPF tengas, más ganas.",
      eventWarning: "¡No te pierdas esta oportunidad de tiempo limitado para maximizar tus recompensas FiStaking!",
      eventPeriod: "Período del Evento",
      eventDates: "15 de Julio, 2025 - 15 de Agosto, 2025",
      participateNow: "Participar Ahora",
      termsConditions: "Términos y Condiciones",
      eventButton: "Evento",
    },
  },
  id: {
    presentation: {
      tagline: "Masa Depan Keuangan Terdesentralisasi",
      connectWallet: "Hubungkan Dompet",
    },
    navigation: {
      codepulse: "PulseCode", // Changed from CodePulse
      wallet: "Dompet",
      news: "Berita",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      membership: "Keanggotaan",
      partnerships: "Kemitraan",
      about: "Tentang",
    },
    common: {
      wallet: "Dompet",
      loading: "Memuat...",
      language: "Bahasa",
      close: "Tutup",
      back: "Kembali",
    },
    partnerships: {
      visitApp: "Kunjungi App",
    },
    events: {
      title: "Acara Langsung",
      liveEvent: "ACARA LANGSUNG",
      eventTitle: "Acara Peningkatan FiStaking",
      eventDescription: "Sampai tanggal 20 bulan depan dua token FiStaking meningkatkan % keuntungan, manfaatkan.",
      eventDetails: "Semakin banyak TPF yang Anda miliki, semakin banyak yang Anda peroleh.",
      eventWarning: "Jangan lewatkan kesempatan terbatas ini untuk memaksimalkan hadiah FiStaking Anda!",
      eventPeriod: "Periode Acara",
      eventDates: "15 Juli, 2025 - 15 Agustus, 2025",
      participateNow: "Berpartisipasi Sekarang",
      termsConditions: "Syarat & Ketentuan",
      eventButton: "Acara",
    },
  },
}

interface NavItem {
  id: string
  labelKey: keyof typeof translations.en.navigation
  icon: React.ComponentType<any>
  href?: string
  action?: () => void
}

interface PresentationProps {
  address?: string
  shortAddress?: string
  copy?: () => void
}

const Presentation: React.FC<PresentationProps> = ({ address, shortAddress, copy }) => {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMiniWallet, setShowMiniWallet] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showEventsModal, setShowEventsModal] = useState(false)
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)
  const router = useRouter()
  const isMobile = useMobile()

  // Adiciona um novo estado para controlar as palavras que aparecem:
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showWord, setShowWord] = useState(true)

  // Get translations for current language
  const t = translations[currentLang]
  const fullText = t.presentation?.tagline || "The Future of Decentralized Finance"

  // Safe MiniKit usage with fallbacks
  const miniKitContext = useMiniKit()
  const {
    user = null,
    isAuthenticated = false,
    isLoading = false,
    connectWallet = async () => {},
    disconnectWallet = async () => {},
  } = miniKitContext || {}

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as keyof typeof translations
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Show mini wallet when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setShowMiniWallet(true)
    } else {
      setShowMiniWallet(false)
    }
  }, [isAuthenticated, user])

  // Partnership slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPartnerIndex((prev) => (prev + 1) % PARTNERSHIPS.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Efeito para palavras motivacionais
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setShowWord(false)
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % MOTIVATIONAL_WORDS.length)
        setShowWord(true)
      }, 200) // Pequena pausa entre palavras
    }, 2000) // 2 segundos por palavra

    return () => clearInterval(wordInterval)
  }, [])

  // REAL wallet connection handler
  const handleWalletConnect = async () => {
    if (!isAuthenticated) {
      try {
        await connectWallet()
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        alert(error instanceof Error ? error.message : "Failed to connect wallet")
      }
    }
  }

  // Handle disconnect
  const handleWalletDisconnect = async () => {
    console.log("🔌 Disconnect button clicked")
    try {
      await disconnectWallet()
      setShowMiniWallet(false)
      console.log("✅ Wallet disconnected and mini wallet hidden")
    } catch (error) {
      console.error("❌ Error during disconnect:", error)
    }
  }

  // Handle minimize wallet
  const handleMinimizeWallet = () => {
    setShowMiniWallet(false)
  }

  // Handle show wallet again
  const handleShowWallet = () => {
    if (isAuthenticated) {
      setShowMiniWallet(true)
    }
  }

  // Handle wallet menu item click (now CodePulse)
  const handleCodePulseMenuClick = () => {
    // This action will navigate to the CodePulse page
    router.push("/codepulse")
    setIsMenuOpen(false)
  }

  // Typewriter effect
  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 150
    const pauseTime = isDeleting ? 1000 : 2000

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText.length < fullText.length) {
        setDisplayText(fullText.slice(0, displayText.length + 1))
      } else if (isDeleting && displayText.length > 0) {
        setDisplayText(fullText.slice(0, displayText.length - 1))
      } else if (!isDeleting && displayText.length === fullText.length) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && displayText.length === 0) {
        setIsDeleting(false)
      }
    }, typeSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, fullText])

  const navigationItems: NavItem[] = [
    {
      id: "pulsecode", // Changed from wallet
      labelKey: "codepulse", // Changed label key
      icon: Code, // Changed icon to Code
      href: "/codepulse", // New href
      action: handleCodePulseMenuClick, // Explicit action for clarity
    },
    {
      id: "news",
      labelKey: "news",
      icon: Newspaper,
      href: "/news",
    },
    {
      id: "airdrop",
      labelKey: "airdrop",
      icon: Gift,
      href: "/airdrop",
    },
    {
      id: "fistaking",
      labelKey: "fistaking",
      icon: TrendingUp,
      href: "/fistaking",
    },
    {
      id: "figames",
      labelKey: "figames",
      icon: Gamepad2,
      href: "/figames",
    },
    {
      id: "membership",
      labelKey: "membership",
      icon: Users,
      href: "/membership",
    },
    {
      id: "partnerships",
      labelKey: "partnerships",
      icon: Hand,
      href: "/partnerships",
    },
    {
      id: "about",
      labelKey: "about",
      icon: Info,
      href: "/about",
    },
  ]

  const handleLanguageChange = (newLanguage: keyof typeof translations) => {
    console.log("Changing language from", currentLang, "to", newLanguage)
    setCurrentLang(newLanguage)
    localStorage.setItem("preferred-language", newLanguage)
    setShowLanguageMenu(false)
    setIsMenuOpen(false)
  }

  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang)
  const currentPartner = PARTNERSHIPS[currentPartnerIndex]

  const handlePartnerClick = () => {
    window.open(currentPartner.url, "_blank")
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* New Background Effect */}
      <BackgroundEffect />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        {" "}
        {/* Reduced padding from p-6 to p-4 */}
        <div className="flex items-center justify-between">
          {/* Left Side - Events Icon */}
          <div className="flex items-center space-x-2">
            {" "}
            {/* Reduced space-x-3 to space-x-2 */}
            {/* Events Icon */}
            <button onClick={() => setShowEventsModal(true)} className="relative group">
              <div className="px-2 py-1.5 bg-black/20 backdrop-blur-md border border-orange-400/30 rounded-full flex items-center space-x-1 hover:bg-orange-500/10 transition-all duration-300">
                {" "}
                {/* Reduced padding and space-x */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Calendar className="w-3 h-3 text-orange-300 relative z-10" /> {/* Reduced icon size */}
                <span className="text-xs font-medium relative z-10">
                  {" "}
                  {/* Reduced text size */}
                  {t.events?.eventButton || "Evento"}
                </span>
                {/* Live Indicator */}
                <div className="flex items-center space-x-0.5">
                  {" "}
                  {/* Reduced space-x */}
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> {/* Reduced indicator size */}
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </div>
            </button>
            {/* Wallet Button (when wallet is connected but hidden) */}
            {isAuthenticated && !showMiniWallet && (
              <button onClick={handleShowWallet} className="relative group">
                <div className="px-2 py-1.5 bg-black/20 backdrop-blur-md border border-green-400/30 rounded-full flex items-center space-x-1 hover:bg-green-500/10 transition-all duration-300">
                  {" "}
                  {/* Reduced padding and space-x */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Eye className="w-3 h-3 text-green-300 relative z-10" /> {/* Reduced icon size */}
                  <span className="text-xs font-medium relative z-10">
                    {" "}
                    {/* Reduced text size */}
                    {t.common?.wallet || "Wallet"}
                  </span>
                </div>
              </button>
            )}
            {/* Connect Wallet Button (only when not connected) */}
            {!isAuthenticated && (
              <button onClick={handleWalletConnect} disabled={isLoading} className="relative group">
                <div className="px-4 py-2 bg-black/20 backdrop-blur-md border border-cyan-400/30 rounded-full flex items-center space-x-1.5 hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50">
                  {" "}
                  {/* Reduced padding and space-x */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Wallet className="w-4 h-4 text-cyan-300 relative z-10" /> {/* Reduced icon size */}
                  <span className="text-sm font-medium relative z-10">
                    {" "}
                    {/* Reduced text size */}
                    {isLoading ? t.common?.loading || "Loading..." : t.presentation?.connectWallet || "Connect Wallet"}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Right Side - Language Selector */}
          <div className="relative">
            <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="relative group">
              <div className="px-2 py-1.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-1 hover:bg-white/10 transition-all duration-300">
                {" "}
                {/* Reduced padding and space-x */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Globe className="w-3 h-3 text-purple-300 relative z-10" /> {/* Reduced icon size */}
                <span className="text-xs font-medium relative z-10">
                  {" "}
                  {/* Reduced text size */}
                  {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
                </span>
              </div>
            </button>

            {/* Language Dropdown */}
            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-10 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[180px] shadow-2xl" // Adjusted top and min-width
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as keyof typeof translations)}
                      className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                        // Adjusted padding and space-x
                        currentLang === lang.code
                          ? `bg-gradient-to-r ${lang.gradient} bg-opacity-20 text-white`
                          : "hover:bg-white/5 text-gray-300 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span> {/* Adjusted text size */}
                      <div className="text-left">
                        <div className="text-xs font-medium">{lang.nativeName}</div> {/* Adjusted text size */}
                        <div className="text-xs opacity-70">{lang.name}</div> {/* Adjusted text size */}
                      </div>
                      {currentLang === lang.code && <div className="ml-auto text-green-400 text-xs">✓</div>}{" "}
                      {/* Adjusted text size */}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mini Wallet - Positioned with safe spacing from top navigation */}
      <AnimatePresence>
        {showMiniWallet && user && (
          <div className="absolute top-4 left-4 z-40">
            {" "}
            {/* Adjusted top and left */}
            <MiniWallet
              walletAddress={user.walletAddress}
              onMinimize={handleMinimizeWallet}
              onDisconnect={handleWalletDisconnect}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Events Modal */}
      <AnimatePresence>
        {showEventsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventsModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3 max-w-xs w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowEventsModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Modal Header with TPF Logo */}
              <div className="text-center mb-3">
                {/* Back Button */}
                <button
                  onClick={() => setShowEventsModal(false)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">{t.common?.back || "Back"}</span>
                </button>
                {/* Animated TPF Logo */}
                <div className="relative mb-2 flex justify-center">
                  {/* Glow Effects */}
                  <div className="absolute w-12 h-12 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-xl animate-pulse" />
                  <div
                    className="absolute w-10 h-10 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-lg animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />

                  {/* Logo Container */}
                  <div className="relative w-12 h-12 bg-white rounded-full p-2 shadow-2xl animate-bounce">
                    <Image
                      src="/images/logo-tpf.png"
                      alt="TPulseFi Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Live Badge */}
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 rounded-full mb-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold tracking-wider">
                    {t.events?.liveEvent || "LIVE EVENT"}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white mb-1">{t.events?.title || "Live Events"}</h2>
              </div>

              {/* Event Content */}
              <div className="space-y-2">
                {/* Event Title */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <h3 className="text-xs font-semibold text-white">
                      {t.events?.eventTitle || "FiStaking Boost Event"}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <p className="text-green-300 text-xs">
                      {t.events?.eventDescription ||
                        "Until the 20th of next month two FiStaking tokens increased the % gain, take advantage."}
                    </p>
                  </div>

                  <p className="text-gray-300 text-xs">
                    {t.events?.eventDetails || "The more TPF you have, the more you earn."}
                  </p>
                </div>

                {/* Warning */}
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-2">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-300 text-xs">
                      {t.events?.eventWarning ||
                        "Don't miss this limited time opportunity to maximize your FiStaking rewards!"}
                    </p>
                  </div>
                </div>

                {/* Event Period */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <h4 className="text-white text-xs">{t.events?.eventPeriod || "Event Period"}</h4>
                  </div>
                  <p className="text-blue-300 font-mono text-xs">
                    {t.events?.eventDates || "July 15, 2025 - August 15, 2025"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs">
                    {t.events?.participateNow || "Participate Now"}
                  </button>
                  <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 text-xs">
                    {t.events?.termsConditions || "Terms & Conditions"}
                  </button>
                </div>
              </div>

              {/* Floating Particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`modal-particle-${i}`}
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
                    backgroundColor: i % 2 === 0 ? "rgba(255,215,0,0.6)" : "rgba(255,165,0,0.4)",
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

      {/* Partnership Slideshow - Between subtitle and bottom bar */}
      <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPartnerIndex}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.8,
            }}
            className="relative group cursor-pointer"
            onClick={handlePartnerClick}
          >
            {/* Partnership Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-2 hover:bg-black/60 transition-all duration-300 shadow-2xl">
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentPartner.gradient} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center space-x-3">
                {/* Partner Logo */}
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-700/50 flex-shrink-0">
                  <Image
                    src={currentPartner.image || "/placeholder.svg"}
                    alt={currentPartner.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Partner Info */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">{currentPartner.name}</h3>
                  <div className={`h-0.5 w-12 bg-gradient-to-r ${currentPartner.gradient} rounded-full mt-0.5`} />
                </div>

                {/* Visit Button */}
                <div
                  className={`bg-gradient-to-r ${currentPartner.gradient} text-white px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 group-hover:scale-105 transition-transform duration-300`}
                >
                  <span className="text-xs">{t.partnerships?.visitApp || "Visit App"}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center space-x-1.5 mt-2">
                {PARTNERSHIPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentPartnerIndex ? `bg-gradient-to-r ${currentPartner.gradient}` : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar with Wallet Icon + Menu Button */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        {/* Futuristic Bottom Bar */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 via-gray-300/10 to-transparent blur-lg" />
          {/* Main Bar */}
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl">
            <div className="flex items-center justify-center py-2 px-4 space-x-4">
              {/* Wallet Icon (when wallet is connected but hidden) */}
              {isAuthenticated && !showMiniWallet && (
                <button onClick={handleShowWallet} className="relative group">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-md border border-green-400/30 rounded-full flex items-center justify-center hover:from-green-400/30 hover:to-emerald-400/30 transition-all duration-300 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Eye className="w-4 h-4 text-green-300 relative z-10" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              )}

              {/* Central Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative group">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400/20 to-gray-600/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:from-gray-400/30 hover:to-gray-600/30 transition-all duration-300 shadow-xl">
                  {/* Pulsing Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400/30 to-gray-600/30 rounded-full animate-ping opacity-75" />
                  {/* Inner Glow */}
                  <div className="absolute inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Icon */}
                  {isMenuOpen ? (
                    <X className="w-4 h-4 text-white relative z-10 transition-transform duration-300 rotate-90" />
                  ) : (
                    <Menu className="w-4 h-4 text-white relative z-10 transition-transform duration-300" />
                  )}
                </div>
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Menu from Bottom */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-6 right-6 z-40"
          >
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl mb-12">
              {/* Menu Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-0.5 bg-white/30 rounded-full" />
              </div>
              {/* Menu Content */}
              <div className="p-4 pb-4">
                {/* Menu Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-gray-600/5 rounded-2xl" />
                {/* Menu Items Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
                  {navigationItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        if (item.action) {
                          item.action()
                          setIsMenuOpen(false)
                        } else if (item.href) {
                          router.push(item.href)
                          setIsMenuOpen(false)
                        }
                      }}
                      className="group p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full flex items-center justify-center group-hover:from-gray-400/30 group-hover:to-gray-600/30 transition-all duration-300">
                          <item.icon className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-white/80 group-hover:text-white font-medium text-xs tracking-wide">
                          {t.navigation?.[item.labelKey] || item.labelKey}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {/* Menu Bottom Glow */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-gray-400/50 to-gray-600/50 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo with Ultra Vibrant Auras and Vibration */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Multiple Vibrant Aura Layers with Intense Pulsing */}
          <div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle,
                rgba(255,255,255,0.4) 0%,
                rgba(156,163,175,0.3) 30%,
                rgba(107,114,128,0.2) 60%,
                transparent 100%)`,
              animation: "vibrateAura 0.1s linear infinite, pulse 1s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-80 h-80 rounded-full"
            style={{
              background: `radial-gradient(circle,
                rgba(255,255,255,0.6) 0%,
                rgba(229,231,235,0.4) 40%,
                transparent 100%)`,
              animation: "vibrateAura 0.15s linear infinite, pulse 0.8s ease-in-out infinite",
              animationDelay: "0.05s",
            }}
          />
          <div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: `radial-gradient(circle,
                rgba(243,244,246,0.5) 0%,
                rgba(209,213,219,0.4) 50%,
                transparent 100%)`,
              animation: "vibrateAura 0.2s linear infinite, pulse 0.6s ease-in-out infinite",
              animationDelay: "0.1s",
            }}
          />

          {/* Intense Vibrating Rings */}
          <div
            className="absolute w-72 h-72 border-2 border-gray-300/60 rounded-full"
            style={{
              animation: "vibrateRing 0.1s linear infinite, spin 8s linear infinite",
              boxShadow: "0 0 40px rgba(255,255,255,0.8), inset 0 0 40px rgba(229,231,235,0.5)",
            }}
          />
          <div
            className="absolute w-60 h-60 border border-gray-400/70 rounded-full"
            style={{
              animation: "vibrateRing 0.12s linear infinite, spin 6s linear infinite reverse",
              boxShadow: "0 0 30px rgba(255,255,255,1)",
            }}
          />

          {/* Vibrating Logo Container with REAL TPF Logo */}
          <div
            className="relative w-32 h-32 flex items-center justify-center"
            style={{
              animation: "vibrateLogo 0.08s linear infinite",
            }}
          >
            <div
              className="absolute inset-0 bg-white rounded-full shadow-2xl"
              style={{
                boxShadow: `
                  0 0 50px rgba(255,255,255,1),
                  0 0 100px rgba(229,231,235,0.8),
                  0 0 150px rgba(209,213,219,0.6),
                  0 0 200px rgba(156,163,175,0.4)
                `,
                animation: "pulse 0.5s ease-in-out infinite",
              }}
            />
            {/* REAL TPF LOGO */}
            <div className="relative z-10 w-28 h-28 rounded-full overflow-hidden bg-white p-2">
              <Image
                src="/images/logo-tpf.png"
                alt="TPulseFi Logo"
                width={112}
                height={112}
                className="w-full h-full object-contain"
                style={{
                  animation: "vibrateLogoImage 0.1s linear infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-wider">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            TPulseFi
          </span>
        </h1>

        {/* Animated Subtitle */}
        <div className="h-8 flex items-center justify-center mb-16">
          <div className="flex items-center space-x-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
            <p className="text-lg md:text-xl text-gray-300 font-light tracking-widest uppercase min-w-[400px] text-center">
              {displayText}
              <span className="animate-pulse">|</span>
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
          </div>
        </div>

        {/* New Social Media Icons */}
        <div className="flex items-center justify-center gap-4 mb-8 z-20 relative">
          <a
            href="https://x.com/TradePulseToken?t=N-8tJuaN9E4asIH0A-gGEg&s=09"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group"
          >
            <div className="px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-2 hover:bg-white/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-600/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <X className="w-4 h-4 text-gray-300 relative z-10" />
              <span className="text-white text-sm font-medium relative z-10">Follow Us</span>
            </div>
          </a>
          <a href="https://t.me/tpulsefi" target="_blank" rel="noopener noreferrer" className="relative group">
            <div className="px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-2 hover:bg-white/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Send className="w-4 h-4 text-blue-300 relative z-10" />
              <span className="text-white text-sm font-medium relative z-10">Join Telegram</span>
            </div>
          </a>
        </div>

        {/* Motivational Words Animation */}
        <div className="flex items-center justify-center mb-8 z-20 relative">
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showWord && (
                <motion.p
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-lg md:text-xl text-white font-medium text-center max-w-md px-4"
                  style={{
                    textShadow: "0 0 20px rgba(255,255,255,0.5)",
                    animation: showWord ? "pulse 2s ease-in-out infinite" : "none",
                  }}
                >
                  {MOTIVATIONAL_WORDS[currentWordIndex]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Invite Button */}
        <div className="flex items-center justify-center mb-12 z-20 relative">
          <a
            href="https://worldcoin.org/mini-app?app_id=app_a3a55e132983350c67923dd57dc22c5e&app_mode=mini-app"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group"
          >
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Users className="w-5 h-5 text-white relative z-10" />
              <span className="text-white text-lg font-bold relative z-10 tracking-wide">INVITE</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Presentation
