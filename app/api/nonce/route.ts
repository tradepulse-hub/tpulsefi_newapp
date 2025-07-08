import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// This route **must** be treated as dynamic because it writes a secure cookie.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    // Generate a secure nonce (at least 8 alphanumeric characters)
    const nonce = crypto.randomUUID().replace(/-/g, "")

    // Store nonce in secure cookie
    cookies().set("siwe", nonce, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 10, // 10 minutes
    })

    return NextResponse.json({ nonce })
  } catch (error) {
    console.error("Error generating nonce:", error)
    return NextResponse.json({ error: "Failed to generate nonce" }, { status: 500 })
  }
}
