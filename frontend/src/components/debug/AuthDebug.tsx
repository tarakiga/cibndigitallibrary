'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api/client'

export function AuthDebug() {
  const { user, isAuthenticated, isLoading, lastError } = useAuth()
  const [tokenPresent, setTokenPresent] = useState(false)

  useEffect(() => {
    try {
      setTokenPresent(!!localStorage.getItem('access_token'))
    } catch {}
  }, [user, isAuthenticated])
  
  return (
    <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg z-50 text-xs max-w-xs space-y-1">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Base URL: {apiClient.defaults.baseURL}</div>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>Token stored: {tokenPresent ? 'true' : 'false'}</div>
      <div>User: {user ? JSON.stringify(user) : 'null'}</div>
      {lastError && <div className="text-red-400">Last error: {lastError}</div>}
    </div>
  )
}
