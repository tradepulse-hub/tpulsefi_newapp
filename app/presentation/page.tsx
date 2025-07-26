"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Menu, X, Wallet, Globe, Gift, TrendingUp, Info, Eye, Users } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useMiniKit } from "../hooks/use-minikit"
import MiniWallet from "../components/mini-wallet"
import { TechGlobe } from "../components/tech-globe"

import { Canvas } from "@react-three/fiber"

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
    presentation: {
      connectWallet: "Connect Wallet",
      heroTitle: "Unlock the Future of Decentralized Applications",
      heroSubtitle: "Experience seamless integration and enhanced user engagement with our cutting-edge MiniKit.",
      getStarted: "Get Started",
      learnMore: "Learn More",
      featuresTitle: "Key Features",
      feature1Title: "Cross-Platform Compatibility",
      feature1Description:
        "Our MiniKit seamlessly integrates with various platforms, ensuring a consistent user experience across all devices.",
      feature2Title: "Easy Integration",
      feature2Description:
        "With our simple and intuitive API, integrating our MiniKit into your existing application is a breeze.",
      feature3Title: "Secure Transactions",
      feature3Description:
        "We prioritize the security of your users' transactions, employing state-of-the-art encryption and security protocols.",
      ctaTitle: "Ready to Get Started?",
      ctaSubtitle: "Join the thousands of developers already using our MiniKit to revolutionize their applications.",
      signUp: "Sign Up Now",
    },
    navigation: {
      airdrop: "Airdrop",
      fistaking: "KStaking",
      about: "About",
      partnerships: "Partnerships",
    },
    partnerships: {
      title: "Our Partnerships",
      tPulseFiTitle: "TPulseFi",
      tPulseFiDescription:
        "TPulseFi is a DeFi project focused on long-term value appreciation, and our main partner/developer.",
      dropWalletTitle: "DropWallet",
      dropWalletDescription:
        "Drop Wallet is your go-to app for easily claiming crypto airdrops on the World Chain. Access top airdrops like KPP, swap them for USDC or WLD, and earn HUB—Drop Wallet's native token—via daily check-ins and swaps. Upcoming features include cross-chain, fiat on-ramps, staking, and crypto savings – making Web3 earning simple for everyone.",
    },
    common: {
      loading: "Loading...",
      language: "Language",
      close: "Close",
      back: "Back",
      wallet: "Wallet",
      features: "Features",
      pricing: "Pricing",
      terms: "Terms",
      privacy: "Privacy",
      contact: "Contact",
    },
  },
  pt: {
    presentation: {
      connectWallet: "Conectar Carteira",
      heroTitle: "Desbloqueie o Futuro das Aplicações Descentralizadas",
      heroSubtitle: "Experimente integração perfeita e engajamento aprimorado do usuário com nosso MiniKit de ponta.",
      getStarted: "Começar",
      learnMore: "Saber Mais",
      featuresTitle: "Principais Recursos",
      feature1Title: "Compatibilidade Multiplataforma",
      feature1Description:
        "Nosso MiniKit integra-se perfeitamente com várias plataformas, garantindo uma experiência de usuário consistente em todos os dispositivos.",
      feature2Title: "Fácil Integração",
      feature2Description:
        "Com nossa API simples e intuitiva, integrar nosso MiniKit em seu aplicativo existente é muito fácil.",
      feature3Title: "Transações Seguras",
      feature3Description:
        "Priorizamos a segurança das transações de seus usuários, empregando criptografia e protocolos de segurança de última geração.",
      ctaTitle: "Pronto para Começar?",
      ctaSubtitle:
        "Junte-se aos milhares de desenvolvedores que já usam nosso MiniKit para revolucionar seus aplicativos.",
      signUp: "Inscreva-se Agora",
    },
    navigation: {
      airdrop: "Airdrop",
      fistaking: "KStaking",
      about: "Sobre",
      partnerships: "Parcerias",
    },
    partnerships: {
      title: "Nossas Parcerias",
      tPulseFiTitle: "TPulseFi",
      tPulseFiDescription:
        "TPulseFi é um projeto DeFi focado na valorização a longo prazo, e nosso principal parceiro/desenvolvedor.",
      dropWalletTitle: "DropWallet",
      dropWalletDescription:
        "Drop Wallet é o seu aplicativo ideal para reivindicar facilmente airdrops de criptomoedas na World Chain. Acesse os melhores airdrops como KPP, troque-os por USDC ou WLD e ganhe HUB — o token nativo da Drop Wallet — através de check-ins diários e trocas. Os próximos recursos incluem cross-chain, on-ramps fiduciárias, staking e poupança de criptomoedas – tornando o ganho Web3 simples para todos.",
    },
    common: {
      loading: "Carregando...",
      language: "Idioma",
      close: "Fechar",
      back: "Voltar",
      wallet: "Carteira",
      features: "Recursos",
      pricing: "Preços",
      terms: "Termos",
      privacy: "Privacidade",
      contact: "Contato",
    },
  },
  es: {
    presentation: {
      connectWallet: "Conectar Billetera",
      heroTitle: "Desbloquea el Futuro de las Aplicaciones Descentralizadas",
      heroSubtitle:
        "Experimenta una integración perfecta y una mayor participación del usuario con nuestro MiniKit de vanguardia.",
      getStarted: "Empezar",
      learnMore: "Aprender Más",
      featuresTitle: "Características Clave",
      feature1Title: "Compatibilidad Multiplataforma",
      feature1Description:
        "Nuestro MiniKit se integra perfectamente con varias plataformas, asegurando una experiencia de usuario consistente en todos los dispositivos.",
      feature2Title: "Fácil Integración",
      feature2Description:
        "Con nuestra API simple e intuitiva, integrar nuestro MiniKit en tu aplicación existente es muy fácil.",
      feature3Title: "Transacciones Seguras",
      feature3Description:
        "Priorizamos la seguridad de las transacciones de tus usuarios, empleando cifrado y protocolos de seguridad de última generación.",
      ctaTitle: "¿Listo para Empezar?",
      ctaSubtitle:
        "Únete a los miles de desarrolladores que ya usan nuestro MiniKit para revolucionar sus aplicaciones.",
      signUp: "Regístrate Ahora",
    },
    navigation: {
      airdrop: "Airdrop",
      fistaking: "KStaking",
      about: "Acerca de",
      partnerships: "Asociaciones",
    },
    partnerships: {
      title: "Nuestras Asociaciones",
      tPulseFiTitle: "TPulseFi",
      tPulseFiDescription:
        "TPulseFi es un proyecto DeFi centrado en la apreciación del valor a largo prazo, e nosso principal socio/desenvolvedor.",
      dropWalletTitle: "DropWallet",
      dropWalletDescription:
        "Drop Wallet es tu aplicación ideal para reclamar fácilmente airdrops de criptomonedas en World Chain. Accede a los mejores airdrops como KPP, intercámbialos por USDC o WLD, y gana HUB —el token nativo de Drop Wallet— a través de registros diarios e intercambios. Las próximas características incluyen cross-chain, rampas de acceso fiat, staking y ahorros de criptomonedas, haciendo que ganar en Web3 sea sencillo para todos.",
    },
    common: {
      loading: "Cargando...",
      language: "Idioma",
      close: "Cerrar",
      back: "Atrás",
      wallet: "Billetera",
      features: "Características",
      pricing: "Precios",
      terms: "Términos",
      privacy: "Privacidad",
      contact: "Contacto",
    },
  },
  id: {
    presentation: {
      connectWallet: "Hubungkan Dompet",
      heroTitle: "Buka Masa Depan Aplikasi Terdesentralisasi",
      heroSubtitle:
        "Rasakan integrasi tanpa batas dan keterlibatan pengguna yang ditingkatkan dengan MiniKit canggih kami.",
      getStarted: "Mulai",
      learnMore: "Pelajari Lebih Lanjut",
      featuresTitle: "Fitur Utama",
      feature1Title: "Kompatibilitas Lintas Platform",
      feature1Description:
        "MiniKit kami terintegrasi dengan mulus dengan berbagai platform, memastikan pengalaman pengguna yang konsisten di semua perangkat.",
      feature2Title: "Integrasi Mudah",
      feature2Description:
        "Dengan API kami yang sederhana dan intuitif, mengintegrasikan MiniKit kami ke dalam aplikasi Anda yang sudah ada sangat mudah.",
      feature3Title: "Transaksi Aman",
      feature3Description:
        "Kami memprioritaskan keamanan transaksi pengguna Anda, menggunakan enkripsi canggih dan protokol keamanan.",
      ctaTitle: "Siap Memulai?",
      ctaSubtitle:
        "Bergabunglah dengan ribuan pengembang yang sudah menggunakan MiniKit kami para merevolusi aplikasi mereka.",
      signUp: "Daftar Sekarang",
    },
    navigation: {
      airdrop: "Airdrop",
      fistaking: "KStaking",
      about: "Tentang",
      partnerships: "Kemitraan",
    },
    partnerships: {
      title: "Kemitraan Kami",
      tPulseFiTitle: "TPulseFi",
      tPulseFiDescription:
        "TPulseFi adalah proyek DeFi yang berfokus pada apresiasi nilai jangka panjang, dan mitra/pengembang utama kami.",
      dropWalletTitle: "DropWallet",
      dropWalletDescription:
        "Drop Wallet adalah aplikasi pilihan Anda para dengan mudah mengklaim airdrop kripto di World Chain. Akses airdrop teratas seperti KPP, tukarkan dengan USDC atau WLD, dan dapatkan HUB—token asli Drop Wallet—melalui check-in harian dan pertukaran. Fitur mendatang termasuk cross-chain, fiat on-ramps, staking, dan tabungan kripto – membuat penghasilan Web3 sederhana para semua orang.",
    },
    common: {
      loading: "Memuat...",
      language: "Bahasa",
      close: "Tutup",
      back: "Kembali",
      wallet: "Dompet",
      features: "Fitur",
      pricing: "Harga",
      terms: "Ketentuan",
      privacy: "Privasi",
      contact: "Kontak",
    },
  },
}

interface NavItem {
  id: string
  labelKey: keyof typeof translations.en.navigation
  icon: React.ComponentType<any>
  href?: string
}

const Presentation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [showMiniWallet, setShowMiniWallet] = useState(false)
  const router = useRouter()

  const miniKitContext = useMiniKit()
  const {
    user = null,
    isAuthenticated = false,
    isLoading = false,
    connectWallet = async () => {},
    disconnectWallet = async () => {},
  } = miniKitContext || {}

  // Get translations for current language
  const t = translations[currentLang]

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

  const navigationItems: NavItem[] = [
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
      id: "about",
      labelKey: "about",
      icon: Info,
      href: "/about",
    },
    {
      id: "partnerships",
      labelKey: "partnerships",
      icon: Users,
      href: "/partnerships",
    },
  ]

  const handleLanguageChange = (newLanguage: keyof typeof translations) => {
    console.log("Changing language from", currentLang, "to", newLanguage)
    setCurrentLang(newLanguage)
    localStorage.setItem("preferred-language", newLanguage)
    setShowLanguageMenu(false)
    setIsMenuOpen(false)
  }

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

  const handleMinimizeWallet = () => {
    setShowMiniWallet(false)
  }

  const handleShowWallet = () => {
    if (isAuthenticated) {
      setShowMiniWallet(true)
    }
  }

  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang)

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gray-900">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Connect Wallet Button / Mini Wallet Toggle */}
          <div className="flex items-center space-x-3">
            {/* Connect Wallet Button (only when not connected) */}
            {!isAuthenticated && (
              <button onClick={connectWallet} disabled={isLoading} className="relative group">
                <div className="px-6 py-3 bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-full flex items-center space-x-2 hover:bg-gray-700/80 transition-all duration-300 disabled:opacity-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Wallet className="w-5 h-5 text-cyan-300 relative z-10" />
                  <span className="text-white font-medium relative z-10">
                    {isLoading ? t.common.loading : t.presentation.connectWallet}
                  </span>
                </div>
              </button>
            )}

            {/* Wallet Button (when wallet is connected but hidden) */}
            {isAuthenticated && !showMiniWallet && (
              <button onClick={handleShowWallet} className="relative group">
                <div className="px-3 py-2 bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-full flex items-center space-x-2 hover:bg-gray-700/80 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Eye className="w-4 h-4 text-green-300 relative z-10" />
                  <span className="text-green-300 text-sm font-medium relative z-10">{t.common.wallet}</span>
                </div>
              </button>
            )}
          </div>

          {/* Right Side - Language Selector */}
          <div className="relative">
            <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="relative group">
              <div className="px-3 py-2 bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-full flex items-center space-x-2 hover:bg-gray-700/80 transition-all duration-300">
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
                  className="absolute top-12 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-2 min-w-[200px] shadow-2xl"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as keyof typeof translations)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        currentLang === lang.code
                          ? `bg-gradient-to-r ${lang.gradient} bg-opacity-20 text-white`
                          : "hover:bg-gray-700/50 text-gray-300 hover:text-white"
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 z-40"
          >
            <MiniWallet
              walletAddress={user.walletAddress}
              onMinimize={handleMinimizeWallet}
              onDisconnect={handleWalletDisconnect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar with 3D Menu Button */}
      <div className="fixed bottom-6 left-6 right-6 z-50" style={{ perspective: "1000px" }}>
        {/* Futuristic Bottom Bar */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-700/20 via-gray-600/10 to-transparent blur-lg" />
          {/* Main Bar */}
          <div className="relative bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl">
            <div className="flex items-center justify-center py-2 px-4 space-x-4">
              {/* Central 3D Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative group"
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-gray-700/80 to-gray-800/90 backdrop-blur-md border border-gray-600/50 rounded-full flex items-center justify-center shadow-2xl"
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
                    animate={{
                      rotateX: isMenuOpen ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isMenuOpen ? (
                      <X className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                    ) : (
                      <Menu className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                    )}
                  </motion.div>
                </motion.div>

                {/* 3D Button Glow */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ transform: "translateZ(-10px)" }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Floating Icons Menu - No Background */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 pointer-events-none">
            {/* Menu Items as Floating 3D Icons */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center px-4">
              <div className="relative flex flex-nowrap justify-center gap-8 overflow-x-auto whitespace-nowrap py-2">
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
                      y: [100, -20, 0],
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
                      if (item.href) {
                        router.push(item.href)
                      }
                      setIsMenuOpen(false)
                    }}
                    className="group pointer-events-auto relative flex-shrink-0"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* 3D Icon Container with Glow */}
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl flex items-center justify-center shadow-2xl"
                      style={{
                        transformStyle: "preserve-3d",
                        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
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
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-2xl blur-sm"
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
                        className="absolute inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                        <item.icon className="w-8 h-8 text-white drop-shadow-2xl" />
                      </motion.div>

                      {/* Outer Glow Effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ transform: "translateZ(-10px)" }}
                      />
                    </motion.div>

                    {/* Floating Label */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                      style={{ transform: "translateZ(4px)" }}
                    >
                      <div className="px-3 py-1 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-full">
                        <span className="text-white text-xs font-medium drop-shadow-lg">
                          {t.navigation[item.labelKey]}
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
      <div className="relative z-10 text-center">
        {/* 3D Globe Container - Compactado */}
        <div className="relative w-[280px] h-[280px] flex items-center justify-center">
          <Canvas
            camera={{ position: [0, 0, 4], fov: 50 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setClearColor("#111827", 0)
            }}
          >
            <TechGlobe />
          </Canvas>
        </div>
      </div>

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
      `}</style>
    </div>
  )
}

export default Presentation
