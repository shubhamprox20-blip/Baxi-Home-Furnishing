import { useParams } from 'wouter';
import {
  useListCategories,
  useListProducts,
  getListProductsQueryKey,
} from '@workspace/api-client-react';
import { StorefrontHeader } from '@/components/storefront-header';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const { data: categories } = useListCategories();
  const [filterInStock, setFilterInStock] = useState<boolean | undefined>(undefined);

  const category = useMemo(
    () => categories?.find((c) => c.slug === params.slug),
    [categories, params.slug]
  );

  const { data: productsData, isLoading } = useListProducts(
    category?.id ? { categoryId: category.id, inStock: filterInStock } : undefined,
    {
      query: {
        enabled: !!category?.id,
        queryKey: getListProductsQueryKey(
          category?.id
            ? { categoryId: category.id, inStock: filterInStock }
            : undefined,
        ),
      },
    }
  );

  if (!params.slug) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        {category && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-category-title">
              {category.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{category.description}</p>
            <p className="text-sm text-muted-foreground">
              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filterInStock === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterInStock(undefined)}
            data-testid="button-filter-all"
          >
            All Products
          </Button>
          <Button
            variant={filterInStock === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterInStock(true)}
            data-testid="button-filter-instock"
          >
            In Stock
          </Button>
          <Button
            variant={filterInStock === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterInStock(false)}
            data-testid="button-filter-outofstock"
          >
            Out of Stock
          </Button>
        </div>

        {/* Products Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="grid-products">
            {productsData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="empty-products">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
