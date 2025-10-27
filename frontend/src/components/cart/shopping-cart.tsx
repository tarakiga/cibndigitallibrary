'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, Plus, Minus, X, CreditCard, Shield, Truck, FileText, Video, Headphones, 
  Star, Clock, Users, Download, Play, ArrowRight, CheckCircle 
} from 'lucide-react'
// Import motion from framer-motion with proper type
type MotionDivProps = {
  initial: { opacity: number; x: number };
  animate: { opacity: number; x: number };
  className?: string;
  children: React.ReactNode;
};

const MotionDiv: React.FC<MotionDivProps> = ({ initial, animate, className, children }) => (
  <div style={{ opacity: animate.opacity, transform: `translateX(${animate.x}px)` }} className={className}>
    {children}
  </div>
);
import { ordersApi } from '@/lib/api/orders'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

interface CartItem {
  id: number
  title: string
  type: 'document' | 'video' | 'audio'
  price: number
  quantity: number
  instructor: string
  duration: string
  image: string
  isPremium: boolean
  isRestricted: boolean
}

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { isAuthenticated, user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('paystack')
  const [paying, setPaying] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria'
  })

  // Nigerian states list
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  // Fetch user profile when checkout is shown
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!showCheckout || !user?.id) return
      
      setIsLoadingProfile(true)
      try {
        const authService = (await import('@/lib/api/auth')).default
        const profile = await authService.getCurrentUser()
        
        setFormData(prev => ({
          ...prev,
          email: profile.email || '',
          firstName: profile.full_name?.split(' ')[0] || '',
          lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
          phone: profile.phone || '',
          // Update these fields if they exist in your user profile
          address: '', // Add address field to your User model if needed
          city: '',    // Add city field to your User model if needed
          state: ''    // Add state field to your User model if needed
        }))
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    
    fetchUserProfile()
  }, [showCheckout, user?.id])

  // Load cart items from localStorage
  const loadCartItems = () => {
    try {
      const raw = localStorage.getItem('cart_items')
      if (raw) {
        const arr = JSON.parse(raw)
        const mapped: CartItem[] = arr.map((x: any) => ({
          id: x.id,
          title: x.title,
          type: x.type || 'document',
          price: x.price || 0,
          quantity: x.quantity || 1,
          instructor: x.instructor || '',
          duration: x.duration || '',
          image: x.image || '',
          isPremium: false,
          isRestricted: false,
        }))
        setCartItems(mapped)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error('Error loading cart items:', error)
      setCartItems([])
    }
  }

  // Load cart when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCartItems()
    }
  }, [isOpen])

  // Only listen for cart changes when the cart is open
  useEffect(() => {
    if (!isOpen) return;
    
    const handleCartChange = () => {
      loadCartItems();
    };

    window.addEventListener('cart:changed', handleCartChange);
    return () => {
      window.removeEventListener('cart:changed', handleCartChange);
    };
  }, [isOpen]); // Only re-run when isOpen changes

  const persistCart = (items: CartItem[], dispatchEvent = false) => {
    try {
      const arr = items.map(i => ({ 
        id: i.id, 
        title: i.title, 
        price: i.price, 
        type: i.type, 
        quantity: i.quantity 
      }))
      localStorage.setItem('cart_items', JSON.stringify(arr))
      if (dispatchEvent) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          window.dispatchEvent(new Event('cart:changed'))
        }, 0)
      }
    } catch {}
  }

  const updateQuantity = (id: number, change: number) => {
    setCartItems(prev => {
      const next = prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
      persistCart(next, true) // Dispatch event for user actions
      return next
    })
  }

  const removeItem = (id: number) => {
    setCartItems(prev => {
      const next = prev.filter(item => item.id !== id)
      persistCart(next, true) // Dispatch event for user actions
      return next
    })
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Headphones className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }


  const handlePayment = async () => {
    if (!isAuthenticated) {
      // Redirect to login with a return URL
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`
      return
    }

    setPaying(true)
    try {
      // Create order
      const order = await ordersApi.createOrder({
        items: cartItems.map(item => ({
          content_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state}`,
        notes: ''
      })

      // Initialize payment
      const payment = await ordersApi.initializePayment(order.id)
      
      // Redirect to payment page
      window.location.href = payment.authorization_url
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (showCheckout) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Checkout</DialogTitle>
            <DialogDescription>
              Complete your purchase to access premium banking resources
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-[#059669]">₦{getTotalPrice().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter first name"
                      required
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter last name"
                      required
                      disabled={isLoadingProfile}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      required
                      disabled={isLoadingProfile}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your full delivery address"
                    required
                    disabled={isLoadingProfile}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      required
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                      disabled={isLoadingProfile}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-[#002366]"
                    />
                    <CreditCard className="w-5 h-5 text-[#002366]" />
                    <div>
                      <p className="font-medium">Pay with Paystack</p>
                      <p className="text-sm text-gray-500">Secure payment via card, bank transfer, or USSD</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 font-semibold"
                disabled={paying}
              >
                <Shield className="w-5 h-5 mr-2" />
                Pay ₦{Math.round(getTotalPrice() * 1.075).toLocaleString()} with Paystack
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCheckout(false)}
                className="w-full"
              >
                Back to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShoppingCart className="w-6 h-6" />
            Shopping Cart
          </DialogTitle>
          <DialogDescription>
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </DialogDescription>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some resources to get started</p>
            <Button onClick={onClose} className="cibn-green-gradient text-white">
              Browse Library
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map(item => (
                <MotionDiv
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                    <p className="text-sm text-gray-500">by {item.instructor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      {item.isRestricted && (
                        <Badge className="bg-red-500 text-white text-xs">
                          Restricted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#059669]">₦{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 ml-2 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>

            {/* Promo Code */}
            <div className="space-y-3">
              <Label htmlFor="promo">Promo Code</Label>
              <div className="flex gap-2">
                <Input
                  id="promo"
                  placeholder="Enter promo code"
                  className="flex-1"
                />
                <Button variant="outline">Apply</Button>
              </div>
            </div>

            {/* Order Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₦{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT (7.5%)</span>
                    <span>₦{Math.round(getTotalPrice() * 0.075).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-[#059669]">
                      ₦{Math.round(getTotalPrice() * 1.075).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  if (!isAuthenticated) {
                    const handleCheckout = () => {
                      if (!isAuthenticated) {
                        onClose()
                        // Trigger login modal
                        window.dispatchEvent(new Event('open:login'))
                        return
                      }
                      setShowCheckout(true)
                    }
                    handleCheckout()
                  } else {
                    setShowCheckout(true)
                  }
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 font-semibold"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure checkout powered by Paystack</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}