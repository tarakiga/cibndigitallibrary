import { renderHook, act } from '@testing-library/react';

jest.unmock('@/components/cart/useCart')
const useCart = require('@/components/cart/useCart').default;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should load cart items from localStorage', () => {
    const mockItems = [
      { 
        id: 1, 
        title: 'Test Item', 
        type: 'document',
        price: 10, 
        qty: 2,
        instructor: 'Test',
        duration: '1h',
        image: '',
        isPremium: false,
        isRestricted: false
      }
    ];
    
    localStorage.setItem('cart_items', JSON.stringify(mockItems));
    
    const { result } = renderHook(() => useCart());
    
    // The hook should load items from localStorage on mount
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].title).toBe('Test Item');
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(20);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({
        id: 1,
        title: 'New Item',
        type: 'document',
        price: 15,
        instructor: 'Test',
        duration: '1h',
        image: '',
        isPremium: false,
        isRestricted: false
      });
    });

    // Check both the cart items and localStorage
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].title).toBe('New Item');
    expect(result.current.totalItems).toBe(1);
    
    // Verify localStorage was updated
    const storedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    expect(storedCart).toHaveLength(1);
    expect(storedCart[0].title).toBe('New Item');
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart());
    
    // Add initial item
    act(() => {
      result.current.addItem({
        id: 1,
        title: 'Test Item',
        type: 'document',
        price: 10,
        instructor: 'Test',
        duration: '1h',
        image: '',
        isPremium: false,
        isRestricted: false
      });
    });

    // Update quantity
    act(() => {
      result.current.updateQuantity(1, 2); // Add 2 more
    });

    expect(result.current.cartItems[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBe(30);
    
    // Verify localStorage was updated
    const storedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    expect(storedCart[0].qty).toBe(3);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());
    
    // Add initial items
    act(() => {
      result.current.addItem({
        id: 1,
        title: 'Item 1',
        type: 'document',
        price: 10,
        instructor: 'Test',
        duration: '1h',
        image: '',
        isPremium: false,
        isRestricted: false
      });
      result.current.addItem({
        id: 2,
        title: 'Item 2',
        type: 'video',
        price: 20,
        instructor: 'Test',
        duration: '2h',
        image: '',
        isPremium: true,
        isRestricted: false
      });
    });

    // Remove first item
    act(() => {
      result.current.removeItem(1);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].id).toBe(2);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(20);
    
    // Verify localStorage was updated
    const storedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    expect(storedCart).toHaveLength(1);
    expect(storedCart[0].id).toBe(2);
  });

  it('should clear the cart', () => {
    const { result } = renderHook(() => useCart());
    
    // Add initial item
    act(() => {
      result.current.addItem({
        id: 1,
        title: 'Test Item',
        type: 'document',
        price: 10,
        instructor: 'Test',
        duration: '1h',
        image: '',
        isPremium: false,
        isRestricted: false
      });
    });

    // Clear cart
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    
    // Verify localStorage was cleared
    const storedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    expect(storedCart).toHaveLength(0);
  });

  it('should handle loading state', async () => {
    const { result } = renderHook(() => useCart());
    
    // The loading state should be false after the initial render
    // since we're not doing any async operations in the hook
    expect(result.current.isLoading).toBe(false);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({
        id: 1,
        title: 'Persistent Item',
        type: 'document',
        price: 15,
        instructor: 'Test',
        duration: '1h',
        image: '',
        isPremium: false,
        isRestricted: false
      });
    });

    const storedCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    expect(storedCart).toHaveLength(1);
    expect(storedCart[0].title).toBe('Persistent Item');
    expect(storedCart[0].qty).toBe(1);
  });
});
