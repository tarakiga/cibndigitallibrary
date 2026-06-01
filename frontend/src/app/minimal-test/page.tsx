// This is a minimal test page to verify Next.js setup
'use client'

import React from 'react'

export default function MinimalTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Minimal Test Page</h1>
      <p className="text-gray-700">If you can see this, the basic Next.js setup is working.</p>
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <p className="text-green-600">✅ Basic rendering is working</p>
      </div>
    </div>
  )
}
