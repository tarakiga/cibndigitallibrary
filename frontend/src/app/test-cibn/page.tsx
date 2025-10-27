'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Only available in development
if (process.env.NODE_ENV === 'production') {
  throw new Error('This page is not available in production')
}

export default function TestCIBNPage() {
  const router = useRouter()

  const setTestSession = () => {
    const testUser = {
      id: 999,
      email: 'test.member@cibn.org',
      full_name: 'Test CIBN Member',
      phone: '+234 800 000 0000',
      role: 'cibn_member',
      cibn_employee_id: 'CIBN-TEST-12345',
      arrears: '5000.00',
      annual_subscription: '25000.00',
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString()
    }
    
    console.log('Setting test CIBN member session:', testUser)
    localStorage.setItem('user', JSON.stringify(testUser))
    localStorage.setItem('access_token', 'test-token-cibn-member')
    
    // Verify
    const saved = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    console.log('Saved to localStorage:', { user: saved, token })
    
    // Redirect
    alert('Test session set! Redirecting to CIBN profile...')
    window.location.href = '/cibn-profile'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CIBN Profile Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Click the button below to set a test CIBN member session and view the profile page.
          </p>
          <p className="text-sm text-gray-600">
            Test user details:
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Member ID: CIBN-TEST-12345</li>
            <li>• Name: Test CIBN Member</li>
            <li>• Arrears: ₦5,000 (will show red alert)</li>
            <li>• Annual Sub: ₦25,000</li>
          </ul>
          <Button 
            onClick={setTestSession}
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            Set Test Session & View Profile
          </Button>
          <Button 
            onClick={() => {
              localStorage.clear()
              alert('Session cleared!')
              router.push('/')
            }}
            variant="outline"
            className="w-full"
          >
            Clear Session
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
