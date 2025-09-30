import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EcosystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </Link>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo with white glow */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer glow layers */}
        <div className="absolute inset-0 blur-3xl bg-white/30 rounded-full scale-150 animate-pulse" />
        <div className="absolute inset-0 blur-2xl bg-white/40 rounded-full scale-125" />
        <div className="absolute inset-0 blur-xl bg-white/50 rounded-full" />

        {/* Logo container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <Image
            src="/images/logo-tpf.jpg"
            alt="TPF Logo"
            width={256}
            height={256}
            className="relative z-10 drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="mt-12 text-4xl font-bold text-white text-center z-10">Ecosystem</h1>
      <p className="mt-4 text-white/60 text-center max-w-md z-10 px-4">Explore o ecossistema TPulseFi</p>
    </div>
  )
}
