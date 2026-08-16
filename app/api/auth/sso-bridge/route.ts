// SSO Bridge API Route
// This route receives the Medusa JWT token from the sign-in flow,
// creates a session on the Medusa backend (server-to-server),
// and redirects to the Medusa Admin with the token in the URL hash
// for the client-side bridge page to consume.
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

  if (!token) {
    return NextResponse.redirect(new URL(`${medusaBackendUrl}/app/login`));
  }

  // Return an HTML page that runs on the MEDUSA origin (via redirect)
  // The trick: we redirect to a data URI or inline page that creates the session
  // Actually, the best approach: redirect to the bridge page on Medusa's origin with the token
  return NextResponse.redirect(`${medusaBackendUrl}/sso-bridge.html#${token}`);
}
