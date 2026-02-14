'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { uploadService } from '@/lib/api/upload'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Crown, FileText, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface ContentFormData {
  id?: string
  title: string
  description: string
  content_type: 'document' | 'video' | 'audio' | 'physical'
  category: string
  price: number
  is_exclusive: boolean
  is_active: boolean
  stock_quantity?: number
  file_url?: string
  image_url?: string
  tags?: string[]
}

interface ContentFormSlideoutProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ContentFormData) => Promise<void>
  initialData?: Partial<ContentFormData>
  isEditing?: boolean
}

const steps = [
  { id: 1, title: 'Basic Info', description: 'Title and description' },
  { id: 2, title: 'Content Type', description: 'Type and category' },
  { id: 3, title: 'Pricing', description: 'Price and availability' },
  { id: 4, title: 'Media', description: 'Files and images' },
]

export function ContentFormSlideout({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false
}: ContentFormSlideoutProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [fileUploadProgress, setFileUploadProgress] = useState(0)
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [fileUploadComplete, setFileUploadComplete] = useState(false)
  const [thumbnailUploadComplete, setThumbnailUploadComplete] = useState(false)
  const [uploadLimits, setUploadLimits] = useState<any>(null)
  
  // Fetch upload limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const { adminSettingsApi } = await import('@/lib/api/admin');
        const limits = await adminSettingsApi.getUploadSettings();
        setUploadLimits(limits);
      } catch (error) {
        console.error('Failed to load upload limits:', error);
      }
    };
    fetchLimits();
  }, []);

  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    content_type: 'document',
    category: 'other',
    price: 0,
    is_exclusive: false,
    is_active: true,
    stock_quantity: 0,
    tags: [],
    ...initialData
  })

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: '',
        description: '',
        content_type: 'document',
        category: 'other',
        price: 0,
        is_exclusive: false,
        is_active: true,
        stock_quantity: 0,
        tags: [],
        file_url: '',
        image_url: '',
        ...initialData
      })
      // Reset upload states when opening with initial data
      if (initialData.file_url) {
        setFileUploadComplete(true)
      }
      if (initialData.image_url) {
        setThumbnailUploadComplete(true)
      }
    }
  }, [initialData])

  const handleChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Upload file to backend
  const uploadFile = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    try {
      // Simulate progress for UX (actual upload happens instantly via API)
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 15
        if (progress <= 90) {
          onProgress(progress)
        }
      }, 100)
      
      // Actual upload
      const response = await uploadService.uploadFile(file)
      
      // Complete progress
      clearInterval(progressInterval)
      onProgress(100)
      
      return response.file_url
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  // Get accepted file types based on content type
  const getAcceptedFileTypes = () => {
    switch (formData.content_type) {
      case 'document':
        return '.pdf,.doc,.docx,.txt,.rtf'
      case 'video':
        return '.mp4,.mov,.avi,.mkv,.webm'
      case 'audio':
        return '.mp3,.wav,.aac,.m4a,.flac'
      default:
        return '*'
    }
  }

  const getFileTypeDescription = () => {
    switch (formData.content_type) {
      case 'document':
        return 'PDF, DOC, DOCX, TXT, RTF'
      case 'video':
        return 'MP4, MOV, AVI, MKV, WebM'
      case 'audio':
        return 'MP3, WAV, AAC, M4A, FLAC'
      default:
        return 'All files'
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file size against dynamic limits
    if (uploadLimits) {
      const typeKey = `max_file_size_${formData.content_type}`;
      // @ts-ignore
      const limit = uploadLimits[typeKey];
      
      if (limit !== null && limit !== undefined && file.size > limit) {
        alert(`File size exceeds the limit of ${(limit / (1024 * 1024)).toFixed(0)}MB.`);
        return;
      }
    }

    setIsUploadingFile(true)
    setFileUploadProgress(0)
    setFileUploadComplete(false)
    
    try {
      const url = await uploadFile(file, setFileUploadProgress)
      handleChange('file_url', url)
      setFileUploadComplete(true)
    } catch (error) {
      console.error('File upload failed:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploadingFile(false)
    }
  }, [])

  const handleThumbnailUpload = useCallback(async (file: File) => {
    // Validate thumbnail size
    if (uploadLimits) {
      const limit = uploadLimits['max_file_size_image'];
      if (limit !== null && limit !== undefined && file.size > limit) {
        alert(`Thumbnail size exceeds the limit of ${(limit / (1024 * 1024)).toFixed(0)}MB.`);
        return;
      }
    }

    setIsUploadingThumbnail(true)
    setThumbnailUploadProgress(0)
    setThumbnailUploadComplete(false)
    
    try {
      const url = await uploadFile(file, setThumbnailUploadProgress)
      handleChange('image_url', url)
      setThumbnailUploadComplete(true)
    } catch (error) {
      console.error('Thumbnail upload failed:', error)
      alert('Failed to upload thumbnail. Please try again.')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent, type: 'file' | 'thumbnail') => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (type === 'file') {
        handleFileUpload(file)
      } else {
        handleThumbnailUpload(file)
      }
    }
  }, [handleFileUpload, handleThumbnailUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'file') {
        handleFileUpload(file)
      } else {
        handleThumbnailUpload(file)
      }
    }
  }, [handleFileUpload, handleThumbnailUpload])

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      // Reset all form states
      setCurrentStep(1)
      setFormData({
        title: '',
        description: '',
        content_type: 'document',
        category: 'other',
        price: 0,
        is_exclusive: false,
        is_active: true,
        stock_quantity: 0,
        tags: [],
        file_url: '',
        image_url: ''
      })
      // Reset upload states
      setFileUploadProgress(0)
      setThumbnailUploadProgress(0)
      setFileUploadComplete(false)
      setThumbnailUploadComplete(false)
      setIsUploadingFile(false)
      setIsUploadingThumbnail(false)
      onClose()
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0
      case 2:
        return formData.content_type && formData.category
      case 3:
        return formData.price >= 0
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setFileUploadProgress(0)
    setThumbnailUploadProgress(0)
    setFileUploadComplete(false)
    setThumbnailUploadComplete(false)
    setIsUploadingFile(false)
    setIsUploadingThumbnail(false)
    // Reset form data
    setFormData({
      title: '',
      description: '',
      content_type: 'document',
      category: 'other',
      price: 0,
      is_exclusive: false,
      is_active: true,
      stock_quantity: 0,
      tags: [],
      file_url: '',
      image_url: ''
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Slideout Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002366] to-[#059669] text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Content' : 'Add New Content'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center w-full">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep > step.id
                            ? 'bg-white text-[#059669]'
                            : currentStep === step.id
                            ? 'bg-white text-[#002366]'
                            : 'bg-white/30 text-white/70'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className="text-xs mt-1 text-white/90 hidden sm:block">
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 transition-all ${
                          currentStep > step.id ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Basic Information
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Start with the essential details about your content.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium">
                            Title *
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            onClear={() => handleChange('title', '')}
                            placeholder="Enter content title..."
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-sm font-medium">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            onClear={() => handleChange('description', '')}
                            placeholder="Describe your content..."
                            rows={6}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Content Type */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Content Type & Category
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Classify your content for better organization.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="content_type" className="text-sm font-medium">
                            Content Type *
                          </Label>
                          <Select
                            value={formData.content_type}
                            onValueChange={(value: any) =>
                              handleChange('content_type', value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="document">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Document
                                </div>
                              </SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="category" className="text-sm font-medium">
                            Category *
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleChange('category', value)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="exam_text">Exam Text</SelectItem>
                              <SelectItem value="cibn_publication">
                                CIBN Publication
                              </SelectItem>
                              <SelectItem value="research_paper">
                                Research Paper
                              </SelectItem>
                              <SelectItem value="stationery">Stationery</SelectItem>
                              <SelectItem value="souvenir">Souvenir</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pricing */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Pricing & Availability
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Set the price and access level for your content.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {!formData.is_exclusive && (
                          <div>
                            <Label htmlFor="price" className="text-sm font-medium">
                              Price (₦)
                            </Label>
                            <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">₦</span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.price || ''}
                      onChange={(e) =>
                        handleChange('price', parseFloat(e.target.value) || 0)
                      }
                      onClear={() => handleChange('price', 0)}
                    />
                  </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Set to 0 to make this content free
                            </p>
                          </div>
                        )}

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                          <div className="flex items-start gap-3">
                            <div className="bg-[#FFD700] rounded-full p-2">
                              <Crown className="w-5 h-5 text-[#002366]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="is_exclusive" className="font-semibold text-gray-900">
                                  Exclusive Content
                                </Label>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${formData.is_exclusive ? 'text-amber-600' : 'text-gray-500'}`}>
                                    {formData.is_exclusive ? 'Exclusive' : 'Standard'}
                                  </span>
                                  <Switch
                                    id="is_exclusive"
                                    checked={formData.is_exclusive}
                                    onCheckedChange={(checked) =>
                                      handleChange('is_exclusive', checked)
                                    }
                                  />
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {formData.is_exclusive 
                                  ? 'Only CIBN staff members can access this content for free'
                                  : 'Only CIBN staff members can access this content'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="is_active" className="font-semibold text-gray-900">
                                  Active Status
                                </Label>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${formData.is_active ? 'text-[#059669]' : 'text-gray-500'}`}>
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                  <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                      handleChange('is_active', checked)
                                    }
                                  />
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Inactive content won't be visible to users
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Media */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Media & Files
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Upload files and images for your content.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Content File Dropzone */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Content File</Label>
                          <div
                            onDrop={(e) => handleFileDrop(e, 'file')}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative"
                          >
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e, 'file')}
                              accept={getAcceptedFileTypes()}
                            />
                            <label
                              htmlFor="file-upload"
                              className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                                isUploadingFile
                                  ? 'border-blue-400 bg-blue-50'
                                  : fileUploadComplete
                                  ? 'border-green-400 bg-green-50'
                                  : 'border-gray-300 hover:border-[#059669] hover:bg-gray-50'
                              }`}
                            >
                              {isUploadingFile ? (
                                <div className="space-y-3">
                                  <Loader2 className="w-10 h-10 text-blue-600 mx-auto animate-spin" />
                                  <p className="text-sm font-medium text-blue-900">Uploading...</p>
                                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-blue-600 h-full transition-all duration-300"
                                      style={{ width: `${fileUploadProgress}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-blue-700">{Math.round(fileUploadProgress)}%</p>
                                </div>
                              ) : fileUploadComplete || formData.file_url ? (
                                <div className="space-y-2">
                                  <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                                  <p className="text-sm font-medium text-green-900">File Uploaded</p>
                                  {formData.file_url && (
                                    <p className="text-xs text-green-700 break-all px-4">
                                      {formData.file_url.split('/').pop()}
                                    </p>
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setFileUploadComplete(false)
                                      handleChange('file_url', '')
                                    }}
                                    className="mt-2"
                                  >
                                    Upload Different File
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                                  <p className="text-sm font-medium text-gray-900">
                                    Drop your {formData.content_type} file here or click to browse
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Supported formats: {getFileTypeDescription()}
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Thumbnail Dropzone */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Thumbnail Image</Label>
                          <div
                            onDrop={(e) => handleFileDrop(e, 'thumbnail')}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative"
                          >
                            <input
                              type="file"
                              id="thumbnail-upload"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e, 'thumbnail')}
                              accept="image/*"
                            />
                            <label
                              htmlFor="thumbnail-upload"
                              className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                                isUploadingThumbnail
                                  ? 'border-blue-400 bg-blue-50'
                                  : thumbnailUploadComplete
                                  ? 'border-green-400 bg-green-50'
                                  : 'border-gray-300 hover:border-[#059669] hover:bg-gray-50'
                              }`}
                            >
                              {isUploadingThumbnail ? (
                                <div className="space-y-3">
                                  <Loader2 className="w-10 h-10 text-blue-600 mx-auto animate-spin" />
                                  <p className="text-sm font-medium text-blue-900">Uploading...</p>
                                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-blue-600 h-full transition-all duration-300"
                                      style={{ width: `${thumbnailUploadProgress}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-blue-700">{Math.round(thumbnailUploadProgress)}%</p>
                                </div>
                              ) : thumbnailUploadComplete || formData.image_url ? (
                                <div className="space-y-2">
                                  <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                                  <p className="text-sm font-medium text-green-900">Thumbnail Uploaded</p>
                                  {formData.image_url && (
                                    <div className="mt-3">
                                      <img
                                        src={formData.image_url}
                                        alt="Thumbnail preview"
                                        className="w-32 h-32 object-cover mx-auto rounded-lg border-2 border-green-300"
                                      />
                                    </div>
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setThumbnailUploadComplete(false)
                                      handleChange('image_url', '')
                                    }}
                                    className="mt-2"
                                  >
                                    Upload Different Image
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
                                  <p className="text-sm font-medium text-gray-900">
                                    Drop your image here or click to browse
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Supported formats: JPG, PNG, GIF, WebP
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <div className="text-sm text-gray-600">
                  Step {currentStep} of {steps.length}
                </div>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-[#002366] to-[#059669] hover:opacity-90 text-white gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving || !canProceed()}
                    className="bg-gradient-to-r from-[#002366] to-[#059669] hover:opacity-90 text-white gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {isEditing ? 'Update' : 'Create'} Content
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
