import {
  getListAdminOrdersQueryKey,
  useListAdminOrders,
  useUpdateAdminOrder,
} from '@workspace/api-client-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Mail, MapPin, Phone, UserRound } from 'lucide-react';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useListAdminOrders();
  const updateOrder = useUpdateAdminOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: (typeof statuses)[number]) => {
    updateOrder.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
          toast({ title: 'Order updated', description: `Order #${id} is now ${statusLabels[status]}.` });
        },
        onError: () => toast({
          title: 'Could not update order',
          description: 'Please try again.',
          variant: 'destructive',
        }),
      },
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="mt-2 text-muted-foreground">See who ordered what and manage delivery progress.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-5">
            {orders.map((order) => (
              <section key={order.id} className="overflow-hidden rounded-xl border bg-card" data-testid={`admin-order-${order.id}`}>
                <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                      <Badge>{statusLabels[order.status] || order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as (typeof statuses)[number])}
                  >
                    <SelectTrigger className="w-full sm:w-48" aria-label={`Update status for order ${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.1fr]">
                  <div>
                    <h3 className="mb-3 font-semibold">Customer & delivery</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2 text-foreground"><UserRound className="h-4 w-4 text-primary" />{order.customerName}</p>
                      <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{order.email}</p>
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{order.phone}</p>
                      <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{order.address}, {order.city}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Items ordered</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded bg-muted">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Qty {item.quantity} · Rs. {item.unitPrice.toLocaleString()} each</p>
                          </div>
                          <p className="text-sm font-medium">Rs. {(item.unitPrice * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-4 font-bold">
                      <span>Total</span>
                      <span className="text-primary">Rs. {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-16 text-center">
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">Customer orders will appear here after checkout.</p>
            <Button asChild variant="outline" className="mt-6"><Link href="/">View store</Link></Button>
          </div>
        )}
      </main>
    </div>
  );
}