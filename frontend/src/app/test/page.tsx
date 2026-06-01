'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Page</h1>
      <p className="text-gray-600 mb-4">This is a test page to help identify the build issue.</p>
      <div className="p-4 bg-gray-100 rounded-lg">
        <p>If you can see this, the basic Next.js setup is working.</p>
      </div>
    </div>
  )
}
