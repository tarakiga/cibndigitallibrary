// This is an isolated test page with no external dependencies
'use client'

import React from 'react'

// Simple component with no external dependencies
function TestComponent() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Isolated Test Page</h1>
      <p className="text-gray-700 mb-4">This page has no external dependencies except React.</p>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">Test Component</h2>
          <p className="text-blue-700">If you can see this, basic React rendering is working.</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h2 className="font-semibold text-green-800">State Test</h2>
          <Counter />
        </div>
      </div>
    </div>
  )
}

// Simple counter component to test React hooks
function Counter() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
      >
        Increment
      </button>
      <span className="text-gray-900 font-medium">Count: {count}</span>
    </div>
  )
}

export default TestComponent
