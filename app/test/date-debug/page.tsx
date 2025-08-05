'use client';

import { useEffect, useState } from 'react';
import { formatSafeDate, convertFirestoreDate, debugDateValue } from '@/lib/utils/date';

export default function DateDebugPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [apiTestResults, setApiTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Test API date conversion
  const testApiDates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      // Extract some orders to test date conversion
      const recentOrders = data.data?.recentOrders || [];
      const orderDateTests = recentOrders.slice(0, 3).map((order: any) => ({
        orderId: order.id,
        created_at_raw: order.created_at,
        created_at_debug: debugDateValue(order.created_at),
        updated_at_raw: order.updated_at,
        updated_at_debug: debugDateValue(order.updated_at),
      }));
      
      setApiTestResults({
        totalOrders: recentOrders.length,
        orderTests: orderDateTests,
        rawResponse: data.data
      });
    } catch (error) {
      console.error('API test error:', error);
      setApiTestResults({ error: (error as Error).message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test various date formats
    const testCases = [
      {
        name: 'ISO String',
        value: '2025-01-08T10:30:00.000Z'
      },
      {
        name: 'Date Object',
        value: new Date('2025-01-08T10:30:00.000Z')
      },
      {
        name: 'Mock Firestore Timestamp',
        value: {
          toDate: () => new Date('2025-01-08T10:30:00.000Z')
        }
      },
      {
        name: 'Mock Admin Timestamp (seconds/nanoseconds)',
        value: {
          seconds: 1736334600,
          nanoseconds: 0
        }
      },
      {
        name: 'Mock Admin Timestamp (_seconds/_nanoseconds)',
        value: {
          _seconds: 1736334600,
          _nanoseconds: 0
        }
      },
      {
        name: 'Null value',
        value: null
      },
      {
        name: 'Invalid string',
        value: 'invalid-date'
      },
      {
        name: 'Real Firestore Timestamp Format',
        value: {
          _seconds: 1736334600,
          _nanoseconds: 123456789
        }
      },
      {
        name: 'Another Firestore Admin Format',
        value: {
          seconds: 1736334600,
          nanoseconds: 123456789
        }
      },
      {
        name: 'ISO String from API',
        value: '2025-01-08T10:30:00.123Z'
      },
      {
        name: 'Empty object',
        value: {}
      },
      {
        name: 'Timestamp in milliseconds',
        value: 1736334600000
      },
      {
        name: 'Date string without timezone',
        value: '2025-01-08 10:30:00'
      }
    ];

    const results = testCases.map(testCase => {
      const debugInfo = debugDateValue(testCase.value);
      
      return {
        name: testCase.name,
        input: testCase.value,
        ...debugInfo
      };
    });

    setTestResults(results);
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Date Conversion Debug</h1>
      
      {/* API Test Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold">Live API Date Test</h2>
          <button 
            onClick={testApiDates}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Dates'}
          </button>
        </div>
        
        {apiTestResults && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">API Test Results</h3>
            {apiTestResults.error ? (
              <div className="text-red-600">Error: {apiTestResults.error}</div>
            ) : (
              <div className="space-y-4">
                <div>Total Orders Found: {apiTestResults.totalOrders}</div>
                {apiTestResults.orderTests?.map((test: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Order #{test.orderId.slice(-8)}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Created At:</strong>
                        <div>Raw: {JSON.stringify(test.created_at_raw)}</div>
                        <div className={test.created_at_debug.isValid ? 'text-green-600' : 'text-red-600'}>
                          Formatted: {test.created_at_debug.formatted}
                        </div>
                      </div>
                      <div>
                        <strong>Updated At:</strong>
                        <div>Raw: {JSON.stringify(test.updated_at_raw)}</div>
                        <div className={test.updated_at_debug.isValid ? 'text-green-600' : 'text-red-600'}>
                          Formatted: {test.updated_at_debug.formatted}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Cases Section */}
      <h2 className="text-2xl font-semibold mb-4">Static Test Cases</h2>
      <div className="space-y-6">
        {testResults.map((result, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{result.name}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Type:</strong> {result.type}
              </div>
              <div>
                <strong>Input:</strong> {JSON.stringify(result.input)}
              </div>
              <div>
                <strong>Converted:</strong> {result.converted || 'null'}
              </div>
              <div>
                <strong>Formatted:</strong> <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>{result.formatted}</span>
              </div>
              <div>
                <strong>Valid:</strong> <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>{result.isValid ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}