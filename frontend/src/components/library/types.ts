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
