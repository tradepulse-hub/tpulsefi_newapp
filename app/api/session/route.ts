export const dynamic = "force-dynamic"

import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // CORRIGIDO: Ler o cookie 'tpulsefi_session' para consistência
    const sessionCookie = cookies().get("tpulsefi_session")

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }

    const session = JSON.parse(sessionCookie.value)

    return NextResponse.json({
      authenticated: true,
      user: {
        walletAddress: session.walletAddress, // CORRIGIDO: Usar walletAddress do objeto user
      },
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
