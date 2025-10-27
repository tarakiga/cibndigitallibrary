import React, { useState, useRef, FormEvent } from 'react';
import {
  Search, Plus, Trash2, Edit,
  ArrowUp, ArrowDown, X, FileText,
  Image as ImageIcon, Video, Check,
  Upload, Loader2, Pencil, Tag,
  DollarSign, Lock, Globe, Clock
} from 'lucide-react';
import { Switch } from '@headlessui/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'image' | 'video';
  category: string;
  tags: string[];
  fileUrl: string;
  image?: string;
  isExclusive: boolean;
  price: number;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryFormData extends Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  isPublic?: boolean;
  publishAt?: string | null;
  file?: File | string | null;
}

export interface LibraryManagerProps {
  items: LibraryItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: string[];
  onSelectItem: (id: string, selected: boolean) => void;
  onBulkDelete: () => void;
  formData: LibraryFormData;
  onFormChange: (data: Partial<LibraryFormData>) => void;
  onFileUpload: (file: File, type: 'image' | 'content', field: 'image' | 'fileUrl') => Promise<string>;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  isEditing: boolean;
  onCancelEdit: () => void;
  categories: string[];
  availableTags: string[];
  isUploading: boolean;
  uploadProgress: number;
}

const LibraryManager: React.FC<LibraryManagerProps> = ({
  items = [],
  searchTerm = '',
  onSearchChange = () => { },
  selectedItems = [],
  onBulkDelete = () => { },
  formData = {
    id: '',
    title: '',
    description: '',
    type: 'document',
    category: '',
    tags: [],
    fileUrl: '',
    isExclusive: false,
    price: 0,
    isFree: true,
    isPublic: true,
    publishAt: null,
    file: null,
    image: ''
  },
  onFormChange = () => { },
  onFileUpload = async () => '',
  onSubmit = () => { },
  onEdit = () => { },
  onDelete = () => { },
  onMove = () => { },
  isEditing = false,
  onCancelEdit = () => { },
  categories = [
    'exam_text',
    'cibn_publication',
    'research_paper',
    'stationery',
    'souvenir',
    'other'
  ],
  availableTags = [],
  isUploading = false,
  uploadProgress = 0,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(formData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Format category for display (converts snake_case to Title Case)
  const formatCategoryName = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'content') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const field = type === 'content' ? 'fileUrl' : 'image';
      onFormChange({ [field]: '' });

      const fileUrl = await onFileUpload(file, type, field);
      onFormChange({ [field]: fileUrl });

      if (type === 'image') {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setCoverImage(file);
        toast.success('Preview image uploaded successfully');
      } else {
        setFile(file);
        toast.success('File uploaded successfully');
      }

      if (e.target) {
        e.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setFileInputKey(prev => prev + 1);
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    onFormChange({ tags: newTags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Handle file uploads if needed
      if (file) {
        const fileUrl = await onFileUpload(file, 'content', 'fileUrl');
        onFormChange({ fileUrl });
      }

      if (coverImage) {
        const imageUrl = await onFileUpload(coverImage, 'image', 'image');
        onFormChange({ image: imageUrl });
      }

      // Call the parent's onSubmit with the form data
      await onSubmit(e);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 mr-1" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 mr-1" />;
      case 'video':
        return <Video className="w-4 h-4 mr-1" />;
      default:
        return <FileText className="w-4 h-4 mr-1" />;
    }
  };

  const renderFilePreview = (): JSX.Element => {
    if (formData.type === 'image' && (formData.image || imagePreview)) {
      const imageSrc = imagePreview || (typeof formData.image === 'string' ? formData.image : '');

      return (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={imageSrc}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (formData.fileUrl && formData.type === 'document') {
      return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Document ready: {file?.name || 'File selected'}</p>
        </div>
      );
    }

    if (formData.fileUrl && formData.type === 'video') {
      return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Video className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Video ready: {file?.name || 'File selected'}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <Upload className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm text-gray-500 text-center">
          {formData.type ? `Drag and drop your ${formData.type} here, or click to browse` : 'Select a file type first'}
        </p>
        {formData.type && (
          <p className="text-xs text-gray-400 mt-1">
            {formData.type === 'image'
              ? 'Supports JPG, PNG up to 5MB'
              : formData.type === 'video'
                ? 'Supports MP4, MOV up to 100MB'
                : 'Supports PDF, DOCX, PPTX up to 50MB'}
          </p>
        )}
      </div>
    );
  };

  // Ensure formData has all required fields with defaults
  const safeFormData = {
    ...formData,
    title: formData?.title || '',
    description: formData?.description || '',
    type: formData?.type || 'document',
    category: formData?.category || '',
    tags: formData?.tags || [],
    fileUrl: formData?.fileUrl || '',
    isExclusive: formData?.isExclusive || false,
    price: formData?.price || 0,
    isFree: formData?.isFree ?? true,
    isPublic: formData?.isPublic ?? true,
    publishAt: formData?.publishAt || null,
    file: formData?.file || null,
    image: formData?.image || ''
  };

  // Handle tag input changes
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!selectedTags.includes(newTag) && selectedTags.length < 10) {
        const newTags = [...selectedTags, newTag];
        setSelectedTags(newTags);
        onFormChange({ tags: newTags });
        setTagInput('');
      }
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    onFormChange({ tags: newTags });
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search library..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedItems.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete ({selectedItems.length})</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onCancelEdit();
              document.getElementById('library-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add New</span>
          </Button>
        </div>
      </div>

      {/* Library Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items found. Create your first library item to get started.
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.type === 'image' && <ImageIcon className="h-8 w-8 text-blue-500" />}
                      {item.type === 'document' && <FileText className="h-8 w-8 text-blue-500" />}
                      {item.type === 'video' && <Video className="h-8 w-8 text-blue-500" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      <div id="library-form" className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-2xl shadow-blue-50/50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit Library Item' : 'Add New Library Item'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-100">
                {isEditing ? 'Editing' : 'New Item'}
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-200"></span>
            </div>
          </div>
          <p className="mt-1 text-sm text-blue-100/90">
            {isEditing ? 'Update your content details' : 'Fill in the details to add new content'}
          </p>
        </div>

        <div className="p-0">
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="flex flex-col lg:flex-row h-[70vh] overflow-hidden">
              {/* Left Column - Preview & Upload */}
              <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-gray-100">
                <div className="space-y-6">
                  {/* Content Type Selector */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Content Type</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'document', icon: FileText, label: 'Document' },
                        { type: 'image', icon: ImageIcon, label: 'Image' },
                        { type: 'video', icon: Video, label: 'Video' }
                      ].map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => onFormChange({ type: type as 'document' | 'image' | 'video' })}
                          className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === type
                              ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                              : 'border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50/30'
                            }`}
                        >
                          <div
                            className={`p-2.5 rounded-lg mb-2 transition-colors ${formData.type === type
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                              }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`text-xs font-medium capitalize ${formData.type === type ? 'text-blue-700' : 'text-gray-600'
                              }`}
                          >
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        {formData.type === 'image'
                          ? 'Upload Image'
                          : formData.type === 'video'
                            ? 'Upload Video'
                            : 'Upload Document'}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Required
                      </span>
                    </div>

                    {/* Main Dropzone */}
                    <div
                      className={`group relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${formData.fileUrl || formData.file
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      onClick={() => document.getElementById('content-file')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          handleFileChange({ target: { files: [file] } } as any, 'content');
                        }
                      }}
                    >
                      {isUploading ? (
                        <div className="space-y-3">
                          <div className="mx-auto h-12 w-12 text-blue-500">
                            <Loader2 className="h-full w-full animate-spin" />
                          </div>
                          <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : formData.fileUrl || formData.file ? (
                        <div className="space-y-3">
                          <div className="mx-auto h-12 w-12 text-green-500">
                            <Check className="h-full w-full" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formData.file?.name || 'File uploaded successfully'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Click to change or drag and drop a new file
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto h-12 w-12 text-blue-500">
                            <UploadCloud className="h-full w-full" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              <span className="text-blue-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              {formData.type === 'image'
                                ? 'JPG, PNG up to 10MB'
                                : formData.type === 'video'
                                  ? 'MP4, WebM up to 50MB'
                                  : 'PDF, DOC, XLS, PPT up to 20MB'}
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        id="content-file"
                        type="file"
                        className="hidden"
                        accept={
                          formData.type === 'image'
                            ? 'image/*'
                            : formData.type === 'video'
                              ? 'video/*'
                              : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
                        }
                        onChange={(e) => handleFileChange(e, 'content')}
                      />
                    </div>

                    {/* Thumbnail Upload (for non-image content) */}
                    {(formData.type === 'document' || formData.type === 'video') && (
                      <div className="space-y-3 pt-4">
                        <h4 className="text-sm font-medium text-gray-700">Thumbnail Image</h4>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${formData.image
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'
                            }`}
                          onClick={() => document.getElementById('thumbnail-file')?.click()}
                        >
                          {formData.image ? (
                            <div className="space-y-2">
                              <div className="mx-auto h-8 w-8 text-green-500">
                                <Check className="h-full w-full" />
                              </div>
                              <p className="text-xs text-gray-600">Thumbnail uploaded</p>
                              <p className="text-xs text-gray-400">Click to change</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="mx-auto h-8 w-8 text-gray-400">
                                <ImageIcon className="h-full w-full" />
                              </div>
                              <p className="text-xs text-gray-500">Click to upload thumbnail</p>
                              <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                            </div>
                          )}
                          <input
                            id="thumbnail-file"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => onFormChange({ title: e.target.value })}
                      placeholder="Enter content title"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <span className="text-xs text-gray-400">
                        {formData.description?.length || 0}/500
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => onFormChange({ description: e.target.value.slice(0, 500) })}
                        className="flex min-h-[120px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none hover:bg-white"
                        placeholder="Provide a detailed description of your content..."
                        rows={4}
                      />
                      <div className="absolute right-3 bottom-3 flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-100 shadow-xs">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => {
                            const textarea = document.getElementById('description') as HTMLTextAreaElement;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selectedText = formData.description.substring(start, end);
                            const newText = formData.description.substring(0, start) + `**${selectedText}**` + formData.description.substring(end);
                            onFormChange({ description: newText });
                          }}
                          aria-label="Bold"
                          title="Bold"
                        >
                          <span className="font-bold">B</span>
                        </button>
                        <span className="h-4 w-px bg-gray-200"></span>
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => {
                            onFormChange({ description: formData.description + '\n• ' });
                          }}
                          aria-label="Bullet points"
                          title="Bullet points"
                        >
                          <span>•</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                      Category
                    </Label>
                    <div className="relative">
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => onFormChange({ category: e.target.value })}
                        className="w-full h-12 pl-4 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 appearance-none hover:bg-white"
                        required
                      >
                        <option value="" disabled>Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {formatCategoryName(category)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              onFormChange({
                                tags: formData.tags.filter((t) => t !== tag),
                              });
                            }}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
                              onFormChange({
                                tags: [...formData.tags, newTag.trim()],
                              });
                              setNewTag('');
                            }
                          }
                        }}
                        placeholder="Add tags..."
                        className="flex-1 min-w-[100px] px-3 py-1 text-sm border-0 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Press Enter or comma to add a tag
                    </p>
                  </div>

                  {/* Pricing & Access */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-medium text-gray-700">Pricing & Access</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Exclusive Content</span>
                        </div>
                        <Switch
                          checked={formData.isExclusive}
                          onChange={(checked) => onFormChange({ isExclusive: checked })}
                          className={`${formData.isExclusive ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${formData.isExclusive ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>

                      {formData.isExclusive && (
                        <div className="space-y-2 pl-8">
                          <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                            Price (₦)
                          </Label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₦</span>
                            </div>
                            <Input
                              type="number"
                              id="price"
                              value={formData.price}
                              onChange={(e) => onFormChange({ price: Number(e.target.value) })}
                              className="pl-8"
                              min="0"
                              step="100"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Public Access</span>
                        </div>
                        <Switch
                          checked={formData.isPublic}
                          onChange={(checked) => onFormChange({ isPublic: checked })}
                          className={`${formData.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>

                      {!formData.isPublic && (
                        <div className="space-y-2 pl-8">
                          <Label htmlFor="publishAt" className="text-sm font-medium text-gray-700">
                            Publish Date & Time
                          </Label>
                          <Input
                            type="datetime-local"
                            id="publishAt"
                            value={formData.publishAt || ''}
                            onChange={(e) => onFormChange({ publishAt: e.target.value })}
                            className="w-full"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancelEdit}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploading || !formData.file || !formData.title}
                      className="px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : isEditing ? (
                        'Update Content'
                      ) : (
                        'Create Content'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Title Section */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mr-2">2</span>
                    <Label>Description</Label>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formData.description?.length || 0}/500
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => onFormChange({ description: e.target.value.slice(0, 500) })}
                    className="flex min-h-[120px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none hover:bg-white"
                    placeholder="Provide a detailed description of your content..."
                    rows={4}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-100 shadow-xs">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      onClick={() => {
                        // Format bold
                        const textarea = document.getElementById('description') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = formData.description.substring(start, end);
                        const newText = formData.description.substring(0, start) + `**${selectedText}**` + formData.description.substring(end);
                        onFormChange({ description: newText });
                      }}
                      aria-label="Bold"
                      title="Bold"
                    >
                      <span className="font-bold">B</span>
                    </button>
                    <span className="h-4 w-px bg-gray-200"></span>
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      onClick={() => {
                        // Add bullet points
                        onFormChange({ description: formData.description + '\n• ' });
                      }}
                      aria-label="Bullet points"
                      title="Bullet points"
                    >
                      <span>•</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Category & Type Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mr-2">3</span>
                    Category
                  </Label>
                  <div className="relative group">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => onFormChange({ category: e.target.value })}
                      className="w-full h-12 pl-12 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 appearance-none hover:bg-white group-hover:shadow-sm"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {formatCategoryName(category)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                      </svg>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content Type Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mr-2">4</span>
                    Content Type
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'document', icon: FileText, label: 'Document' },
                      { type: 'video', icon: Video, label: 'Video' },
                      { type: 'image', icon: ImageIcon, label: 'Image' }
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onFormChange({ type: type as 'document' | 'image' | 'video' })}
                        className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === type
                          ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                          : 'border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50/30'
                          }`}
                      >
                        <div className={`p-2.5 rounded-lg mb-2 transition-colors ${formData.type === type
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                          }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-medium capitalize ${formData.type === type ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-6 pt-2">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mr-2">5</span>
                    <h4 className="text-sm font-medium text-gray-900">Upload Content</h4>
                    <div className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      Required
                    </div>
                  </div>

                  {/* Content File Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      {formData.type === 'image' ? 'Image File' : formData.type === 'video' ? 'Video File' : 'Document File'}
                    </Label>
                    <div
                      className={`group relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${formData.fileUrl
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      onClick={() => document.getElementById('content-file')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const input = document.getElementById('content-file') as HTMLInputElement;
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          input.files = dataTransfer.files;
                          input.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div className="text-sm text-gray-700">
                          <p className="font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.type === 'image'
                              ? 'JPG, PNG up to 10MB'
                              : formData.type === 'video'
                                ? 'MP4, WebM up to 50MB'
                                : 'PDF, DOC, XLS, PPT up to 20MB'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        id="content-file"
                        className="hidden"
                        accept={
                          formData.type === 'image'
                            ? 'image/*'
                            : formData.type === 'video'
                              ? 'video/*'
                              : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
                        }
                        onChange={(e) => handleFileChange(e, 'content')}
                      />
                      {formData.fileUrl ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="p-2.5 rounded-full bg-green-100 text-green-600">
                            <Check className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            {formData.type === 'image' ? 'Image' : formData.type === 'video' ? 'Video' : 'Document'} uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500">
                            {formData.fileUrl.split('/').pop()?.substring(0, 30)}...
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFormChange({ fileUrl: '' });
                              const input = document.getElementById('content-file') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Change file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                            <Upload className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              Drag and drop your {formData.type}, or <span className="text-blue-600">browse</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {formData.type === 'image'
                                ? 'Supports JPG, PNG up to 10MB'
                                : formData.type === 'video'
                                  ? 'Supports MP4, MOV up to 100MB'
                                  : 'Supports PDF, DOC, XLS up to 50MB'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Image Upload (only for non-image content) */}
                  {formData.type !== 'image' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        Cover Image
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Optional
                        </span>
                      </Label>
                      <div
                        className={`group relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${formData.image
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/30'
                          }`}
                        onClick={() => document.getElementById('cover-image')?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const input = document.getElementById('cover-image') as HTMLInputElement;
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            input.files = dataTransfer.files;
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                          } else {
                            toast.error('Please upload a valid image file');
                          }
                        }}
                      >
                        <input
                          type="file"
                          id="cover-image"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                toast.error('Please upload a valid image file');
                                return;
                              }
                              const imageUrl = await onFileUpload(file, 'image', 'image');
                              onFormChange({ image: imageUrl });
                            }
                          }}
                        />
                        {formData.image ? (
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="relative">
                              <img
                                src={formData.image}
                                alt="Cover preview"
                                className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                              />
                              <div className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm border border-gray-200">
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              </div>
                            </div>
                            <div className="text-sm text-gray-700">Cover image uploaded</div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFormChange({ image: '' });
                                const input = document.getElementById('cover-image') as HTMLInputElement;
                                if (input) input.value = '';
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                Drag and drop a cover image, or <span className="text-blue-600">browse</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Recommended: 1200×630px, JPG or PNG, up to 2MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.title || !formData.fileUrl}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${formData.title && formData.fileUrl
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                      : 'bg-blue-300 cursor-not-allowed'
                      }`}
                  >
                    {isEditing ? 'Update Content' : 'Publish Content'}
                  </button>
                </div>
              </div>

              {/* Enhanced Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Tags</Label>
                  <span className="text-xs text-gray-400">
                    {selectedTags.length}/10 tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className="ml-1.5 -mr-1 text-blue-400 hover:text-blue-600 transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {selectedTags.length < 10 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            handleTagToggle(tagInput.trim());
                            setTagInput('');
                            e.preventDefault();
                          }
                        }}
                        className="text-sm px-3 py-1.5 border border-dashed border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                      />
                      {availableTags.filter(tag =>
                        !selectedTags.includes(tag) &&
                        tag.toLowerCase().includes(tagInput.toLowerCase())
                      ).length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                            {availableTags
                              .filter(tag =>
                                !selectedTags.includes(tag) &&
                                tag.toLowerCase().includes(tagInput.toLowerCase())
                              )
                              .map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    handleTagToggle(tag);
                                    setTagInput('');
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {tag}
                                </button>
                              ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type and press Enter to add tags. Max 10 tags allowed.
                </p>
              </div>

              {/* Enhanced Pricing Section */}
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <h3 className="text-base font-medium text-gray-800 flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                  Pricing & Access
                </h3>

                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">Content Access</h4>
                      <p className="text-xs text-gray-500">Choose how users can access this content</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => onFormChange({ isFree: true, price: 0 })}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${formData.isFree
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() => onFormChange({ isFree: false })}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!formData.isFree
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        Premium
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Price Input (only show if not free) */}
                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                      Price
                      <span className="text-xs font-normal text-gray-500 ml-1">(NGN)</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₦</span>
                      </div>
                      <Input
                        type="number"
                        id="price"
                        min="0"
                        step="100"
                        value={formData.price || ''}
                        onChange={(e) => onFormChange({ price: parseInt(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-10 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        NGN
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Set the price for this content. Leave as 0 for free content.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Enhanced Toggles */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Exclusive Content</h4>
                    <p className="text-xs text-gray-500">Only available to premium subscribers</p>
                  </div>
                </div>
                <Switch
                  id="isExclusive"
                  checked={formData.isExclusive}
                  onChange={(checked) => onFormChange({ isExclusive: checked })}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Make Public</h4>
                    <p className="text-xs text-gray-500">Visible to all users</p>
                  </div>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic !== false}
                  onChange={(checked) => onFormChange({ isPublic: checked })}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Schedule Publish */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Schedule Publish</h4>
                    <p className="text-xs text-gray-500">Set a future publish date</p>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    onChange={(e) => onFormChange({ publishAt: e.target.value })}
                    value={formData.publishAt || ''}
                  />
                </div>
              </div>
            </div>
        </div>

        <div className="space-y-4">
          {/* File Type */}
          <div>
            <Label>File Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['document', 'image', 'video'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onFormChange({ type: type as 'document' | 'image' | 'video' })}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 border rounded-md',
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {type === 'document' && <FileText className="h-6 w-6 mb-1" />}
                  {type === 'image' && <ImageIcon className="h-6 w-6 mb-1" />}
                  {type === 'video' && <Video className="h-6 w-6 mb-1" />}
                  <span className="text-sm capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label>File</Label>
            <div className="mt-1">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {formData.fileUrl ? (
                    <div className="p-2 text-center">
                      <Check className="h-8 w-8 text-green-500 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">
                        {formData.fileUrl.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.type === 'image'
                          ? 'PNG, JPG, GIF up to 5MB'
                          : formData.type === 'video'
                            ? 'MP4, MOV up to 100MB'
                            : 'PDF, DOCX, PPTX up to 50MB'}
                      </p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    accept={
                      formData.type === 'image'
                        ? 'image/*'
                        : formData.type === 'video'
                          ? 'video/*'
                          : '.pdf,.doc,.docx,.ppt,.pptx'
                    }
                    onChange={(e) => handleFileChange(e, formData.type, 'fileUrl')}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {isUploading && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Image (if applicable) */}
          {formData.type === 'document' && (
            <div>
              <Label>Preview Image (Optional)</Label>
              <div className="mt-1">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {formData.image ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/placeholder-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                          <Pencil className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">
                          Upload a cover image
                        </p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image', 'image')}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Media Upload */}
      <div className="space-y-6">
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
            Media & Files
          </h3>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === 'image' ? 'Image' : formData.type === 'video' ? 'Video File' : 'Document File'} *
              </Label>
              <div className="mt-1">
                <div
                  className="flex items-center justify-center w-full cursor-pointer"
                  onClick={() => handleFileSelect('content')}
                >
                  {renderFilePreview()}
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={
                      formData.type === 'image'
                        ? 'image/*'
                        : formData.type === 'video'
                          ? 'video/*'
                          : '.pdf,.doc,.docx,.ppt,.pptx'
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFile(file);
                        if (formData.type === 'image') {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            onFormChange({ image: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
                <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
              </Label>
              <div className="mt-1">
                <div
                  className="flex items-center justify-center w-full cursor-pointer"
                  onClick={() => handleFileSelect('image')}
                >
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Cover preview"
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          Click to upload a cover image
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="cover-upload"
                    ref={imageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCoverImage(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          onFormChange({ image: e.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Preview
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              {formData.type === 'image' && formData.image ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : formData.type === 'video' ? (
                <div className="flex flex-col items-center text-gray-400">
                  <Video className="h-10 w-10 mb-2" />
                  <p className="text-sm">Video Preview</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">Document Preview</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 truncate">
                {formData.title || 'Your Content Title'}
              </h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {formData.description || 'A brief description of your content will appear here...'}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {formData.category || 'Category'}
                </span>
                {formData.isFree ? (
                  <span className="text-sm font-medium text-green-600">Free</span>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    ₦{formData.price?.toLocaleString() || '0'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

            {/* Form Actions */ }
  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:col-span-3 pt-6 border-t border-gray-100">
    <button
      type="submit"
      disabled={isSubmitting || isUploading}
      className="w-full flex items-center justify-center py-3 px-6 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isSubmitting || isUploading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isUploading ? 'Uploading...' : 'Saving...'}
        </>
      ) : isEditing ? (
        'Update Content'
      ) : (
        'Publish Content'
      )}
    </button>

    <button
      type="button"
      onClick={onCancelEdit}
      disabled={isSubmitting || isUploading}
      className="w-full py-3 px-6 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      Cancel
    </button>

    {isEditing && (
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            onDelete(formData.id || '');
          }
        }}
        disabled={isSubmitting || isUploading}
        className="w-full py-3 px-6 text-base font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        Delete Content
      </button>
    )}
  </div>
          </form >
        </div >
      </div >
    </div >);
};

export default LibraryManager;
