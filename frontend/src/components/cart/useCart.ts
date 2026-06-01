import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: number;
  title: string;
  type: 'document' | 'video' | 'audio';
  price: number;
  quantity: number;
  instructor: string;
  duration: string;
  image: string;
  isPremium: boolean;
  isRestricted: boolean;
}

const getStoredCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cart_items');
    if (!raw) return [];
    const items = JSON.parse(raw);
    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type || 'document',
      price: item.price || 0,
      quantity: item.qty || item.quantity || 1,
      instructor: item.instructor || '',
      duration: item.duration || '',
      image: item.image || '',
      isPremium: item.isPremium || false,
      isRestricted: item.isRestricted || false,
    }));
  } catch (error) {
    console.error('Error loading cart items:', error);
    return [];
  }
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getStoredCartItems());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);

  // Load cart items from localStorage
  const loadCartItems = useCallback(() => {
    setIsLoading(true);
    const items = getStoredCartItems();
    setCartItems(items);
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  // Auto-load cart on mount
  useEffect(() => {
    if (!isInitialized) {
      loadCartItems();
    }
  }, [isInitialized, loadCartItems]);

  // Save cart items to localStorage
  const persistCart = useCallback((items: CartItem[]) => {
    try {
      const data = items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        type: item.type,
        qty: item.quantity,
      }));
      localStorage.setItem('cart_items', JSON.stringify(data));
      window.dispatchEvent(new Event('cart:changed'));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  }, []);

  // Update quantity of an item
  const updateQuantity = useCallback((id: number, change: number) => {
    setCartItems(prev => {
      const updated = prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );
      persistCart(updated);
      return updated;
    });
  }, [persistCart]);

  // Remove an item from cart
  const removeItem = useCallback((id: number) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      persistCart(updated);
      return updated;
    });
  }, [persistCart]);

  // Add an item to cart
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      let updated: CartItem[];
      
      if (existingItem) {
        updated = prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      
      persistCart(updated);
      return updated;
    });
  }, [persistCart]);

  // Clear the cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart_items');
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = Math.round(totalPrice * 0.075);
  const grandTotal = totalPrice + vat;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    totalPrice,
    vat,
    grandTotal,
    totalItems,
    isInitialized,
    loadCartItems,
    updateQuantity,
    removeItem,
    addItem,
    clearCart,
  };
};

export default useCart;
