"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ordersApi } from '@/lib/api/orders'
import { CheckCircle, XCircle } from 'lucide-react'

export default function PaymentCallbackPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'success'|'error'|'pending'>('pending')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const ref = params.get('reference') || params.get('trxref') || ''
    if (!ref) {
      setStatus('error')
      setMessage('Missing payment reference')
      const t = setTimeout(()=> router.replace('/library'), 2500)
      return () => clearTimeout(t)
    }
    
    const clearCart = () => {
      try {
        // Clear cart from localStorage
        localStorage.removeItem('cart_items')
        // Dispatch event to update cart state in other components
        window.dispatchEvent(new Event('cart:changed'))
      } catch (error) {
        console.error('Error clearing cart:', error)
      }
    }
    
    (async () => {
      try {
        // Verify payment with the backend
        await ordersApi.verifyPayment(ref)
        
        // Clear the cart after successful payment verification
        clearCart()
        
        // Update UI state
        setStatus('success')
        setMessage('Payment verified successfully. Redirecting to your library...')
        
        // Redirect to library with a small delay
        setTimeout(() => {
          // Force refresh the library page to show newly purchased items
          router.replace('/library?purchased=true')
          // Refresh the page to ensure all data is up to date
          window.location.reload()
        }, 1500)
        
      } catch (e: any) {
        console.error('Payment verification error:', e)
        setStatus('error')
        setMessage(e?.response?.data?.detail || 'Payment verification failed. Redirecting...')
        setTimeout(()=> router.replace('/library'), 3000)
      }
    })()
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border rounded-2xl p-8 text-center space-y-4">
        {status==='success' && <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />}
        {status==='error' && <XCircle className="w-12 h-12 text-red-600 mx-auto" />}
        {status==='pending' && <div className="w-12 h-12 rounded-full border-4 border-[#059669] border-t-transparent animate-spin mx-auto" />}
        <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
