import { LibraryItem, LibraryFormData } from '../../types';

export interface LibraryManagerProps {
  /**
   * Array of library items to display
   */
  items: LibraryItem[];
  
  /**
   * Form data for adding/editing an item
   */
  formData: LibraryFormData;
  
  /**
   * Whether the form is in edit mode
   */
  isEditing: boolean;
  
  /**
   * Whether the component is in a loading state
   */
  isLoading: boolean;
  
  /**
   * Search query for filtering items
   */
  searchQuery: string;
  
  /**
   * Callback when the form data changes
   */
  onFormChange: (data: Partial<LibraryFormData>) => void;
  
  /**
   * Callback when the search query changes
   */
  onSearch: (query: string) => void;
  
  /**
   * Callback to add a new item
   */
  onAddItem: () => Promise<void>;
  
  /**
   * Callback to update an existing item
   */
  onUpdateItem: () => Promise<void>;
  
  /**
   * Callback to delete an item
   */
  onDeleteItem: (id: string) => void;
  
  /**
   * Callback to edit an item
   */
  onEditItem: (id: string) => void;
  
  /**
   * Callback to cancel editing
   */
  onCancelEdit: () => void;
  
  /**
   * Callback when a file is uploaded
   */
  onFileUpload: (file: File, type: 'image' | 'content', field: 'image' | 'fileUrl') => Promise<string>;
  
  /**
   * Callback to reorder items
   */
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
  
  /**
   * Callback to select/deselect items for bulk operations
   */
  onSelectItem: (id: string, selected: boolean) => void;
  
  /**
   * Callback to delete selected items
   */
  onBulkDelete: () => void;
  
  /**
   * Array of selected item IDs
   */
  selectedItems: string[];
  
  /**
   * Whether bulk operations are available
   */
  allowBulkOperations: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Available categories for the dropdown
   */
  categories: string[];
  
  /**
   * Available tags for the tags input
   */
  availableTags: string[];
  
  /**
   * Whether to show the file upload section
   */
  showFileUpload?: boolean;
  
  /**
   * Whether to show the preview section
   */
  showPreview?: boolean;
  
  /**
   * Custom class name for the component
   */
  className?: string;
}
