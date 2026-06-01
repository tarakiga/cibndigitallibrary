import { useState } from 'react';
import { LibrarySearchBar } from './LibrarySearchBar';
import { LibraryItemList } from './LibraryItemList';
import { LibraryForm } from './LibraryForm';
import { LibraryItem, LibraryFormData } from './types';

export function LibraryManager({
  items = [],
  searchTerm = '',
  onSearchChange = () => {},
  selectedItems = [],
  onSelectItem = () => {},
  onBulkDelete = () => {},
  formData,
  onFormChange = () => {},
  onFileUpload = async () => '',
  onSubmit = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onMove = () => {},
  isEditing = false,
  onCancelEdit = () => {},
  categories = [],
  availableTags = [],
  isUploading = false,
  uploadProgress = 0,
}: {
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
}) {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddNew = () => {
    onCancelEdit();
    setIsFormVisible(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('library-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    onCancelEdit();
  };

  const handleItemEdit = (id: string) => {
    onEdit(id);
    setIsFormVisible(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('library-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
    if (!isEditing) {
      setIsFormVisible(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <LibrarySearchBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedItems={selectedItems}
        onBulkDelete={onBulkDelete}
        onAddNew={handleAddNew}
      />

      {/* Content Area */}
      {isFormVisible || isEditing ? (
        <div id="library-form">
          <LibraryForm
            formData={formData}
            onFormChange={onFormChange}
            onFileUpload={onFileUpload}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            onDelete={isEditing ? () => onDelete(formData.id || '') : undefined}
            categories={categories}
            availableTags={availableTags}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isEditing={isEditing}
          />
        </div>
      ) : (
        <LibraryItemList
          items={items}
          selectedItems={selectedItems}
          onSelectItem={onSelectItem}
          onEdit={handleItemEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      )}
    </div>
  );
}
