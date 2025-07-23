import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { type MiniAppWalletAuthSuccessPayload, verifySiweMessage } from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export const POST = async (req: NextRequest) => {
  const { payload, nonce }: IRequestPayload = await req.json()

  const siweCookie = cookies().get("siwe")?.value

  if (nonce !== siweCookie) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce",
    })
  }

  try {
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
  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: err.message,
    })
  }
}
