import { LibraryItem } from './types';
import { LibraryItem as LibraryItemComponent } from './LibraryItem';

interface LibraryItemListProps {
  items: LibraryItem[];
  selectedItems: string[];
  onSelectItem: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export function LibraryItemList({
  items,
  selectedItems,
  onSelectItem,
  onEdit,
  onDelete,
  onMove,
}: LibraryItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new library item.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg divide-y">
      {items.map((item, index) => (
        <LibraryItemComponent
          key={item.id}
          item={item}
          isSelected={selectedItems.includes(item.id)}
          onSelect={onSelectItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}
