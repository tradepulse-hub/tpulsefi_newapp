"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { BackgroundEffect } from "@/components/background-effect" // Import BackgroundEffect

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations for about page
const translations = {
  en: {
    title: "About TPulseFi",
    subtitle: "Learn about the TPulseFi project",
    about: "About",
    roadmap: "Roadmap",
    tokenomics: "Tokenomics",
    description:
      "TPulseFi is a DeFi project designed for long-term market appreciation, rewarding its users with daily airdrops.",
    whyChoose: "Why choose TPulseFi?",
    dailyAirdrops: "Daily Airdrops",
    dailyAirdropsDesc: "Rewards for loyal holders",
    activeCommunity: "Active Community",
    activeCommunityDesc: "Exclusive events and rewards",
    utility: "Utility",
    utilityDesc: "Transfer, play, and earn in one ecosystem",
    longTermVision: "Long-term Vision",
    longTermVisionDesc: "Sustainable growth and innovation",
    // Roadmap
    phase1: "Phase 1",
    phase2: "Phase 2",
    phase3: "Phase 3",
    completed: "Completed",
    inDevelopment: "In Development",
    futureGoals: "Future Goals",
    tokenLaunch: "Token Launch",
    websiteAndDocs: "Website and Documentation",
    communityGrowth: "Community Growth",
    miniApp: "Mini-App (Worldcoin AppStore)",
    airdropCampaigns: "Airdrop Campaigns",
    fiGames: "Fi Games",
    fiStaking: "FiStaking (12% APY)",
    pulseGame: "Pulse Game",
    fiPay: "FiPay",
    enhancedSecurity: "Enhanced Security",
    exchangeListings: "Exchange Listings",
    ecosystemExpansion: "TPulseFi Ecosystem Expansion",
    partnerships: "Partnerships",
    mobileApp: "Mobile App",
    // Tokenomics
    tpfTokenomics: "TPF Tokenomics",
    totalSupply: "Total Supply: 1,000,000,000 (1 Billion)",
    liquidity: "Liquidity",
    staking: "Staking",
    team: "Team",
    marketing: "Marketing",
    reserve: "Reserve",
    tokenDetails: "Token Details",
    name: "Name",
    symbol: "Symbol",
    network: "Network",
    type: "Type",
    back: "Back",
  },
  pt: {
    title: "Sobre TPulseFi",
    subtitle: "Saiba mais sobre o projeto TPulseFi",
    about: "Sobre",
    roadmap: "Roteiro",
    tokenomics: "Tokenomics",
    description:
      "TPulseFi é um projeto DeFi projetado para valorização de mercado a longo prazo, recompensando seus usuários com airdrops diários.",
    whyChoose: "Por que escolher TPulseFi?",
    dailyAirdrops: "Airdrops Diários",
    dailyAirdropsDesc: "Recompensas para detentores leais",
    activeCommunity: "Comunidade Ativa",
    activeCommunityDesc: "Eventos exclusivos e recompensas",
    utility: "Utilidade",
    utilityDesc: "Transferir, jogar e ganhar em um ecossistema",
    longTermVision: "Visão de Longo Prazo",
    longTermVisionDesc: "Crescimento sustentável e inovação",
    // Roadmap
    phase1: "Fase 1",
    phase2: "Fase 2",
    phase3: "Fase 3",
    completed: "Concluído",
    inDevelopment: "Em Desenvolvimento",
    futureGoals: "Objetivos Futuros",
    tokenLaunch: "Lançamento do Token",
    websiteAndDocs: "Site e Documentação",
    communityGrowth: "Crescimento da Comunidade",
    miniApp: "Mini-App (Worldcoin AppStore)",
    airdropCampaigns: "Campanhas de Airdrop",
    fiGames: "Fi Games",
    fiStaking: "FiStaking (12% APY)",
    pulseGame: "Pulse Game",
    fiPay: "FiPay",
    enhancedSecurity: "Segurança Aprimorada",
    exchangeListings: "Listagens em Exchanges",
    ecosystemExpansion: "Expansão do Ecossistema TPulseFi",
    partnerships: "Parcerias",
    mobileApp: "Aplicativo Móvel",
    // Tokenomics
    tpfTokenomics: "Tokenomics TPF",
    totalSupply: "Fornecimento Total: 1.000.000.000 (1 Bilhão)",
    liquidity: "Liquidez",
    staking: "Staking",
    team: "Equipe",
    marketing: "Marketing",
    reserve: "Reserva",
    tokenDetails: "Detalhes do Token",
    name: "Nome",
    symbol: "Símbolo",
    network: "Rede",
    type: "Tipo",
    back: "Voltar",
  },
  es: {
    title: "Acerca de TPulseFi",
    subtitle: "Aprende sobre el proyecto TPulseFi",
    about: "Acerca de",
    roadmap: "Hoja de Ruta",
    tokenomics: "Tokenomics",
    description:
      "TPulseFi es un proyecto DeFi diseñado para la apreciación del mercado a largo plazo, recompensando a sus usuarios con airdrops diarios.",
    whyChoose: "¿Por qué elegir TPulseFi?",
    dailyAirdrops: "Airdrops Diarios",
    dailyAirdropsDesc: "Recompensas para holders leales",
    activeCommunity: "Comunidad Activa",
    activeCommunityDesc: "Eventos exclusivos y recompensas",
    utility: "Utilidad",
    utilityDesc: "Transferir, jugar y ganar en un ecosistema",
    longTermVision: "Visión a Largo Plazo",
    longTermVisionDesc: "Crecimiento sostenible e innovación",
    // Roadmap
    phase1: "Fase 1",
    phase2: "Fase 2",
    phase3: "Fase 3",
    completed: "Completado",
    inDevelopment: "En Desarrollo",
    futureGoals: "Objetivos Futuros",
    tokenLaunch: "Lanzamiento del Token",
    websiteAndDocs: "Sitio Web y Documentación",
    communityGrowth: "Crecimiento de la Comunidad",
    miniApp: "Mini-App (Worldcoin AppStore)",
    airdropCampaigns: "Campañas de Airdrop",
    fiGames: "Fi Games",
    fiStaking: "FiStaking (12% APY)",
    pulseGame: "Pulse Game",
    fiPay: "FiPay",
    enhancedSecurity: "Seguridad Mejorada",
    exchangeListings: "Listados en Exchanges",
    ecosystemExpansion: "Expansión del Ecosistema TPulseFi",
    partnerships: "Asociaciones",
    mobileApp: "Aplicación Móvil",
    // Tokenomics
    tpfTokenomics: "Tokenomics TPF",
    totalSupply: "Suministro Total: 1,000,000,000 (1 Mil Millones)",
    liquidity: "Liquidez",
    staking: "Staking",
    team: "Equipo",
    marketing: "Marketing",
    reserve: "Reserva",
    tokenDetails: "Detalles del Token",
    name: "Nombre",
    symbol: "Símbolo",
    network: "Red",
    type: "Tipo",
    back: "Volver",
  },
  id: {
    title: "Tentang TPulseFi",
    subtitle: "Pelajari tentang proyek TPulseFi",
    about: "Tentang",
    roadmap: "Peta Jalan",
    tokenomics: "Tokenomics",
    description:
      "TPulseFi adalah proyek DeFi yang dirancang untuk apresiasi pasar jangka panjang, memberikan reward kepada penggunanya dengan airdrop harian.",
    whyChoose: "Mengapa memilih TPulseFi?",
    dailyAirdrops: "Airdrop Harian",
    dailyAirdropsDesc: "Hadiah untuk pemegang setia",
    activeCommunity: "Komunitas Aktif",
    activeCommunityDesc: "Acara eksklusif dan hadiah",
    utility: "Utilitas",
    utilityDesc: "Transfer, bermain, dan dapatkan dalam satu ekosistem",
    longTermVision: "Visi Jangka Panjang",
    longTermVisionDesc: "Pertumbuhan berkelanjutan dan inovasi",
    // Roadmap
    phase1: "Fase 1",
    phase2: "Fase 2",
    phase3: "Fase 3",
    completed: "Selesai",
    inDevelopment: "Dalam Pengembangan",
    futureGoals: "Tujuan Masa Depan",
    tokenLaunch: "Peluncuran Token",
    websiteAndDocs: "Website dan Dokumentasi",
    communityGrowth: "Pertumbuhan Komunitas",
    miniApp: "Mini-App (Worldcoin AppStore)",
    airdropCampaigns: "Kampanye Airdrop",
    fiGames: "Fi Games",
    fiStaking: "FiStaking (12% APY)",
    pulseGame: "Pulse Game",
    fiPay: "FiPay",
    enhancedSecurity: "Keamanan Ditingkatkan",
    exchangeListings: "Listing Exchange",
    ecosystemExpansion: "Ekspansi Ekosistem TPulseFi",
    partnerships: "Kemitraan",
    mobileApp: "Aplikasi Mobile",
    // Tokenomics
    tpfTokenomics: "Tokenomics TPF",
    totalSupply: "Total Supply: 1,000,000,000 (1 Miliar)",
    liquidity: "Likuiditas",
    staking: "Staking",
    team: "Tim",
    marketing: "Marketing",
    reserve: "Cadangan",
    tokenDetails: "Detail Token",
    name: "Nama",
    symbol: "Simbol",
    network: "Jaringan",
    type: "Tipe",
    back: "Kembali",
  },
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"about" | "roadmap" | "tokenomics">("about")
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")
  const router = useRouter()

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  // Get translations for current language
  const t = translations[currentLang]

  // Get tokenomics data with translations
  const getTokenomicsData = () => [
    { name: t.liquidity, value: 40, color: "#3b82f6" },
    { name: t.staking, value: 25, color: "#8b5cf6" },
    { name: t.team, value: 15, color: "#ec4899" },
    { name: t.marketing, value: 10, color: "#10b981" },
    { name: t.reserve, value: 10, color: "#f59e0b" },
  ]

  const handleBack = () => {
    router.back()
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center pt-6 pb-8">
      {/* Same animated background as other pages */}
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

      <style jsx>{`
        @keyframes moveRight {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        
        @keyframes moveDown {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-4 z-20"
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">{t.back}</span>
        </button>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col w-full max-w-md px-4"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-200">
              {t.title}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t.subtitle}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-1 mb-6">
          {[
            { id: "about", label: t.about },
            { id: "roadmap", label: t.roadmap },
            { id: "tokenomics", label: t.tokenomics },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`flex-1 py-2 text-sm rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setActiveTab(tab.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* About Content */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Logo and intro */}
            <div className="p-6 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-24 h-24 relative mb-4"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-2 shadow-2xl">
                  <Image
                    src="/images/logo-tpf.png"
                    alt="TPulseFi Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl -z-10"
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-white mb-2"
              >
                TPulseFi
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-sm leading-relaxed"
              >
                {t.description}
              </motion.p>
            </div>

            {/* Features */}
            <div className="px-6 pb-6 space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-black/30 rounded-xl p-4 border border-white/10"
              >
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-blue-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {t.whyChoose}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{t.dailyAirdrops}</p>
                      <p className="text-gray-400 text-xs">{t.dailyAirdropsDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{t.activeCommunity}</p>
                      <p className="text-gray-400 text-xs">{t.activeCommunityDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{t.utility}</p>
                      <p className="text-gray-400 text-xs">{t.utilityDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{t.longTermVision}</p>
                      <p className="text-gray-400 text-xs">{t.longTermVisionDesc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Roadmap Content */}
        {activeTab === "roadmap" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="space-y-6">
              {/* Phase 1 */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{t.phase1}</h3>
                    <span className="text-green-400 text-xs font-medium">{t.completed}</span>
                  </div>
                </div>
                <div className="ml-11 space-y-2">
                  <p className="text-gray-300 text-sm">• {t.tokenLaunch}</p>
                  <p className="text-gray-300 text-sm">• {t.websiteAndDocs}</p>
                  <p className="text-gray-300 text-sm">• {t.communityGrowth}</p>
                </div>
              </motion.div>

              {/* Phase 2 */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{t.phase2}</h3>
                    <span className="text-blue-400 text-xs font-medium">{t.inDevelopment}</span>
                  </div>
                </div>
                <div className="ml-11 space-y-2">
                  <p className="text-gray-300 text-sm">• {t.miniApp}</p>
                  <p className="text-gray-300 text-sm">• {t.airdropCampaigns}</p>
                  <p className="text-gray-300 text-sm">• {t.fiGames}</p>
                  <p className="text-gray-300 text-sm">• {t.fiStaking}</p>
                </div>
              </motion.div>

              {/* Phase 3 */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{t.phase3}</h3>
                    <span className="text-purple-400 text-xs font-medium">{t.futureGoals}</span>
                  </div>
                </div>
                <div className="ml-11 space-y-2">
                  <p className="text-gray-300 text-sm">• {t.pulseGame}</p>
                  <p className="text-gray-300 text-sm">• {t.fiPay}</p>
                  <p className="text-gray-300 text-sm">• {t.enhancedSecurity}</p>
                  <p className="text-gray-300 text-sm">• {t.exchangeListings}</p>
                  <p className="text-gray-300 text-sm">• {t.ecosystemExpansion}</p>
                  <p className="text-gray-300 text-sm">• {t.partnerships}</p>
                  <p className="text-gray-300 text-sm">• {t.mobileApp}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Tokenomics Content */}
        {activeTab === "tokenomics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{t.tpfTokenomics}</h3>
                <p className="text-gray-400 text-sm">{t.totalSupply}</p>
              </div>

              {/* Simple Pie Chart */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {
                      getTokenomicsData().reduce(
                        (acc, item, index) => {
                          const startAngle = acc.currentAngle
                          const angle = (item.value / 100) * 360
                          const endAngle = startAngle + angle
                          const largeArcFlag = angle > 180 ? 1 : 0

                          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

                          const pathData = [
                            `M 50 50`,
                            `L ${x1} ${y1}`,
                            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `Z`,
                          ].join(" ")

                          acc.paths.push(
                            <motion.path
                              key={index}
                              d={pathData}
                              fill={item.color}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                            />,
                          )

                          acc.currentAngle = endAngle
                          return acc
                        },
                        { paths: [] as any[], currentAngle: 0 },
                      ).paths
                    }
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {getTokenomicsData().map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                      <span className="text-white text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{item.value}%</span>
                  </motion.div>
                ))}
              </div>

              {/* Token Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-black/30 rounded-lg p-4 space-y-3 border border-white/10"
              >
                <h4 className="text-white font-semibold mb-3">{t.tokenDetails}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">{t.name}</p>
                    <p className="text-white font-medium">TPulseFi</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t.symbol}</p>
                    <p className="text-white font-medium">TPF</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t.network}</p>
                    <p className="text-white font-medium">Worldchain</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t.type}</p>
                    <p className="text-white font-medium">ERC-20</p>
                  </div>
                </div>
              </motion.div>
              {/* Contract Link */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-center"
              >
                <a
                  href="https://worldchain-mainnet.explorer.alchemy.com/token/0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.804 9.804a3.75 3.75 0 00-1.035-6.037.75.75 0 01.646-1.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 000 5.304z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>View Contract</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path
                      fillRule="evenodd"
                      d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75H15.75a.75.75 0 010-1.5z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
