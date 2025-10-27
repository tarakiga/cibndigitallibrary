'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Crown, Shield, Calendar, AlertCircle, CheckCircle2, 
  ExternalLink, CreditCard, User as UserIcon
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { motion } from 'framer-motion'

export default function CIBNProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('CIBN Profile - Auth Check:', { isAuthenticated, user, role: user?.role })
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.replace('/login')
      return
    }
    if (user?.role !== 'cibn_member') {
      console.log('Not a CIBN member, redirecting to profile')
      router.replace('/profile')
      return
    }
    console.log('CIBN member authenticated, showing profile')
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'cibn_member') return null

  const hasArrears = user.arrears && parseFloat(user.arrears.toString()) > 0
  const arrearsAmount = user.arrears ? parseFloat(user.arrears.toString()) : 0
  const subscriptionAmount = user.annual_subscription ? parseFloat(user.annual_subscription.toString()) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-12">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#002366] via-[#003d9e] to-[#FFD700] rounded-2xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Premium Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-yellow-400 rounded-full blur-xl opacity-40"></div>
              <Avatar className="w-28 h-28 border-4 border-[#FFD700] shadow-2xl relative">
                <AvatarFallback className="text-3xl bg-gradient-to-br from-[#FFD700] to-yellow-500 text-[#002366] font-bold">
                  {user.full_name?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-[#FFD700] rounded-full p-2 shadow-lg">
                <Crown className="w-5 h-5 text-[#002366]" />
              </div>
            </div>

            {/* Member Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
                <Badge className="bg-[#FFD700] text-[#002366] hover:bg-[#FFD700] border-0 shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  CIBN Member
                </Badge>
              </div>
              <p className="text-white/90 flex items-center gap-2 text-lg mb-1">
                <Shield className="w-4 h-4" />
                Member ID: <span className="font-mono font-semibold">{user.cibn_employee_id}</span>
              </p>
              <p className="text-white/80 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              {!hasArrears ? (
                <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-400 rounded-xl p-4">
                  <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-2" />
                  <p className="font-semibold">Account Active</p>
                  <p className="text-xs text-white/80">No outstanding dues</p>
                </div>
              ) : (
                <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400 rounded-xl p-4">
                  <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-2" />
                  <p className="font-semibold">Payment Required</p>
                  <p className="text-xs text-white/80">Outstanding arrears</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Alert if has arrears */}
        {hasArrears && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-2 border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 rounded-full p-3">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Outstanding Payment Required</h3>
                    <p className="text-red-800 mb-4">
                      Your account has outstanding arrears of <span className="font-bold">₦{arrearsAmount.toLocaleString()}</span>. 
                      Please clear your dues to maintain uninterrupted access to exclusive CIBN content and member benefits.
                    </p>
                    <Button
                      onClick={() => window.open('https://portal.cibng.org/cb_login.asp', '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Make Payment on CIBN Portal
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Member Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border-t-4 border-t-[#002366]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#002366]" />
                  Member Details
                </CardTitle>
                <CardDescription>Your CIBN membership information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Full Name</span>
                    <span className="font-semibold text-gray-900">{user.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Member ID</span>
                    <span className="font-mono font-semibold text-gray-900">{user.cibn_employee_id}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Email Address</span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Phone Number</span>
                      <span className="text-sm text-gray-900">{user.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Information Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg border-t-4 border-t-[#FFD700]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#FFD700]" />
                  Financial Information
                </CardTitle>
                <CardDescription>Your subscription and payment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    hasArrears ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {hasArrears ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      <span className={`text-sm font-medium ${hasArrears ? 'text-red-900' : 'text-green-900'}`}>
                        Outstanding Arrears
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${hasArrears ? 'text-red-600' : 'text-green-600'}`}>
                      ₦{arrearsAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                    <span className="text-sm font-medium text-blue-900">Annual Subscription</span>
                    <span className="text-xl font-bold text-blue-600">₦{subscriptionAmount.toLocaleString()}</span>
                  </div>
                </div>

                {hasArrears && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-3">
                      To clear your arrears and maintain full access to exclusive content:
                    </p>
                    <Button
                      onClick={() => window.open('https://portal.cibng.org/cb_login.asp', '_blank')}
                      variant="outline"
                      className="w-full border-[#002366] text-[#002366] hover:bg-[#002366] hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit CIBN Payment Portal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Member Benefits Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#FFD700]" />
                CIBN Member Benefits
              </CardTitle>
              <CardDescription>Exclusive perks available with your membership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Exclusive Content</p>
                    <p className="text-xs text-gray-600 mt-1">Access to premium banking resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Professional Development</p>
                    <p className="text-xs text-gray-600 mt-1">Training materials and certifications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Member Network</p>
                    <p className="text-xs text-gray-600 mt-1">Connect with banking professionals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
