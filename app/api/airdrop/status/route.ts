import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock airdrop status
    return NextResponse.json({
      canClaim: true,
      lastClaimTime: null,
      nextClaimTime: null,
      dailyAmount: "100",
      totalClaimed: "0",
    })
  } catch (error) {
    console.error("Airdrop status error:", error)
    return NextResponse.json(
      {
        error: "Failed to get airdrop status",
      },
      { status: 500 },
    )
  }
}
