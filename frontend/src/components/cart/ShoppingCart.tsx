'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './useCart';
import { CartItem as CartItemComponent } from './CartItem';
import { CartSummary } from './CartSummary';
import { CheckoutForm } from './CheckoutForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { ordersApi } from '@/lib/api/orders';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
  const { isAuthenticated } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  
  const {
    cartItems,
    isLoading,
    totalPrice,
    vat,
    grandTotal,
    totalItems,
    loadCartItems,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // Load cart when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen, loadCartItems]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      onClose();
      window.dispatchEvent(new Event('open:login'));
      return;
    }
    setShowCheckout(true);
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsPaying(true);
    try {
      // Create order
      const order = await ordersApi.createOrder({
        items: cartItems.map(item => ({
          content_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: '', // Add shipping address if needed
        notes: ''
      });

      // Initialize payment
      const payment = await ordersApi.initializePayment(order.id);
      
      // Redirect to payment page
      window.location.href = payment.authorization_url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };


  if (showCheckout) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <CheckoutForm 
            cartItems={cartItems}
            totalPrice={grandTotal}
            onBack={() => setShowCheckout(false)}
            onPayment={handlePayment}
            isPaying={isPaying}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShoppingCart className="w-6 h-6" />
            Shopping Cart
          </DialogTitle>
          <DialogDescription>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </DialogDescription>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some resources to get started</p>
            <Button onClick={onClose} className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              Browse Library
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                >
                  <CartItemComponent 
                    item={item} 
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <CartSummary 
              totalPrice={totalPrice}
              vat={vat}
              grandTotal={grandTotal}
              onCheckout={handleCheckout}
              onContinueShopping={onClose}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingCart;
