import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@workspace/api-client-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-card border border-card-border rounded-lg overflow-hidden smooth-hover"
      data-testid={`card-product-${product.id}`}
    >
      <div className="aspect-square bg-muted overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid={`img-product-${product.id}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground" data-testid={`badge-discount-${product.id}`}>
            {discountPercent}% OFF
          </Badge>
        )}
        {!product.inStock && (
          <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground" data-testid={`badge-outofstock-${product.id}`}>
            Out of Stock
          </Badge>
        )}
        {product.featured && product.inStock && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground" data-testid={`badge-featured-${product.id}`}>
            Featured
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2" data-testid={`text-category-${product.id}`}>
          {product.categoryName}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
            Rs. {product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
              Rs. {product.originalPrice!.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
