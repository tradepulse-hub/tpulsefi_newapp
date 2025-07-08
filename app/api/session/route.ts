export const dynamic = "force-dynamic"

import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }

    const session = JSON.parse(sessionCookie.value)

    return NextResponse.json({
      authenticated: true,
      user: {
        walletAddress: session.address,
      },
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
