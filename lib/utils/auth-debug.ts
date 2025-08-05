// Authentication debugging utilities

export async function debugAuthState() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: typeof window !== 'undefined' ? 'client' : 'server',
    errors: []
  }

  try {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      debugInfo.errors.push('Running on server side - auth not available')
      return debugInfo
    }

    // Check Firebase config
    const { auth } = await import('@/lib/firebase/config')
    const firebaseAuth = auth()
    
    debugInfo.firebaseAuth = {
      exists: !!firebaseAuth,
      currentUser: !!firebaseAuth?.currentUser,
      userEmail: firebaseAuth?.currentUser?.email || null,
      userUid: firebaseAuth?.currentUser?.uid || null,
      emailVerified: firebaseAuth?.currentUser?.emailVerified || false
    }

    // Try to get ID token
    if (firebaseAuth?.currentUser) {
      try {
        const token = await firebaseAuth.currentUser.getIdToken()
        debugInfo.token = {
          exists: !!token,
          length: token?.length || 0,
          preview: token ? `${token.substring(0, 20)}...` : null
        }
      } catch (tokenError) {
        debugInfo.errors.push(`Token generation failed: ${tokenError}`)
      }
    }

    // Check auth context
    try {
      // This would require importing the auth context, but we'll skip for now
      debugInfo.authContext = 'Not checked to avoid circular imports'
    } catch (contextError) {
      debugInfo.errors.push(`Auth context error: ${contextError}`)
    }

  } catch (error) {
    debugInfo.errors.push(`General error: ${error}`)
  }

  return debugInfo
}

export async function testApiCall(endpoint: string = '/api/orders') {
  const debugInfo = await debugAuthState()
  
  if (debugInfo.errors.length > 0) {
    return {
      ...debugInfo,
      apiTest: 'Skipped due to auth errors'
    }
  }

  try {
    const { auth } = await import('@/lib/firebase/config')
    const firebaseAuth = auth()
    const currentUser = firebaseAuth?.currentUser

    if (!currentUser) {
      return {
        ...debugInfo,
        apiTest: 'No authenticated user for API test'
      }
    }

    const token = await currentUser.getIdToken()
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    debugInfo.apiTest = {
      endpoint,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    }

    if (!response.ok) {
      const errorData = await response.json()
      debugInfo.apiTest.error = errorData
    } else {
      const data = await response.json()
      debugInfo.apiTest.success = true
      debugInfo.apiTest.dataKeys = Object.keys(data)
    }

  } catch (error) {
    debugInfo.apiTest = {
      error: `API test failed: ${error}`
    }
  }

  return debugInfo
}