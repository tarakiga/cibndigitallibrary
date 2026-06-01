'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Construction, Clock, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#002366] to-[#059669] mb-8 relative"
          >
            <Construction className="w-12 h-12 text-white" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-[#FFD700]" />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Badge className="bg-[#FFD700] text-[#002366] px-4 py-2 text-sm font-semibold">
              <Clock className="w-4 h-4 mr-2 inline" />
              Under Development
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Resources Coming Soon
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            We're building something amazing! Our Resources section will feature premium banking research, 
            CIBN publications, exam materials, and regulatory updates.
          </motion.p>

          {/* Features Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-2 border-gray-200 overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">What to Expect</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Research Papers</h4>
                      <p className="text-sm text-gray-600">Curated banking research and industry insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📖</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">CIBN Publications</h4>
                      <p className="text-sm text-gray-600">Official publications and journals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Exam Materials</h4>
                      <p className="text-sm text-gray-600">Study guides and practice resources</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Regulatory Updates</h4>
                      <p className="text-sm text-gray-600">Latest banking regulations and compliance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-sm text-gray-500"
          >
            Thank you for your patience. We're working hard to bring you the best resources experience.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}


