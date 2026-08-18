import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth/firebase-auth'
import ConditionalLayout from '@/components/ConditionalLayout'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jookawear.com'),
  title: {
    default: 'JOOKA | Premium Streetwear & Modern Fashion Nepal',
    template: '%s | JOOKA Store Nepal',
  },
  description: 'Nepal premier online destination for luxury streetwear, heavyweight outerwear, denim, tees, and capsule collections. Fast Kathmandu Valley delivery & nationwide courier.',
  keywords: ['JOOKA', 'Nepal clothing brand', 'online shopping Nepal', 'streetwear Kathmandu', 'hoodies Nepal', 'jackets Nepal', 'men fashion Nepal', 'women fashion Nepal'],
  authors: [{ name: 'JOOKA' }],
  creator: 'JOOKA',
  publisher: 'JOOKA Store Nepal',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jookawear.com',
    siteName: 'JOOKA Store',
    title: 'JOOKA | Premium Streetwear & Modern Fashion Nepal',
    description: 'Luxury streetwear, heavyweight outerwear, denim, tees, and capsule collections. Fast dispatch in Kathmandu Valley and nationwide delivery across Nepal.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'JOOKA Store Nepal Fashion Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JOOKA | Premium Fashion Nepal',
    description: 'Shop luxury streetwear, outerwear, and modern capsule collections in Nepal.',
    images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=1200&q=80'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Jooka.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-canvas text-black antialiased selection:bg-black selection:text-white'}>
        <PerformanceMonitor />
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
