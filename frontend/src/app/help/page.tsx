'use client'

import { UserGuide } from '@/components/content/UserGuide'
import { motion } from 'framer-motion'

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <UserGuide />
      </motion.div>
    </div>
  )
}
