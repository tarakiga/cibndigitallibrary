'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, Mail, Phone, Calendar, Shield, Key, Camera, 
  CheckCircle2, AlertCircle, Crown
} from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/lib/api/client'
import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const router = useRouter()
  
  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    purchasedContent: 0,
    completedContent: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (user) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      loadStats()
    }
  }, [isAuthenticated, user, router])

  const loadStats = async () => {
    try {
      const purchasedResponse = await apiClient.get('/content/me/purchased')
      setStats(prev => ({
        ...prev,
        purchasedContent: purchasedResponse.data?.length || 0
      }))
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true)
      
      await apiClient.patch('/auth/me', {
        full_name: fullName,
        email: email,
        phone: phone
      })
      
      toast.success('Profile updated successfully!')
      await refreshUser()
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setIsChangingPassword(true)
      
      await apiClient.post('/auth/me/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to change password'
      toast.error(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!isAuthenticated || !user) return null

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return <Badge className="bg-purple-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
      case 'cibn_member':
        return <Badge className="bg-[#FFD700] text-[#002366]"><Crown className="w-3 h-3 mr-1" />CIBN Member</Badge>
      default:
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Subscriber</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#002366] to-[#059669] rounded-2xl p-8 mb-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarFallback className="text-2xl bg-[#FFD700] text-[#002366]">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full bg-white text-[#002366] hover:bg-gray-100 shadow-lg"
                disabled
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.full_name}</h1>
                {getRoleBadge()}
                {user.is_verified && (
                  <CheckCircle2 className="w-5 h-5 text-green-300" title="Verified" />
                )}
              </div>
              <p className="text-white/80 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              {user.phone && (
                <p className="text-white/80 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{stats.purchasedContent}</div>
                <div className="text-xs text-white/70">Content</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                <div className="text-xs text-white/70">Member Since</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Member Since
                    </Label>
                    <Input
                      value={new Date(user.created_at).toLocaleDateString()}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {!user.is_verified && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Your email is not verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="bg-[#059669] hover:bg-[#048558]"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View your account details and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <Badge variant={user.is_verified ? "default" : "secondary"}>
                      {user.is_verified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Account Type</span>
                    {getRoleBadge()}
                  </div>
                  {user.cibn_employee_id && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Employee ID</span>
                      <span className="font-mono font-semibold">{user.cibn_employee_id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is secure by using a strong password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    <Key className="w-4 h-4 inline mr-2" />
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-[#002366] hover:bg-[#001a4d]"
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Security Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    Use a unique password that you don't use anywhere else
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    Include uppercase, lowercase, numbers, and special characters
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    Change your password regularly (every 3-6 months)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    Never share your password with anyone
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
