'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth/firebase-auth';

export default function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a loading state or the children without auth context during SSR
    return <div>{children}</div>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
