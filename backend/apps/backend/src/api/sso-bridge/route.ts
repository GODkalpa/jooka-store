import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Serve the SSO bridge HTML page
  // This page receives a JWT token via the URL hash fragment,
  // calls POST /auth/session to create a session cookie,
  // then redirects to /app (the Medusa Admin dashboard)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signing in to JOOKA Admin...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #111;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container { text-align: center; }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #d4a843;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 14px; color: #d4a843; text-transform: uppercase; letter-spacing: 2px; font-weight: 500; }
    .error { color: #ef4444; text-transform: none; letter-spacing: 0; margin-top: 12px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Signing in to JOOKA Admin...</p>
    <p id="error" class="error" style="display:none;"></p>
  </div>
  <script>
    (async function() {
      try {
        var token = window.location.hash.substring(1);
        if (!token) throw new Error('No authentication token provided');

        var res = await fetch('/auth/session', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Session creation failed (' + res.status + ')');

        window.location.replace('/app');
      } catch (err) {
        document.getElementById('error').textContent = err.message || 'Authentication failed';
        document.getElementById('error').style.display = 'block';
        setTimeout(function() { window.location.replace('/app/login'); }, 3000);
      }
    })();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
