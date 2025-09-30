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
  Globe,
  ExternalLink,
  Gamepad2,
  Send,
  Share2,
  Copy,
  Check,
} from "lucide-react"
import { useMiniKit } from "@/hooks/use-minikit"
import MiniWallet from "@/components/mini-wallet"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { BackgroundEffect } from "@/components/background-effect"

import { MiniKit, ResponseEvent } from "@worldcoin/minikit-js"

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
    id: "play",
    name: "PLAY - Earn Money Creating",
    image: "/images/logo-play.png",
    gradient: "from-purple-500 to-indigo-600",
    url: "https://worldcoin.org/mini-app?app_id=app_271b2cf77994b56f013f465c625bc275&app_mode=mini-app",
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
    url: "https://world.org/mini-app?app_id=app_459cd0d0d3125864ea42bd4c19d1986c&path=/dlink/TPulseFi",
  },
  {
    id: "humantap",
    name: "Human Tap",
    image: "/images/human-tap.jpg",
    gradient: "from-green-500 to-emerald-600",
    url: "https://worldcoin.org/mini-app?app_id=app_25cf6ee1d9660721e651d43cf126953a&app_mode=mini-app",
  },
  {
    id: "redlightgreenlight",
    name: "Red Light Green Light",
    image: "/images/redlightgreenlight-logo.png",
    gradient: "from-red-500 to-green-500",
    url: "https://world.org/mini-app?app_id=app_f11a49a98aab37a10e7dcfd20139f605",
  },
  {
    id: "pulse",
    name: "Pulse",
    image: "/images/pulse-logo.png",
    gradient: "from-cyan-500 to-blue-600",
    url: "https://worldcoin.org/mini-app?app_id=app_91043e97761ffc609071cc48447b6eba&app_mode=mini-app",
  },
]

const generateInviteUrl = (walletAddress: string) => {
  return `https://worldcoin.org/mini-app?app_id=app_a3a55e132983350c67923dd57dc22c5e&app_mode=mini-app&invited_by=${walletAddress}`
}

// URL do convite
const INVITE_URL = "https://worldcoin.org/mini-app?app_id=app_a3a55e132983350c67923dd57dc22c5e&app_mode=mini-app"

// Translations
const translations = {
  en: {
    presentation: {
      tagline: "THE GLOBAL CRYPTO BRIDGE",
      connectWallet: "Connect Wallet",
    },
    banner: {
      dailyTokens: "Don't forget to redeem your daily tokens in the airdrop",
      holderBonus: "You are entitled to more tokens for being a TPF holder - the more TPF you have, the more you earn",
    },
    navigation: {
      codepulse: "PulseCode",
      wallet: "Wallet",
      news: "News",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      ecosystem: "Ecosystem",
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
      start: "Start",
    },
    partnerships: {
      visitApp: "Visit App",
    },
    events: {
      title: "Invitations",
      liveEvent: "INVITE & EARN REWARDS",
      eventTitle: "How the Invitation System Works",
      eventDescription: "You can start inviting, it's already counting while we prepare everything perfectly.",
      eventDetails: "Win prizes in WLD! Invite friends and earn rewards for each successful referral.",
      eventWarning: "The more you invite, the more rewards you earn!",
      eventPeriod: "Invitation Stats",
      eventDates: `${0} people invited • ${0} clicks`,
      participateNow: "Rewards 0/10 guests",
      termsConditions: "Guests",
      eventButton: "Invitations",
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
    popup: {
      pulseTitle: "Earn TPulseFi while you play!",
      pulseDescription: "Earn a lot with TPulseFi, while you play Pulse you earn TPulseFi",
      figamesTitle: "FiGames - Amazing Gameplay!",
      figamesDescription: "FiGames - Amazing gameplay in our app, still in development.",
      rateUsTitle: "Rate us with 5 stars",
      rateUsDescription: "A small gesture that helps us strengthen and achieve success.",
      shareFriendsTitle: "Share with your friends and family",
      shareFriendsDescription: "Do your part and contribute to TPulseFi truly growing, together we are stronger.",
    },
  },
  pt: {
    presentation: {
      tagline: "A PONTE CRIPTO GLOBAL",
      connectWallet: "Conectar Carteira",
    },
    banner: {
      dailyTokens: "Não se esqueça de redimir os seus tokens diários no airdrop",
      holderBonus: "Você tem direito a mais tokens por ser detentor de TPF - quando mais TPF tiver mais ganha",
    },
    navigation: {
      codepulse: "PulseCode",
      wallet: "Carteira",
      news: "Notícias",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      ecosystem: "Ecossistema",
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
      shareVia: "Compartilhar via",
      copyLink: "Copiar Link",
      start: "Começar",
    },
    partnerships: {
      visitApp: "Visitar App",
    },
    events: {
      title: "Convites",
      liveEvent: "CONVIDE E GANHE RECOMPENSAS",
      eventTitle: "Como Funciona o Sistema de Convites",
      eventDescription: "Podes começar a convidar já está a contar, enquanto preparamos tudo de forma perfeita.",
      eventDetails: "Ganha prémios em WLD! Convida amigos e ganha recompensas por cada referência bem-sucedida.",
      eventWarning: "Quanto mais convidares, mais recompensas ganhas!",
      eventPeriod: "Estatísticas de Convites",
      eventDates: `${0} pessoas convidadas • ${0} cliques`,
      participateNow: "Prémios 0/10 convidados",
      termsConditions: "Convidados",
      eventButton: "Convites",
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
    popup: {
      title: "Grandes Recompensas na HoldStation!",
      description:
        "10000$ em jogo! Vais querer perder a competição de trade do nosso parceiro HoldStation e as taxas mais baratas na World? Aproveita!",
      moreInfo: "(Mais info na App HoldStation)",
      pulseTitle: "Ganha TPulseFi enquanto jogas!",
      pulseDescription: "Ganha muito com TPulseFi, enquanto jogas Pulse ganhas TPulseFi",
      figamesTitle: "FiGames - Jogabilidade Incrível!",
      figamesDescription: "FiGames - Uma jogabilidade incrível no nosso app, ainda em desenvolvimento.",
      rateUsTitle: "Classifique-nos com 5 estrelas",
      rateUsDescription: "Um pequeno gesto que nos ajuda a fortalecer e alcançar o sucesso.",
      shareFriendsTitle: "Partilhe com os seus amigos e família",
      shareFriendsDescription:
        "Faça a sua parte e contribua para que TPulseFi cresça verdadeiramente, juntos somos mais fortes.",
    },
  },
  es: {
    presentation: {
      tagline: "EL PUENTE CRIPTO GLOBAL",
      connectWallet: "Conectar Billetera",
    },
    banner: {
      dailyTokens: "No olvides redimir tus tokens diarios en el airdrop",
      holderBonus: "Tienes derecho a más tokens por ser poseedor de TPF - cuanto más TPF tengas, más ganas",
    },
    navigation: {
      codepulse: "PulseCode",
      wallet: "Billetera",
      news: "Noticias",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      ecosystem: "Ecosistema",
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
      start: "Comenzar",
    },
    partnerships: {
      visitApp: "Visitar App",
    },
    events: {
      title: "Invitaciones",
      liveEvent: "INVITA Y GANA RECOMPENSAS",
      eventTitle: "Cómo Funciona el Sistema de Invitaciones",
      eventDescription: "Puedes empezar a invitar ya está contando, mientras preparamos todo de forma perfecta.",
      eventDetails: "¡Gana premios en WLD! Invita amigos y gana recompensas por cada referencia exitosa.",
      eventWarning: "¡Cuanto más invites, más recompensas ganas!",
      eventPeriod: "Estadísticas de Invitaciones",
      eventDates: `${0} personas invitadas • ${0} clics`,
      participateNow: "Premios 0/10 invitados",
      termsConditions: "Invitados",
      eventButton: "Invitaciones",
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
    popup: {
      title: "Grandes Recompensas en HoldStation!",
      description:
        "¡10.000$ en juego! ¿Quieres perderte la competición de trading de nuestro socio HoldStation y las tarifas más baratas en World? ¡Aprovecha!",
      moreInfo: "(Más info en la App de HoldStation)",
      pulseTitle: "¡Gana TPulseFi mientras juegas!",
      pulseDescription: "Gana mucho con TPulseFi, mientras juegas Pulse ganas TPulseFi",
      figamesTitle: "FiGames - ¡Jugabilidad Increíble!",
      figamesDescription: "FiGames - Una jugabilidad increíble en nuestra app, aún en desarrollo.",
      rateUsTitle: "Califícanos con 5 estrellas",
      rateUsDescription: "Un pequeño gesto que nos ayuda a fortalecer y alcanzar el éxito.",
      shareFriendsTitle: "Comparte con tus amigos y familiares",
      shareFriendsDescription: "Haz tu parte y contribuye a que TPulseFi crezca de verdad, juntos somos más fuertes.",
    },
  },
  id: {
    presentation: {
      tagline: "JEMBATAN KRIPTO GLOBAL",
      connectWallet: "Hubungkan Dompet",
    },
    banner: {
      dailyTokens: "Jangan lupa untuk menukarkan token harian Anda di airdrop",
      holderBonus:
        "Anda berhak mendapatkan lebih banyak token karena menjadi pemegang TPF - semakin banyak TPF yang Anda miliki, semakin banyak yang Anda dapatkan",
    },
    navigation: {
      codepulse: "PulseCode",
      wallet: "Dompet",
      news: "Berita",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      figames: "Fi Games",
      ecosystem: "Ekosistem",
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
      shareVia: "Bagikan melalui",
      copyLink: "Salin Link",
      start: "Mulai",
    },
    partnerships: {
      visitApp: "Kunjungi App",
    },
    events: {
      title: "Undangan",
      liveEvent: "UNDANG & DAPATKAN HADIAH",
      eventTitle: "Cara Kerja Sistem Undangan",
      eventDescription:
        "Anda bisa mulai mengundang sudah terhitung, sementara kami mempersiapkan semuanya dengan sempurna.",
      eventDetails: "Menangkan hadiah dalam WLD! Undang teman dan dapatkan hadiah untuk setiap rujukan yang berhasil.",
      eventWarning: "Semakin banyak Anda mengundang, semakin banyak hadiah yang Anda dapatkan!",
      eventPeriod: "Statistik Undangan",
      eventDates: `${0} orang diundang • ${0} klik`,
      participateNow: "Hadiah 0/10 tamu",
      termsConditions: "Tamu",
      eventButton: "Undangan",
    },
    motivationalWords: [
      "Kepercayaan",
      "Fokus jangka panjang",
      "Komitmen",
      "adalah kata-kata que masuk aká para kami",
      "dukung proyek kami",
      "undang teman dan keluarga",
      "dan mari",
      "berikan nilai pada TPulseFi",
    ],
    popup: {
      title: "Hadiah Besar di HoldStation!",
      description:
        "10.000$ dalam permainan! Tidak ingin melewatkan kompetisi trading mitra kami HoldStation dan biaya lebih murah di World? Manfaatkan!",
      moreInfo: "(Info lebih lanjut di Aplikasi HoldStation)",
      pulseTitle: "Dapatkan TPulseFi sambil bermain!",
      pulseDescription: "Dapatkan banyak dengan TPulseFi, sambil bermain Pulse Anda mendapatkan TPulseFi",
      figamesTitle: "FiGames - Gameplay Luar Biasa!",
      figamesDescription: "FiGames - Gameplay luar biasa di aplikasi kami, masih dalam pengembangan.",
      rateUsTitle: "Beri kami 5 bintang",
      rateUsDescription: "Sebuah isyarat kecil yang membantu kami memperkuat dan mencapai kesuksesan.",
      shareFriendsTitle: "Bagikan dengan teman dan keluarga Anda",
      shareFriendsDescription:
        "Lakukan bagian Anda dan kontribusi agar TPulseFi benar-benar tumbuh, bersama kita lebih kuat.",
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
  const [showShareModal, setShowShareModal] = useState(false)
  const [showInvitationStats, setShowInvitationStats] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)
  const router = useRouter()
  const isMobile = useMobile()

  // Adiciona um novo estado para controlar as palavras que aparecem:
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showWord, setShowWord] = useState(true)

  const [invitedUsers, setInvitedUsers] = useState<string[]>([])
  const [clickedUsers, setClickedUsers] = useState<string[]>([])
  const [currentUserId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [invitedUsernames, setInvitedUsernames] = useState<{ [key: string]: string }>({})

  const [modalContent, setModalContent] = useState<"prizes" | "invitations" | null>(null)

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

  const getUsernameByAddress = async (walletAddress: string): Promise<string> => {
    try {
      if (MiniKit && MiniKit.getUserByAddress) {
        const worldIdUser = await MiniKit.getUserByAddress(walletAddress)
        return worldIdUser?.username || `User ${walletAddress.slice(-8)}`
      }
    } catch (error) {
      console.error("Failed to get username:", error)
    }
    return `User ${walletAddress.slice(-8)}`
  }

  const loadUsernamesForInvitedUsers = async (invites: any[]) => {
    const usernameMap: { [key: string]: string } = {}

    for (const invite of invites) {
      const walletAddress = invite.walletAddress || invite.userId
      if (!invitedUsernames[walletAddress]) {
        const username = await getUsernameByAddress(walletAddress)
        usernameMap[walletAddress] = username
      }
    }

    if (Object.keys(usernameMap).length > 0) {
      setInvitedUsernames((prev) => ({ ...prev, ...usernameMap }))
    }
  }

  useEffect(() => {
    // Subscribe to share events
    MiniKit.subscribe(ResponseEvent.MiniAppShare, (payload) => {
      console.log("Share Response", payload)
      if (payload.success) {
        // Track successful share
        const timestamp = new Date().toISOString()
        const shareRecord = {
          userId: currentUserId,
          timestamp,
          platform: "native_share",
        }
        localStorage.setItem(`share_${timestamp}`, JSON.stringify(shareRecord))
      }
    })

    // Check if user came from invite link
    const urlParams = new URLSearchParams(window.location.search)
    const invitedBy = urlParams.get("invited_by")
    if (invitedBy) {
      // Add this user to the inviter's list using wallet address
      const inviterInvites = JSON.parse(localStorage.getItem(`invites_${invitedBy}`) || "[]")
      const newInvite = {
        userId: currentUserId,
        walletAddress: user?.wallet_address || currentUserId,
        timestamp: new Date().toISOString(),
        status: "joined",
      }

      // Check if this user already exists in invites to avoid duplicates
      const existingInvite = inviterInvites.find(
        (invite: any) =>
          invite.userId === currentUserId || invite.walletAddress === (user?.wallet_address || currentUserId),
      )

      if (!existingInvite) {
        inviterInvites.push(newInvite)
        localStorage.setItem(`invites_${invitedBy}`, JSON.JSON.stringify(inviterInvites))

        if (invitedBy === (user?.wallet_address || currentUserId)) {
          setInvitedUsers(inviterInvites)
        }
      }

      // Track the click
      const clickRecord = {
        userId: currentUserId,
        walletAddress: user?.wallet_address || currentUserId,
        timestamp: new Date().toISOString(),
      }
      const existingClicks = JSON.parse(localStorage.getItem(`clicks_${invitedBy}`) || "[]")

      // Check for duplicate clicks
      const existingClick = existingClicks.find(
        (click: any) =>
          click.userId === currentUserId || click.walletAddress === (user?.wallet_address || currentUserId),
      )

      if (!existingClick) {
        existingClicks.push(clickRecord)
        localStorage.setItem(`clicks_${invitedBy}`, JSON.stringify(existingClicks))
      }

      // Update clicked users state
      setClickedUsers(existingClicks)
    }

    const walletAddress = user?.wallet_address || currentUserId
    const userInvites = JSON.parse(localStorage.getItem(`invites_${walletAddress}`) || "[]")
    setInvitedUsers(userInvites)

    if (userInvites.length > 0) {
      loadUsernamesForInvitedUsers(userInvites)
    }

    // Load clicked users for the current user
    const userClicks = JSON.parse(localStorage.getItem(`clicks_${walletAddress}`) || "[]")
    setClickedUsers(userClicks)
  }, [currentUserId, user?.wallet_address])

  const handleCopyLink = async () => {
    const walletAddress = user?.wallet_address || currentUserId
    const inviteUrl = generateInviteUrl(walletAddress)
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleShare = async (platform: string) => {
    // Try MiniKit native share first
    if (platform === "native") {
      await shareCommand()
      setShowShareModal(false)
      return
    }

    const walletAddress = user?.wallet_address || currentUserId
    const inviteUrl = generateInviteUrl(walletAddress)
    const message = `Join TPulseFi - The Future of Decentralized Finance! ${inviteUrl}`
    const encodedMessage = encodeURIComponent(message)
    const encodedUrl = encodeURIComponent(inviteUrl)

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

  const shareCommand = async () => {
    const walletAddress = user?.wallet_address || currentUserId
    const inviteUrl = generateInviteUrl(walletAddress)

    try {
      await MiniKit.commandsAsync.share({
        title: "Join TPulseFi - The Future of DeFi!",
        text: "Use this invite link to join TPulseFi and explore decentralized finance together!",
        url: inviteUrl,
      })

      // Track the share attempt
      const shareRecord = {
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        url: inviteUrl,
      }
      localStorage.setItem(`share_${Date.now()}`, JSON.stringify(shareRecord))
    } catch (error) {
      console.error("Failed to share:", error)
      // Fallback to copy link
      handleCopyLink()
    }
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
      id: "ecosystem",
      labelKey: "ecosystem",
      icon: Globe,
      href: "/ecosystem",
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
            {/* Wallet Button (when wallet is connected but hidden) */}
            {isAuthenticated && !showMiniWallet && (
              <button onClick={handleShowWallet} className="relative group">
                <div className="px-2 py-1.5 bg-black/20 backdrop-blur-md border border-green-400/30 rounded-full flex items-center space-x-1 hover:bg-green-500/10 transition-all duration-300">
                  {" "}
                  {/* Reduced padding and space-x */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Eye className="w-3 h-3 text-green-300 relative z-10" /> {/* Reduced icon size */}
                  <span className="text-xs font-medium relative z-10"> {t.common?.wallet || "Wallet"}</span>
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
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-black/95 backdrop-blur-xl border border-white/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowEventsModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="text-center mb-6">
                <div className="relative mb-4 flex justify-center">
                  <div className="absolute w-20 h-20 bg-white/20 rounded-full blur-2xl animate-pulse" />
                  <div
                    className="absolute w-16 h-16 bg-white/30 rounded-full blur-xl animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />

                  {/* Logo Container */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full p-2 shadow-2xl border border-white/30">
                    <Image
                      src="/images/wldlogo3D.png"
                      alt="WLD Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {t.events?.title || "Convites"}
                </h2>
              </div>

              <div className="space-y-4">
                {modalContent === "invitations" && (
                  <div className="bg-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Users className="w-12 h-12 text-white/80" />
                      <div className="text-3xl font-bold text-white">{invitedUsers.length}</div>
                    </div>
                  </div>
                )}

                {modalContent === "prizes" && (
                  <div className="bg-white/5 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <h3 className="text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] text-sm mb-3">
                      Prémios Disponíveis
                    </h3>
                    <p className="text-white/90 text-xs mb-3 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                      Ganha prémios em WLD por cada convite realizado
                    </p>
                    <p className="text-white/80 text-xs font-medium drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                      Mais detalhes em breve...
                    </p>
                  </div>
                )}

                {!modalContent && (
                  <div className="bg-white/5 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <h3 className="text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] text-sm mb-3">
                      {t.events?.eventTitle || "Como Funciona o Sistema de Convites"}
                    </h3>
                    <p className="text-white/90 text-xs mb-3 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                      {t.events?.eventDescription ||
                        "Podes começar a convidar já está a contar, enquanto preparamos tudo de forma perfeita"}
                    </p>
                    <p className="text-white/80 text-xs font-medium drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                      {t.events?.eventDetails || "Ganha prémios em WLD"}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setModalContent("prizes")}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-xs backdrop-blur-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  >
                    {t.events?.participateNow || "Prémios"}
                  </button>
                  <button
                    onClick={() => setModalContent("invitations")}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 text-xs backdrop-blur-sm border border-white/30 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  >
                    {t.events?.termsConditions || "Convidados"}
                  </button>
                </div>
              </div>

              {[...Array(6)].map((_, i) => (
                <div
                  key={`modal-particle-${i}`}
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 1}s`,
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
                  onClick={() => handleShare("native")}
                  className="flex flex-col items-center p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200 col-span-3 mb-2"
                >
                  <Share2 className="w-8 h-8 text-purple-400 mb-2" />
                  <span className="text-white text-sm font-semibold">Native Share</span>
                  <span className="text-gray-400 text-xs">Recommended</span>
                </button>

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
                    <span className="text-green-400 text-sm">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Copy Invite Link</span>
                  </>
                )}
              </button>

              {invitedUsers.length > 0 && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white text-sm font-semibold mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    People You Invited ({invitedUsers.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {invitedUsers.map((invite, index) => {
                      const walletAddress = invite.walletAddress || invite.userId
                      const displayName = invitedUsernames[walletAddress] || `User ${walletAddress.slice(-8)}`

                      return (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">{displayName}</span>
                          <span className="text-gray-400">{new Date(invite.timestamp).toLocaleDateString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partnership Slideshow - Between subtitle and bottom bar */}
      <div className="fixed bottom-20 left-6 right-6 z-30 flex justify-center">
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
            className="relative group cursor-pointer w-full max-w-xl"
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
          <div className="relative bg-gradient-to-t from-black/90 to-gray-950/90 backdrop-blur-xl border border-white/10 rounded-xl">
            <div className="flex items-center justify-center py-2 px-4 space-x-4">
              {/* Wallet Icon (when wallet is connected but hidden) */}
              {isAuthenticated && !showMiniWallet && (
                <button onClick={handleShowWallet} className="relative group">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-200/50 to-emerald-200/50 backdrop-blur-md border border-green-300 rounded-full flex items-center justify-center hover:from-green-300/50 hover:to-emerald-300/50 transition-all duration-300 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-1 bg-gradient-to-r from-black/10 to-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Eye className="w-4 h-4 text-green-700 relative z-10" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              )}

              {/* Central Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative group">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 backdrop-blur-md border border-gray-400 rounded-full flex items-center justify-center hover:from-gray-400 hover:to-gray-500 transition-all duration-300 shadow-xl">
                  {/* Pulsing Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-ping opacity-75" />
                  {/* Inner Glow */}
                  <div className="absolute inset-1 bg-gradient-to-r from-black/10 to-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Icon */}
                  {isMenuOpen ? (
                    <X className="w-4 h-4 text-black relative z-10 transition-transform duration-300 rotate-90" />
                  ) : (
                    <Menu className="w-4 h-4 text-black relative z-10 transition-transform duration-300" />
                  )}
                </div>
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-20 left-6 right-6 z-40"
          >
            <div className="bg-gradient-to-br from-black/90 to-gray-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4">
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                    onClick={() => {
                      if (item.action) {
                        item.action()
                      } else if (item.href) {
                        router.push(item.href)
                      }
                      setIsMenuOpen(false)
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl border border-gray-700/30 transition-all duration-200 hover:scale-105"
                  >
                    <item.icon className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-medium text-center">
                      {t.navigation[item.labelKey]}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Menu Handle */}
              <div className="flex justify-center pt-4">
                <div className="w-8 h-0.5 bg-gray-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
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
            {" "}
            {/* Adicionado o fechamento da tag aqui */}
            <div
              className="absolute inset-0 bg-white rounded-full shadow-2xl"
              style={{
                boxShadow: `0 0 30px rgba(255,255,255,1),0 0 60px rgba(229,231,235,0.8),0 0 90px rgba(209,213,219,0.6),0 0 120px rgba(156,163,175,0.4)`,
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
            </div>{" "}
            {/* Esta é a tag de fechamento que faltava */}
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
          <button onClick={() => shareCommand()} className="relative group">
            <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center space-x-1.5 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Share2 className="w-4 h-4 text-white relative z-10" />
              <span className="text-white text-sm font-bold relative z-10 tracking-wide">
                {t.common?.invite || "INVITE"}
              </span>
              {invitedUsers.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {invitedUsers.length}
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Presentation
