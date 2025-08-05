'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'

export default function CheckoutDebugPage() {
  const { user, firebaseUser, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  const testAuthentication = async () => {
    try {
      setTestResult('Testing authentication...')
      
      const { debugAuthState, testApiCall } = await import('@/lib/utils/auth-debug')
      
      // Run comprehensive auth debug
      const authDebug = await debugAuthState()
      console.log('Auth debug info:', authDebug)
      
      // Test API call
      const apiTest = await testApiCall('/api/orders')
      console.log('API test info:', apiTest)
      
      setDebugInfo({
        authContext: {
          user: user ? { email: user.email, role: user.role } : null,
          firebaseUser: firebaseUser ? { email: firebaseUser.email, uid: firebaseUser.uid } : null
        },
        authDebug,
        apiTest
      })
      
      if (apiTest.apiTest?.success) {
        setTestResult('✅ Authentication working! API call successful')
      } else if (apiTest.errors?.length > 0) {
        setTestResult(`❌ Auth errors: ${apiTest.errors.join(', ')}`)
      } else if (apiTest.apiTest?.error) {
        setTestResult(`❌ API call failed: ${JSON.stringify(apiTest.apiTest.error)}`)
      } else {
        setTestResult('❌ Unknown authentication issue')
      }
      
    } catch (error) {
      console.error('Test failed:', error)
      setTestResult(`❌ Test failed: ${error}`)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading authentication...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Context Status:</h2>
          <p>User: {user ? `${user.email} (${user.role})` : 'Not authenticated'}</p>
          <p>Firebase User: {firebaseUser ? `${firebaseUser.email}` : 'Not found'}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        </div>
        
        <button
          onClick={testAuthentication}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Authentication & API
        </button>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Test Result:</h2>
            <p>{testResult}</p>
          </div>
        )}
        
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Debug Info:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}