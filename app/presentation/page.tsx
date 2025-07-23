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
} from "lucide-react"
import { useMiniKit } from "../../hooks/use-minikit"
import MiniWallet from "../../components/mini-wallet"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { DebugConsole } from "../../components/debug-console" // Import DebugConsole

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

// Translations
const translations = {
  en: {
    presentation: {
      tagline: "The Future of Decentralized Finance",
      connectWallet: "Connect Wallet",
    },
    navigation: {
      codepulse: "CodePulse", // New translation key for CodePulse
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
      codepulse: "CodePulse", // New translation key for CodePulse
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
      codepulse: "CodePulse", // New translation key for CodePulse
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
      codepulse: "CodePulse", // New translation key for CodePulse
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
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Events Icon */}
          <div className="flex items-center space-x-3">
            {/* Events Icon */}
            <button onClick={() => setShowEventsModal(true)} className="relative group">
              <div className="px-3 py-2 bg-black/20 backdrop-blur-md border border-orange-400/30 rounded-full flex items-center space-x-2 hover:bg-orange-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Calendar className="w-4 h-4 text-orange-300 relative z-10" />
                <span className="text-orange-300 text-sm font-medium relative z-10">
                  {t.events?.eventButton || "Evento"}
                </span>
                {/* Live Indicator */}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-xs font-bold">LIVE</span>
                </div>
              </div>
            </button>

            {/* Wallet Button (when wallet is connected but hidden) */}
            {isAuthenticated && !showMiniWallet && (
              <button onClick={handleShowWallet} className="relative group">
                <div className="px-3 py-2 bg-black/20 backdrop-blur-md border border-green-400/30 rounded-full flex items-center space-x-2 hover:bg-green-500/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Eye className="w-4 h-4 text-green-300 relative z-10" />
                  <span className="text-green-300 text-sm font-medium relative z-10">
                    {t.common?.wallet || "Wallet"}
                  </span>
                </div>
              </button>
            )}

            {/* Connect Wallet Button (only when not connected) */}
            {!isAuthenticated && (
              <button onClick={handleWalletConnect} disabled={isLoading} className="relative group">
                <div className="px-6 py-3 bg-black/20 backdrop-blur-md border border-cyan-400/30 rounded-full flex items-center space-x-2 hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Wallet className="w-5 h-5 text-cyan-300 relative z-10" />
                  <span className="text-white font-medium relative z-10">
                    {isLoading ? t.common?.loading || "Loading..." : t.presentation?.connectWallet || "Connect Wallet"}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Right Side - Language Selector */}
          <div className="relative">
            <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="relative group">
              <div className="px-3 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-2 hover:bg-white/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Globe className="w-4 h-4 text-purple-300 relative z-10" />
                <span className="text-purple-300 text-sm font-medium relative z-10">
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
                  className="absolute top-12 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[200px] shadow-2xl"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as keyof typeof translations)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        currentLang === lang.code
                          ? `bg-gradient-to-r ${lang.gradient} bg-opacity-20 text-white`
                          : "hover:bg-white/5 text-gray-300 hover:text-white"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <div className="text-left">
                        <div className="text-sm font-medium">{lang.nativeName}</div>
                        <div className="text-xs opacity-70">{lang.name}</div>
                      </div>
                      {currentLang === lang.code && <div className="ml-auto text-green-400">✓</div>}
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
          <div className="absolute top-6 left-6 z-40">
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
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/20 via-blue-400/10 to-transparent blur-lg" />
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
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:from-cyan-400/30 hover:to-blue-400/30 transition-all duration-300 shadow-xl">
                  {/* Pulsing Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-ping opacity-75" />
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
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-2xl" />
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
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full flex items-center justify-center group-hover:from-cyan-400/30 group-hover:to-blue-400/30 transition-all duration-300">
                          <item.icon className="w-3 h-3 text-cyan-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-white/80 group-hover:text-white font-medium text-xs tracking-wide">
                          {t.navigation?.[item.labelKey] || item.labelKey}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {/* Menu Bottom Glow */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-cyan-400/50 to-blue-400/50 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moving Light Lines Background */}
      <div className="absolute inset-0">
        {/* Horizontal Moving Lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`h-line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse"
            style={{
              top: `${8 + i * 8}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight 4s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* Vertical Moving Lines */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`v-line-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"
            style={{
              left: `${10 + i * 10}%`,
              top: "-100%",
              height: "200%",
              animation: `moveDown 5s linear infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* Diagonal Moving Lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`d-line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45"
            style={{
              top: `${15 + i * 12}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight 6s linear infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Static Grid for Reference */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute w-80 h-80 bg-cyan-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-64 h-64 bg-blue-400/15 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute w-48 h-48 bg-white/20 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Rotating Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-72 h-72 border border-white/10 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute w-80 h-80 border border-cyan-400/15 rounded-full animate-spin"
          style={{ animationDuration: "25s", animationDirection: "reverse" }}
        />
        <div
          className="absolute w-64 h-64 border border-blue-400/20 rounded-full animate-spin"
          style={{ animationDuration: "15s" }}
        />
      </div>

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
      </div>

      {/* Enhanced Floating Particles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full animate-ping"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            backgroundColor:
              i % 3 === 0 ? "rgba(255,255,255,0.8)" : i % 3 === 1 ? "rgba(34,211,238,0.6)" : "rgba(59,130,246,0.4)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${1 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Energy Beams */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`beam-${i}`}
          className="absolute bg-gradient-to-r from-transparent via-white/20 to-transparent h-px animate-pulse"
          style={{
            top: "50%",
            left: "50%",
            width: "200px",
            transformOrigin: "0 0",
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: "2s",
          }}
        />
      ))}

      <style jsx>{`
        @keyframes moveRight {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        @keyframes moveDown {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes vibrateAura {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(0.5px, 0.5px);
          }
          50% {
            transform: translate(-0.5px, 0.5px);
          }
          75% {
            transform: translate(0.5px, -0.5px);
          }
          100% {
            transform: translate(-0.5px, -0.5px);
          }
        }

        @keyframes vibrateRing {
          0% {
            transform: translate(0) rotate(0deg);
          }
          25% {
            transform: translate(1px, 1px) rotate(90deg);
          }
          50% {
            transform: translate(-1px, 1px) rotate(180deg);
          }
          75% {
            transform: translate(1px, -1px) rotate(270deg);
          }
          100% {
            transform: translate(-1px, -1px) rotate(360deg);
          }
        }

        @keyframes vibrateLogo {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(0.3px, 0.3px);
          }
          50% {
            transform: translate(-0.3px, 0.3px);
          }
          75% {
            transform: translate(0.3px, -0.3px);
          }
          100% {
            transform: translate(-0.3px, -0.3px);
          }
        }

        @keyframes vibrateLogoImage {
          0% {
            transform: translate(0) scale(1);
          }
          25% {
            transform: translate(0.2px, 0.2px) scale(1.01);
          }
          50% {
            transform: translate(-0.2px, 0.2px) scale(0.99);
          }
          75% {
            transform: translate(0.2px, -0.2px) scale(1.01);
          }
          100% {
            transform: translate(-0.2px, -0.2px) scale(0.99);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Debug Console */}
      <DebugConsole />
    </div>
  )
}

export default Presentation
