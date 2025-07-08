import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Process airdrop request:", body)

    // Mock processing
    return NextResponse.json({
      success: true,
      txHash: "0x1234567890abcdef",
      amount: "100",
    })
  } catch (error) {
    console.error("Process airdrop error:", error)
    return NextResponse.json(
      {
        error: "Failed to process airdrop",
      },
      { status: 500 },
    )
  }
}
