import { type NextRequest, NextResponse } from "next/server"

interface IRequestPayload {
  transaction_id: string
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== TRANSACTION DEBUG API START ===")

    const body = await req.json()
    const { transaction_id } = body as IRequestPayload

    if (!transaction_id) {
      return NextResponse.json({ error: "Invalid transaction_id" }, { status: 400 })
    }

    if (!process.env.APP_ID || !process.env.DEV_PORTAL_API_KEY) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Missing APP_ID or DEV_PORTAL_API_KEY",
        },
        { status: 500 },
      )
    }

    // Endpoint para obter informações de debug da transação
    const debugUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transaction_id}/debug?app_id=${process.env.APP_ID}`

    console.log("Debug API URL:", debugUrl)

    const response = await fetch(debugUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Debug API Error:", errorText)

      return NextResponse.json(
        {
          error: "Failed to get debug info",
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      )
    }

    const debugInfo = await response.json()
    console.log("✅ Debug info received:", debugInfo)

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("❌ Debug API Error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
