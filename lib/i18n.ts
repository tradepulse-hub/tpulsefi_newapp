export type Language = "en" | "pt" | "es" | "id"

export interface Translations {
  common: {
    back: string
    loading: string
    error: string
    success: string
    confirm: string
    cancel: string
  }
  navigation: {
    home: string
    wallet: string
    staking: string
    membership: string
    news: string
    about: string
    airdrop: string
    partnerships: string
  }
  home: {
    welcome: string
    subtitle: string
    getStarted: string
    learnMore: string
    features: {
      secure: string
      fast: string
      decentralized: string
    }
  }
  wallet: {
    title: string
    balance: string
    send: string
    receive: string
    history: string
    connect: string
    disconnect: string
  }
  staking: {
    title: string
    subtitle: string
    stake: string
    unstake: string
    rewards: string
    apy: string
    claim: string
    processing: string
    claimSuccessful: string
    claimFailed: string
    transactionRejected: string
    insufficientFunds: string
  }
  membership: {
    title: string
    benefits: string
    upgrade: string
    current: string
  }
  news: {
    title: string
    latest: string
    readMore: string
  }
  about: {
    title: string
    description: string
    team: string
    contact: string
  }
  airdrop: {
    title: string
    everyDayReward: string
    verifying: string
    verified: string
    verificationFailed: string
    clickToBreakChain: string
    breakingChain: string
    processing: string
    claim: string
    claimed: string
    claimSuccessful: string
    claimFailed: string
    nextClaimIn: string
    hours: string
    minutes: string
    seconds: string
  }
  partnerships: {
    title: string
    subtitle: string
    ourPartners: string
    holdstationTitle: string
    holdstationDescription: string
    axoDescription: string
    dropWalletDescription: string
    humanTapDescription: string
    visitApp: string
    claimNow: string
    morePartnerships: string
    comingSoon: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      back: "Back",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    navigation: {
      home: "Home",
      wallet: "Wallet",
      staking: "Staking",
      membership: "Membership",
      news: "News",
      about: "About",
      airdrop: "Airdrop",
      partnerships: "Partnerships",
    },
    home: {
      welcome: "Welcome to TPF",
      subtitle: "The future of decentralized finance",
      getStarted: "Get Started",
      learnMore: "Learn More",
      features: {
        secure: "Secure",
        fast: "Fast",
        decentralized: "Decentralized",
      },
    },
    wallet: {
      title: "Wallet",
      balance: "Balance",
      send: "Send",
      receive: "Receive",
      history: "History",
      connect: "Connect Wallet",
      disconnect: "Disconnect",
    },
    staking: {
      title: "FiStaking",
      subtitle: "Stake your tokens and earn rewards",
      stake: "Stake",
      unstake: "Unstake",
      rewards: "Rewards",
      apy: "APY",
      claim: "Claim",
      processing: "Processing...",
      claimSuccessful: "Rewards claimed successfully",
      claimFailed: "Failed to claim rewards. Please try again.",
      transactionRejected: "Transaction was rejected by user.",
      insufficientFunds: "Insufficient funds for transaction.",
    },
    membership: {
      title: "Membership",
      benefits: "Benefits",
      upgrade: "Upgrade",
      current: "Current Plan",
    },
    news: {
      title: "News",
      latest: "Latest News",
      readMore: "Read More",
    },
    about: {
      title: "About",
      description: "Learn more about our project",
      team: "Team",
      contact: "Contact",
    },
    airdrop: {
      title: "Daily Airdrop",
      everyDayReward: "Every day you have TPF waiting for you, see what you earn today",
      verifying: "Verifying World ID...",
      verified: "World ID Verified!",
      verificationFailed: "World ID verification failed. Please try again.",
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
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      confirm: "Confirmar",
      cancel: "Cancelar",
    },
    navigation: {
      home: "Início",
      wallet: "Carteira",
      staking: "Staking",
      membership: "Membros",
      news: "Notícias",
      about: "Sobre",
      airdrop: "Airdrop",
      partnerships: "Parcerias",
    },
    home: {
      welcome: "Bem-vindo ao TPF",
      subtitle: "O futuro das finanças descentralizadas",
      getStarted: "Começar",
      learnMore: "Saber Mais",
      features: {
        secure: "Seguro",
        fast: "Rápido",
        decentralized: "Descentralizado",
      },
    },
    wallet: {
      title: "Carteira",
      balance: "Saldo",
      send: "Enviar",
      receive: "Receber",
      history: "Histórico",
      connect: "Conectar Carteira",
      disconnect: "Desconectar",
    },
    staking: {
      title: "FiStaking",
      subtitle: "Aposte seus tokens e ganhe recompensas",
      stake: "Apostar",
      unstake: "Retirar",
      rewards: "Recompensas",
      apy: "APY",
      claim: "Reclamar",
      processing: "Processando...",
      claimSuccessful: "Recompensas reclamadas com sucesso",
      claimFailed: "Falha ao reclamar recompensas. Tente novamente.",
      transactionRejected: "Transação foi rejeitada pelo usuário.",
      insufficientFunds: "Fundos insuficientes para a transação.",
    },
    membership: {
      title: "Membros",
      benefits: "Benefícios",
      upgrade: "Atualizar",
      current: "Plano Atual",
    },
    news: {
      title: "Notícias",
      latest: "Últimas Notícias",
      readMore: "Ler Mais",
    },
    about: {
      title: "Sobre",
      description: "Saiba mais sobre o nosso projeto",
      team: "Equipa",
      contact: "Contacto",
    },
    airdrop: {
      title: "Airdrop Diário",
      everyDayReward: "Todos os dias tens TPF à tua espera, vê o que ganhas hoje",
      verifying: "Verificando World ID...",
      verified: "World ID Verificado!",
      verificationFailed: "Falha na verificação do World ID. Tenta novamente.",
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
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      confirm: "Confirmar",
      cancel: "Cancelar",
    },
    navigation: {
      home: "Inicio",
      wallet: "Billetera",
      staking: "Staking",
      membership: "Membresía",
      news: "Noticias",
      about: "Acerca de",
      airdrop: "Airdrop",
      partnerships: "Asociaciones",
    },
    home: {
      welcome: "Bienvenido a TPF",
      subtitle: "El futuro de las finanzas descentralizadas",
      getStarted: "Comenzar",
      learnMore: "Saber Más",
      features: {
        secure: "Seguro",
        fast: "Rápido",
        decentralized: "Descentralizado",
      },
    },
    wallet: {
      title: "Billetera",
      balance: "Saldo",
      send: "Enviar",
      receive: "Recibir",
      history: "Historial",
      connect: "Conectar Billetera",
      disconnect: "Desconectar",
    },
    staking: {
      title: "FiStaking",
      subtitle: "Apuesta tus tokens y gana recompensas",
      stake: "Apostar",
      unstake: "Retirar",
      rewards: "Recompensas",
      apy: "APY",
      claim: "Reclamar",
      processing: "Procesando...",
      claimSuccessful: "Recompensas reclamadas exitosamente",
      claimFailed: "Error al reclamar recompensas. Inténtalo de nuevo.",
      transactionRejected: "La transacción fue rechazada por el usuario.",
      insufficientFunds: "Fondos insuficientes para la transacción.",
    },
    membership: {
      title: "Membresía",
      benefits: "Beneficios",
      upgrade: "Actualizar",
      current: "Plan Actual",
    },
    news: {
      title: "Noticias",
      latest: "Últimas Noticias",
      readMore: "Leer Más",
    },
    about: {
      title: "Acerca de",
      description: "Aprende más sobre nuestro proyecto",
      team: "Equipo",
      contact: "Contacto",
    },
    airdrop: {
      title: "Airdrop Diario",
      everyDayReward: "Todos los días tienes TPF esperándote, ve lo que ganas hoy",
      verifying: "Verificando World ID...",
      verified: "¡World ID Verificado!",
      verificationFailed: "La verificación de World ID falló. Inténtalo de nuevo.",
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
      loading: "Memuat...",
      error: "Kesalahan",
      success: "Berhasil",
      confirm: "Konfirmasi",
      cancel: "Batal",
    },
    navigation: {
      home: "Beranda",
      wallet: "Dompet",
      staking: "Staking",
      membership: "Keanggotaan",
      news: "Berita",
      about: "Tentang",
      airdrop: "Airdrop",
      partnerships: "Kemitraan",
    },
    home: {
      welcome: "Selamat datang di TPF",
      subtitle: "Masa depan keuangan terdesentralisasi",
      getStarted: "Mulai",
      learnMore: "Pelajari Lebih Lanjut",
      features: {
        secure: "Aman",
        fast: "Cepat",
        decentralized: "Terdesentralisasi",
      },
    },
    wallet: {
      title: "Dompet",
      balance: "Saldo",
      send: "Kirim",
      receive: "Terima",
      history: "Riwayat",
      connect: "Hubungkan Dompet",
      disconnect: "Putuskan Koneksi",
    },
    staking: {
      title: "FiStaking",
      subtitle: "Stake token Anda dan dapatkan hadiah",
      stake: "Stake",
      unstake: "Unstake",
      rewards: "Hadiah",
      apy: "APY",
      claim: "Klaim",
      processing: "Memproses...",
      claimSuccessful: "Hadiah berhasil diklaim",
      claimFailed: "Gagal mengklaim hadiah. Silakan coba lagi.",
      transactionRejected: "Transaksi ditolak oleh pengguna.",
      insufficientFunds: "Dana tidak mencukupi untuk transaksi.",
    },
    membership: {
      title: "Keanggotaan",
      benefits: "Manfaat",
      upgrade: "Tingkatkan",
      current: "Paket Saat Ini",
    },
    news: {
      title: "Berita",
      latest: "Berita Terbaru",
      readMore: "Baca Selengkapnya",
    },
    about: {
      title: "Tentang",
      description: "Pelajari lebih lanjut tentang proyek kami",
      team: "Tim",
      contact: "Kontak",
    },
    airdrop: {
      title: "Airdrop Harian",
      everyDayReward: "Setiap hari Anda memiliki TPF yang menunggu, lihat apa yang Anda dapatkan hari ini",
      verifying: "Memverifikasi World ID...",
      verified: "World ID Terverifikasi!",
      verificationFailed: "Verifikasi World ID gagal. Silakan coba lagi.",
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

export function getCurrentLanguage(): Language {
  if (typeof window === "undefined") return "en"

  const stored = localStorage.getItem("language")
  if (stored && ["en", "pt", "es", "id"].includes(stored)) {
    return stored as Language
  }

  const browserLang = navigator.language.split("-")[0]
  if (["en", "pt", "es", "id"].includes(browserLang)) {
    return browserLang as Language
  }

  return "en"
}

export function setLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang)
  }
}

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en
}
