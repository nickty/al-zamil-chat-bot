import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Production Intelligence - ZHI AI Tool",
  description: "Real-time production monitoring and analytics",
}

export default function ProductionIntelligenceLayout({
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

