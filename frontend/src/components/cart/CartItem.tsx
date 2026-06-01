import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Headphones, Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from './useCart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, change: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
        {getTypeIcon(item.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
        <p className="text-sm text-gray-500">by {item.instructor}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {item.type}
          </Badge>
          {item.isRestricted && (
            <Badge className="bg-red-500 text-white text-xs">
              Restricted
            </Badge>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[#059669]">₦{item.price.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="w-6 h-6"
            onClick={() => onUpdateQuantity(item.id, -1)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="w-6 h-6"
            onClick={() => onUpdateQuantity(item.id, 1)}
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 ml-2 text-red-500 hover:text-red-700"
            onClick={() => onRemove(item.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
