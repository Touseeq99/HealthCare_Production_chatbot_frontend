"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TestTokenPage() {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
  }, []);

  const testToken = async () => {
    if (!token) {
      setError('No token found in localStorage');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate token');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error('Token validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">JWT Token Tester</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Token Status</h2>
          <div className="p-3 bg-gray-100 rounded">
            {token ? (
              <div className="text-green-600">Token found in localStorage</div>
            ) : (
              <div className="text-red-600">No token found in localStorage</div>
            )}
          </div>
        </div>

        <Button 
          onClick={testToken} 
          disabled={!token || isLoading}
          className="mb-4"
        >
          {isLoading ? 'Testing...' : 'Test Token'}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
            Error: {error}
          </div>
        )}

        {userData && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">User Data:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
