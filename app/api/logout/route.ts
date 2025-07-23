import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers" // Importar cookies para usar cookies().delete()

export async function POST(request: NextRequest) {
  try {
    console.log("🔌 Logout API called")

    // Clear all authentication cookies directly using cookies().delete()
    cookies().delete("tpulsefi_session") // CORRIGIDO: Limpa o cookie de sessão principal
    cookies().delete("session") // Limpa o cookie 'session' se ainda estiver a ser usado
    cookies().delete("siwe") // Limpa o cookie 'siwe'
    cookies().delete("minikit-auth") // Limpa cookies específicos do minikit
    cookies().delete("worldcoin-auth") // Limpa cookies específicos da worldcoin

    // Sinaliza ao cliente para limpar o localStorage, se necessário
    cookies().set("clear_local_storage", "true", {
      maxAge: 1, // Curta duração, apenas para sinalizar ao cliente
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
