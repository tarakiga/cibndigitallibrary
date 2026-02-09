'use client'

import React, { useState, useEffect } from 'react'
import { contentService, Content } from '@/lib/api/content'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { ContentCard } from '@/components/content/ContentCard'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage, isNetworkError } from '@/utils/error'

export function ContentShowcase() {
  const [content, setContent] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      setRequiresAuth(true)
      return
    }
    fetchContent()
  }, [isAuthenticated])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await (isAuthenticated ? contentService.getContent : contentService.getPublicContent)({
        page: 1,
        page_size: 6, // Show 6 items on homepage
      })
      setContent(response.items)
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      const isConnectionError = isNetworkError(err)
      if (status === 403) {
        setRequiresAuth(true)
        setError(null)
      } else {
        const errorMessage = getErrorMessage(err, isConnectionError ? 'Unable to connect to server' : 'Failed to load content')
        setError(errorMessage)
        if (!isConnectionError) {
          toast.error(errorMessage)
        }
      }
      
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (item: Content) => {
    try {
      if (!isAuthenticated) {
        toast.info('Sign in to add items to cart')
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?returnUrl=${returnUrl}`
        return
      }
      const cart = JSON.parse(localStorage.getItem('cart_items') || '[]')
      const existingItem = cart.find((c: any) => c.id === item.id)
      
      if (existingItem) {
        toast.info('Item already in cart')
      } else {
        cart.push({ ...item, quantity: 1 })
        localStorage.setItem('cart_items', JSON.stringify(cart))
        window.dispatchEvent(new Event('cart:changed'))
        toast.success('Added to cart!')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#002366] to-[#059669] bg-clip-text text-transparent">
          Featured Content
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Content</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchContent} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Content</h2>
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">No content available yet</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon for new resources!</p>
        </div>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#002366] to-[#059669] bg-clip-text text-transparent">
            Featured Content
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive collection of banking resources, courses, and materials
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              index={index}
              onAddToCart={handleAddToCart}
              showActions={true}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#002366] to-[#059669] hover:opacity-90 px-8"
            onClick={() => window.location.href = '/library'}
          >
            View All Content
          </Button>
        </div>
      </div>
    </section>
  )
}
