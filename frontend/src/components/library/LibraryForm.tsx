import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Image as ImageIcon, Video, FileText, X, Tag as TagIcon, DollarSign, Lock, Globe, Clock, Upload } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LibraryFormData } from './types';

interface LibraryFormProps {
  formData: LibraryFormData;
  onFormChange: (data: Partial<LibraryFormData>) => void;
  onFileUpload: (file: File, type: 'image' | 'content', field: 'image' | 'fileUrl') => Promise<string>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  categories: string[];
  availableTags: string[];
  isUploading: boolean;
  uploadProgress: number;
  isEditing: boolean;
}

export function LibraryForm({
  formData,
  onFormChange,
  onFileUpload,
  onSubmit,
  onCancel,
  onDelete,
  categories,
  availableTags,
  isUploading,
  uploadProgress,
  isEditing,
}: LibraryFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(formData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'content') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const field = type === 'image' ? 'image' : 'fileUrl';
    
    try {
      const fileUrl = await onFileUpload(file, type, field);
      onFormChange({ [field]: fileUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error (e.g., show toast)
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onFormChange({ tags: newTags });
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!selectedTags.includes(newTag)) {
        const newTags = [...selectedTags, newTag];
        setSelectedTags(newTags);
        onFormChange({ tags: newTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    onFormChange({ tags: newTags });
  };

  const getFileTypeIcon = () => {
    switch (formData.type) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => onFormChange({ title: e.target.value })}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.description}
                  onChange={(e) => onFormChange({ description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    value={formData.type}
                    onChange={(e) => onFormChange({ type: e.target.value as any })}
                  >
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    value={formData.category}
                    onChange={(e) => onFormChange({ category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">File</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Upload {formData.type === 'image' ? 'Image' : formData.type === 'video' ? 'Video' : 'Document'}</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {getFileTypeIcon()}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'content')}
                          accept={
                            formData.type === 'image' 
                              ? 'image/*' 
                              : formData.type === 'video' 
                                ? 'video/*' 
                                : '.pdf,.doc,.docx,.txt'
                          }
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.type === 'image'
                        ? 'PNG, JPG, GIF up to 10MB'
                        : formData.type === 'video'
                        ? 'MP4, WebM up to 50MB'
                        : 'PDF, DOC, DOCX, TXT up to 10MB'}
                    </p>
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              {formData.type === 'image' && (
                <div>
                  <Label>Thumbnail (Optional)</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload a custom thumbnail (leave blank to use the first frame of the video)
                  </p>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a thumbnail</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'image')}
                            accept="image/*"
                            ref={imageInputRef}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Access */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Access</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Switch
                  checked={formData.isFree}
                  onChange={(checked) => onFormChange({ isFree: checked })}
                  className={cn(
                    formData.isFree ? 'bg-green-500' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  <span className="sr-only">Free content</span>
                  <span
                    className={cn(
                      formData.isFree ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  >
                    <span
                      className={cn(
                        formData.isFree
                          ? 'opacity-0 duration-100 ease-out'
                          : 'opacity-100 duration-200 ease-in',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <DollarSign className="h-3 w-3 text-gray-400" />
                    </span>
                    <span
                      className={cn(
                        formData.isFree
                          ? 'opacity-100 duration-200 ease-in'
                          : 'opacity-0 duration-100 ease-out',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <Globe className="h-3 w-3 text-green-500" />
                    </span>
                  </span>
                </Switch>
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formData.isFree ? 'Free content' : 'Paid content'}
                  </span>
                  <p className="text-sm text-gray-500">
                    {formData.isFree
                      ? 'This content will be available for free to all users.'
                      : 'Set a price for this content.'}
                  </p>
                </span>
              </div>

              {!formData.isFree && (
                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <Input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => onFormChange({ price: parseFloat(e.target.value) || 0 })}
                      className="pl-7"
                      placeholder="0.00"
                      required={!formData.isFree}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Switch
                  checked={formData.isExclusive}
                  onChange={(checked) => onFormChange({ isExclusive: checked })}
                  className={cn(
                    formData.isExclusive ? 'bg-purple-500' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                  )}
                >
                  <span className="sr-only">Exclusive content</span>
                  <span
                    className={cn(
                      formData.isExclusive ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  >
                    <span
                      className={cn(
                        formData.isExclusive
                          ? 'opacity-0 duration-100 ease-out'
                          : 'opacity-100 duration-200 ease-in',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <Globe className="h-3 w-3 text-gray-400" />
                    </span>
                    <span
                      className={cn(
                        formData.isExclusive
                          ? 'opacity-100 duration-200 ease-in'
                          : 'opacity-0 duration-100 ease-out',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <Lock className="h-3 w-3 text-purple-500" />
                    </span>
                  </span>
                </Switch>
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Exclusive content</span>
                  <p className="text-sm text-gray-500">
                    {formData.isExclusive
                      ? 'This content will only be available to premium members.'
                      : 'This content will be available to all users.'}
                  </p>
                </span>
              </div>

              <div className="flex items-center">
                <Switch
                  checked={formData.isPublic}
                  onChange={(checked) => onFormChange({ isPublic: checked })}
                  className={cn(
                    formData.isPublic ? 'bg-blue-500' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  <span className="sr-only">Publish status</span>
                  <span
                    className={cn(
                      formData.isPublic ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  >
                    <span
                      className={cn(
                        formData.isPublic
                          ? 'opacity-0 duration-100 ease-out'
                          : 'opacity-100 duration-200 ease-in',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <Lock className="h-3 w-3 text-gray-400" />
                    </span>
                    <span
                      className={cn(
                        formData.isPublic
                          ? 'opacity-100 duration-200 ease-in'
                          : 'opacity-0 duration-100 ease-out',
                        'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                      )}
                      aria-hidden="true"
                    >
                      <Globe className="h-3 w-3 text-blue-500" />
                    </span>
                  </span>
                </Switch>
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formData.isPublic ? 'Public' : 'Private'}
                  </span>
                  <p className="text-sm text-gray-500">
                    {formData.isPublic
                      ? 'This content will be visible to everyone.'
                      : 'Only you can see this content.'}
                  </p>
                </span>
              </div>

              {formData.isPublic && (
                <div>
                  <Label htmlFor="publishAt">Publish Date & Time</Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        name="publishAt"
                        id="publishAt"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        value={formData.publishAt || ''}
                        onChange={(e) => onFormChange({ publishAt: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to publish immediately.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
            </div>
            <div className="p-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
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

          {/* Tags */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add tags to help users find your content.
              </p>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Remove tag</span>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div>
                <Label htmlFor="tag-input">Add tags</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    id="tag-input"
                    className="pl-10"
                    placeholder="Type and press enter to add"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Popular tags:{' '}
                    {availableTags
                      .filter((tag) => !selectedTags.includes(tag))
                      .slice(0, 5)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className="text-blue-600 hover:text-blue-800 mr-1"
                        >
                          {tag}
                        </button>
                      ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:col-span-3 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isUploading}
          className="w-full flex items-center justify-center py-3 px-6 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
          onClick={onCancel}
          disabled={isUploading}
          className="w-full py-3 px-6 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isUploading}
            className="w-full py-3 px-6 text-base font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Delete Content
          </button>
        )}
      </div>
    </form>
  );
}
