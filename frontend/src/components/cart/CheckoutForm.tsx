import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Video, Headphones, FileText } from 'lucide-react';
import { CartItem } from './useCart';
import { Separator } from '@/components/ui/separator';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

interface CheckoutFormProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onPayment: (paymentMethod: string) => Promise<void>;
  isPaying: boolean;
}

export const CheckoutForm = ({
  cartItems,
  totalPrice,
  onBack,
  onPayment,
  isPaying,
}: CheckoutFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // In a real app, you would fetch the user's profile here
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, you would fetch the user's profile here
        // and update the form data
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPayment(paymentMethod);
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.type === 'video' ? (
                    <Video className="w-5 h-5 text-gray-500" />
                  ) : item.type === 'audio' ? (
                    <Headphones className="w-5 h-5 text-gray-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-[#059669]">₦{totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                  disabled={isLoadingProfile}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                  disabled={isLoadingProfile}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  disabled={isLoadingProfile}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+234 800 000 0000"
                  required
                  disabled={isLoadingProfile}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="address">Delivery Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Your full delivery address"
                required
                disabled={isLoadingProfile}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  required
                  disabled={isLoadingProfile}
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  disabled={isLoadingProfile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-[#002366]"
                  />
                  <Shield className="w-5 h-5 text-[#002366]" />
                  <div>
                    <p className="font-medium">Pay with Paystack</p>
                    <p className="text-sm text-gray-500">Secure payment via card, bank transfer, or USSD</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 font-semibold"
                disabled={isPaying || isLoadingProfile}
              >
                {isPaying ? 'Processing...' : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Pay ₦{Math.round(totalPrice * 1.075).toLocaleString()} with Paystack
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={onBack}
                className="w-full"
                disabled={isPaying || isLoadingProfile}
              >
                Back to Cart
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutForm;
