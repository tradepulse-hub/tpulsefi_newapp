"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "en" | "pt" | "es" | "id"

const translations = {
  en: {
    common: {
      back: "Back",
    },
    airdrop: {
      title: "Daily Airdrop",
      everyDayReward: "Every day you have TPF waiting for you, see what you earn today",
      verifying: "Verifying World ID...",
      verified: "World ID Verified!",
      verificationFailed: "World ID Not Verified",
      clickToBreakChain: "Click the box to break the chain",
      breakingChain: "Breaking chain...",
      processing: "Processing...",
      claim: "Claim",
      claimed: "Claimed",
      claimSuccessful: "Tokens claimed successfully",
      claimFailed: "An error occurred during the claim. Please try again.",
      nextClaimIn: "Next claim available in",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },
  },
  pt: {
    common: {
      back: "Voltar",
    },
    airdrop: {
      title: "Airdrop Diário",
      everyDayReward: "Todos os dias tens TPF à tua espera, vê o que ganhas hoje",
      verifying: "Verificando World ID...",
      verified: "World ID Verificado!",
      verificationFailed: "World ID Não Verificado",
      clickToBreakChain: "Clica na caixa para partir a corrente",
      breakingChain: "Partindo corrente...",
      processing: "Processando...",
      claim: "Reclamar",
      claimed: "Reclamado",
      claimSuccessful: "Tokens reclamados com sucesso",
      claimFailed: "Ocorreu um erro durante a reclamação. Tenta novamente.",
      nextClaimIn: "Próxima reclamação disponível em",
      hours: "Horas",
      minutes: "Minutos",
      seconds: "Segundos",
    },
  },
  es: {
    common: {
      back: "Volver",
    },
    airdrop: {
      title: "Airdrop Diario",
      everyDayReward: "Todos los días tienes TPF esperándote, ve lo que ganas hoy",
      verifying: "Verificando World ID...",
      verified: "¡World ID Verificado!",
      verificationFailed: "World ID No Verificado",
      clickToBreakChain: "Haz clic en la caja para romper la cadena",
      breakingChain: "Rompiendo cadena...",
      processing: "Procesando...",
      claim: "Reclamar",
      claimed: "Reclamado",
      claimSuccessful: "Tokens reclamados exitosamente",
      claimFailed: "Ocurrió un error durante la reclamación. Inténtalo de nuevo.",
      nextClaimIn: "Próximo reclamo disponible en",
      hours: "Horas",
      minutes: "Minutos",
      seconds: "Segundos",
    },
  },
  id: {
    common: {
      back: "Kembali",
    },
    airdrop: {
      title: "Airdrop Harian",
      everyDayReward: "Setiap hari Anda memiliki TPF yang menunggu, lihat apa yang Anda dapatkan hari ini",
      verifying: "Memverifikasi World ID...",
      verified: "World ID Terverifikasi!",
      verificationFailed: "World ID Tidak Terverifikasi",
      clickToBreakChain: "Klik kotak untuk memutus rantai",
      breakingChain: "Memutus rantai...",
      processing: "Memproses...",
      claim: "Klaim",
      claimed: "Diklaim",
      claimSuccessful: "Token berhasil diklaim",
      claimFailed: "Terjadi kesalahan saat klaim. Silakan coba lagi.",
      nextClaimIn: "Klaim berikutnya tersedia dalam",
      hours: "Jam",
      minutes: "Menit",
      seconds: "Detik",
    },
  },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.en
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const stored = localStorage.getItem("preferred-language") as Language
    if (stored && stored in translations) {
      setLanguage(stored)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("preferred-language", language)
  }, [language])

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
