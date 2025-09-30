"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { useRef } from "react"

export default function EcosystemPage() {
  const section2Ref = useRef<HTMLDivElement>(null)
  const section1Ref = useRef<HTMLDivElement>(null)

  const scrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const scrollToSection1 = () => {
    section1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {/* Section 1 - Logo */}
      <div
        ref={section1Ref}
        className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden snap-start"
      >
        <Link
          href="/presentation"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs">Back</span>
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
              src="/images/logo-tpf.png"
              alt="TPF Logo"
              width={256}
              height={256}
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        <h1 className="mt-12 text-2xl font-bold text-white text-center z-10">Ecosystem</h1>
        <p className="mt-4 text-white/60 text-center max-w-md z-10 px-4 text-xs">Explore the TPulseFi ecosystem</p>

        <button
          onClick={scrollToSection2}
          className="absolute bottom-8 left-[47%] -translate-x-1/2 z-20 text-white/70 hover:text-white transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>

      {/* Section 2 - PLAY Logo */}
      <div
        ref={section2Ref}
        className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden snap-start"
      >
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

        {/* PLAY Logo with white glow */}
        <div className="relative z-10 flex items-center justify-center mb-8">
          {/* Outer glow layers */}
          <div className="absolute inset-0 blur-3xl bg-white/30 rounded-full scale-150 animate-pulse" />
          <div className="absolute inset-0 blur-2xl bg-white/40 rounded-full scale-125" />
          <div className="absolute inset-0 blur-xl bg-white/50 rounded-full" />

          {/* Logo container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <Image
              src="/images/logo-play.png"
              alt="PLAY Logo"
              width={256}
              height={256}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">PLAY - For Only Humans</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Part of the TPulseFi ecosystem, PLAY leverages World ID to bring real utility to social media and video
            streaming platforms. By ensuring security against fake accounts and bots, PLAY creates a trusted environment
            where authentic content creators can earn financial rewards for their work.
          </p>
        </div>

        {/* Go App button */}
        <a
          href="https://worldcoin.org/mini-app?app_id=app_271b2cf77994b56f013f465c625bc275&app_mode=mini-app"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
        >
          Go App
        </a>
      </div>
    </div>
  )
}
