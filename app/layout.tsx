import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MiniKitProvider } from "@/components/minikit-provider"
import { I18nProvider } from "@/lib/i18n/context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TPulseFi - Worldcoin Mini App",
  description: "TPulseFi Worldcoin integration with MiniKit",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <MiniKitProvider>{children}</MiniKitProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
