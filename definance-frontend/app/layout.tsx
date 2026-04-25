import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-provider'
import { SettingsProvider } from '@/lib/settings-context'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import "./globals.css";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Definance - Gestão Financeira Pessoal',
  description: 'Controle total da sua vida financeira. Organize seus gastos, entenda seu dinheiro e tome decisões melhores.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#22C55E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <Suspense fallback={null}>
                {children}
              </Suspense>
              <Toaster />
              <SonnerToaster position="top-right" />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}