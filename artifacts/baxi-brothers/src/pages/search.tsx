import { useLocation } from 'wouter';
import { useListProducts } from '@workspace/api-client-react';
import { StorefrontHeader } from '@/components/storefront-header';
import { ProductCard } from '@/components/product-card';

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const query = searchParams.get('q') || '';

  const { data: productsData, isLoading } = useListProducts(
    query ? { search: query } : undefined
  );

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-muted-foreground">
              Showing results for <span className="font-semibold text-foreground" data-testid="text-search-query">"{query}"</span>
            </p>
          )}
          {productsData && (
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-result-count">
              {productsData.total} {productsData.total === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-5 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : productsData && productsData.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="grid-search-results">
            {productsData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="empty-search">
            <p className="text-muted-foreground text-lg mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
