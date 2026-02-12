'use client'

import { ContentCard } from '@/components/content/ContentCard'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Content, contentService } from '@/lib/api/content'
import { storePurchasedContent } from '@/utils/storage'
import { motion } from 'framer-motion'
import {
    BookOpen, Grid, List,
    Search,
    SlidersHorizontal, X
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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

  const [contentItems, setContentItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)

  // Load favorites and cart items from localStorage
  useEffect(() => {
    try { 
      const rawFavs = localStorage.getItem('library_favorites'); 
      if (rawFavs) setFavorites(JSON.parse(rawFavs));
      
      const rawCart = localStorage.getItem('cart_items');
      if (rawCart) setCartItems(JSON.parse(rawCart).map((item: any) => item.id));
      
      if (isAuthenticated) {
        loadPurchasedContent();
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, [isAuthenticated])

  // Listen for purchase success events
  useEffect(() => {
    const handlePurchaseSuccess = () => { loadPurchasedContent() }
    window.addEventListener('purchase:success', handlePurchaseSuccess)
    return () => window.removeEventListener('purchase:success', handlePurchaseSuccess)
  }, [isAuthenticated])

  // Save favorites to localStorage
  useEffect(() => {
    try { localStorage.setItem('library_favorites', JSON.stringify(favorites)) } catch {}
  }, [favorites])

  // Add to cart handler (passed to ContentCard)
  const handleAddToCart = (item: Content) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart_items') || '[]')
      const exists = currentCart.findIndex((c: any) => c.id === item.id)
      
      if (exists >= 0) {
        toast.info('Item already in cart')
      } else {
        currentCart.push({ id: item.id, title: item.title, price: item.price, quantity: 1 })
        localStorage.setItem('cart_items', JSON.stringify(currentCart))
        setCartItems(currentCart.map((c: any) => c.id))
        window.dispatchEvent(new Event('cart:changed'))
        toast.success(`${item.title} added to cart`)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const loadPurchasedContent = async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const freshContent = await contentService.getPurchasedContent()
      storePurchasedContent(freshContent)
      const purchasedIds = freshContent.map((item: any) => item.id)
      setPurchasedItems(purchasedIds)
    } catch (error) {
      console.error('Error loading purchased content:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await contentService.getContent({
        content_type: selectedType === 'all' ? undefined : selectedType as any,
        category: selectedCategory === 'all' ? undefined : selectedCategory as any,
        search: searchQuery || undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        page: 1,
        page_size: 100
      })
      
      const items = Array.isArray(response) ? response : 
                  (response && Array.isArray(response.items) ? response.items : [])
      
      if (!items.length) {
        setContentItems([])
        return
      }
      
      // Store API data directly as Content[] — no transformation needed
      setContentItems(items.filter(
        (item: any) => item && typeof item === 'object' && 'id' in item && 'title' in item
      ))

    } catch (error) {
      console.error('Error in fetchContent:', error)
      toast.error('Failed to load content. Please try again later.')
      setContentItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filter === 'purchased') {
      loadPurchasedContent()
    } else {
      fetchContent()
    }
  }, [filter, searchQuery, selectedType, selectedCategory, priceRange])

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
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ]

  const filteredContent = contentItems.filter(item => {
    // If filter is 'purchased', only show items in the purchased list
    if (filter === 'purchased' && !purchasedItems.includes(item.id)) return false
    
    const matchesType = selectedType === 'all' || item.content_type === selectedType
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1]
    
    return matchesType && matchesSearch && matchesCategory && matchesPrice
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'popularity': return (b.purchase_count || 0) - (a.purchase_count || 0)
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto mb-4" />
                    <p className="text-gray-600">Loading content…</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredContent.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No content found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              )}

              {/* Content Grid/List — uses shared ContentCard */}
              {!loading && filteredContent.length > 0 && (
                <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredContent.map((item, index) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      index={index}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                      showActions={true}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {!loading && filteredContent.length > 0 && (
                <div className="text-center mt-12">
                  <Button className="cibn-gold-gradient text-[#059669] px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                    Load More Resources
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}