import { Link } from 'wouter';
import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, totalItems, totalPrice, removeItem, updateQty, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container mx-auto px-4 py-24 text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Browse our collection and add something you love.</p>
          <Button asChild size="lg">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
          <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-card border rounded-lg p-4">
                <div className="w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-2">{item.name}</h3>
                  {item.categoryName && (
                    <p className="text-sm text-muted-foreground mb-2">{item.categoryName}</p>
                  )}
                  <p className="text-primary font-bold">Rs. {item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 border rounded-md">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-muted transition-colors rounded-l-md"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-muted transition-colors rounded-r-md"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full mt-3">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
