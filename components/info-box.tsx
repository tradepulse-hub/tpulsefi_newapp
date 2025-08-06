import { Card, CardContent } from "@/components/ui/card"

interface InfoBoxProps {
  text: string
}

export function InfoBox({ text }: InfoBoxProps) {
  return (
    <Card className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg mt-4">
      <CardContent className="p-4 text-center text-xs text-gray-300">
        <p>{text}</p>
      </CardContent>
    </Card>
  )
}
