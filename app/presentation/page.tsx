"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import {
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
  Calendar,
  Star,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Gamepad2,
  Code,
  Send,
  Share2,
  Copy,
  Check,
  CircleDot,
} from "lucide-react"
import { useMiniKit } from "../../hooks/use-minikit"
import MiniWallet from "../../components/mini-wallet"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { BackgroundEffect } from "../../components/background-effect"
import { ExternalLink } from "lucide-react"

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

// URL do convite
const INVITE_URL = "https://worldcoin.org/mini-app?app_id=app_a3a55e132983350c67923dd57dc22c5e&app_mode=mini-app"

// Translations
const translations = {
  en: {
    presentation: {
      tagline: "THE GLOBAL CRYPTO BRIDGE",
      connectWallet: "Connect Wallet",
    },
    navigation: {
      codepulse: "PulseCode",
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
      invite: "INVITE",
      linkCopied: "Link copied!",
      shareVia: "Share via",
      copyLink: "Copy Link",
      move: "MOVE", // Added "MOVE" translation
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
    motivationalWords: [
      "Trust",
      "Long-term focus",
      "Commitment",
      "these are words that make sense to us",
      "support our project",
      "invite friends and family",
      "and let's",
      "give value to TPulseFi",
    ],
  },
  pt: {
    presentation: {
      tagline: "THE GLOBAL CRYPTO BRIDGE",
      connectWallet: "Conectar Carteira",
    },
    navigation: {
      codepulse: "PulseCode",
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
      invite: "CONVIDAR",
      linkCopiado: "Link copiado!",
      shareVia: "Partilhar via",
      copyLink: "Copiar Link",
      move: "MOVER", // Added "MOVER" translation
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
    motivationalWords: [
      "Confiança",
      "Foco no longo prazo",
      "Compromisso",
      "são palavras que para nós faz sentido",
      "apoia o nosso projeto",
      "convida amigos e familiares",
      "e vamos",
      "dar valor a TPulseFi",
    ],
  },
  es: {
    presentation: {
      tagline: "THE GLOBAL CRYPTO BRIDGE",
      connectWallet: "Conectar Billetera",
    },
    navigation: {
      codepulse: "PulseCode",
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
      invite: "INVITAR",
      linkCopied: "¡Enlace copiado!",
      shareVia: "Compartir vía",
      copyLink: "Copiar Enlace",
      move: "MOVER", // Added "MOVER" translation
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
    motivationalWords: [
      "Confianza",
      "Enfoque a largo plazo",
      "Compromiso",
      "son palabras que tienen sentido para nosotros",
      "apoya nuestro proyecto",
      "invita a amigos y familiares",
      "y vamos a",
      "dar valor a TPulseFi",
    ],
  },
  id: {
    presentation: {
      tagline: "THE GLOBAL CRYPTO BRIDGE",
      connectWallet: "Hubungkan Dompet",
    },
    navigation: {
      codepulse: "PulseCode",
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
      invite: "UNDANG",
      linkCopied: "Link disalin!",
      shareVia: "Bagikan via",
      copyLink: "Salin Link",
      move: "PINDAH", // Added "PINDAH" translation
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
    motivationalWords: [
      "Kepercayaan",
      "Fokus jangka panjang",
      "Komitmen",
      "adalah kata-kata yang masuk akal bagi kami",
      "dukung proyek kami",
      "undang teman dan keluarga",
      "dan mari",
      "berikan nilai pada TPulseFi",
    ],
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
  const [showShareModal, setShowShareModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
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
        setCurrentWordIndex((prev) => (prev + 1) % t.motivationalWords.length)
        setShowWord(true)
      }, 200) // Pequena pausa entre palavras
    }, 2000) // 2 segundos por palavra

    return () => clearInterval(wordInterval)
  }, [t.motivationalWords.length])

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_URL)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  // Handle share options
  const handleShare = (platform: string) => {
    const message = `Join TPulseFi - The Future of Decentralized Finance! ${INVITE_URL}`
    const encodedMessage = encodeURIComponent(message)
    const encodedUrl = encodeURIComponent(INVITE_URL)

    let shareUrl = ""

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedMessage}`
        break
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent("Join TPulseFi - The Future of Decentralized Finance!")}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("Join TPulseFi")}&body=${encodedMessage}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
    setShowShareModal(false)
  }

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
    setIsMenuOpen(false) // Close the menu after navigation
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
      id: "pulsecode",
      labelKey: "codepulse",
      icon: Code,
      href: "/codepulse",
      action: handleCodePulseMenuClick,
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
    setIsMenuOpen(false) // Close the menu after language change
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
        <div className="flex items-center justify-between">
          {/* Left Side - Events Icon */}
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowEventsModal(true)} className="relative group">
              <div className="px-1.5 py-1 bg-black/20 backdrop-blur-md border border-orange-400/30 rounded-full flex items-center space-x-0.5 hover:bg-orange-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Calendar className="w-2.5 h-2.5 text-orange-300 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{t.events?.eventButton || "Evento"}</span>
                {/* Live Indicator */}
                <div className="flex items-center space-x-0.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </div>
            </button>
            {/* Wallet Button (when wallet is connected but hidden) */}
            {isAuthenticated && !showMiniWallet && (
              <button onClick={handleShowWallet} className="relative group">
                <div className="px-1.5 py-1 bg-black/20 backdrop-blur-md border border-green-400/30 rounded-full flex items-center space-x-0.5 hover:bg-green-500/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Eye className="w-2.5 h-2.5 text-green-300 relative z-10" />
                  <span className="text-[10px] font-medium relative z-10">{t.common?.wallet || "Wallet"}</span>
                </div>
              </button>
            )}
            {/* Connect Wallet Button (only when not connected) */}
            {!isAuthenticated && (
              <button onClick={handleWalletConnect} disabled={isLoading} className="relative group">
                <div className="px-3 py-1.5 bg-black/20 backdrop-blur-md border border-cyan-400/30 rounded-full flex items-center space-x-1 hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Wallet className="w-3 h-3 text-cyan-300 relative z-10" />
                  <span className="text-xs font-medium relative z-10">
                    {isLoading ? t.common?.loading || "Loading..." : t.presentation?.connectWallet || "Connect Wallet"}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Right Side - Language Selector */}
          <div className="relative">
            <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="relative group">
              <div className="px-1.5 py-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-0.5 hover:bg-white/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Globe className="w-2.5 h-2.5 text-purple-300 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">
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
                  className="absolute top-10 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 min-w-[180px] shadow-2xl"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as keyof typeof translations)}
                      className={`w-full flex items-center space-x-1.5 p-1.5 rounded-lg transition-all duration-200 ${
                        currentLang === lang.code
                          ? `bg-gradient-to-r ${lang.gradient} bg-opacity-20 text-white`
                          : "hover:bg-white/5 text-gray-300 hover:text-white"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <div className="text-left">
                        <div className="text-[10px] font-medium">{lang.nativeName}</div>
                        <div className="text-[10px] opacity-70">{lang.name}</div>
                      </div>
                      {currentLang === lang.code && <div className="ml-auto text-green-400 text-xs">✓</div>}
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

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-sm w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-2">{t.common?.shareVia || "Share via"}</h3>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex flex-col items-center p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </div>
                  <span className="text-white text-xs">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare("telegram")}
                  className="flex flex-col items-center p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                >
                  <Send className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-white text-xs">Telegram</span>
                </button>

                <button
                  onClick={() => handleShare("twitter")}
                  className="flex flex-col items-center p-3 bg-sky-500/20 hover:bg-sky-500/30 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">X</span>
                  </div>
                  <span className="text-white text-xs">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare("facebook")}
                  className="flex flex-col items-center p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">f</span>
                  </div>
                  <span className="text-white text-xs">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex flex-col items-center p-3 bg-blue-700/20 hover:bg-blue-700/30 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">in</span>
                  </div>
                  <span className="text-white text-xs">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShare("email")}
                  className="flex flex-col items-center p-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-bold">@</span>
                  </div>
                  <span className="text-white text-xs">Email</span>
                </button>
              </div>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">{t.common?.linkCopied || "Link copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">{t.common?.copyLink || "Copy Link"}</span>
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central 3D Menu Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50" style={{ perspective: "1000px" }}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative group flex items-center justify-center px-4 py-0.5"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="w-auto h-8 bg-gradient-to-br from-gray-700/80 to-gray-800/90 backdrop-blur-md border border-gray-600/50 rounded-full flex items-center justify-center shadow-2xl"
            whileHover={{
              scale: 1.1,
              rotateX: 15,
              rotateY: 15,
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.95,
              rotateX: -10,
              rotateY: -10,
            }}
            animate={{
              rotateZ: isMenuOpen ? 180 : 0,
              transition: { duration: 0.3 },
            }}
            style={{
              transformStyle: "preserve-3d",
              boxShadow: isMenuOpen
                ? "0 20px 40px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)"
                : "0 10px 20px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* 3D Inner Ring */}
            <div
              className="absolute inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ transform: "translateZ(2px)" }}
            />

            {/* Pulsing Ring */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Icon with 3D effect */}
            <motion.div
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(4px)",
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-2"
            >
              <CircleDot className="w-4 h-4 text-white relative z-10 drop-shadow-lg" />
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.span
                    key="close-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-white text-sm font-bold relative z-10 drop-shadow-lg"
                  >
                    {t.common?.close || "CLOSE"}
                  </motion.span>
                ) : (
                  <motion.span
                    key="move-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-white text-sm font-bold relative z-10 drop-shadow-lg"
                  >
                    {t.common?.move || "MOVE"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 3D Button Glow */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ transform: "translateZ(-10px)" }}
            />
          </motion.div>
        </button>
      </div>

      {/* 3D Floating Icons Menu - No Background */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 pointer-events-none">
            {/* Menu Items as Floating 3D Icons in a Row */}
            <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2">
              <div className="relative flex justify-center gap-8">
                {" "}
                {/* Changed to flex for row layout */}
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 100,
                      scale: 0,
                      rotateX: 90,
                      rotateY: 180,
                    }}
                    animate={{
                      opacity: 1,
                      y: [100, -20, 0], // Jumping effect
                      scale: [0, 1.2, 1],
                      rotateX: [90, -10, 0],
                      rotateY: [180, 10, 0],
                    }}
                    exit={{
                      opacity: 0,
                      y: 100,
                      scale: 0,
                      rotateX: 90,
                      rotateY: 180,
                    }}
                    transition={{
                      delay: index * 0.15,
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      duration: 0.8,
                    }}
                    whileHover={{
                      scale: 1.15,
                      y: -10,
                      rotateX: -15,
                      rotateY: 15,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      scale: 0.9,
                      y: 5,
                      rotateX: 10,
                      rotateY: -10,
                    }}
                    onClick={() => {
                      if (item.action) {
                        // Use action if defined
                        item.action()
                      } else if (item.href) {
                        router.push(item.href)
                      }
                      setIsMenuOpen(false)
                    }}
                    className="group pointer-events-auto relative"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* 3D Icon Container with Glow */}
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-lg flex items-center justify-center shadow-xl"
                      style={{
                        transformStyle: "preserve-3d",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)", // Reduced shadow
                      }}
                      animate={{
                        rotateZ: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }}
                    >
                      {/* Pulsing Glow Ring */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-lg blur-sm"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: index * 0.3,
                        }}
                      />

                      {/* Inner Glow */}
                      <div
                        className="absolute inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ transform: "translateZ(2px)" }}
                      />

                      {/* 3D Icon with Floating Animation */}
                      <motion.div
                        style={{
                          transformStyle: "preserve-3d",
                          transform: "translateZ(6px)",
                        }}
                        animate={{
                          y: [0, -3, 0],
                          rotateY: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: index * 0.4,
                        }}
                      >
                        <item.icon className="w-4 h-4 text-white drop-shadow-2xl" />
                      </motion.div>

                      {/* Outer Glow Effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ transform: "translateZ(-10px)" }}
                      />
                    </motion.div>

                    {/* Floating Label */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                      className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                      style={{ transform: "translateZ(4px)" }}
                    >
                      <div className="px-2 py-0.5 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-full">
                        <span className="text-white text-[9px] font-medium drop-shadow-lg">
                          {t.navigation?.[item.labelKey] || item.labelKey}
                        </span>
                      </div>
                    </motion.div>

                    {/* Particle Effect on Hover */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      whileHover={{
                        scale: [1, 1.5, 1],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {[...Array(6)].map((_, particleIndex) => (
                        <motion.div
                          key={particleIndex}
                          className="absolute w-1 h-1 bg-blue-400 rounded-full"
                          style={{
                            top: "50%",
                            left: "50%",
                          }}
                          animate={{
                            x: Math.cos((particleIndex * Math.PI * 2) / 6) * 30,
                            y: Math.sin((particleIndex * Math.PI * 2) / 6) * 30,
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: particleIndex * 0.1,
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
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

      {/* Moving Light Lines Background */}
      <div className="absolute inset-0 bg-gray-900">
        {/* Horizontal Moving Lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`h-line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"
            style={{
              top: `${8 + i * 8}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight 4s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content with 3D Globe */}
      <div className="absolute inset-0 bg-gray-900">
        {/* Horizontal Moving Lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`h-line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"
            style={{
              top: `${8 + i * 8}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight 4s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content with 3D Globe */}
      <div className="relative z-10 text-center">
        {/* Logo with Ultra Vibrant Auras and Vibration - COMPACTED */}
        <div className="relative mb-4 flex items-center justify-center">
          {/* Multiple Vibrant Aura Layers with Intense Pulsing - REDUCED */}
          <div
            className="absolute w-64 h-64 rounded-full"
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
            className="absolute w-52 h-52 rounded-full"
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
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: `radial-gradient(circle,
          rgba(243,244,246,0.5) 0%,
          rgba(209,213,219,0.4) 50%,
          transparent 100%)`,
              animation: "vibrateAura 0.2s linear infinite, pulse 0.6s ease-in-out infinite",
              animationDelay: "0.1s",
            }}
          />

          {/* Intense Vibrating Rings - REDUCED */}
          <div
            className="absolute w-48 h-48 border-2 border-gray-300/60 rounded-full"
            style={{
              animation: "vibrateRing 0.1s linear infinite, spin 8s linear infinite",
              boxShadow: "0 0 30px rgba(255,255,255,0.8), inset 0 0 30px rgba(229,231,235,0.5)",
            }}
          />
          <div
            className="absolute w-36 h-36 border border-gray-400/70 rounded-full"
            style={{
              animation: "vibrateRing 0.12s linear infinite, spin 6s linear infinite reverse",
              boxShadow: "0 0 20px rgba(255,255,255,1)",
            }}
          />

          {/* Vibrating Logo Container with REAL TPF Logo - REDUCED */}
          <div
            className="relative w-20 h-20 flex items-center justify-center"
            style={{
              animation: "vibrateLogo 0.08s linear infinite",
            }}
          >
            <div
              className="absolute inset-0 bg-white rounded-full shadow-2xl"
              style={{
                boxShadow: `
        0 0 30px rgba(255,255,255,1),
        0 0 60px rgba(229,231,235,0.8),
        0 0 90px rgba(209,213,219,0.6),
        0 0 120px rgba(156,163,175,0.4)
      `,
                animation: "pulse 0.5s ease-in-out infinite",
              }}
            />
            {/* REAL TPF LOGO - REDUCED */}
            <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden bg-white p-1.5">
              <Image
                src="/images/logo-tpf.png"
                alt="TPulseFi Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                style={{
                  animation: "vibrateLogoImage 0.1s linear infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand Name - COMPACTED */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            TPulseFi
          </span>
        </h1>

        {/* Animated Subtitle - COMPACTED */}
        <div className="h-6 flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/50" />
            <p className="text-sm md:text-base text-gray-300 font-light tracking-widest uppercase min-w-[300px] text-center">
              {displayText}
              <span className="animate-pulse">|</span>
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/50" />
          </div>
        </div>

        {/* New Social Media Icons */}
        <div className="flex items-center justify-center gap-3 mb-8 z-20 relative">
          <a
            href="https://x.com/TradePulseToken?t=N-8tJuaN9E4asIH0A-gGEg&s=09"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group"
          >
            <div className="px-2 py-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-1.5 hover:bg-white/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-600/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <X className="w-3 h-3 text-gray-300 relative z-10" />
              <span className="text-white text-xs font-medium relative z-10">Follow Us</span>
            </div>
          </a>
          <a href="https://t.me/tpulsefi" target="_blank" rel="noopener noreferrer" className="relative group">
            <div className="px-2 py-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center space-x-1.5 hover:bg-white/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Send className="w-3 h-3 text-blue-300 relative z-10" />
              <span className="text-white text-xs font-medium relative z-10">Join Telegram</span>
            </div>
          </a>
        </div>

        {/* Motivational Words Animation - COMPACTED */}
        <div className="flex items-center justify-center mb-6 z-20 relative">
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showWord && (
                <motion.p
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-sm md:text-base text-white font-medium text-center max-w-sm px-3"
                  style={{
                    textShadow: "0 0 15px rgba(255,255,255,0.5)",
                    animation: showWord ? "pulse 2s ease-in-out infinite" : "none",
                  }}
                >
                  {t.motivationalWords[currentWordIndex]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Invite Button */}
        <div className="flex items-center justify-center mb-12 z-20 relative">
          <button onClick={() => setShowShareModal(true)} className="relative group">
            <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center space-x-1.5 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Share2 className="w-4 h-4 text-white relative z-10" />
              <span className="text-white text-sm font-bold relative z-10 tracking-wide">
                {t.common?.invite || "INVITE"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Add custom CSS for animations */}
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
        @keyframes vibrateAura {
          0% {
            transform: translateX(0px) translateY(0px);
          }
          25% {
            transform: translateX(0.5px) translateY(-0.5px);
          }
          50% {
            transform: translateX(0px) translateY(0.5px);
          }
          75% {
            transform: translateX(-0.5px) translateY(0px);
          }
          100% {
            transform: translateX(0px) translateY(0px);
          }
        }

        @keyframes vibrateRing {
          0% {
            transform: translateX(0px) translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateX(-0.3px) translateY(0.3px) rotate(0.5deg);
          }
          50% {
            transform: translateX(0.5px) translateY(0px) rotate(-0.3deg);
          }
          75% {
            transform: translateX(0px) translateY(-0.5px) rotate(0deg);
          }
          100% {
            transform: translateX(0px) translateY(0px) rotate(0deg);
          }
        }

        @keyframes vibrateLogo {
          0% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(0.3px) translateY(-0.3px);
          }
          100% {
            transform: translateX(0px) translateY(0px);
          }
        }

        @keyframes vibrateLogoImage {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-0.2deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
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
    </div>
  )
}

export default Presentation
