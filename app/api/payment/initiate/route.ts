import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const uuid = crypto.randomUUID().replace(/-/g, "")

  // TODO: Store the ID field in your database so you can verify the payment later
  const cookieStore = await cookies()
  cookieStore.set({
    name: "payment-nonce",
    value: uuid,
    httpOnly: true,
  })

  console.log("Payment nonce generated:", uuid)

  return NextResponse.json({ id: uuid })
}
