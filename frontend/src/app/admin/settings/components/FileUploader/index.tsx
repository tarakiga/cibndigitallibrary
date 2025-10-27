'use client';

import { useCallback, useState, useRef, ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { FileUploaderProps } from './types';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { X, Upload, File, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONTENT_SIZE = 20 * 1024 * 1024; // 20MB

export const FileUploader = ({
  onFileSelect,
  fileUrl,
  accept = 'image/*',
  field,
  label,
  showPreview = true,
  isLoading = false,
  error,
  className,
  disabled = false,
  maxSize = field === 'image' ? MAX_IMAGE_SIZE : MAX_CONTENT_SIZE,
}: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(fileUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImageField = field === 'image';
  const fileType = isImageField ? 'image' : 'content';

  // Handle file selection
  const handleFileChange = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
        toast.error(`File is too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }

      // For images, validate the type
      if (isImageField && !file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }

      try {
        setIsUploading(true);
        
        // Create preview for images
        if (isImageField) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }

        // Call the onFileSelect callback with the file
        const result = await onFileSelect(file, fileType, field);
        
        // If the callback returns a URL, use it as the preview
        if (result && !isImageField) {
          setPreviewUrl(result);
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        toast.error('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [field, fileType, isImageField, maxSize, onFileSelect]
  );

  // Handle dropzone file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]);
      }
    },
    [handleFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept.split(',')[0]]: [] } : undefined,
    multiple: false,
    disabled: disabled || isLoading || isUploading,
  });

  // Handle file input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  // Handle remove file
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Call onFileSelect with empty file to clear the value
    onFileSelect(new File([], ''), fileType, field);
  };

  // Get file icon based on file type
  const getFileIcon = () => {
    if (isImageField) return <ImageIcon className="h-5 w-5 text-gray-400" />;
    
    const extension = fileUrl?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <File className="h-5 w-5 text-green-500" />;
      case 'zip':
      case 'rar':
        return <File className="h-5 w-5 text-yellow-500" />;
      default:
        return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get file name from URL
  const getFileName = () => {
    if (!fileUrl) return '';
    return fileUrl.split('/').pop() || 'Download file';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        {...(isImageField ? getRootProps() : {})}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          isImageField ? 'cursor-pointer' : ''
        )}
      >
        <input
          {...(isImageField ? getInputProps() : {})}
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isLoading || isUploading}
        />

        {!isImageField && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop the file here' : 'Drag and drop a file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              {accept} (max {Math.floor(maxSize / (1024 * 1024))}MB)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading || isUploading}
            >
              Select File
            </Button>
          </div>
        )}

        {isImageField && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative w-full">
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={disabled || isLoading || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isDragActive ? 'Drop the image here' : 'Drag and drop an image here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {accept} (max {Math.floor(maxSize / (1024 * 1024))}MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showPreview && !isImageField && previewUrl && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getFileIcon()}
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {getFileName()}
              </a>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-gray-400 hover:text-gray-600"
              disabled={disabled || isLoading || isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {(isLoading || isUploading) && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Spinner className="h-4 w-4" />
            <span>Uploading...</span>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default FileUploader;
