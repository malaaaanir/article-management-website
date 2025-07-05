import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CategoryProvider } from "@/contexts/category-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Logoipsum - Article Management System",
  description: "A modern article management system with role-based authentication",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CategoryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CategoryProvider>
      </body>
    </html>
  )
}
