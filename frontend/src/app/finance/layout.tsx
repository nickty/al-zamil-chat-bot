import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financial Management - ZHI AI Tool",
  description: "Track and analyze financial performance for your industrial operations",
}

export default function FinanceLayout({
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

