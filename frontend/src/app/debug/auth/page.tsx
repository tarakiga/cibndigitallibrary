'use client'

import React from 'react'
import { AuthDebug } from '@/components/debug/AuthDebug'

export default function AuthDebugPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auth Debug</h1>
        <p className="text-sm text-gray-600">Use this page to inspect authentication state, tokens, and recent auth requests.</p>
      </div>
      <AuthDebug />
    </div>
  )
}