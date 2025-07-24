"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, ChevronRight, ArrowLeft, Users, Gift, Copy } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BackgroundEffect } from "@/components/background-effect" // Import BackgroundEffect

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
    referralProgramTitle: "Membership Referral Program",
    referralProgramDate: "Valid from: July 13, 2025",
    referralProgramDescription: "Earn 10 WLD for each friend you bring to get membership!",
    referralHowItWorks: "How it works:",
    referralStep1: "1. Your friend subscribes for 30 WLD membership",
    referralStep2: "2. Friend sends email proof with both addresses to support@tradepulsetoken.com",
    referralStep3: "3. You contact support team indicating the address you invited",
    referralStep4: "4. You receive 10 WLD reward!",
    referralValidity:
      "Offer valid from July 13, 2025 until TPulseFi decides to end the promotion with 30 days advance notice.",
    referralEmailLabel: "Support Email:",
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
    referralProgramTitle: "Programa de Referência de Membros",
    referralProgramDate: "Válido a partir de: 13 de Julho de 2025",
    referralProgramDescription: "Ganha 10 WLD por cada amigo que trouxeres para obter membership!",
    referralHowItWorks: "Como funciona:",
    referralStep1: "1. O teu amigo assina por 30 WLD",
    referralStep2: "2. Amigo envia email com comprovativo e ambos os endereços para support@tradepulsetoken.com",
    referralStep3: "3. Tu contactas a equipa de apoio indicando o endereço que convidaste",
    referralStep4: "4. Recebes 10 WLD de recompensa!",
    referralValidity:
      "Oferta válida a partir do dia 13/07/2025 até TPulseFi resolver acabar com a promoção em vigor com aviso antecipado de 30 dias.",
    referralEmailLabel: "Email de Apoio:",
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
    referralProgramTitle: "Programa de Referidos de Membresía",
    referralProgramDate: "Válido desde: 13 de Julio de 2025",
    referralProgramDescription: "¡Gana 10 WLD por cada amigo que traigas para obtener membresía!",
    referralHowItWorks: "Cómo funciona:",
    referralStep1: "1. Tu amigo se suscribe por 30 WLD",
    referralStep2: "2. Amigo envía email con comprobante y ambas direcciones a support@tradepulsetoken.com",
    referralStep3: "3. Tú contactas al equipo de soporte indicando la dirección que invitaste",
    referralStep4: "4. ¡Recibes 10 WLD de recompensa!",
    referralValidity:
      "Oferta válida desde el 13/07/2025 hasta que TPulseFi decida terminar la promoción con aviso previo de 30 días.",
    referralEmailLabel: "Email de Soporte:",
    stayTuned: "Mantente Atento",
    moreAnnouncements: "Más anuncios próximamente. ¡Vuelve regularmente para ver actualizaciones!",
    back: "Voltar",
  },
  id: {
    title: "Berita",
    subtitle: "Berita dan pembaruan terbaru",
    worldRepublicPartyTitle: "Pesta TPulseFi di WorldRepublic",
    worldRepublicPartyDate: "Tanggal: 15 Mei 2025",
    worldRepublicPartyDescription:
      "Bergabunglah dengan kami di pesta kami di World Republic, semua yang kami kumpulkan akan menguntungkan pemegang TPulseFi di FiStaking dan akan meningkatkan keuntungan!",
    worldRepublicPartyEnterNow: "Masuk Sekarang",
    referralProgramTitle: "Program Rujukan Keanggotaan",
    referralProgramDate: "Berlaku dari: 13 Juli 2025",
    referralProgramDescription: "Dapatkan 10 WLD untuk setiap teman yang Anda bawa untuk mendapatkan keanggotaan!",
    referralHowItWorks: "Cara kerjanya:",
    referralStep1: "1. Teman Anda berlangganan dengan 30 WLD",
    referralStep2: "2. Teman mengirim email bukti dengan kedua alamat ke support@tradepulsetoken.com",
    referralStep3: "3. Anda menghubungi tim dukungan menunjukkan alamat yang Anda undang",
    referralStep4: "4. Anda menerima hadiah 10 WLD!",
    referralValidity:
      "Penawaran berlaku dari 13/07/2025 hingga TPulseFi memutuskan untuk mengakhiri promosi dengan pemberitahuan 30 hari sebelumnya.",
    referralEmailLabel: "Email Dukungan:",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Background Effect */}
      <BackgroundEffect />

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
            {/* Referral Program Announcement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl mr-4 flex-shrink-0">
                  <Gift size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{t.referralProgramTitle}</h2>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Calendar size={16} className="mr-2" />
                    <span>{t.referralProgramDate}</span>
                  </div>
                  <p className="text-sm text-green-300 font-semibold mb-4">{t.referralProgramDescription}</p>

                  {/* How it works */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white mb-2">{t.referralHowItWorks}</h3>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="flex items-start">
                        <Users className="w-3 h-3 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                        <span>{t.referralStep1}</span>
                      </div>
                      <div className="flex items-start">
                        <Bell className="w-3 h-3 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                        <span>{t.referralStep2}</span>
                      </div>
                      <div className="flex items-start">
                        <ChevronRight className="w-3 h-3 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                        <span>{t.referralStep3}</span>
                      </div>
                      <div className="flex items-start">
                        <Gift className="w-3 h-3 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                        <span>{t.referralStep4}</span>
                      </div>
                    </div>
                  </div>

                  {/* Support Email */}
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{t.referralEmailLabel}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white font-mono">support@tradepulsetoken.com</span>
                      <button
                        onClick={() => copyToClipboard("support@tradepulsetoken.com")}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Validity */}
                  <div className="text-xs text-gray-400 leading-relaxed">
                    <p>{t.referralValidity}</p>
                  </div>
                </div>
              </div>
            </motion.div>

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
    </div>
  )
}
