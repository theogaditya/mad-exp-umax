import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { Zap } from 'lucide-react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Intelligent Queue Management',
  description: 'Seamless token management with priority access and real-time updates',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-gray-900">Q-Flow</span>
                  </div>

                </Link>

                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton>
                      <button className="text-gray-700 hover:text-gray-900 font-medium">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-sm px-4 py-2 transition-colors duration-200">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/services">
                      <button className="text-gray-700 hover:text-gray-900 font-medium mr-4">
                        Services
                      </button>
                    </Link>
                    <Link href="/profile">
                      <button className="text-gray-700 hover:text-gray-900 font-medium mr-4">
                        Profile
                      </button>
                    </Link>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}