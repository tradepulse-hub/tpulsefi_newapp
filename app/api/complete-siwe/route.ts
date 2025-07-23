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

    // --- Adicionado para depuração ---
    console.log("--- SIWE Verification Debug ---")
    console.log("Received Nonce:", nonce)
    console.log("Received Payload (address):", payload.address)
    console.log("Received Payload (message):", payload.message)
    console.log("Received Payload (signature):", payload.signature)
    console.log("Received Payload (full):", JSON.stringify(payload, null, 2))
    // --- Fim da depuração ---

    // Verify nonce matches the one we created
    const storedNonce = cookies().get("siwe")?.value
    if (nonce !== storedNonce) {
      console.error(`[SIWE] Nonce mismatch. Received: ${nonce}, Stored: ${storedNonce}`)
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      })
    }
    console.log("[SIWE] Nonce matched.")

    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce)

    if (validMessage.isValid) {
      console.log("[SIWE] Signature verification successful.")
      cookies().set(
        "tpulsefi_session",
        JSON.stringify({
          id: payload.address,
          walletAddress: payload.address,
          authenticated: true,
          authTime: new Date().toISOString(),
        }),
        {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        },
      )
    } else {
      console.error(`[SIWE] Signature verification failed. Reason: ${validMessage.message || "Unknown"}`)
    }

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
      message: validMessage.message, // Incluir mensagem de erro da verificação
    })
  } catch (error: any) {
    console.error("SIWE verification error in catch block:", error)
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Verification failed",
    })
  }
}
