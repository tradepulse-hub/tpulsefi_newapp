"use client"

import Image from "next/image"
import { ArrowLeft, Coins, Info, Hammer, Flame } from "lucide-react" // Added Flame icon
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link" // Import Link for navigation

// Simplified language support (replicated from presentation page for consistency)
const translations = {
  en: {
    pulsecode: {
      title: "PulseCode: The Project Unifier",
      description:
        "A project focused on helping various projects get developed for a fee of 500 WLD. What do we do with this fee? 50% - Liquidity, 50% - Repurchase, continuously increasing the value of PulseCode (PSC).",
      back: "Back",
      footer: {
        codeStaking: "CodeStaking",
        about: "About",
        projectsInDevelopment: "Projects in Development",
        burn: "Burn", // New translation for burn tab
        underDevelopment: "Under Development",
        keplerPay: "KeplerPay (KPP)",
      },
    },
    furnace: {
      // New translations for the Furnace page, moved here
      title: "Furnace",
      subtitle: "Burn PSC tokens and contribute to token stability",
      totalBurned: "Total burned",
      amountToBurn: "Amount of PSC to burn",
      openFurnace: "OPEN FURNACE",
      startBurn: "START BURN",
      burning: "Burning...",
      burnCompleted: "Burn Completed!",
      lastTransaction: "Last Transaction",
      instructions: "Click the button to open the furnace",
      furnaceInfo: "Furnace Information",
      deflation:
        "Deflation: Each token burned is sent to a dead wallet (0x000...dEaD) and permanently removed from circulation.",
    },
  },
  pt: {
    pulsecode: {
      title: "PulseCode: O Projeto que Une Projetos",
      description:
        "Projeto que o foco passa por ajudar varios projetos a serem desenvolvidos por uma taxa de 500 WLD, o que fazemos com essa taxa, 50% - Liquidez, 50% - Recompra Aumentando cada vez mais o valor de PulseCode (PSC).",
      back: "Voltar",
      footer: {
        codeStaking: "CodeStaking",
        about: "Sobre",
        projectsInDevelopment: "Projetos em Desenvolvimento",
        burn: "Queima", // New translation for burn tab
        underDevelopment: "Em Desenvolvimento",
        keplerPay: "KeplerPay (KPP)",
      },
    },
    furnace: {
      // New translations for the Furnace page, moved here
      title: "Fornalha",
      subtitle: "Queime tokens PSC e contribua para a estabilidade do token",
      totalBurned: "Total queimado",
      amountToBurn: "Quantidade de PSC para queimar",
      openFurnace: "ABRIR FORNALHA",
      startBurn: "INICIAR QUEIMA",
      burning: "Queimando...",
      burnCompleted: "Queima Concluída!",
      lastTransaction: "Última Transação",
      instructions: "Clique no botão para abrir a fornalha",
      furnaceInfo: "Informações sobre a Fornalha",
      deflation:
        "Deflação: Cada token queimado é enviado para uma carteira morta (0x000...dEaD) e removido permanentemente da circulação.",
    },
  },
  es: {
    pulsecode: {
      title: "PulseCode: El Proyecto que Une Proyectos",
      description:
        "Proyecto que se enfoca en ayudar a desarrollar varios proyectos por una tarifa de 500 WLD. ¿Qué hacemos con esta tarifa? 50% - Liquidez, 50% - Recompra, aumentando continuamente el valor de PulseCode (PSC).",
      back: "Atrás",
      footer: {
        codeStaking: "CodeStaking",
        about: "Acerca de",
        projectsInDevelopment: "Proyectos en Desarrollo",
        burn: "Quema", // New translation for burn tab
        underDevelopment: "En Desarrollo",
        keplerPay: "KeplerPay (KPP)",
      },
    },
    furnace: {
      // New translations for the Furnace page, moved here
      title: "Horno",
      subtitle: "Quema tokens PSC y contribuye a la estabilidad del token",
      totalBurned: "Total quemado",
      amountToBurn: "Cantidad de PSC a quemar",
      openFurnace: "ABRIR HORNO",
      startBurn: "INICIAR QUEMA",
      burning: "Quemando...",
      burnCompleted: "¡Quema Completada!",
      lastTransaction: "Última Transacción",
      instructions: "Haz clic en el botón para abrir el horno",
      furnaceInfo: "Información sobre el Horno",
      deflation:
        "Deflación: Cada token quemado se envía a una billetera muerta (0x000...dEaD) y se elimina permanentemente de la circulación.",
    },
  },
  id: {
    pulsecode: {
      title: "PulseCode: Proyek Pemersatu Proyek",
      description:
        "Proyek yang berfokus pada membantu berbagai proyek dikembangkan dengan biaya 500 WLD. Apa yang kami lakukan dengan biaya ini? 50% - Likuiditas, 50% - Pembelian Kembali, terus meningkatkan nilai PulseCode (PSC).",
      back: "Kembali",
      footer: {
        codeStaking: "CodeStaking",
        about: "Tentang",
        projectsInDevelopment: "Proyek dalam Pengembangan",
        burn: "Bakar", // New translation for burn tab
        underDevelopment: "Dalam Pengembangan",
        keplerPay: "KeplerPay (KPP)",
      },
    },
    furnace: {
      // New translations for the Furnace page, moved here
      title: "Tungku",
      subtitle: "Bakar token PSC dan berkontribusi pada stabilitas token",
      totalBurned: "Total dibakar",
      amountToBurn: "Jumlah PSC yang akan dibakar",
      openFurnace: "BUKA TUNGKU",
      startBurn: "MULAI PEMBAKARAN",
      burning: "Membakar...",
      burnCompleted: "Pembakaran Selesai!",
      lastTransaction: "Transaksi Terakhir",
      instructions: "Klik tombol untuk membuka tungku",
      furnaceInfo: "Informasi tentang Tungku",
      deflation:
        "Deflasi: Setiap token yang dibakar dikirim ke dompet mati (0x000...dEaD) dan dihapus secara permanen dari peredaran.",
    },
  },
}

export default function PulseCodePage() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>("en")
  const [activeFooterTab, setActiveFooterTab] = useState<"about" | "codestaking" | "projects" | "burn">("about") // Added 'burn' tab

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as keyof typeof translations
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLang(savedLanguage)
    }
  }, [])

  const t = translations[currentLang]

  const renderContent = () => {
    switch (activeFooterTab) {
      case "about":
        return (
          <>
            {/* PulseCode Logo - Only visible in About tab */}
            <div className="relative mb-8 flex items-center justify-center">
              <div
                className="absolute w-48 h-48 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(255,255,255,0.4) 0%,
                    rgba(156,163,175,0.3) 30%,
                    rgba(107,114,128,0.2) 60%,
                    transparent 100%)`,
                  animation: "vibrateAura 0.1s linear infinite, pulse 1s ease-in-out infinite",
                }}
              />
              <div
                className="absolute w-40 h-40 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(255,255,255,0.6) 0%,
                    rgba(229,231,235,0.4) 40%,
                    transparent 100%)`,
                  animation: "vibrateAura 0.15s linear infinite, pulse 0.8s ease-in-out infinite",
                  animationDelay: "0.05s",
                }}
              />
              <div
                className="absolute w-32 h-32 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(243,244,246,0.5) 0%,
                    rgba(209,213,219,0.4) 50%,
                    transparent 100%)`,
                  animation: "vibrateAura 0.2s linear infinite, pulse 0.6s ease-in-out infinite",
                  animationDelay: "0.1s",
                }}
              />

              <div
                className="absolute w-36 h-36 border-2 border-gray-300/60 rounded-full"
                style={{
                  animation: "vibrateRing 0.1s linear infinite, spin 8s linear infinite",
                  boxShadow: "0 0 20px rgba(255,255,255,0.8), inset 0 0 20px rgba(229,231,235,0.5)",
                }}
              />
              <div
                className="absolute w-30 h-30 border border-gray-400/70 rounded-full"
                style={{
                  animation: "vibrateRing 0.12s linear infinite, spin 6s linear infinite reverse",
                  boxShadow: "0 0 15px rgba(255,255,255,1)",
                }}
              />

              <div
                className="relative w-24 h-24 flex items-center justify-center"
                style={{
                  animation: "vibrateLogo 0.08s linear infinite",
                }}
              >
                <div
                  className="absolute inset-0 bg-white rounded-full shadow-2xl"
                  style={{
                    boxShadow: `
                      0 0 25px rgba(255,255,255,1),
                      0 0 50px rgba(229,231,235,0.8),
                      0 0 75px rgba(209,213,219,0.6),
                      0 0 100px rgba(156,163,175,0.4)
                    `,
                    animation: "pulse 0.5s ease-in-out infinite",
                  }}
                />
                <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden bg-white p-1">
                  <Image
                    src="/images/pulsecode-logo.png"
                    alt="PulseCode Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    style={{
                      animation: "vibrateLogoImage 0.1s linear infinite",
                    }}
                  />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wider">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                {t.pulsecode?.title || "PulseCode: The Project Unifier"}
              </span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {t.pulsecode?.description ||
                "A project focused on helping various projects get developed for a fee of 500 WLD. What do we do with this fee? 50% - Liquidity, 50% - Repurchase, continuously increasing the value of PulseCode (PSC)."}
            </p>
          </>
        )
      case "codestaking":
        return (
          <div className="text-center text-xl font-semibold text-cyan-400">
            {t.pulsecode?.footer?.underDevelopment || "Under Development"}
          </div>
        )
      case "projects":
        return (
          <div className="flex flex-col items-center justify-center text-xl font-semibold text-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              {t.pulsecode?.footer?.projectsInDevelopment || "Projects in Development"}
            </h2>
            <div className="flex items-center gap-2">
              <Image
                src="/images/keplerpay-logo.png"
                alt="KeplerPay Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span>{t.pulsecode?.footer?.keplerPay || "KeplerPay (KPP)"}</span>
              <Hammer className="w-6 h-6 ml-2 animate-hammer" />
            </div>
          </div>
        )
      case "burn": // New case for burn tab
        return (
          <div className="text-center text-xl font-semibold text-orange-400">
            <h2 className="text-2xl font-bold mb-4 text-orange-300">{t.furnace?.title || "Furnace"}</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              {t.furnace?.instructions || "Click the burn icon to burn tokens."}
            </p>
            <Link href="/burn" passHref>
              <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                {t.furnace?.openFurnace || "Open Furnace Page"}
              </Button>
            </Link>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects (similar to presentation page) */}
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

      {/* Rotating Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-72 h-72 border border-white/10 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute w-80 h-80 border border-cyan-400/15 rounded-full animate-spin"
          style={{ animationDuration: "25s", animationDirection: "reverse" }}
        />
        <div
          className="absolute w-64 h-64 border border-blue-400/20 rounded-full animate-spin"
          style={{ animationDuration: "15s" }}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg font-medium">{t.pulsecode?.back || "Back"}</span>
      </button>

      <div className="relative z-10 bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl p-8 max-w-2xl text-center shadow-2xl mb-20">
        {" "}
        {renderContent()}
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

      {/* Energy Beams */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`beam-${i}`}
          className="absolute bg-gradient-to-r from-transparent via-white/20 to-transparent h-px animate-pulse"
          style={{
            top: "50%",
            left: "50%",
            width: "200px",
            transformOrigin: "0 0",
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: "2s",
          }}
        />
      ))}

      {/* Bottom Navigation Bar (local to PulseCodePage) */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs bg-black/70 backdrop-blur-md border border-white/10 rounded-full p-2 z-50">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "codestaking" ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
            }`}
            onClick={() => setActiveFooterTab("codestaking")}
          >
            <Coins className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "about" ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
            }`}
            onClick={() => setActiveFooterTab("about")}
          >
            <Info className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "projects" ? "text-cyan-400" : "text-gray-400 hover:text-cyan-400"
            }`}
            onClick={() => setActiveFooterTab("projects")}
          >
            <Hammer className="w-6 h-6" />
          </Button>
          {/* New Burn Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center p-2 ${
              activeFooterTab === "burn" ? "text-orange-400" : "text-gray-400 hover:text-orange-400"
            }`}
            onClick={() => setActiveFooterTab("burn")}
          >
            <Flame className="w-6 h-6" />
          </Button>
        </div>
      </footer>

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

        @keyframes vibrateAura {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(0.5px, 0.5px);
          }
          50% {
            transform: translate(-0.5px, 0.5px);
          }
          75% {
            transform: translate(0.5px, -0.5px);
          }
          100% {
            transform: translate(-0.5px, -0.5px);
          }
        }

        @keyframes vibrateRing {
          0% {
            transform: translate(0) rotate(0deg);
          }
          25% {
            transform: translate(1px, 1px) rotate(90deg);
          }
          50% {
            transform: translate(-1px, 1px) rotate(180deg);
          }
          75% {
            transform: translate(1px, -1px) rotate(270deg);
          }
          100% {
            transform: translate(-1px, -1px) rotate(360deg);
          }
        }

        @keyframes vibrateLogo {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(0.3px, 0.3px);
          }
          50% {
            transform: translate(-0.3px, 0.3px);
          }
          75% {
            transform: translate(0.3px, -0.3px);
          }
          100% {
            transform: translate(-0.3px, -0.3px);
          }
        }

        @keyframes vibrateLogoImage {
          0% {
            transform: translate(0) scale(1);
          }
          25% {
            transform: translate(0.2px, 0.2px) scale(1.01);
          }
          50% {
            transform: translate(-0.2px, 0.2px) scale(0.99);
          }
          75% {
            transform: translate(0.2px, -0.2px) scale(1.01);
          }
          100% {
            transform: translate(-0.2px, -0.2px) scale(0.99);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes hammer {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(20deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-hammer {
          animation: hammer 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
