import { ChangeEvent } from 'react';

export interface FileUploaderProps {
  /**
   * Callback function that is called when a file is selected
   * @param file The selected file
   * @param type The type of file being uploaded ('image' or 'content')
   * @param field The field this upload is for ('image' or 'fileUrl')
   */
  onFileSelect: (file: File, type: 'image' | 'content', field: 'image' | 'fileUrl') => Promise<string>;
  
  /**
   * The current file URL or base64 string (for preview)
   */
  fileUrl?: string;
  
  /**
   * The type of file to accept (e.g., 'image/*', '.pdf,.doc,.docx')
   */
  accept?: string;
  
  /**
   * The field name this uploader is for
   */
  field: 'image' | 'fileUrl';
  
  /**
   * Label to display above the uploader
   */
  label?: string;
  
  /**
   * Whether to show the preview of the uploaded file
   * @default true
   */
  showPreview?: boolean;
  
  /**
   * Whether the uploader is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Additional class names
   */
  className?: string;
  
  /**
   * Whether the uploader is disabled
   */
  disabled?: boolean;
  
  /**
   * Maximum file size in bytes
   * @default 5MB for images, 20MB for content
   */
  maxSize?: number;
}
