"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from "next/navigation"

// Supported languages
const SUPPORTED_LANGUAGES = ["en", "pt", "es", "id"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Translations
const translations = {
  en: {
    title: "Important Announcement Regarding Memberships",
    back: "Back",
    message1: "Due to regulatory requirements that we must comply with, we have decided to cancel the membership system.",
    message2: "This decision was not made by our own will but due to greater reasons beyond our control.",
    message3: "For those who already hold memberships, we will continue payments until completing your invested value so you don't suffer any losses.",
    appreciation: "We appreciate your understanding and continued support.",
  },
  pt: {
    title: "Anúncio Importante sobre Membrianças",
    back: "Voltar",
    message1: "Devido a regras que devemos cumprir, decidimos cancelar o sistema de memberships.",
    message2: "Não foi por nossa vontade mas sim por motivos maiores.",
    message3: "Para os que detêm o membership, iremos continuar a pagar até completar o seu valor investido de forma que não tenha nenhum dano.",
    appreciation: "Agradecemos a sua compreensão e contínuo apoio.",
  },
  es: {
    title: "Anuncio Importante sobre Membresías",
    back: "Volver",
    message1: "Debido a regulaciones que debemos cumplir, hemos decidido cancelar el sistema de membresías.",
    message2: "Esta decisión no fue por nuestra voluntad sino por motivos mayores beyond nuestro control.",
    message3: "Para aquellos que ya tienen membresías, continuaremos con los pagos hasta completar su valor invertido para que no sufran pérdidas.",
    appreciation: "Agradecemos su comprensión y continuo apoyo.",
  },
  id: {
    title: "Pengumuman Penting tentang Keanggotaan",
    back: "Kembali",
    message1: "Karena persyaratan peraturan yang harus kami patuhi, kami memutuskan untuk membatalkan sistem keanggotaan.",
    message2: "Keputusan ini bukan dibuat atas keinginan kami sendiri tetapi karena alasan yang lebih besar di luar kendali kami.",
    message3: "Bagi mereka yang sudah memegang keanggotaan, kami akan terus melakukan pembayaran hingga nilai investasi Anda terlunasi agar Anda tidak mengalami kerugian.",
    appreciation: "Kami menghargai pengertian dan dukungan terus menerus Anda.",
  },
}

export default function MembershipPage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en")

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
    try {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push("/")
      }
    } catch (error) {
      router.push("/")
    }
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center pt-6 pb-8 px-4">
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

      {/* Language Selector */}
      <div className="absolute top-6 right-4 z-20 flex space-x-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => {
              setCurrentLang(lang)
              localStorage.setItem("preferred-language", lang)
            }}
            className={`w-8 h-8 rounded-full text-xs font-medium border transition-all ${
              currentLang === lang
                ? "bg-white text-black border-white"
                : "bg-black/20 text-white/80 border-white/10 hover:bg-white/10"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Announcement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto text-center p-8 bg-red-900/20 border border-red-700/30 rounded-xl backdrop-blur-md"
      >
        <div className="mb-6 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
          {t.title}
        </h1>
        
        <div className="space-y-4 text-gray-200 text-lg leading-relaxed">
          <p>{t.message1}</p>
          <p>{t.message2}</p>
          <p className="text-green-300 font-medium">{t.message3}</p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-red-700/30">
          <p className="text-red-300 text-sm">
            {t.appreciation}
          </p>
        </div>
      </motion.div>
    </main>
  )
}
