import { FileText, Image as ImageIcon, Video, Check, Edit, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { LibraryItem } from './types';
import { cn } from '@/lib/utils';

interface LibraryItemProps {
  item: LibraryItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

export function LibraryItem({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  isFirst,
  isLast,
}: LibraryItemProps) {
  const getFileTypeIcon = () => {
    switch (item.type) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 group flex items-center">
      <div className="flex items-center w-8">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <div className="ml-4 flex-shrink-0">
        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
          {getFileTypeIcon()}
        </div>
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <div className="flex items-center">
          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
          {item.isExclusive && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Exclusive
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{item.description}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {item.category}
          </span>
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
              +{item.tags.length - 2} more
            </span>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex space-x-2">
        <button
          onClick={() => onEdit(item.id)}
          className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => onMove(item.id, 'up')}
            disabled={isFirst}
            className={cn(
              'text-gray-400 hover:text-gray-600 p-0.5 rounded',
              isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
            )}
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => onMove(item.id, 'down')}
            disabled={isLast}
            className={cn(
              'text-gray-400 hover:text-gray-600 p-0.5 rounded',
              isLast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
            )}
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
