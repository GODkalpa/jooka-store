// Authentication debugging utilities
export async function debugAuthState() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: typeof window !== 'undefined' ? 'client' : 'server',
    errors: [],
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('medusa_jwt') || localStorage.getItem('_medusa_jwt');
    const userSession = localStorage.getItem('jooka_user_session');

    debugInfo.tokenExists = !!token;
    debugInfo.sessionExists = !!userSession;
    if (userSession) {
      try {
        debugInfo.sessionUser = JSON.parse(userSession);
      } catch {
        debugInfo.sessionUser = null;
      }
    }
  }

  return debugInfo;
}

export async function testApiCall(endpoint: string = '/api/orders'): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      apiTest: {
        success: response.ok,
        error: response.ok ? null : `HTTP ${response.status}`,
      },
      errors: response.ok ? [] : [`HTTP ${response.status}`],
    };
  } catch (error) {
    return {
      endpoint,
      apiTest: {
        success: false,
        error: (error as Error).message,
      },
      errors: [(error as Error).message],
    };
  }
}