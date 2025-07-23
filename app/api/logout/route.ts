import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("🔌 Logout API called")

    // Clear all authentication cookies directly using cookies().delete()
    cookies().delete("tpulsefi_session")
    cookies().delete("session")
    cookies().delete("siwe")
    cookies().delete("minikit-auth")
    cookies().delete("worldcoin-auth")

    // Sinaliza ao cliente para limpar o localStorage, se necessário
    cookies().set("clear_local_storage", "true", {
      maxAge: 1,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    })

    console.log("✅ All auth cookies cleared")

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}
