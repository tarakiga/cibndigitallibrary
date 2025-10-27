'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'gold' | 'purple'
  index?: number
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-[#059669] to-green-600',
  gold: 'from-[#FFD700] to-yellow-500',
  purple: 'from-purple-500 to-purple-600',
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'blue',
  index = 0 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
