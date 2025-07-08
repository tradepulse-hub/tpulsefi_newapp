import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Verify request body:", body)

    // For now, just return success
    // In production, you would verify the World ID proof here
    return NextResponse.json({
      status: 200,
      message: "Verification successful",
      verified: true,
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({
      status: 500,
      message: "Verification failed",
      verified: false,
    })
  }
}
