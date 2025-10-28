'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Navbar } from '@/components/layout/navbar'
import { 
  Search, Filter, BookOpen, Video, FileText, Headphones, Star, Clock, Users, Download, 
  Play, ShoppingCart, Lock, Heart, Share2, Grid, List, SlidersHorizontal, X, ChevronDown 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { contentService, Content } from '@/lib/api/content'
import { storePurchasedContent, getPurchasedContent } from '@/utils/storage'

export default function LibraryPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState('popularity')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const [cartItems, setCartItems] = useState<number[]>([])
  const [purchasedItems, setPurchasedItems] = useState<number[]>([])

  // Load favorites, cart items, and purchased content from localStorage
  useEffect(() => {
    try { 
      const rawFavs = localStorage.getItem('library_favorites'); 
      if (rawFavs) setFavorites(JSON.parse(rawFavs));
      
      const rawCart = localStorage.getItem('cart_items');
      if (rawCart) setCartItems(JSON.parse(rawCart).map((item: any) => item.id));
      
      // Load purchased content if user is authenticated
      if (isAuthenticated) {
        loadPurchasedContent();
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, [isAuthenticated])
  
  // Listen for purchase success events
  useEffect(() => {
    const handlePurchaseSuccess = () => {
      loadPurchasedContent();
    };

    window.addEventListener('purchase:success', handlePurchaseSuccess);
    return () => {
      window.removeEventListener('purchase:success', handlePurchaseSuccess);
    };
  }, [isAuthenticated]);

  // Save favorites to localStorage
  useEffect(() => {
    try { 
      localStorage.setItem('library_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites])
  
  // Function to add item to cart
  const addToCart = (item: any) => {
    try {
      // Get current cart items from localStorage
      const currentCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
      
      // Check if item is already in cart
      const existingItemIndex = currentCart.findIndex((cartItem: any) => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item already in cart, update quantity
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // Add new item to cart
        currentCart.push({
          id: item.id,
          title: item.title,
          price: item.price,
          type: item.type,
          quantity: 1
        });
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart_items', JSON.stringify(currentCart));
      
      // Update local state
      setCartItems(currentCart.map((cartItem: any) => cartItem.id));
      
      // Dispatch cart changed event
      window.dispatchEvent(new Event('cart:changed'));
      
      // Show success message
      toast.success(`${item.title} added to cart`);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      return false;
    }
  };

  const [contentItems, setContentItems] = useState<Array<{
    id: number;
    title: string;
    type: 'document' | 'video' | 'audio';
    category: string;
    price: number;
    rating: number;
    reviews: number;
    duration?: string | number;  // string for legacy, number (seconds) from API
    students: number;
    purchase_count?: number;  // number of purchases from API
    instructor: string;
    level: string;
    description: string;
    tags: string[];
    isPremium: boolean;
    isRestricted: boolean;
    featured: boolean;
    thumbnail_url?: string;
    file_url?: string;
  }>>([])

  useEffect(() => {
    try { const raw = localStorage.getItem('library_favorites'); if (raw) setFavorites(JSON.parse(raw)) } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('library_favorites', JSON.stringify(favorites)) } catch {}
  }, [favorites])

  const [loading, setLoading] = useState(false)
  
  const loadPurchasedContent = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Always fetch fresh data first
      const freshContent = await contentService.getPurchasedContent();
      
      // Store the fresh data in localStorage
      storePurchasedContent(freshContent);
      
      // Only keep essential data in memory
      const essentialContent = freshContent.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.content_type || 'document',
        price: item.price || 0,
        thumbnail_url: item.thumbnail_url || null,
        isPremium: item.price > 0,
        isRestricted: false, // Purchased items shouldn't be restricted
        file_url: item.file_url || null,
      }));
      
      // Update purchased items state with just the IDs for quick lookup
      const purchasedIds = essentialContent.map((item: any) => item.id);
      setPurchasedItems(purchasedIds);
      
      // Also update the content items to reflect the purchased status
      setContentItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          isRestricted: purchasedIds.includes(item.id) ? false : item.isRestricted
        }))
      );
      
      return essentialContent;
    } catch (error) {
      console.error('Error loading purchased content:', error);
      toast.error('Failed to load purchased content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    
    try {
      const response = await contentService.getContent({
        content_type: selectedType === 'all' ? undefined : selectedType as any,
        category: selectedCategory === 'all' ? undefined : selectedCategory as any,
        search: searchQuery || undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        page: 1,
        page_size: 100
      });
      
      const items = Array.isArray(response) ? response : 
                  (response && Array.isArray(response.items) ? response.items : []);
      
      if (!items.length) {
        console.warn('No content items found in response');
        setContentItems([]);
        return;
      }
      
      const mapped = items
        .filter(item => item && typeof item === 'object' && 'id' in item && 'title' in item)
        .map((item) => ({
          id: item.id,
          title: item.title,
          type: item.content_type || 'document',
          category: item.category || 'uncategorized',
          price: typeof item.price === 'number' ? item.price : 0,
          rating: 4.5,
          reviews: 12,
          duration: item.duration || null,  // Use actual duration from API (in seconds)
          students: item.purchase_count || 0,  // Fallback to purchase_count
          purchase_count: item.purchase_count || 0,  // Actual purchase count from API
          instructor: item.author || 'CIBN',
          level: 'All Levels',
          description: item.description || '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          isPremium: item.price > 0,
          isRestricted: Boolean(item.is_exclusive),
          featured: Boolean(item.thumbnail_url),
          thumbnail_url: item.thumbnail_url || null,
          file_url: item.file_url || null,
        }));
      
      setContentItems(mapped);
      
    } catch (error) {
      console.error('Error in fetchContent:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast.error('Failed to load content. Please try again later.');
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'purchased') {
      loadPurchasedContent();
    } else {
      fetchContent();
    }
  }, [filter, searchQuery, selectedType, selectedCategory, priceRange]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'exam_text', label: 'Exam Text' },
    { value: 'cibn_publication', label: 'CIBN Publication' },
    { value: 'research_paper', label: 'Research Paper' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'souvenir', label: 'Souvenir' },
    { value: 'other', label: 'Other' }
  ]

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Headphones className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-700'
      case 'video': return 'bg-purple-100 text-purple-700'
      case 'audio': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  // Get purchased content IDs from session storage
  const getPurchasedContentIds = (): number[] => {
    if (typeof window === 'undefined') return [];
    try {
      const purchasedContent = JSON.parse(sessionStorage.getItem('purchasedContent') || '[]');
      return purchasedContent.map((item: any) => item.id);
    } catch (error) {
      console.error('Error parsing purchased content:', error);
      return [];
    }
  };

  const purchasedContentIds = getPurchasedContentIds();
  
  const filteredContent = contentItems.filter(item => {
    // If filter is 'purchased', only show items that are in the purchased list
    if (filter === 'purchased' && !purchasedContentIds.includes(item.id)) {
      return false;
    }
    
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    
    return matchesType && matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'popularity': return b.students - a.students
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 cibn-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Digital Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Access thousands of premium banking resources, from exam materials to professional development courses
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search resources, courses, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-xl h-14 border border-gray-300 bg-white"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Filters and Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80`}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content Type */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Content Type</h4>
                  <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                      <TabsTrigger value="all" className="text-xs py-2">All</TabsTrigger>
                      <TabsTrigger value="document" className="text-xs py-2">Documents</TabsTrigger>
                      <TabsTrigger value="video" className="text-xs py-2">Videos</TabsTrigger>
                      <TabsTrigger value="audio" className="text-xs py-2">Audio</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Category</h4>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₦{priceRange[0].toLocaleString()}</span>
                      <span>₦{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Level</h4>
                  <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                      <label key={level} className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Sort By</h4>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setPriceRange([0,10000]);
                  setSortBy('popularity');
                }}>
                  Reset Filters
                </Button>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                    <p className="text-gray-600">
                      Showing <span className="font-semibold">{filteredContent.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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

              {/* Content Grid/List */}
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}>
                      {/* Image with Thumbnail */}
                      <div className={`relative ${viewMode === 'list' ? 'w-48' : 'h-48'} bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden`}>
                        {item.thumbnail_url ? (
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                            <div className="absolute top-4 left-4">
                              <Badge className={`${getTypeColor(item.type)} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                {getTypeIcon(item.type)}
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </Badge>
                            </div>
                            {item.isRestricted && (
                              <div className="absolute bottom-4 left-4">
                                <Badge className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Restricted
                                </Badge>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              {item.type === 'video' ? (
                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-8 h-8 text-[#002366] ml-1" />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  {getTypeIcon(item.type)}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(item.id)}
                              className="flex-shrink-0"
                            >
                              <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </Button>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.description}
                          </p>
                        </CardHeader>

                        <CardContent className={viewMode === 'list' ? 'pb-3' : 'pb-3'}>
                          {/* Stats Row */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            {/* Purchase Count */}
                            {(item.purchase_count !== undefined || item.students) && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{item.purchase_count ?? item.students ?? 0}</span>
                              </div>
                            )}
                            
                            {/* Duration - only for video and audio */}
                            {(item.type === 'video' || item.type === 'audio') && item.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{typeof item.duration === 'number' ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : item.duration}</span>
                              </div>
                            )}
                            
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{item.level}</span>
                          </div>
                        </CardContent>

                        <CardFooter className={viewMode === 'list' ? 'pt-0' : 'pt-0'}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="text-xl font-bold text-[#059669]">₦{item.price.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">by {item.instructor}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {user?.role === 'admin' ? (
                                <Button 
                                  size="sm" 
                                  className="flex-1 gap-2"
                                  onClick={() => {
                                    if (item.file_url) {
                                      window.open(item.file_url, '_blank');
                                    } else {
                                      toast.info('No file available for this content');
                                    }
                                  }}
                                >
                                  {item.type === 'video' ? 'Play' : 'Get'}
                                </Button>
                              ) : purchasedItems.includes(item.id) ? (
                                <Button 
                                  size="sm" 
                                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {
                                    // Navigate to my-library page
                                    window.location.href = '/my-library';
                                  }}
                                >
                                  <BookOpen className="w-4 h-4" />
                                  My Library
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="flex-1 gap-2" 
                                  disabled={item.isRestricted || cartItems.includes(item.id)}
                                  onClick={() => {
                                    if (item.isRestricted) return;
                                    addToCart(item);
                                  }}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  {cartItems.includes(item.id) ? 'In Cart' : 'Add to Cart'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardFooter>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button className="cibn-gold-gradient text-[#059669] px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                  Load More Resources
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}