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
import { progressService, ContentProgress } from '@/lib/api/progress'
import { DocumentViewer } from '@/components/viewers/DocumentViewer'
import { VideoPlayer } from '@/components/viewers/VideoPlayer'
import { AudioPlayer } from '@/components/viewers/AudioPlayer'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'

export default function MyLibraryPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [purchasedContent, setPurchasedContent] = useState<any[]>([])
  const [progressData, setProgressData] = useState<ContentProgress[]>([])
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
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/my-library')
        return
      }

      try {
        setIsLoading(true)
        // Fetch purchased content (required)
        const content = await contentService.getPurchasedContent()
        setPurchasedContent(content)
        
        // Fetch progress (optional - may not be available yet)
        try {
          const progress = await progressService.getAllProgress()
          setProgressData(progress)
        } catch (progressError: any) {
          // Progress tracking might not be available yet
          if (process.env.NODE_ENV === 'development') {
            console.warn('Progress tracking not available:', progressError.response?.status)
          }
          setProgressData([])
        }
      } catch (error) {
        console.error('Error fetching library data:', error)
        toast.error('Failed to load your library')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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
    // Validate that the item has a file_url
    if (!item.file_url) {
      console.error('No file_url found for item:', item)
      toast.error(`Unable to open ${item.content_type}. File is not available.`)
      return
    }
    
    console.log('Opening viewer for item:', {
      id: item.id,
      title: item.title,
      type: item.content_type,
      fileUrl: item.file_url
    })
    
    setSelectedContent(item)
    setViewerType(item.content_type)
  }

  const closeViewer = () => {
    setSelectedContent(null)
    setViewerType(null)
  }

  // Get progress for an item from database
  const getProgress = (contentId: number) => {
    const progress = progressData.find(p => p.content_id === contentId)
    return progress ? progress.progress_percentage : 0
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
      const progress = getProgress(item.id)
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
    inProgress: contentInProgress.length
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your library...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ContentCard = ({ item, index }: { item: any; index: number }) => {
    const progress = getProgress(item.id, item.content_type)
    const isFavorite = favorites.includes(item.id)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
          {/* Thumbnail/Header */}
          <div className="relative h-48 bg-gradient-to-br from-[#002366]/10 to-[#059669]/10">
            <div className="absolute top-4 left-4">
              <Badge className={`${getTypeColor(item.content_type)} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                {getContentIcon(item.content_type)}
                {item.content_type}
              </Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {getContentIcon(item.content_type)}
              </div>
            </div>
            {/* Progress Bar for Video/Audio */}
            {(item.content_type === 'video' || item.content_type === 'audio') && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div 
                  className="h-full bg-[#059669]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-gray-900 group-hover:text-[#059669] transition-colors text-lg line-clamp-2">
                {item.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(item.id)
                }}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description || 'No description available'}
            </p>
          </CardHeader>

          <CardContent className="pb-3">
            {progress > 0 && progress < 95 && (
              <div className="flex items-center gap-2 text-sm text-[#059669] mb-2">
                <Clock className="w-4 h-4" />
                <span>{Math.round(progress)}% complete</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2">
            {/* Primary Action Button */}
            {item.content_type === 'document' && (
              <Button 
                className="flex-1 gap-2"
                onClick={() => openViewer(item)}
                disabled={!item.file_url}
              >
                <Eye className="w-4 h-4" />
                {item.file_url ? 'Read' : 'Not Available'}
              </Button>
            )}
            {item.content_type === 'video' && (
              <Button 
                className="flex-1 gap-2"
                onClick={() => openViewer(item)}
                disabled={!item.file_url}
              >
                <Play className="w-4 h-4" />
                {!item.file_url ? 'Not Available' : (progress > 0 && progress < 95 ? 'Continue' : 'Watch')}
              </Button>
            )}
            {item.content_type === 'audio' && (
              <Button 
                className="flex-1 gap-2"
                onClick={() => openViewer(item)}
                disabled={!item.file_url}
              >
                <Play className="w-4 h-4" />
                {!item.file_url ? 'Not Available' : (progress > 0 && progress < 95 ? 'Continue' : 'Listen')}
              </Button>
            )}
            {item.content_type === 'physical' && (
              <Button 
                className="flex-1 gap-2"
                onClick={() => toast.info('Track order feature coming soon')}
              >
                <Package className="w-4 h-4" />
                Track Order
              </Button>
            )}
            
            {/* Download Button */}
            {item.content_type !== 'physical' && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={async () => {
                  try {
                    await contentService.downloadContent(item.id, item.title || 'download')
                  } catch (error) {
                    console.error('Error downloading content:', error)
                    toast.error('Failed to download content')
                  }
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-8 overflow-hidden">
        <div className="absolute inset-0 cibn-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              My Library
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Welcome back, {user?.full_name || 'there'}! Access your purchased content anytime.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#059669]" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-gray-600">Total Items</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.documents}</p>
                    <p className="text-xs text-gray-600">Documents</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.videos}</p>
                    <p className="text-xs text-gray-600">Videos</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.audio}</p>
                    <p className="text-xs text-gray-600">Audio</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        {purchasedContent.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-6">Purchase content from the library to see it here</p>
            <Button onClick={() => router.push('/library')} size="lg">
              Browse Library
            </Button>
          </div>
        ) : (
          <>
            {/* Continue Learning Section */}
            {contentInProgress.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#059669]" />
                  Continue Learning
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contentInProgress.slice(0, 3).map((item, index) => (
                    <ContentCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Type Filter */}
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="type">Content Type</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                All Content ({filteredContent.length})
              </h2>
              {filteredContent.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-600">No content matches your search</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredContent.map((item, index) => (
                    <ContentCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Content Viewers */}
      {selectedContent && viewerType === 'document' && selectedContent.file_url && (
        <DocumentViewer
          isOpen={true}
          onClose={closeViewer}
          fileUrl={selectedContent.file_url}
          title={selectedContent.title}
          contentId={selectedContent.id}
        />
      )}

      {selectedContent && viewerType === 'video' && selectedContent.file_url && (
        <VideoPlayer
          isOpen={true}
          onClose={closeViewer}
          fileUrl={selectedContent.file_url}
          title={selectedContent.title}
          contentId={selectedContent.id}
          duration={selectedContent.duration}
        />
      )}

      {selectedContent && viewerType === 'audio' && selectedContent.file_url && (
        <AudioPlayer
          isOpen={true}
          onClose={closeViewer}
          fileUrl={selectedContent.file_url}
          title={selectedContent.title}
          contentId={selectedContent.id}
          duration={selectedContent.duration}
          author={selectedContent.author}
        />
      )}
    </div>
  )
}
