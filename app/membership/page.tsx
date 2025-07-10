"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Menu,
  X,
  Wallet,
  Eye,
  Home,
  Newspaper,
  Users,
  Info,
  Gift,
  TrendingUp,
  Hand,
  Globe,
  Crown,
  Star,
  Zap,
  Shield,
  CheckCircle,
  Mail,
} from "lucide-react"
import { useMiniKit } from "../../hooks/use-minikit"
import MiniWallet from "../../components/mini-wallet"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"

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

// Translations
const translations = {
  en: {
    membership: {
      title: "Exclusive Membership",
      subtitle: "Join the Elite Circle",
      description: "Unlock premium features and exclusive benefits",
      benefits: {
        title: "Premium Benefits",
        items: [
          "Priority customer support",
          "Exclusive airdrops and rewards",
          "Advanced trading features",
          "VIP community access",
          "Early access to new features",
          "Reduced transaction fees",
        ],
      },
      pricing: {
        monthly: "Monthly",
        price: "$29.99",
        currency: "USD",
        period: "/month",
      },
      emailInstructions: {
        title: "Membership Instructions",
        text: "After purchase, send your transaction hash and wallet address to:",
        email: "membership@tpulsefi.com",
        note: "You will receive confirmation within 24 hours",
      },
      paymentSchedule: {
        text: "Payments to exclusive members occur every month on the 9th",
      },
      purchaseButton: "Purchase Membership",
      comingSoon: "Coming Soon",
    },
    navigation: {
      home: "Home",
      news: "News",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      membership: "Membership",
      partnerships: "Partnerships",
      about: "About",
    },
    common: {
      wallet: "Wallet",
      loading: "Loading...",
      language: "Language",
    },
  },
  pt: {
    membership: {
      title: "Membros Exclusivos",
      subtitle: "Junte-se ao Círculo Elite",
      description: "Desbloqueie recursos premium e benefícios exclusivos",
      benefits: {
        title: "Benefícios Premium",
        items: [
          "Suporte ao cliente prioritário",
          "Airdrops e recompensas exclusivas",
          "Recursos de negociação avançados",
          "Acesso à comunidade VIP",
          "Acesso antecipado a novos recursos",
          "Taxas de transação reduzidas",
        ],
      },
      pricing: {
        monthly: "Mensal",
        price: "$29.99",
        currency: "USD",
        period: "/mês",
      },
      emailInstructions: {
        title: "Instruções de Membros",
        text: "Após a compra, envie seu hash de transação e endereço da carteira para:",
        email: "membership@tpulsefi.com",
        note: "Você receberá confirmação em até 24 horas",
      },
      paymentSchedule: {
        text: "Os pagamentos aos membros exclusivos decorrem todos os meses ao dia 9",
      },
      purchaseButton: "Comprar Membros",
      comingSoon: "Em Breve",
    },
    navigation: {
      home: "Início",
      news: "Notícias",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      membership: "Membros",
      partnerships: "Parcerias",
      about: "Sobre",
    },
    common: {
      wallet: "Carteira",
      loading: "Carregando...",
      language: "Idioma",
    },
  },
  es: {
    membership: {
      title: "Membresía Exclusiva",
      subtitle: "Únete al Círculo Elite",
      description: "Desbloquea características premium y beneficios exclusivos",
      benefits: {
        title: "Beneficios Premium",
        items: [
          "Soporte al cliente prioritario",
          "Airdrops y recompensas exclusivas",
          "Características de trading avanzadas",
          "Acceso a comunidad VIP",
          "Acceso temprano a nuevas características",
          "Tarifas de transacción reducidas",
        ],
      },
      pricing: {
        monthly: "Mensual",
        price: "$29.99",
        currency: "USD",
        period: "/mes",
      },
      emailInstructions: {
        title: "Instrucciones de Membresía",
        text: "Después de la compra, envía tu hash de transacción y dirección de billetera a:",
        email: "membership@tpulsefi.com",
        note: "Recibirás confirmación dentro de 24 horas",
      },
      paymentSchedule: {
        text: "Los pagos a miembros exclusivos ocurren todos los meses el día 9",
      },
      purchaseButton: "Comprar Membresía",
      comingSoon: "Próximamente",
    },
    navigation: {
      home: "Inicio",
      news: "Noticias",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      membership: "Membresía",
      partnerships: "Asociaciones",
      about: "Acerca de",
    },
    common: {
      wallet: "Billetera",
      loading: "Cargando...",
      language: "Idioma",
    },
  },
  id: {
    membership: {
      title: "Keanggotaan Eksklusif",
      subtitle: "Bergabung dengan Lingkaran Elite",
      description: "Buka fitur premium dan manfaat eksklusif",
      benefits: {
        title: "Manfaat Premium",
        items: [
          "Dukungan pelanggan prioritas",
          "Airdrop dan hadiah eksklusif",
          "Fitur trading lanjutan",
          "Akses komunitas VIP",
          "Akses awal ke fitur baru",
          "Biaya transaksi berkurang",
        ],
      },
      pricing: {
        monthly: "Bulanan",
        price: "$29.99",
        currency: "USD",
        period: "/bulan",
      },
      emailInstructions: {
        title: "Instruksi Keanggotaan",
        text: "Setelah pembelian, kirim hash transaksi dan alamat dompet Anda ke:",
        email: "membership@tpulsefi.com",
        note: "Anda akan menerima konfirmasi dalam 24 jam",
      },
      paymentSchedule: {
        text: "Pembayaran kepada anggota eksklusif terjadi setiap bulan pada tanggal 9",
      },
      purchaseButton: "Beli Keanggotaan",
      comingSoon: "Segera Hadir",
    },
    navigation: {
      home: "Beranda",
      news: "Berita",
      airdrop: "Airdrop",
      fistaking: "Fi Staking",
      membership: "Keanggotaan",
      partnerships: "Kemitraan",
      about: "Tentang",
    },
    common: {
      wallet: "Dompet",
      loading: "Memuat...",
      language: "Bahasa",
    },
  },
}

interface NavItem {
  id: string
  labelKey: keyof typeof translations.en.navigation
  icon: React.ComponentType<any>
  href: string
}

interface MembershipProps {
  address?: string
  shortAddress?: string
  copy?: () => void
}

const Membership: React.FC<MembershipProps> = ({ address, shortAddress, copy }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMiniWallet, setShowMiniWallet] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const router = useRouter()

  // Get translations for current language
  const t = translations[currentLang]

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

  const navigationItems: NavItem[] = [
    {
      id: "home",
      labelKey: "home",
      icon: Home,
      href: "/",
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

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Top Navigation - Wallet Left, Language Right */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Wallet Controls */}
          <div className="flex items-center space-x-3">
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
                    {isLoading ? t.common?.loading || "Loading..." : "Connect Wallet"}
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

      {/* Mini Wallet - Positioned in top left when connected */}
      <AnimatePresence>
        {showMiniWallet && user && (
          <div className="absolute top-24 left-6 z-40">
            <MiniWallet
              walletAddress={user.walletAddress}
              onMinimize={handleMinimizeWallet}
              onDisconnect={handleWalletDisconnect}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-16 h-16 text-yellow-400 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  {t.membership?.title || "Exclusive Membership"}
                </h1>
                <p className="text-xl text-gray-300 mt-2">{t.membership?.subtitle || "Join the Elite Circle"}</p>
              </div>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t.membership?.description || "Unlock premium features and exclusive benefits"}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Benefits List */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Star className="w-6 h-6 text-yellow-400 mr-3" />
                {t.membership?.benefits?.title || "Premium Benefits"}
              </h3>
              <div className="space-y-4">
                {(t.membership?.benefits?.items || []).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8">
              <div className="text-center">
                <div className="bg-yellow-400/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t.membership?.pricing?.monthly || "Monthly"}</h3>
                <div className="text-4xl font-bold text-yellow-400 mb-1">
                  {t.membership?.pricing?.price || "$29.99"}
                </div>
                <p className="text-gray-400 mb-6">
                  {t.membership?.pricing?.currency || "USD"} {t.membership?.pricing?.period || "/month"}
                </p>
                <div className="bg-yellow-400/10 rounded-lg p-4 mb-6">
                  <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Premium Access Guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Instructions */}
          <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-8 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Mail className="w-6 h-6 text-blue-400 mr-3" />
              {t.membership?.emailInstructions?.title || "Membership Instructions"}
            </h3>
            <p className="text-gray-300 mb-4">
              {t.membership?.emailInstructions?.text ||
                "After purchase, send your transaction hash and wallet address to:"}
            </p>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-blue-400 font-mono text-lg text-center">
                {t.membership?.emailInstructions?.email || "membership@tpulsefi.com"}
              </p>
            </div>
            <p className="text-sm text-gray-400 text-center">
              {t.membership?.emailInstructions?.note || "You will receive confirmation within 24 hours"}
            </p>
          </div>

          {/* Payment Schedule Information */}
          <div className="bg-green-500/10 backdrop-blur-xl border border-green-400/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-2xl">💰</div>
              <p className="text-green-300 font-medium text-center">
                {t.membership?.paymentSchedule?.text || "Payments to exclusive members occur every month on the 9th"}
              </p>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="text-center">
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-4 px-12 rounded-full text-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              {t.membership?.comingSoon || "Coming Soon"}
            </button>
            <p className="text-gray-400 text-sm mt-4">Membership system will be available soon</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/20 via-blue-400/10 to-transparent blur-lg" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl">
            <div className="flex items-center justify-center py-3 px-6">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative group">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:from-cyan-400/30 hover:to-blue-400/30 transition-all duration-300 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-ping opacity-75" />
                  <div className="absolute inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-white relative z-10 transition-transform duration-300 rotate-90" />
                  ) : (
                    <Menu className="w-5 h-5 text-white relative z-10 transition-transform duration-300" />
                  )}
                </div>
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
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl mb-16">
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-white/30 rounded-full" />
              </div>
              <div className="p-6 pb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-2xl" />
                <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                  {navigationItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        router.push(item.href)
                        setIsMenuOpen(false)
                      }}
                      className="group p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full flex items-center justify-center group-hover:from-cyan-400/30 group-hover:to-blue-400/30 transition-all duration-300">
                          <item.icon className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-white/80 group-hover:text-white font-medium text-sm tracking-wide">
                          {t.navigation?.[item.labelKey] || item.labelKey}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-cyan-400/50 to-blue-400/50 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full animate-ping"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              backgroundColor:
                i % 3 === 0 ? "rgba(255,255,255,0.3)" : i % 3 === 1 ? "rgba(34,211,238,0.4)" : "rgba(59,130,246,0.3)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

export default Membership
