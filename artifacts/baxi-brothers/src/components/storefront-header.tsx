import { Link } from 'wouter';
import { ShoppingBag, ChevronDown, UserRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListCategories } from '@workspace/api-client-react';
import { useCart } from '@/context/cart-context';
import { useClerk, useUser } from '@clerk/react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function StorefrontHeader() {
  const { data: categories } = useListCategories();
  const { totalItems } = useCart();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Main bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-home">
            <div className="text-2xl font-bold tracking-tight text-primary">
              Baxi Brothers
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {isSignedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/account">
                    <UserRound className="mr-2 h-4 w-4" />
                    {user?.firstName || 'Account'}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => signOut({ redirectUrl: `${basePath || ''}/` })}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative" data-testid="button-cart">
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

      </div>

      {/* Category nav bar */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0" data-testid="nav-categories">
            <Link
              href="/#categories"
              className="flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              All Categories
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            <span className="text-border">|</span>
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors shrink-0"
                data-testid={`nav-category-${cat.slug}`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
