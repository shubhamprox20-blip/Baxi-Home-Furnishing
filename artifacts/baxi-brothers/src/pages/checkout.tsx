import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@clerk/react';
import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/cart-context';
import { CreditCard, Lock } from 'lucide-react';
import { useCreateOrder } from '@workspace/api-client-react';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn, user } = useUser();
  const createOrder = useCreateOrder();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '',
    cardNumber: '', cardExpiry: '', cardCvv: '',
  });

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        name: current.name || user.fullName || '',
        email: current.email || user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) setLocation('/cart');
  }, [items.length, setLocation]);

  if (items.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setLocation('/sign-in');
      return;
    }
    setLoading(true);
    createOrder.mutate(
      {
        data: {
          customerName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order-success?order=${order.id}`);
        },
        onSettled: () => setLoading(false),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!isLoaded ? null : !isSignedIn ? (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h1 className="text-xl font-semibold">Sign in to complete your order</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your order history is saved to your account so you can track it later.
            </p>
            <Button type="button" className="mt-4" onClick={() => setLocation('/sign-in')}>
              Log in or sign up
            </Button>
          </div>
        ) : null}
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <Input name="name" value={form.name} onChange={handleChange} required placeholder="Ahmed Ali" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input name="phone" value={form.phone} onChange={handleChange} required placeholder="+92 300 1234567" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Street Address</label>
                  <Input name="address" value={form.address} onChange={handleChange} required placeholder="House #5, Street 12, Block B" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">City</label>
                  <Input name="city" value={form.city} onChange={handleChange} required placeholder="Lahore" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Payment</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Demo Mode</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This checkout records your order securely. Payment processing can be connected later.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="cardNumber" value={form.cardNumber} onChange={handleChange} className="pl-9" placeholder="4242 4242 4242 4242" maxLength={19} required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Expiry Date</label>
                  <Input name="cardExpiry" value={form.cardExpiry} onChange={handleChange} placeholder="MM / YY" maxLength={7} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CVV</label>
                  <Input name="cardCvv" value={form.cardCvv} onChange={handleChange} placeholder="123" maxLength={4} required />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading || !isSignedIn}>
              <Lock className="mr-2 h-4 w-4" />
              {loading ? 'Saving order...' : `Place order · Rs. ${totalPrice.toLocaleString()}`}
            </Button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-28">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
