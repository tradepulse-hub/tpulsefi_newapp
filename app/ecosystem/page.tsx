"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
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
          <span>Back</span>
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

        {/* Title */}
        <h1 className="mt-12 text-4xl font-bold text-white text-center z-10">Ecosystem</h1>
        <p className="mt-4 text-white/60 text-center max-w-md z-10 px-4">Explore the TPulseFi ecosystem</p>

        <button
          onClick={scrollToSection2}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-white transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>

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

        {/* Content */}
        <div className="relative z-10 max-w-4xl px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Coming Soon</h2>
          <p className="text-white/60 text-lg">More ecosystem features will be available here</p>
        </div>

        <button
          onClick={scrollToSection1}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-white transition-colors animate-bounce"
          aria-label="Scroll up"
        >
          <ChevronUp className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}
