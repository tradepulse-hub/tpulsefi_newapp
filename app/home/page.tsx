"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          {welcomeMessages[language as keyof typeof welcomeMessages]}
        </h1>
        <p className="text-gray-400">Your Worldcoin mini app is ready to be built!</p>
      </motion.div>
    </div>
  )
}
