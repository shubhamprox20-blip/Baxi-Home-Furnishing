import { useParams } from 'wouter';
import { useGetProduct, getGetProductQueryKey } from '@workspace/api-client-react';
import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/cart-context';

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = params.id ? Number(params.id) : 0;
  const { data: product, isLoading } = useGetProduct(productId, {
    query: {
      enabled: !!productId && !isNaN(productId),
      queryKey: getGetProductQueryKey(productId),
    },
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl ?? null,
      categoryName: product.categoryName,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="h-12 bg-muted rounded w-1/3" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const allImages = [product.imageUrl, ...product.images].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
              {allImages.length > 0 ? (
                <div
                  className="relative w-full h-full group"
                  onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
                  onTouchEnd={(event) => {
                    if (touchStartX === null) return;
                    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
                    const distance = touchEndX - touchStartX;
                    if (Math.abs(distance) > 40 && allImages.length > 1) {
                      setSelectedImage((current) =>
                        distance < 0
                          ? (current + 1) % allImages.length
                          : (current - 1 + allImages.length) % allImages.length,
                      );
                    }
                    setTouchStartX(null);
                  }}
                >
                  <img
                    src={allImages[selectedImage]}
                    alt={`${product.name} image ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                    data-testid="img-product-main"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedImage((current) => (current - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-md transition hover:bg-background"
                        aria-label="Previous product image"
                        data-testid="button-previous-image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedImage((current) => (current + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-md transition hover:bg-background"
                        aria-label="Next product image"
                        data-testid="button-next-image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
                        {selectedImage + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="h-24 w-24" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                    data-testid={`button-image-${idx}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3" data-testid="badge-category">
                {product.categoryName}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                {product.inStock ? (
                  <Badge className="bg-accent text-accent-foreground" data-testid="badge-instock">
                    In Stock ({product.stockCount} available)
                  </Badge>
                ) : (
                  <Badge variant="secondary" data-testid="badge-outofstock">
                    Out of Stock
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground" data-testid="badge-featured">
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary" data-testid="text-price">
                Rs. {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-muted-foreground line-through" data-testid="text-original-price">
                    Rs. {product.originalPrice!.toLocaleString()}
                  </span>
                  <Badge className="bg-destructive text-destructive-foreground" data-testid="badge-discount">
                    {discountPercent}% OFF
                  </Badge>
                </>
              )}
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              {added ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </Button>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {product.description}
              </p>
            </div>

            {product.material && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Material</h2>
                <p className="text-muted-foreground" data-testid="text-material">{product.material}</p>
              </div>
            )}

            {product.dimensions && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Dimensions</h2>
                <p className="text-muted-foreground" data-testid="text-dimensions">{product.dimensions}</p>
              </div>
            )}

            {product.careInstructions && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Care Instructions</h2>
                <p className="text-muted-foreground" data-testid="text-care">{product.careInstructions}</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" data-testid={`badge-tag-${idx}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
