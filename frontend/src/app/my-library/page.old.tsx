'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BookOpen, Download, Heart, Share2, Search, FileText, Video, Headphones, 
  Play, Grid, List, Clock, TrendingUp, Package, Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { contentService } from '@/lib/api/content'
import { DocumentViewer } from '@/components/viewers/DocumentViewer'
import { VideoPlayer } from '@/components/viewers/VideoPlayer'
import { AudioPlayer } from '@/components/viewers/AudioPlayer'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'

export default function MyLibraryPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [purchasedContent, setPurchasedContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<number[]>([])
  
  // Viewer states
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [viewerType, setViewerType] = useState<'document' | 'video' | 'audio' | null>(null)

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('library_favorites')
      if (raw) setFavorites(JSON.parse(raw))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('library_favorites', JSON.stringify(favorites))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }, [favorites])

  useEffect(() => {
    const fetchPurchasedContent = async () => {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/my-library')
        return
      }

      try {
        setIsLoading(true)
        const content = await contentService.getPurchasedContent()
        setPurchasedContent(content)
      } catch (error) {
        console.error('Error fetching purchased content:', error)
        toast.error('Failed to load your library')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchasedContent()
  }, [isAuthenticated, router])

  // Helper functions
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Headphones className="w-5 h-5" />
      case 'physical': return <Package className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
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

  const openViewer = (item: any) => {
    setSelectedContent(item)
    setViewerType(item.content_type)
  }

  const closeViewer = () => {
    setSelectedContent(null)
    setViewerType(null)
  }

  // Get progress for an item
  const getProgress = (contentId: number, type: string) => {
    try {
      const key = type === 'video' ? `video_progress_${contentId}` : `audio_progress_${contentId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const { currentTime, totalDuration } = JSON.parse(saved)
        return (currentTime / totalDuration) * 100
      }
    } catch (error) {
      return 0
    }
    return 0
  }

  // Filter and sort content
  const filteredContent = purchasedContent
    .filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || item.content_type === selectedType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.purchase_date || 0).getTime() - new Date(a.purchase_date || 0).getTime()
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'type':
          return (a.content_type || '').localeCompare(b.content_type || '')
        default:
          return 0
      }
    })

  // Get content with progress (for Continue Learning section)
  const contentInProgress = filteredContent.filter(item => {
    if (item.content_type === 'video' || item.content_type === 'audio') {
      const progress = getProgress(item.id, item.content_type)
      return progress > 0 && progress < 95
    }
    return false
  })

  // Calculate stats
  const stats = {
    total: purchasedContent.length,
    documents: purchasedContent.filter(i => i.content_type === 'document').length,
    videos: purchasedContent.filter(i => i.content_type === 'video').length,
    audio: purchasedContent.filter(i => i.content_type === 'audio').length,
    physical: purchasedContent.filter(i => i.content_type === 'physical').length,
    inProgress: contentInProgress.length
  }

  if (!isAuthenticated) {
    return null // Redirect will happen in the effect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Loading your library...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">
            {purchasedContent.length} {purchasedContent.length === 1 ? 'item' : 'items'} in your library
          </p>
        </div>

        {purchasedContent.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-6">Purchase content from the library to see it here</p>
            <Button onClick={() => router.push('/library')}>
              Browse Library
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedContent.map((item) => (
              <Card key={item.id} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#059669] transition-colors text-lg line-clamp-2">
                    {item.title}
                  </h3>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <span className="capitalize">{item.content_type}</span>
                    <span className="mx-2">•</span>
                    <span>{item.duration || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {item.description || 'No description available.'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={async () => {
                      try {
                        await contentService.downloadContent(item.id, item.title || 'download');
                      } catch (error) {
                        console.error('Error downloading content:', error);
                        toast.error('Failed to download content. Please try again.');
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
