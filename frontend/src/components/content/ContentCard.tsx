'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, Video, FileText, Headphones, Star, Clock, Users, 
  Play, ShoppingCart, Lock, Heart, Package, Crown 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Content } from '@/lib/api/content'
import { useAuth } from '@/contexts/AuthContext'

interface ContentCardProps {
  item: Content
  index?: number
  viewMode?: 'grid' | 'list'
  onAddToCart?: (item: Content) => void
  showActions?: boolean
}

const contentTypeIcons = {
  document: FileText,
  video: Video,
  audio: Headphones,
  physical: Package,
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'document': return 'bg-blue-100 text-blue-700'
    case 'video': return 'bg-purple-100 text-purple-700'
    case 'audio': return 'bg-green-100 text-green-700'
    case 'physical': return 'bg-orange-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function ContentCard({ 
  item, 
  index = 0, 
  viewMode = 'grid',
  onAddToCart,
  showActions = true 
}: ContentCardProps) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const [cartItems, setCartItems] = useState<number[]>([])
  const [purchasedItems, setPurchasedItems] = useState<number[]>([])

  const Icon = contentTypeIcons[item.content_type] || BookOpen

  // Load state from localStorage
  useEffect(() => {
    const loadState = () => {
      try {
        const rawFavs = localStorage.getItem('library_favorites')
        if (rawFavs) setFavorites(JSON.parse(rawFavs))
        
        const rawCart = localStorage.getItem('cart_items')
        if (rawCart) {
          const cart = JSON.parse(rawCart)
          setCartItems(Array.isArray(cart) ? cart.map((c: any) => c.id) : [])
        }
        
        const rawPurchased = sessionStorage.getItem('purchasedContent')
        if (rawPurchased) {
          const purchased = JSON.parse(rawPurchased)
          setPurchasedItems(Array.isArray(purchased) ? purchased.map((p: any) => p.id) : [])
        }
      } catch (error) {
        console.error('Error loading state:', error)
      }
    }
    
    // Load initial state
    loadState()
    
    // Listen for cart changes from other components
    const handleCartChanged = () => {
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        try {
          const rawCart = localStorage.getItem('cart_items')
          if (rawCart) {
            const cart = JSON.parse(rawCart)
            setCartItems(Array.isArray(cart) ? cart.map((c: any) => c.id) : [])
          } else {
            setCartItems([])
          }
        } catch (error) {
          console.error('Error syncing cart:', error)
        }
      }, 0)
    }
    
    // Listen for purchase success events
    const handlePurchaseSuccess = () => {
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        try {
          const rawPurchased = sessionStorage.getItem('purchasedContent')
          if (rawPurchased) {
            const purchased = JSON.parse(rawPurchased)
            setPurchasedItems(Array.isArray(purchased) ? purchased.map((p: any) => p.id) : [])
          }
        } catch (error) {
          console.error('Error syncing purchased items:', error)
        }
      }, 0)
    }
    
    window.addEventListener('cart:changed', handleCartChanged)
    window.addEventListener('purchase:success', handlePurchaseSuccess)
    
    return () => {
      window.removeEventListener('cart:changed', handleCartChanged)
      window.removeEventListener('purchase:success', handlePurchaseSuccess)
    }
  }, [])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newFavorites = favorites.includes(item.id)
      ? favorites.filter(fav => fav !== item.id)
      : [...favorites, item.id]
    
    setFavorites(newFavorites)
    localStorage.setItem('library_favorites', JSON.stringify(newFavorites))
    toast.success(favorites.includes(item.id) ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onAddToCart) {
      onAddToCart(item)
    } else {
      // Default cart logic
      try {
        const cart = JSON.parse(localStorage.getItem('cart_items') || '[]')
        const existingItem = cart.find((c: any) => c.id === item.id)
        
        if (existingItem) {
          toast.info('Item already in cart')
        } else {
          cart.push({ ...item, quantity: 1 })
          localStorage.setItem('cart_items', JSON.stringify(cart))
          window.dispatchEvent(new Event('cart:changed'))
          setCartItems([...cartItems, item.id])
          toast.success('Added to cart!')
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        toast.error('Failed to add to cart')
      }
    }
  }

  const isPurchased = purchasedItems.includes(item.id)
  const isInCart = cartItems.includes(item.id)
  const isFavorite = favorites.includes(item.id)
  const isOutOfStock = item.content_type === 'physical' && (item.stock_quantity === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card className={`h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group ${
        viewMode === 'list' ? 'flex' : ''
      }`}>
        {/* Thumbnail/Image */}
        <div className={`relative ${viewMode === 'list' ? 'w-48' : 'h-48'} bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden`}>
          {item.thumbnail_url ? (
            <img 
              src={item.thumbnail_url} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#002366]/10 to-[#059669]/10">
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300"></div>
              <div className="absolute top-4 left-4">
                <Badge className={`${getTypeColor(item.content_type)} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                  <Icon className="w-3 h-3" />
                  {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                </Badge>
              </div>
              {item.is_exclusive && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#FFD700] text-[#002366] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Exclusive
                  </Badge>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                {item.content_type === 'video' ? (
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-[#002366] ml-1" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-[#002366]" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 ${viewMode === 'list' ? 'p-6' : ''}`}>
          <CardHeader className={viewMode === 'list' ? 'pb-3' : 'pb-3'}>
            <div className="flex items-start justify-between">
              <h3 className={`font-bold text-gray-900 group-hover:text-[#059669] transition-colors ${
                viewMode === 'list' ? 'text-lg' : 'text-xl line-clamp-2'
              }`}>
                {item.title}
              </h3>
              {showActions && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className="flex-shrink-0"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              )}
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.description || 'No description available'}
            </p>
          </CardHeader>

          <CardContent className={viewMode === 'list' ? 'pb-3' : 'pb-3'}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">
                <span className="capitalize">{item.content_type.replace('_', ' ')}</span>
                {item.category && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {item.category.replace('_', ' ')}
                  </span>
                )}
              </div>
              {item.content_type === 'physical' && item.stock_quantity !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                </Badge>
              )}
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {/* Purchase Count */}
              {item.purchase_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{item.purchase_count}</span>
                </div>
              )}
              
              {/* Duration - only for video and audio */}
              {(item.content_type === 'video' || item.content_type === 'audio') && item.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className={viewMode === 'list' ? 'pt-0' : 'pt-0'}>
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-2xl font-bold text-[#002366]">
                  ₦{item.price.toLocaleString()}
                </p>
              </div>
              {showActions && (
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' ? (
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => window.location.href = `/content/${item.id}`}
                    >
                      View Details
                    </Button>
                  ) : isPurchased ? (
                    <Button 
                      size="sm" 
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.location.href = '/my-library'}
                    >
                      <BookOpen className="w-4 h-4" />
                      My Library
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="gap-2" 
                      disabled={item.is_exclusive || isInCart || isOutOfStock}
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isInCart ? 'In Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  )
}
