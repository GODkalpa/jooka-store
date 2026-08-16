'use client';

import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

    async function authenticateAndRedirect() {
      const medusaToken = localStorage.getItem('medusa_jwt');

      if (medusaToken) {
        localStorage.removeItem('medusa_jwt'); // consume the one-time token

        try {
          // Step 1: Create a session cookie on the Medusa backend (port 9000)
          // AUTH_CORS includes localhost:3000, so this cross-origin request is allowed
          // credentials: 'include' ensures the Set-Cookie from port 9000 is stored
          setStatus('Creating admin session...');
          const sessionRes = await fetch(`${medusaBackendUrl}/auth/session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${medusaToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include', // This is critical — stores the session cookie for port 9000
          });

          if (sessionRes.ok) {
            // Session cookie is now set for localhost:9000. Redirect to admin.
            setStatus('Opening Medusa Admin Dashboard...');
            window.location.href = `${medusaBackendUrl}/app`;
            return;
          } else {
            console.warn('Session creation failed:', sessionRes.status);
          }
        } catch (err) {
          console.warn('SSO session creation error:', err);
        }
      }

      // Fallback: no token or session creation failed — go to Medusa login
      setStatus('Redirecting to Medusa Admin...');
      window.location.href = `${medusaBackendUrl}/app`;
    }

    authenticateAndRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center font-sans text-white">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-amber-400 uppercase tracking-wider">
          {status}
        </p>
      </div>
    </div>
  );
}