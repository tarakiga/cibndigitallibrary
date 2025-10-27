'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Play, BookOpen, Users, Award, TrendingUp, Star, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { icon: BookOpen, label: 'Digital Resources', value: '10,000+', color: 'text-blue-600' },
    { icon: Users, label: 'Active Members', value: '5,000+', color: 'text-green-600' },
    { icon: Award, label: 'Expert Instructors', value: '200+', color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Success Rate', value: '98%', color: 'text-orange-600' }
  ]

  const features = [
    {
      icon: BookOpen,
      title: 'Extensive Library',
      description: 'Access thousands of banking resources, e-books, and publications',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Play,
      title: 'Video Courses',
      description: 'Learn from industry experts with our premium video content',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Expert Community',
      description: 'Connect with banking professionals and thought leaders',
      gradient: 'from-green-500 to-green-600'
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cibn-gradient opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <Badge className="mb-6 bg-[#FFD700] text-[#002366] px-4 py-2 text-sm font-semibold">
              <Star className="w-4 h-4 mr-2" />
              Nigeria's Premier Banking Education Platform
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Excellence in
              <span className="block text-[#059669]">Banking Education</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Unlock your potential with CIBN's comprehensive digital library. 
              Access premium resources, expert-led courses, and join a community 
              of banking professionals.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl shadow-xl premium-shadow p-6 border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -top-4 -right-4 z-20"
            >
              <div className="bg-[#FFD700] text-[#002366] px-4 py-2 rounded-full font-semibold shadow-lg gold-shadow">
                <Award className="w-4 h-4 inline mr-2" />
                Premium Quality
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}