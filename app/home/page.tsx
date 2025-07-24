"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BackgroundEffect } from "@/components/background-effect" // Import the BackgroundEffect component

export default function HomePage() {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const welcomeMessages = {
    en: "Welcome to TPulseFi Home",
    pt: "Bem-vindo à página inicial do TPulseFi",
    es: "Bienvenido a la página de inicio de TPulseFi",
    id: "Selamat datang di beranda TPulseFi",
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Render the BackgroundEffect component */}
      <BackgroundEffect />

      {/* Content of the page */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10">
        <h1 className="text-2xl font-bold text-white mb-4">
          {welcomeMessages[language as keyof typeof welcomeMessages]}
        </h1>
        <p className="text-gray-400">Your Worldcoin mini app is ready to be built!</p>
      </motion.div>
    </div>
  )
}
