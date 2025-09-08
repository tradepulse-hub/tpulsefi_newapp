"use client"
import { motion } from "framer-motion"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from "next/navigation"

export default function MembershipPage() {
  const router = useRouter()

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
          <span className="text-sm font-medium">Back</span>
        </button>
      </motion.div>

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
          Important Announcement Regarding Memberships
        </h1>
        
        <div className="space-y-4 text-gray-200 text-lg leading-relaxed">
          <p>
            Due to regulatory requirements that we must comply with, we have decided to cancel the membership system.
          </p>
          <p>
            This decision was not made by our own will but due to greater reasons beyond our control.
          </p>
          <p className="text-green-300 font-medium">
            For those who already hold memberships, we will continue payments until completing your invested value so you don't suffer any losses.
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-red-700/30">
          <p className="text-red-300 text-sm">
            We appreciate your understanding and continued support.
          </p>
        </div>
      </motion.div>
    </main>
  )
}
