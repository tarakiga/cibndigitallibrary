'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Video, FileText, Headphones, Star, Clock, Users, Download, Play, ShoppingCart, Lock, Filter, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { 
  contentService, 
  type Content, 
  type ContentType, 
  type ContentCategory,
  type ContentListResponse 
} from '@/lib/api/content'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// Extend the Content interface with UI-specific properties
interface ContentWithExtras extends Content {
  students?: number;
  rating?: number;
  reviews?: number;
  duration?: string;
}

export function ContentShowcase() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all')
  const handleTabChange = (value: string) => {
    setActiveTab(value as ContentType | 'all')
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all')
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as ContentCategory | 'all')
  }
  const [contentItems, setContentItems] = useState<ContentWithExtras[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;
    
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response: ContentListResponse = await contentService.getContent({
          page: 1,
          page_size: 6, // Show 6 items on the home page
          content_type: activeTab === 'all' ? undefined : activeTab,
          category: selectedCategory === 'all' ? undefined : selectedCategory as ContentCategory,
          search: searchTerm || undefined
        });
        
        if (!isMounted) return;
        
        // Add mock data for UI elements that aren't in the API response
        const itemsWithExtras = response.items.map(item => ({
          ...item,
          students: Math.floor(Math.random() * 1000),
          rating: 4.5,
          reviews: Math.floor(Math.random() * 100),
          duration: ['1h 30m', '45m', '2h', '30m', '1h 15m'][Math.floor(Math.random() * 5)]
        }));
        
        setContentItems(itemsWithExtras);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching content:', error);
          toast.error('Failed to load content');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchContent();
    
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCategory, searchTerm]);

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Headphones className="w-5 h-5" />
      case 'physical': return <ShoppingCart className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-700'
      case 'video': return 'bg-purple-100 text-purple-700'
      case 'audio': return 'bg-green-100 text-green-700'
      case 'physical': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Filter content based on search term and selected category
  const filteredContent = React.useMemo(() => {
    return (contentItems || [])
      .filter((item) => {
        if (!item) return false;
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' || 
          item.title.toLowerCase().includes(searchLower) ||
          (item.description || '').toLowerCase().includes(searchLower);
        
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesTab = activeTab === 'all' || item.content_type === activeTab;
        
        return matchesSearch && matchesCategory && matchesTab;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [contentItems, searchTerm, selectedCategory, activeTab]);

  // Ensure we have a proper return statement with valid JSX
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-[#FFD700] text-[#059669] px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" />
            Premium Content Library
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Explore Our <span className="text-[#059669]">Resources</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access thousands of premium banking resources, from exam materials to professional development courses
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="exam_text">Exam Texts</SelectItem>
                  <SelectItem value="cibn_publication">CIBN Publications</SelectItem>
                  <SelectItem value="research_paper">Research Papers</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="souvenir">Souvenirs</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center justify-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="mb-12"
          defaultValue="all"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-xl p-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-[#059669] data-[state=active]:text-white rounded-lg"
            >
              All Content
            </TabsTrigger>
            <TabsTrigger 
              value="document" 
              className="data-[state=active]:bg-[#059669] data-[state=active]:text-white rounded-lg"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:bg-[#059669] data-[state=active]:text-white rounded-lg"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="audio" 
              className="data-[state=active]:bg-[#059669] data-[state=active]:text-white rounded-lg"
            >
              Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
                </div>
              ) : !filteredContent || filteredContent.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No content found. Try adjusting your filters.
                </div>
              ) : (
                filteredContent.map((item: ContentWithExtras, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {item.thumbnail_url ? (
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            {getTypeIcon(item.content_type)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <Badge className={`${getTypeColor(item.content_type)} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                            {getTypeIcon(item.content_type)}
                            {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                          </Badge>
                        </div>
                        {item.is_exclusive && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Exclusive
                            </Badge>
                          </div>
                        )}
                        {item.price > 0 && (
                          <div className="absolute bottom-4 right-4">
                            <Badge className="bg-[#FFD700] text-[#002366] px-3 py-1 rounded-full text-xs font-semibold">
                              Premium
                            </Badge>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {item.content_type === 'video' ? (
                              <Play className="w-8 h-8 text-[#059669] ml-1" />
                            ) : item.content_type === 'document' ? (
                              <Download className="w-6 h-6 text-[#059669]" />
                            ) : item.content_type === 'audio' ? (
                              <Headphones className="w-6 h-6 text-[#059669]" />
                            ) : (
                              <ShoppingCart className="w-6 h-6 text-[#059669]" />
                            )}
                          </div>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-[#059669] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.description || 'No description available'}
                        </p>
                      </CardHeader>

                      <CardContent className="pb-3">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold text-gray-900">{item.rating}</span>
                            <span>({item.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{item.students?.toLocaleString()} students</span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="text-2xl font-bold text-[#059669]">
                              {item.price > 0 ? `₦${item.price.toLocaleString()}` : 'Free'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {item.content_type === 'document' ? (
                              <Button 
                                size="sm" 
                                className="bg-[#059669] hover:bg-[#047857] text-white"
                                onClick={() => {
                                  if (item.file_url) {
                                    window.open(item.file_url, '_blank')
                                  } else {
                                    toast.info('No file available for this content')
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                {user?.role === 'admin' ? 'View' : 'Download'}
                              </Button>
                            ) : item.content_type === 'video' ? (
                              <Button 
                                size="sm" 
                                className="bg-[#059669] hover:bg-[#047857] text-white"
                                onClick={() => {
                                  if (item.file_url) {
                                    window.open(item.file_url, '_blank')
                                  } else {
                                    toast.info('No video available for this content')
                                  }
                                }}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                {user?.role === 'admin' ? 'View' : 'Watch'}
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                className="bg-[#059669] hover:bg-[#047857] text-white"
                                onClick={() => {
                                  if (item.file_url) {
                                    window.open(item.file_url, '_blank')
                                  } else {
                                    toast.info('No content available')
                                  }
                                }}
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                {user?.role === 'admin' ? 'View' : 'Get'}
                              </Button>
                            )}
                            
                            {user?.role !== 'admin' && item.price > 0 && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-[#059669] text-[#059669] hover:bg-[#059669]/10"
                                onClick={() => {
                                  // Add to cart functionality
                                  toast.success('Added to cart')
                                }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => router.push('/library')}
            className="bg-[#059669] hover:bg-[#047857] text-white px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            View All Resources
          </Button>
        </div>
      </div>
    </section>
  );
}