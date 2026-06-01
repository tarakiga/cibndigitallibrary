import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface LibrarySearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: string[];
  onBulkDelete: () => void;
  onAddNew: () => void;
}

export function LibrarySearchBar({
  searchTerm,
  onSearchChange,
  selectedItems,
  onBulkDelete,
  onAddNew,
}: LibrarySearchBarProps) {
  return (
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
          onClick={onAddNew}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </Button>
      </div>
    </div>
  );
}
