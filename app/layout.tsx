import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth/firebase-auth'
import ConditionalLayout from '@/components/ConditionalLayout'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'JOOKA – Natural Elegance',
  description: 'Luxury fashion designed with timeless sophistication',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-black text-gold'}>
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
