import { Link } from 'wouter';
import { useUser, useClerk } from '@clerk/react';
import { getListOrdersQueryKey, useListOrders } from '@workspace/api-client-react';
import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRound, LogOut, Package, ArrowRight } from 'lucide-react';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AccountPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { data: orders, isLoading } = useListOrders({
    query: {
      enabled: isLoaded && !!isSignedIn,
      retry: false,
      queryKey: getListOrdersQueryKey(),
    },
  });

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container mx-auto max-w-lg px-4 py-20 text-center">
          <UserRound className="mx-auto mb-5 h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold">Sign in to view your account</h1>
          <p className="mt-3 text-muted-foreground">
            Your orders and delivery updates will be saved here.
          </p>
          <Button asChild className="mt-7">
            <Link href="/sign-in">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <main className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              My account
            </p>
            <h1 className="text-3xl font-bold">Welcome, {user.firstName || 'there'}</h1>
            <p className="mt-2 text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Button variant="outline" onClick={() => signOut({ redirectUrl: '/' })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">Your orders</h2>
            <p className="text-sm text-muted-foreground">Track everything you have purchased from Baxi Brothers.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-5">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </p>
                  </div>
                  <Badge variant={order.status === 'cancelled' ? 'secondary' : 'default'}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">Rs. {(item.unitPrice * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground">
                      Delivering to {order.address}, {order.city}
                    </p>
                    <p className="text-lg font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No orders yet</h3>
              <p className="mt-2 text-muted-foreground">Your completed purchases will appear here.</p>
              <Button asChild className="mt-6">
                <Link href="/">
                  Start shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}