"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "pt", name: "Português", flag: "🇧🇷", nativeName: "Português" },
  { code: "es", name: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },
]

// Translation texts
const translations = {
  en: {
    title: "Welcome to TPulseFi",
    subtitle: "For the best user experience, please select your preferred language",
    continue: "Continue",
  },
  pt: {
    title: "Bem-vindo ao TPulseFi",
    subtitle: "Para a melhor experiência do usuário, selecione seu idioma preferido",
    continue: "Continuar",
  },
  es: {
    title: "Bienvenido a TPulseFi",
    subtitle: "Para la mejor experiencia de usuario, selecciona tu idioma preferido",
    continue: "Continuar",
  },
  id: {
    title: "Selamat datang di TPulseFi",
    subtitle: "Untuk pengalaman pengguna terbaik, silakan pilih bahasa pilihan Anda",
    continue: "Lanjutkan",
  },
}

interface LanguageWelcomeProps {
  onComplete?: () => void
}

export default function LanguageWelcome({ onComplete }: LanguageWelcomeProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof translations>("en")
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has already completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed")
    if (hasCompletedOnboarding === "true") {
      // Redirect directly to presentation if already completed
      router.push("/presentation")
    }
  }, [router])

  const handleLanguageChange = (langCode: keyof typeof translations) => {
    setSelectedLanguage(langCode)
    setHasSelectedLanguage(true)
  }

  const handleContinue = () => {
    if (onComplete) {
      onComplete()
    }
    // Store selected language in localStorage
    localStorage.setItem("preferred-language", selectedLanguage)
    // Mark onboarding as completed
    localStorage.setItem("onboarding-completed", "true")
    // Redirect to presentation page
    router.push("/presentation")
  }

  // Default English text for initial display
  const defaultText = translations.en

  // Use selected language text or default
  const displayText = hasSelectedLanguage ? translations[selectedLanguage] : defaultText

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Moving grid lines */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`grid-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-slide-right"
            style={{
              top: `${i * 7}%`,
              left: "-100%",
              width: "200%",
              animationDuration: `${3 + i * 0.1}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        {/* Vertical lines */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`v-grid-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-slide-down"
            style={{
              left: `${i * 10}%`,
              top: "-100%",
              height: "200%",
              animationDuration: `${4 + i * 0.1}s`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-10 left-10 w-60 h-60 bg-cyan-400/15 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col h-[500px] justify-between">
        <motion.div
          key={hasSelectedLanguage ? selectedLanguage : "default"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* TPF Logo with Intense Vibration */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center mb-4 animate-vibrate-container">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-2xl animate-vibrate-logo animate-pulse-glow">
                <Image
                  src="/images/logo-tpf.png"
                  alt="TPulseFi Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain animate-vibrate-logo"
                />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">{displayText.title}</h1>
            <p className="text-gray-400 text-sm leading-relaxed px-2">{displayText.subtitle}</p>
          </motion.div>

          {/* Language Options */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-6"
          >
            {SUPPORTED_LANGUAGES.map((lang, index) => (
              <motion.button
                key={lang.code}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => handleLanguageChange(lang.code as keyof typeof translations)}
                className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                  selectedLanguage === lang.code
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/70"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-3 min-w-[24px]">{lang.flag}</span>
                    <span className="font-medium text-sm">{lang.nativeName}</span>
                  </div>
                  {selectedLanguage === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Continue Button */}
        {hasSelectedLanguage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-600 transition-all duration-200 shadow-lg text-sm flex items-center justify-center space-x-2"
            >
              <span>{displayText.continue}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
