"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    Eye, EyeOff,
    Lock,
    Mail, Phone,
    Shield, Sparkles,
    User
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestSignin?: () => void
}

export function SignupModal({ isOpen, onClose, onRequestSignin }: SignupModalProps) {
  const { register, isLoading } = useAuth() as any

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = useMemo(() => (
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    password === confirmPassword &&
    agree
  ), [fullName, email, password, confirmPassword, agree])

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }, [password])

  const onOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError('Please complete all required fields and accept the terms.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await register({
        full_name: fullName,
        email,
        password,
        phone,
        role: 'subscriber',
      })
      onClose()
      onRequestSignin?.()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 pt-8 pb-6 bg-gradient-to-r from-[#002366] to-[#059669] text-white relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <DialogTitle className="text-3xl font-bold">Join CIBN Library</DialogTitle>
            </div>
            <DialogDescription className="text-white/90 text-base">
              Create your account and unlock access to professional resources
            </DialogDescription>
          </DialogHeader>
          
          {/* Benefits badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />Unlimited Access
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <Shield className="w-3 h-3 mr-1" />Secure & Private
            </Badge>
          </div>
        </motion.div>

        {/* Body */}
        <div className="px-8 py-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="su-fullname" className="text-gray-700 font-medium">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </Label>
              <Input 
                id="su-fullname" 
                value={fullName} 
                onChange={(e)=>setFullName(e.target.value)} 
                onClear={() => setFullName('')}
                placeholder="Enter your full name"
                className="h-11 border-gray-300 focus:border-[#059669] focus:ring-[#059669]"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="su-email" className="text-gray-700 font-medium">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </Label>
                <Input 
                  id="su-email" 
                  type="email" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  onClear={() => setEmail('')}
                  placeholder="your.email@example.com"
                  className="h-11 border-gray-300 focus:border-[#059669] focus:ring-[#059669]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-phone" className="text-gray-700 font-medium">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone <span className="text-gray-400 text-xs">(optional)</span>
                </Label>
                <Input 
                  id="su-phone" 
                  type="tel"
                  value={phone} 
                  onChange={(e)=>setPhone(e.target.value)} 
                  onClear={() => setPhone('')}
                  placeholder="+234 800 000 0000"
                  className="h-11 border-gray-300 focus:border-[#059669] focus:ring-[#059669]"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="su-password" className="text-gray-700 font-medium">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="su-password" 
                    type={showPw ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e)=>setPassword(e.target.value)} 
                    onClear={() => setPassword('')}
                    placeholder="Create a strong password"
                    className="h-11 pr-10 border-gray-300 focus:border-[#059669] focus:ring-[#059669]"
                  />
                  <button 
                    type="button" 
                    onClick={()=>setShowPw(s=>!s)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Password strength: <span className={`font-semibold ${passwordStrength.score <= 2 ? 'text-red-600' : passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
                {password && password.length > 0 && password.length < 6 && (
                  <div className="flex items-start gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Must be at least 6 characters</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-confirm" className="text-gray-700 font-medium">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input 
                    id="su-confirm" 
                    type={showConfirmPw ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e)=>setConfirmPassword(e.target.value)} 
                    onClear={() => setConfirmPassword('')}
                    placeholder="Confirm your password"
                    className="h-11 pr-10 border-gray-300 focus:border-[#059669] focus:ring-[#059669]"
                  />
                  <button 
                    type="button" 
                    onClick={()=>setShowConfirmPw(s=>!s)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <div className="flex items-start gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Passwords do not match</span>
                  </div>
                )}
                {confirmPassword && confirmPassword === password && password.length >= 6 && (
                  <div className="flex items-start gap-1 text-xs text-green-600">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agree} 
                onChange={(e)=>setAgree(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#059669] focus:ring-[#059669]"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-[#059669] hover:underline font-medium" onClick={(e) => e.stopPropagation()}>Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[#059669] hover:underline font-medium" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
              </span>
            </label>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#059669] to-[#048558] hover:from-[#048558] hover:to-[#037347] text-white shadow-lg hover:shadow-xl transition-all" 
              disabled={!valid || submitting || isLoading}
            >
              {submitting || isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating your account...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {/* Sign in link */}
            <div className="text-center pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={()=>{ onClose(); onRequestSignin?.() }} 
                  className="text-[#002366] hover:text-[#059669] font-semibold hover:underline cursor-pointer transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
