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
      // Create session cookie
      cookies().set(
        "session",
        JSON.stringify({
          address: payload.address,
          timestamp: Date.now(),
        }),
        {
          secure: true,
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 days
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
