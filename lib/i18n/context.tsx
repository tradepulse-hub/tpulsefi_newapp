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
    partnerships: {
      title: "Partnerships",
      subtitle: "Our strategic partners",
      ourPartners: "Our Partners",
      holdstationTitle: "HoldStation",
      holdstationDescription: "Advanced trading and swap platform for WorldChain",
      axoDescription: "Claim cute free tokens everyday!",
      dropWalletDescription: "Claim crypto airdrops & earn by swapping - Up to 10 HUB",
      humanTapDescription: "Invite friends - For real humans only",
      visitApp: "Visit App",
      claimNow: "Claim Now",
      morePartnerships: "More partnerships",
      comingSoon: "Coming soon...",
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
    partnerships: {
      title: "Parcerias",
      subtitle: "Nossos parceiros estratégicos",
      ourPartners: "Nossos Parceiros",
      holdstationTitle: "HoldStation",
      holdstationDescription: "Plataforma avançada de trading e swap para WorldChain",
      axoDescription: "Reclama tokens fofos grátis todos os dias!",
      dropWalletDescription: "Reclama airdrops de crypto e ganha fazendo swap - Até 10 HUB",
      humanTapDescription: "Convida amigos - Apenas para humanos reais",
      visitApp: "Visitar App",
      claimNow: "Reclamar Agora",
      morePartnerships: "Mais parcerias",
      comingSoon: "Em breve...",
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
    partnerships: {
      title: "Asociaciones",
      subtitle: "Nuestros socios estratégicos",
      ourPartners: "Nuestros Socios",
      holdstationTitle: "HoldStation",
      holdstationDescription: "Plataforma avanzada de trading e intercambio para WorldChain",
      axoDescription: "¡Reclama tokens lindos gratis todos los días!",
      dropWalletDescription: "Reclama airdrops de crypto y gana intercambiando - Hasta 10 HUB",
      humanTapDescription: "Invita amigos - Solo para humanos reales",
      visitApp: "Visitar App",
      claimNow: "Reclamar Ahora",
      morePartnerships: "Más asociaciones",
      comingSoon: "Próximamente...",
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
    partnerships: {
      title: "Kemitraan",
      subtitle: "Mitra strategis kami",
      ourPartners: "Mitra Kami",
      holdstationTitle: "HoldStation",
      holdstationDescription: "Platform trading dan swap canggih untuk WorldChain",
      axoDescription: "Klaim token lucu gratis setiap hari!",
      dropWalletDescription: "Klaim airdrop crypto & dapatkan dengan bertukar - Hingga 10 HUB",
      humanTapDescription: "Undang teman - Hanya untuk manusia asli",
      visitApp: "Kunjungi App",
      claimNow: "Klaim Sekarang",
      morePartnerships: "Lebih banyak kemitraan",
      comingSoon: "Segera hadir...",
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
