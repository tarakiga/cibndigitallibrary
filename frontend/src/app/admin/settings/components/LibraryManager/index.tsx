'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, Plus, X, ArrowUp, ArrowDown, Edit2, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LibraryManagerProps } from './types';

// Helper component for the tags input
const TagsInput = ({
  tags,
  availableTags = [],
  onAddTag,
  onRemoveTag,
  placeholder = 'Add tags...',
  className = '',
}: {
  tags: string[];
  availableTags?: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return availableTags;
    return availableTags.filter(
      (tag) =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag)
    );
  }, [inputValue, availableTags, tags]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !tags.includes(value)) {
        onAddTag(value);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleSelectSuggestion = (tag: string) => {
    if (!tags.includes(tag)) {
      onAddTag(tag);
    }
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2 items-center border rounded-md p-2 min-h-10">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm"
        />
      </div>
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          {filteredSuggestions.map((tag) => (
            <div
              key={tag}
              className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onMouseDown={() => handleSelectSuggestion(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const LibraryManager = ({
  items = [],
  formData,
  isEditing,
  isLoading,
  searchQuery,
  onFormChange,
  onSearch,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onEditItem,
  onCancelEdit,
  onFileUpload,
  onMoveItem,
  onSelectItem,
  onBulkDelete,
  selectedItems = [],
  allowBulkOperations = true,
  error,
  categories = [],
  availableTags = [],
  showFileUpload = true,
  showPreview = true,
  className = '',
}: LibraryManagerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onUpdateItem();
      } else {
        await onAddItem();
      }
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    onFormChange({
      id: '',
      title: '',
      description: '',
      type: 'document',
      category: categories[0] || '',
      tags: [],
      image: '',
      fileUrl: '',
      isExclusive: false,
    });
    setActiveTab('form');
  };

  const handleEdit = (id: string) => {
    onEditItem(id);
    setActiveTab('form');
  };

  const handleCancel = () => {
    onCancelEdit();
    setActiveTab('list');
  };

  const handleTagChange = (tags: string[]) => {
    onFormChange({ tags });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Library Manager</h2>
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search library..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleAddNew} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              type="button"
              className={cn(
                'px-4 py-2 text-sm font-medium',
                activeTab === 'list'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => setActiveTab('list')}
            >
              Library Items
            </button>
            <button
              type="button"
              className={cn(
                'px-4 py-2 text-sm font-medium',
                activeTab === 'form'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => activeTab !== 'form' && handleAddNew()}
              disabled={isLoading}
            >
              {isEditing ? 'Edit Item' : 'Add New Item'}
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {allowBulkOperations && selectedItems.length > 0 && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onBulkDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}

              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No items match your search.' : 'No items found.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {allowBulkOperations && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => onSelectItem(item.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                      
                      {item.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.isExclusive && (
                            <Badge variant="secondary" className="text-xs">
                              Exclusive
                            </Badge>
                          )}
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onMoveItem(item.id, 'up')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          disabled={isLoading}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveItem(item.id, 'down')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          disabled={isLoading}
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item.id)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          disabled={isLoading}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          disabled={isLoading}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
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
                      value={formData.description}
                      onChange={(e) => onFormChange({ description: e.target.value })}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter description"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => onFormChange({ type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => onFormChange({ category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Tags</Label>
                    <TagsInput
                      tags={formData.tags}
                      availableTags={availableTags}
                      onAddTag={(tag) =>
                        onFormChange({ tags: [...formData.tags, tag] })
                      }
                      onRemoveTag={(tag) =>
                        onFormChange({
                          tags: formData.tags.filter((t) => t !== tag),
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isExclusive"
                      checked={formData.isExclusive}
                      onChange={(e) =>
                        onFormChange({ isExclusive: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isExclusive" className="text-sm font-medium">
                      Mark as exclusive content
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {showFileUpload && (
                    <>
                      <div>
                        <Label>Cover Image</Label>
                        <FileUploader
                          fileUrl={formData.image}
                          onFileSelect={onFileUpload}
                          field="image"
                          accept="image/*"
                          showPreview={showPreview}
                          disabled={isLoading || isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <Label>Content File</Label>
                        <FileUploader
                          fileUrl={formData.fileUrl}
                          onFileSelect={onFileUpload}
                          field="fileUrl"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.mp4,.mp3,.zip"
                          showPreview={showPreview}
                          disabled={isLoading || isSubmitting}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading || isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    isSubmitting ||
                    !formData.title ||
                    !formData.type ||
                    !formData.category
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </span>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditing ? (
                    'Update Item'
                  ) : (
                    'Create Item'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryManager;
