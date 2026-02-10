'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import {
    BarChart3,
    BookOpen,
    Copy,
    Crown,
    Edit,
    Eye,
    FileText, Headphones,
    MoreVertical,
    Package,
    Play,
    Power,
    Trash2,
    Video
} from 'lucide-react'
import { useState } from 'react'

interface ContentItem {
  id: string
  title: string
  description?: string
  type: 'document' | 'image' | 'video' | 'audio' | 'physical'
  category?: string
  tags?: string[]
  fileUrl?: string
  image?: string
  isExclusive?: boolean
  isActive?: boolean
  price?: number
  isFree?: boolean
  createdAt?: string
  updatedAt?: string
}

interface ContentManagementCardProps {
  content: ContentItem
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (item: ContentItem) => void
  onDelete: (id: string) => void
  onDuplicate?: (item: ContentItem) => void
  onToggleActive?: (item: ContentItem) => void
  onPreview?: (item: ContentItem) => void
  onViewStats?: (item: ContentItem) => void
  index?: number
}

const contentTypeIcons = {
  document: FileText,
  video: Video,
  audio: Headphones,
  physical: Package,
  image: FileText,
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'document': return 'bg-blue-100 text-blue-700'
    case 'video': return 'bg-purple-100 text-purple-700'
    case 'audio': return 'bg-green-100 text-green-700'
    case 'physical': return 'bg-orange-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function ContentManagementCard({
  content,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onPreview,
  onViewStats,
  index = 0
}: ContentManagementCardProps) {
  const [showActions, setShowActions] = useState(false)
  const Icon = contentTypeIcons[content.type] || BookOpen

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Card className="relative h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-[#059669] group">
        {/* Selection Checkbox & Menu */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(content.id)}
              className="h-4 w-4"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(content)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(content)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onPreview && (
                <DropdownMenuItem onClick={() => onPreview(content)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
              )}
              {onViewStats && (
                <DropdownMenuItem onClick={() => onViewStats(content)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Stats
                </DropdownMenuItem>
              )}
              {onToggleActive && (
                <DropdownMenuItem onClick={() => onToggleActive(content)}>
                  <Power className={`mr-2 h-4 w-4 ${!content.isActive ? 'text-green-600' : ''}`} />
                  {!content.isActive ? 'Activate' : 'Deactivate'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(content.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Thumbnail/Icon Area */}
        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {content.image ? (
            <img 
              src={content.image} 
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#002366]/10 to-[#059669]/10">
              <div className="absolute top-3 left-3">
                <Badge className={`${getTypeColor(content.type)} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                  <Icon className="w-3 h-3" />
                  {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                {content.type === 'video' ? (
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-[#002366] ml-1" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-[#002366]" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2">
            {!content.isActive && (
              <Badge className="bg-gray-100 text-gray-500 border-gray-200 px-2 py-1 text-xs font-semibold flex items-center gap-1">
                Inactive
              </Badge>
            )}
            {content.isExclusive && (
              <Badge className="bg-[#FFD700] text-[#002366] hover:bg-[#FFD700]/90 px-2 py-1 text-xs font-semibold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Exclusive
              </Badge>
            )}
            {content.isFree ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-2 py-1 text-xs font-semibold">
                Free
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-2 py-1 text-xs font-semibold">
                Paid
              </Badge>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 group-hover:text-[#059669] transition-colors line-clamp-1 mb-1">
            {content.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {content.description || 'No description'}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="capitalize">{content.category?.replace('_', ' ') || 'Other'}</span>
            {content.type === 'physical' && (
              <Badge variant="outline" className="text-xs">
                Physical item
              </Badge>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-xl font-bold text-[#002366]">
                {content.isFree ? 'Free' : `₦${content.price?.toLocaleString() || 0}`}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(content)}
                className="h-8 px-2 hover:bg-[#059669] hover:text-white"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(content.id)}
                className="h-8 px-2 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
