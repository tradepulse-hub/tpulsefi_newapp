"use client"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function PartnershipsPage() {
  const router = useRouter()

  const partners = [
    {
      id: "holdstation",
      name: "HoldStation",
      image: "/images/holdstation-logo.jpg",
      gradient: "from-blue-500 to-purple-600",
      url: "https://world.org/mini-app?app_id=app_0d4b759921490adc1f2bd569fda9b53a&path=/ref/f5S3wA",
    },
    {
      id: "axo",
      name: "AXO",
      image: "/images/axo.jpg",
      gradient: "from-pink-500 to-rose-600",
      url: "https://worldcoin.org/mini-app?app_id=app_8aeb55d57b7be834fb8d67e2f803d258&app_mode=mini-app",
    },
    {
      id: "dropwallet",
      name: "Drop Wallet",
      image: "/images/HUB.png",
      gradient: "from-yellow-500 to-orange-600",
      url: "https://worldcoin.org/mini-app?app_id=app_459cd0d0d3125864ea42bd4c19d1986c&app_mode=mini-app",
    },
    {
      id: "humantap",
      name: "Human Tap",
      image: "/images/human-tap.jpg",
      gradient: "from-green-500 to-emerald-600",
      url: "https://worldcoin.org/mini-app?app_id=app_25cf6ee1d9660721e651d43cf126953a&app_mode=mini-app",
    },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Moving Light Lines */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
            style={{
              top: `${5 + i * 6}%`,
              left: "-100%",
              width: "200%",
              animation: `moveRight ${3 + (i % 3)}s linear infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        {/* Vertical Lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-line-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
            style={{
              left: `${8 + i * 8}%`,
              top: "-100%",
              height: "200%",
              animation: `moveDown ${4 + (i % 2)}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Central Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute w-80 h-80 bg-cyan-400/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-64 h-64 bg-blue-400/8 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between p-6">
        <motion.button
          onClick={() => router.back()}
          className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg px-4 py-2 text-white hover:bg-gray-700/80 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </motion.button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-blue-400">
                Partnerships
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Our strategic partners</p>
          </motion.div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 hover:bg-gray-700/40 transition-all duration-300">
                  {/* Partner Logo */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-700/50">
                      <Image
                        src={partner.image || "/placeholder.svg"}
                        alt={partner.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Partner Name */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{partner.name}</h3>
                    <div className={`h-1 w-20 bg-gradient-to-r ${partner.gradient} rounded-full mx-auto`} />
                  </div>

                  {/* Action Button */}
                  <motion.a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full bg-gradient-to-r ${partner.gradient} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Visit App</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">More partnerships coming soon</h2>
            <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-700/20 rounded-xl p-8">
              <div className="flex justify-center space-x-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-lg">Stay tuned for exciting new collaborations</p>
            </div>
          </motion.div>
        </div>
      </main>

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
