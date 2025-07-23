import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export function GET() {
  // Expects only alphanumeric characters
  const nonce: string = crypto.randomUUID().replace(/-/g, "")

  // The nonce should be stored somewhere that is not tamperable by the client
  // Optionally you can HMAC the nonce with a secret key stored in your environment
  cookies().set("siwe", nonce, {
    secure: process.env.NODE_ENV === "production", // Use secure only in production
    httpOnly: true, // Boa prática para cookies de nonce
    sameSite: "lax", // CORRIGIDO: Garante que o cookie seja enviado em navegações de nível superior
    path: "/", // CORRIGIDO: Garante que o cookie esteja disponível em toda a aplicação
  })

  return NextResponse.json({ nonce })
}
