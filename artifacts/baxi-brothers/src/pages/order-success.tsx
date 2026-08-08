import { Link, useLocation } from 'wouter';
import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage() {
  const [location] = useLocation();
  const orderId = new URLSearchParams(location.split('?')[1] || '').get('order');
  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-24 w-24 text-accent" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Order Placed!</h1>
        <p className="text-muted-foreground mb-2 text-lg">
          Thank you for your order. We'll contact you shortly to confirm delivery.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          {orderId ? `Order #${orderId} has been saved to your account.` : 'Your order has been saved to your account.'}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/account">View My Orders</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
