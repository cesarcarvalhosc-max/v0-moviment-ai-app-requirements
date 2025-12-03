import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { SoundProvider } from "@/lib/sound-context"
import { ThemeProvider } from "@/lib/theme-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MovimentAI - Your Premium Fitness Companion",
  description: "Treinos rápidos, práticos e inteligentes. Construa consistência com IA.",
  generator: "v0.app",
  applicationName: "MovimentAI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MovimentAI",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MovimentAI" />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SoundProvider>
              {children}
              <Analytics />
            </SoundProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
