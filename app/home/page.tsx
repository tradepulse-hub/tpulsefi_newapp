"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TPulseFiIntro() {
  const [letterCount, setLetterCount] = useState(0)
  const [lightPasses, setLightPasses] = useState(0)
  const [taglineLetterCount, setTaglineLetterCount] = useState(0)
  const [showTagline, setShowTagline] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [showLetters, setShowLetters] = useState({
    T: false,
    P: false,
    u: false,
    l: false,
    s: false,
    e: false,
    F: false,
    i: false,
  })
  const router = useRouter()

  const taglineText = "THE GLOBAL CRYPTO BRIDGE"

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (letterCount < 8) {
          const letters = ["T", "P", "u", "l", "s", "e", "F", "i"]
          const currentLetter = letters[letterCount] as keyof typeof showLetters
          setShowLetters((prev) => ({ ...prev, [currentLetter]: true }))
          setLetterCount((prev) => prev + 1)
        } else if (lightPasses < 3) {
          setLightPasses((prev) => prev + 1)
        } else if (!showTagline) {
          setShowTagline(true)
        } else if (taglineLetterCount < taglineText.length) {
          setTaglineLetterCount((prev) => prev + 1)
        } else {
          setTimeout(() => {
            setFadeOut(true)
            setTimeout(() => {
              router.push("/presentation")
            }, 300)
          }, 300)
        }
      },
      letterCount < 8 ? 100 : lightPasses < 3 ? 400 : taglineLetterCount < taglineText.length ? 30 : 300,
    )

    return () => clearTimeout(timer)
  }, [letterCount, lightPasses, router, showTagline, taglineLetterCount, taglineText.length])

  return (
    <>
      <style jsx global>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #ffffff; }
          50% { text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff; }
        }
        
        @keyframes light-sweep-internal {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }
        
        .animate-glow {
          animation: glow 1s ease-in-out infinite alternate;
        }
      `}</style>

      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        <div
          className={`relative flex flex-col items-center transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className="relative flex items-center transition-transform duration-700"
            style={{
              transform: letterCount > 0 ? `translateX(${2 - letterCount * 0.3}rem)` : "translateX(2rem)",
            }}
          >
            <span
              className={`text-5xl font-bold relative text-white ${fadeOut ? "" : "animate-glow"}`}
              style={{
                background:
                  lightPasses < 3 && !fadeOut
                    ? "linear-gradient(90deg, transparent 0%, transparent 30%, #ffffff 50%, transparent 70%, transparent 100%)"
                    : "transparent",
                backgroundSize: lightPasses < 3 ? "300% 100%" : "100% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                animation:
                  lightPasses < 3 && !fadeOut
                    ? "light-sweep-internal 1s infinite"
                    : !fadeOut
                      ? "glow 1s ease-in-out infinite alternate"
                      : "none",
                color: "white",
                textShadow: fadeOut ? "none" : undefined,
              }}
            >
              T
            </span>

            <div className="text-5xl font-bold text-white flex">
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.P ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                P
              </span>
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.u ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                u
              </span>
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.l ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                l
              </span>
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.s ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                s
              </span>
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.e ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                e
              </span>
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.F ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                F
              </span>
              <span
                className={`transition-opacity duration-500 ${
                  fadeOut ? "" : "animate-glow"
                } ${showLetters.i ? "opacity-100" : "opacity-0"}`}
                style={{ textShadow: fadeOut ? "none" : undefined }}
              >
                i
              </span>
            </div>

            <div className="absolute top-full left-0 text-5xl font-bold text-gray-600 opacity-20 transform scale-y-[-1] blur-sm">
              T
              <span className={`transition-opacity duration-500 ${showLetters.P ? "opacity-100" : "opacity-0"}`}>
                P
              </span>
              <span className={`transition-opacity duration-500 ${showLetters.u ? "opacity-100" : "opacity-0"}`}>
                u
              </span>
              <span className={`transition-opacity duration-500 ${showLetters.l ? "opacity-100" : "opacity-0"}`}>
                l
              </span>
              <span className={`transition-opacity duration-500 ${showLetters.s ? "opacity-100" : "opacity-0"}`}>
                s
              </span>
              <span className={`transition-opacity duration-500 ${showLetters.e ? "opacity-100" : "opacity-0"}`}>
                e
              </span>
              <span className={`transition-opacity duration-500 ${showLetters.F ? "opacity-100" : "opacity-0"}`}>
                F
              </span>
              <span className={`transition-opacity duration-500 ${showLetters.i ? "opacity-100" : "opacity-0"}`}>
                i
              </span>
            </div>
          </div>

          {showTagline && (
            <div className="mt-8">
              <p className="text-sm text-gray-400 tracking-widest font-light">
                {taglineText.split("").map((letter, index) => (
                  <span
                    key={index}
                    className={`transition-opacity duration-200 ${
                      index < taglineLetterCount ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
