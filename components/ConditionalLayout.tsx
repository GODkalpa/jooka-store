'use client'

import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { UserDataProvider } from '@/lib/context/UserDataContext'
import { CartSyncProvider } from '@/lib/context/CartSyncProvider'

// Lazy load heavy components
const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
  loading: () => <div className="h-16 bg-black" />
})

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-32 bg-black" />
})

const ConditionalLayout = memo(function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isDashboard = useMemo(() => 
    pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin'),
    [pathname]
  )

  return (
    <UserDataProvider>
      <CartSyncProvider>
        {!isDashboard && <Navbar />}
        <main className="min-h-screen">{children}</main>
        {!isDashboard && <Footer />}
      </CartSyncProvider>
    </UserDataProvider>
  )
})

export default ConditionalLayout
