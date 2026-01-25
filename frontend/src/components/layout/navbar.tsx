'use client'

import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal'
import { LoginModal } from '@/components/auth/login-modal'
import { SignupModal } from '@/components/auth/signup-modal'
import { ShoppingCart } from '@/components/cart/shopping-cart'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { contentService } from '@/lib/api/content'
import { storePurchasedContent } from '@/utils/storage'
import { motion } from 'framer-motion'
import { BookOpen, LogOut, Menu, Search, Settings, ShoppingCart as ShoppingCartIcon, User, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [purchasedContent, setPurchasedContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isForgotOpen, setIsForgotOpen] = useState(false)

  const fetchPurchasedContent = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const content = await contentService.getPurchasedContent();
      
      // Store the content using our storage utility
      storePurchasedContent(content);
      
      setPurchasedContent(content);
    } catch (error) {
      console.error('Error fetching purchased content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Import the storage utility at the top of the file
  // import { storePurchasedContent } from '@/utils/storage';

  useEffect(() => {
    if (isAuthenticated) {
      fetchPurchasedContent()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    const openLogin = () => setIsLoginModalOpen(true)
    const refreshCartCount = () => {
      try {
        const raw = localStorage.getItem('cart_items')
        const arr = raw ? JSON.parse(raw) : []
        const count = Array.isArray(arr) ? arr.reduce((sum: number, x: any) => sum + (x.qty || x.quantity || 1), 0) : 0
        setCartCount(count)
      } catch {
        setCartCount(0)
      }
    }

    // initial
    refreshCartCount()

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('open:login', openLogin as EventListener)
    window.addEventListener('cart:changed', refreshCartCount)
    window.addEventListener('storage', refreshCartCount)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('open:login', openLogin as EventListener)
      window.removeEventListener('cart:changed', refreshCartCount)
      window.removeEventListener('storage', refreshCartCount)
    }
  }, [])

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/cibnlogo.png"
                  alt="CIBN Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#002366] to-[#059669] bg-clip-text text-transparent">CIBN Digital Library</h1>
                <p className="text-xs text-gray-600">Excellence in Banking Education</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/library" className="text-gray-700 hover:text-[#059669] transition-colors font-medium">
                Library
              </Link>
              <Link href="/resources" className="text-gray-700 hover:text-[#059669] transition-colors font-medium">
                Resources
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#059669] transition-colors font-medium">
                About
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-[#FFD700] text-[#059669] text-xs min-w-[20px] h-5">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Section */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-[#FFD700]">
                        <AvatarImage src="/avatars/user.png" alt={user?.full_name || "User"} />
                        <AvatarFallback className="bg-[#059669] text-white">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <Users className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                      {user?.full_name || "User"}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">
                      {user?.email}
                    </div>
                    {user?.role !== 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/my-library" className="flex items-center gap-2 w-full">
                            <BookOpen className="h-4 w-4" />
                            <div>
                              <div>My Library</div>
                              {isLoading ? (
                                <div className="text-xs text-gray-500">Loading...</div>
                              ) : purchasedContent.length > 0 ? (
                                <div className="text-xs text-gray-500">{purchasedContent.length} items</div>
                              ) : null}
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {/* Edit Profile - visible to all */}
                    <DropdownMenuItem className="flex items-center space-x-2" asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {/* Settings - admin only */}
                    {user?.role === 'admin' && (
                      <DropdownMenuItem className="flex items-center space-x-2" asChild>
                        <Link href="/admin/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center space-x-2"
                      onClick={() => {
                        logout()
                        router.push('/')
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="cibn-green-gradient text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/library" className="text-lg font-medium text-gray-700 hover:text-[#059669] transition-colors">
                      Library
                    </Link>
                    <Link href="/courses" className="text-lg font-medium text-gray-700 hover:text-[#059669] transition-colors">
                      Courses
                    </Link>
                    <Link href="/resources" className="text-lg font-medium text-gray-700 hover:text-[#059669] transition-colors">
                      Resources
                    </Link>
                    <Link href="/about" className="text-lg font-medium text-gray-700 hover:text-[#059669] transition-colors">
                      About
                    </Link>
                    {!isAuthenticated && (
                      <Button 
                        onClick={() => setIsLoginModalOpen(true)}
                        className="cibn-green-gradient text-white mt-4"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onRequestSignup={() => { setIsLoginModalOpen(false); setIsSignupModalOpen(true) }}
        onRequestForgot={() => { setIsLoginModalOpen(false); setIsForgotOpen(true) }}
      />
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onRequestSignin={() => { setIsSignupModalOpen(false); setIsLoginModalOpen(true) }}
      />
      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  )
}