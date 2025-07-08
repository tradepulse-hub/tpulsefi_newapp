import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock balance check
    return NextResponse.json({
      balance: "1000",
      symbol: "TPF",
    })
  } catch (error) {
    console.error("Balance check error:", error)
    return NextResponse.json(
      {
        error: "Failed to get balance",
      },
      { status: 500 },
    )
  }
}
