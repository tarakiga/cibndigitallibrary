import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield } from 'lucide-react';

interface CartSummaryProps {
  totalPrice: number;
  vat: number;
  grandTotal: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
}

export const CartSummary = ({
  totalPrice,
  vat,
  grandTotal,
  onCheckout,
  onContinueShopping,
  isAuthenticated,
  isLoading = false,
}: CartSummaryProps) => {
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Trigger login modal
      window.dispatchEvent(new Event('open:login'));
      onContinueShopping();
      return;
    }
    onCheckout();
  };

  return (
    <div className="space-y-6">
      {/* Promo Code */}
      <div className="space-y-3">
        <label htmlFor="promo" className="text-sm font-medium">Promo Code</label>
        <div className="flex gap-2">
          <input
            id="promo"
            placeholder="Enter promo code"
            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="outline" className="whitespace-nowrap">
            Apply
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (7.5%)</span>
              <span>₦{vat.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-[#059669]">
                ₦{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleCheckout}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 font-semibold"
          disabled={isLoading}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Proceed to Checkout
        </Button>
        <Button 
          variant="outline" 
          onClick={onContinueShopping}
          className="w-full"
          disabled={isLoading}
        >
          Continue Shopping
        </Button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Shield className="w-4 h-4" />
        <span>Secure checkout powered by Paystack</span>
      </div>
    </div>
  );
};

export default CartSummary;
