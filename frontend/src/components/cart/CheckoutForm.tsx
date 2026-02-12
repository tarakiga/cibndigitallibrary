import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FileText, Headphones, Shield, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CartItem } from './useCart';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const CheckoutSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
});

type CheckoutFormValues = z.infer<typeof CheckoutSchema>;

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
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
    },
    mode: "onBlur"
  });

  // In a real app, you would fetch the user's profile here
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, you would fetch the user's profile here
        // and update the form data using form.reset() or form.setValue()
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const onSubmit = async (data: CheckoutFormValues) => {
    // You can use 'data' here if needed for payment/order creation
    console.log("Checkout Data:", data);
    await onPayment(paymentMethod);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Side: Billing Information */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-premium-navy/10 rounded-2xl">
                <Shield className="w-6 h-6 text-premium-navy" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-premium-navy dark:text-white">Secure Checkout</h3>
                <p className="text-sm text-gray-500 font-medium">Verified billing & delivery details</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10"
                            disabled={isLoadingProfile}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10"
                            disabled={isLoadingProfile}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10"
                            disabled={isLoadingProfile}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+234 ..."
                            className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10"
                            disabled={isLoadingProfile}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery Address *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street, Building No."
                          className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10"
                          disabled={isLoadingProfile}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="ml-1" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">City *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City"
                            className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10"
                            disabled={isLoadingProfile}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">State *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingProfile}
                        >
                          <FormControl>
                            <SelectTrigger className="h-14 bg-white/50 dark:bg-white/5 border-gray-200/50 rounded-2xl focus:ring-premium-navy/10">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white/90 backdrop-blur-xl border-gray-200/50 rounded-2xl">
                            {NIGERIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state} className="rounded-xl">
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="ml-1" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-8 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-premium-gold rounded-full" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Payment Method</h4>
                  </div>
                  
                  <div 
                    onClick={() => setPaymentMethod('paystack')}
                    className={cn(
                      "group relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all cursor-pointer",
                      paymentMethod === 'paystack' 
                        ? "border-premium-emerald bg-premium-emerald/5 shadow-xl shadow-premium-emerald/5" 
                        : "border-gray-100 dark:border-white/5 hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-2xl transition-colors",
                          paymentMethod === 'paystack' ? "bg-premium-emerald text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">Paystack Secured</p>
                          <p className="text-sm text-gray-500 font-medium">Card, Transfer & USSD</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        paymentMethod === 'paystack' ? "border-premium-emerald" : "border-gray-200"
                      )}>
                        {paymentMethod === 'paystack' && <div className="w-3 h-3 bg-premium-emerald rounded-full" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit"
                    className="h-16 flex-1 bg-premium-navy hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl text-lg font-bold shadow-xl shadow-premium-navy/20"
                    disabled={isPaying || isLoadingProfile}
                  >
                    {isPaying ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        Complete Payment
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={onBack}
                    className="h-16 px-10 text-lg font-bold border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                    disabled={isPaying || isLoadingProfile}
                  >
                    Return to Cart
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="bg-premium-navy dark:bg-gray-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-premium-emerald/10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <h3 className="text-xl font-bold">Order Summary</h3>
                <Badge className="bg-white/10 text-white/60 border-none font-bold">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>

              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {cartItems.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shrink-0">
                        {item.type === 'video' ? (
                          <Video className="w-6 h-6 text-premium-emerald" />
                        ) : item.type === 'audio' ? (
                          <Headphones className="w-6 h-6 text-premium-emerald" />
                        ) : (
                          <FileText className="w-6 h-6 text-premium-emerald" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate group-hover:text-premium-emerald transition-colors">{item.title}</h4>
                        <p className="text-xs text-white/40 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-4 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center text-white/40 font-bold text-xs uppercase tracking-widest">
                  <span>Merchant Calculation</span>
                  <span>NGN (₦)</span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-white/60">Final Valuation</p>
                    <p className="text-[2.5rem] leading-none font-black text-premium-emerald">
                      ₦{totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-premium-emerald/20 rounded-lg">
                      <Shield className="w-4 h-4 text-premium-emerald" />
                    </div>
                    <p className="text-xs font-bold text-white/80">End-to-End Encrypted Transaction</p>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium italic leading-relaxed">
                    By proceeding, you verify the items above are correct. Digital assets are delivered instantly upon confirmation of payment by the merchant provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutForm;
