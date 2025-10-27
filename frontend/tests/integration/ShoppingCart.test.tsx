import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from '@/components/cart';
import { useCart } from '@/components/cart/useCart';

// Mock the useCart hook
jest.mock('@/components/cart/useCart');

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

describe('ShoppingCart', () => {
  const mockClose = jest.fn();
  const mockAddItem = jest.fn();
  const mockRemoveItem = jest.fn();
  const mockUpdateQuantity = jest.fn();
  const mockClearCart = jest.fn();

  const defaultCartState = {
    cartItems: [],
    isLoading: false,
    totalPrice: 0,
    vat: 0,
    grandTotal: 0,
    totalItems: 0,
    loadCartItems: jest.fn(),
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue(defaultCartState);
  });

  it('should render empty cart state', () => {
    render(<ShoppingCart isOpen={true} onClose={mockClose} />);
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some resources to get started')).toBeInTheDocument();
    expect(screen.getByText('Browse Library')).toBeInTheDocument();
  });

  it('should render cart items when cart is not empty', () => {
    const mockItems = [
      {
        id: 1,
        title: 'Test Course',
        type: 'video' as const,
        price: 29.99,
        quantity: 1,
        instructor: 'John Doe',
        duration: '2h',
        image: '',
        isPremium: true,
        isRestricted: false
      }
    ];

    mockUseCart.mockReturnValue({
      ...defaultCartState,
      cartItems: mockItems,
      totalItems: 1,
      totalPrice: 29.99,
      grandTotal: 32.24, // with VAT
    });

    render(<ShoppingCart isOpen={true} onClose={mockClose} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
    expect(screen.getByText('₦29.99')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('should call removeItem when remove button is clicked', () => {
    const mockItems = [
      {
        id: 1,
        title: 'Test Course',
        type: 'video' as const,
        price: 29.99,
        quantity: 1,
        instructor: 'John Doe',
        duration: '2h',
        image: '',
        isPremium: true,
        isRestricted: false
      }
    ];

    mockUseCart.mockReturnValue({
      ...defaultCartState,
      cartItems: mockItems,
      totalItems: 1,
      totalPrice: 29.99,
    });

    render(<ShoppingCart isOpen={true} onClose={mockClose} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });

  it('should show loading state when isLoading is true', () => {
    mockUseCart.mockReturnValue({
      ...defaultCartState,
      isLoading: true,
    });

    render(<ShoppingCart isOpen={true} onClose={mockClose} />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
