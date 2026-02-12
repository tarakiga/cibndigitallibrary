"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Eye, EyeOff,
    Sparkles
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from "react-hook-form"
import * as z from "zod"


const SignupSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof SignupSchema>;

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestSignin?: () => void
}

export function SignupModal({ isOpen, onClose, onRequestSignin }: SignupModalProps) {
  const { register: registerUser, isLoading } = useAuth() as any
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agree: false as any, // Cast to any to avoid type issues with literal(true)
    },
    mode: "onChange",
  });

  const { watch } = form;
  const password = watch("password");

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
    if (!open) {
      form.reset();
      setError(null);
      onClose();
    }
  }

  const onSubmit = async (data: SignupFormValues) => {
    setError(null)
    setSubmitting(true)
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
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
      <DialogContent className="p-0 overflow-hidden sm:max-w-[550px] border-none bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Premium Header */}
          <div className="relative h-48 flex items-end px-8 pb-8 overflow-hidden bg-gradient-to-br from-[#002366] via-premium-navy to-premium-emerald">
             {/* Animated decorative circles */}
             <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                x: [0, 20, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-24 -left-12 w-64 h-64 bg-premium-gold/10 rounded-full blur-3xl" 
            />

            <div className="relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-premium-gold/20 text-premium-gold border-premium-gold/30 backdrop-blur-md px-3 py-1">
                    Professional Access
                  </Badge>
                </div>
                <DialogTitle className="text-4xl font-bold text-white tracking-tight">Join CIBN</DialogTitle>
                <DialogDescription className="text-white/80 text-lg mt-1 font-medium">
                  Professional Research & Learning
                </DialogDescription>
              </motion.div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-start gap-3 text-sm text-red-600 bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <span className="font-medium leading-relaxed">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Smith"
                              autoComplete="name"
                              className="border-gray-200/50 dark:border-white/10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-medium ml-1" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Email *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="name@email.com"
                                type="email"
                                autoComplete="email"
                                className="border-gray-200/50 dark:border-white/10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="font-medium ml-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+234..."
                                type="tel"
                                autoComplete="tel"
                                className="border-gray-200/50 dark:border-white/10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="font-medium ml-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Password *</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input 
                                  type={showPw ? 'text' : 'password'} 
                                  placeholder="••••••••"
                                  autoComplete="new-password"
                                  className="pr-12 border-gray-200/50 dark:border-white/10 font-mono"
                                  {...field}
                                />
                                <button 
                                  type="button" 
                                  onClick={()=>setShowPw(s=>!s)} 
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-premium-emerald transition-colors p-1"
                                >
                                  {showPw ? <EyeOff className="w-5 h-5 transition-transform group-hover:scale-110" /> : <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />}
                                </button>
                              </div>
                            </FormControl>
                            
                             {field.value && field.value.length > 0 && (
                              <div className="space-y-1.5 mt-2 px-1">
                                <div className="flex gap-1.5">
                                  {[...Array(5)].map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                        i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200 dark:bg-white/5'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <FormMessage className="font-medium ml-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Confirm *</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input 
                                  type={showConfirmPw ? 'text' : 'password'} 
                                  placeholder="••••••••"
                                  autoComplete="new-password"
                                  className="pr-12 border-gray-200/50 dark:border-white/10 font-mono"
                                  {...field}
                                />
                                <button 
                                  type="button" 
                                  onClick={()=>setShowConfirmPw(s=>!s)} 
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-premium-emerald transition-colors p-1"
                                >
                                  {showConfirmPw ? <EyeOff className="w-5 h-5 transition-transform group-hover:scale-110" /> : <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="font-medium ml-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.8 }}
                >
                   <FormField
                    control={form.control}
                    name="agree"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <div className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                          <FormControl>
                            <input 
                              type="checkbox" 
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-premium-emerald focus:ring-premium-emerald transition-all"
                            />
                          </FormControl>
                          <span className="text-sm text-gray-500 font-medium leading-relaxed select-none">
                            I accept the{' '}
                            <span className="text-premium-navy dark:text-premium-emerald font-bold hover:underline">Terms</span>
                            {' '}and{' '}
                            <span className="text-premium-navy dark:text-premium-emerald font-bold hover:underline">Privacy Policy</span>
                          </span>
                        </div>
                        <FormMessage className="ml-1 mt-2" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.9 }}
                >
                  <Button 
                    type="submit" 
                    variant="premium"
                    size="lg"
                    className="w-full"
                    disabled={submitting || isLoading}
                  >
                    {submitting || isLoading ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        Securing Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <Sparkles className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 1 }}
                   className="text-center pt-4"
                >
                  <p className="text-sm text-gray-400 font-medium">
                    Already an associate?{' '}
                    <button 
                      type="button" 
                      onClick={()=>{ onClose(); onRequestSignin?.() }} 
                      className="text-premium-navy dark:text-premium-emerald font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              </form>
            </Form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
