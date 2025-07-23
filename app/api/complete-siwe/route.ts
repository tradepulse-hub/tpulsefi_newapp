import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { type MiniAppWalletAuthSuccessPayload, verifySiweMessage } from "@worldcoin/minikit-js"

interface RequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as RequestPayload

    // Verify nonce matches the one we created
    const storedNonce = cookies().get("siwe")?.value
    if (nonce !== storedNonce) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      })
    }

    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce)

    if (validMessage.isValid) {
      // CORRIGIDO: Adicionado a criação do cookie de sessão 'tpulsefi_session'
      cookies().set(
        "tpulsefi_session", // Nome do cookie de sessão consistente com a rota de login
        JSON.stringify({
          id: payload.address, // Usar o endereço como ID
          walletAddress: payload.address,
          authenticated: true,
          authTime: new Date().toISOString(),
        }),
        {
          secure: process.env.NODE_ENV === "production", // Use secure only in production
          httpOnly: true,
          sameSite: "lax", // CORRIGIDO: Crucial para iOS
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/", // CORRIGIDO: Garante que o cookie esteja disponível em toda a aplicação
        },
      )
    }

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    })
  } catch (error: any) {
    console.error("SIWE verification error:", error)
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Verification failed",
    })
  }
}
