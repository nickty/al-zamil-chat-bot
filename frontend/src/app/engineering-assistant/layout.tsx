import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Engineering Assistant - ZHI AI Tool",
  description: "AI-powered engineering design analysis and optimization",
}

export default function EngineeringAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  )
}

