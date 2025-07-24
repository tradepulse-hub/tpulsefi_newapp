"use client"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BackgroundEffect } from "@/components/background-effect" // Import BackgroundEffect

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
      <BackgroundEffect /> {/* Added BackgroundEffect component */}
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
            className="text-center mb-12 pt-20"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-blue-400">
                Partnerships
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Our strategic partners</p>
          </motion.div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4
                            transition-all duration-300 ease-in-out
                            hover:bg-gray-700/40 hover:shadow-xl hover:border-blue-500/50"
                >
                  {/* Partner Logo */}
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700/50">
                      <Image
                        src={partner.image || "/placeholder.svg"}
                        alt={partner.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Partner Name */}
                  <div className="text-center mb-3">
                    <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                    <div className={`h-1 w-16 bg-gradient-to-r ${partner.gradient} rounded-full mx-auto`} />
                  </div>

                  {/* Action Button */}
                  <motion.a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full bg-gradient-to-r ${partner.gradient} text-white py-2 px-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2 text-sm`}
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
    </div>
  )
}
