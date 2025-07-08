"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, ChevronRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations for news content
const translations = {
  en: {
    title: "News",
    subtitle: "Latest news and updates",
    worldRepublicPartyTitle: "TPulseFi Party on WorldRepublic",
    worldRepublicPartyDate: "Date: May 15, 2025",
    worldRepublicPartyDescription:
      "Join us at our party on World Republic, everything we raise will benefit TPulseFi holders in FiStaking and will increase earnings!",
    worldRepublicPartyEnterNow: "Enter Now",
    stayTuned: "Stay Tuned",
    moreAnnouncements: "More announcements coming soon. Check back regularly for updates!",
    back: "Back",
  },
  pt: {
    title: "Notícias",
    subtitle: "Últimas notícias e atualizações",
    worldRepublicPartyTitle: "Partido TPulseFi no WorldRepublic",
    worldRepublicPartyDate: "Data: 15 de Maio de 2025",
    worldRepublicPartyDescription:
      "Junta te a nós no nosso partido no World Republic, tudo que angariarmos vai benificar os holders de TPulseFi no FiStaking e ira aumentar os ganhos!",
    worldRepublicPartyEnterNow: "Entrar Agora",
    stayTuned: "Fique Ligado",
    moreAnnouncements: "Mais anúncios em breve. Volte regularmente para atualizações!",
    back: "Voltar",
  },
  es: {
    title: "Noticias",
    subtitle: "Últimas noticias y actualizaciones",
    worldRepublicPartyTitle: "Partido TPulseFi en WorldRepublic",
    worldRepublicPartyDate: "Fecha: 15 de Mayo de 2025",
    worldRepublicPartyDescription:
      "¡Únete a nosotros en nuestro partido en World Republic, todo lo que recaudemos beneficiará a los holders de TPulseFi en FiStaking y aumentará las ganancias!",
    worldRepublicPartyEnterNow: "Entrar Ahora",
    stayTuned: "Mantente Atento",
    moreAnnouncements: "Más anuncios próximamente. ¡Vuelve regularmente para ver actualizaciones!",
    back: "Volver",
  },
  id: {
    title: "Berita",
    subtitle: "Berita dan pembaruan terbaru",
    worldRepublicPartyTitle: "Pesta TPulseFi di WorldRepublic",
    worldRepublicPartyDate: "Tanggal: 15 Mei 2025",
    worldRepublicPartyDescription:
      "Bergabunglah dengan kami di pesta kami di World Republic, semua yang kami kumpulkan akan menguntungkan pemegang TPulseFi di FiStaking dan akan meningkatkan keuntungan!",
    worldRepublicPartyEnterNow: "Masuk Sekarang",
    stayTuned: "Tetap Terhubung",
    moreAnnouncements: "Pengumuman lebih lanjut akan segera hadir. Periksa kembali secara berkala untuk pembaruan!",
    back: "Kembali",
  },
}

export default function NewsPage() {
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

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Same animated background as presentation.tsx */}
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
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{t.back}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          {/* Title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tighter flex items-center justify-center mb-2">
              <Bell className="w-8 h-8 mr-3 text-cyan-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-200">
                {t.title}
              </span>
            </h1>
            <p className="text-gray-400 text-sm">{t.subtitle}</p>
          </motion.div>

          {/* News Content */}
          <div className="w-full max-w-md space-y-6">
            {/* WorldRepublic Party Announcement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-xl mr-4 flex-shrink-0">
                  <Bell size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{t.worldRepublicPartyTitle}</h2>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Calendar size={16} className="mr-2" />
                    <span>{t.worldRepublicPartyDate}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">{t.worldRepublicPartyDescription}</p>
                  <div className="flex justify-end">
                    <a
                      href="https://world.org/mini-app?app_id=app_66c83ab8c851fb1e54b1b1b62c6ce39d&path=%2Fgovern%2Fparty%2F1304"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                    >
                      <span>{t.worldRepublicPartyEnterNow}</span>
                      <ChevronRight size={16} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stay Tuned Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.stayTuned}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{t.moreAnnouncements}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full animate-ping"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            backgroundColor:
              i % 3 === 0 ? "rgba(255,255,255,0.6)" : i % 3 === 1 ? "rgba(34,211,238,0.4)" : "rgba(59,130,246,0.3)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
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
      `}</style>
    </div>
  )
}
