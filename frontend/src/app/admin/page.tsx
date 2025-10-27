'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  BarChart3, Users, BookOpen, ShoppingCart, TrendingUp, DollarSign, Upload, 
  FileText, Video, Headphones, Plus, Edit, Trash2, Eye, Download, Star, Clock,
  Settings, LogOut, Search, Filter, Grid, List, AlertCircle, CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.replace('/')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    {
      title: 'Total Revenue',
      value: '₦2,450,000',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Users',
      value: '5,234',
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Content',
      value: '1,847',
      change: '+15.3%',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Orders',
      value: '892',
      change: '+5.7%',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      amount: 7500,
      status: 'completed',
      date: '2024-01-15',
      items: 2
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      amount: 2500,
      status: 'pending',
      date: '2024-01-15',
      items: 1
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      amount: 10000,
      status: 'completed',
      date: '2024-01-14',
      items: 3
    }
  ]

  const contentItems = [
    {
      id: 1,
      title: 'Banking Fundamentals 2024',
      type: 'document',
      category: 'exam-texts',
      price: 2500,
      status: 'published',
      students: 1234,
      rating: 4.8,
      revenue: 3085000,
      date: '2024-01-10'
    },
    {
      id: 2,
      title: 'Advanced Risk Management',
      type: 'video',
      category: 'professional',
      price: 5000,
      status: 'published',
      students: 567,
      rating: 4.9,
      revenue: 2835000,
      date: '2024-01-08'
    },
    {
      id: 3,
      title: 'Customer Service Excellence',
      type: 'audio',
      category: 'soft-skills',
      price: 1500,
      status: 'draft',
      students: 0,
      rating: 0,
      revenue: 0,
      date: '2024-01-12'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Headphones className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Redirecting...</div>
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#059669] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">CIBN Digital Library Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatars/admin.png" />
                <AvatarFallback className="bg-[#059669] text-white">AD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-green-600">{stat.change}</p>
                        </div>
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest transactions in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-600">{order.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{order.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <span className="text-sm text-gray-600">{order.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
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
                <Button className="cibn-green-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {contentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={viewMode === 'list' ? 'flex' : ''}>
                    <CardContent className={`p-6 ${viewMode === 'list' ? 'flex items-center justify-between w-full' : ''}`}>
                      <div className={viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-4'}>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Price:</span>
                            <span className="font-semibold">₦{item.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Students:</span>
                            <span>{item.students.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Revenue:</span>
                            <span className="font-semibold">₦{item.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Manage and track all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <p className="text-gray-600">{order.customer} - {order.email}</p>
                          <p className="text-sm text-gray-500 mt-1">{order.items} items • {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#059669]">₦{order.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600 mb-6">Manage user accounts, roles, and permissions</p>
                  <Button className="cibn-green-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}