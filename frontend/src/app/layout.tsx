import type React from "react"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/AuthProvider"
import Navbar from "@/components/Navbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ZHI Equipment Assistant",
  description: "AI-powered assistant for ZHI equipment information",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}

