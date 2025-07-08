import { Suspense } from "react"
import AirdropLoader from "./airdrop-loader"

export default function AirdropPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <AirdropLoader />
    </Suspense>
  )
}
