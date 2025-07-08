import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔌 Logout API called")

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear all authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0, // This expires the cookie immediately
    }

    // Clear session cookie
    response.cookies.set("session", "", cookieOptions)

    // Clear SIWE cookie
    response.cookies.set("siwe", "", cookieOptions)

    // Clear any other auth-related cookies
    response.cookies.set("minikit-auth", "", cookieOptions)
    response.cookies.set("worldcoin-auth", "", cookieOptions)

    console.log("✅ All auth cookies cleared")

    return response
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}
