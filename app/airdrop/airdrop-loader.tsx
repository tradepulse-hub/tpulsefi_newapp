"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { I18nProvider } from "@/lib/i18n/context"

const AirdropClient = dynamic(() => import("./airdrop-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading airdrop...</div>
    </div>
  ),
})

export default function AirdropLoader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <I18nProvider>
      <AirdropClient />
    </I18nProvider>
  )
}
