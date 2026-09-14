import { useQuery } from '@tanstack/react-query';
import { useListCategories, useGetFeaturedProducts } from '@workspace/api-client-react';
import { StorefrontHeader } from '@/components/storefront-header';
import { ProductCard } from '@/components/product-card';
import { Link } from 'wouter';
import { ArrowRight, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categoryGradients: Record<string, string> = {
  'mats': 'linear-gradient(135deg, #c8956c 0%, #a0704a 100%)',
  'bedsheets': 'linear-gradient(135deg, #d4a89a 0%, #b07060 100%)',
  'curtains': 'linear-gradient(135deg, #8faabc 0%, #5d7f96 100%)',
  'towels': 'linear-gradient(135deg, #9dc3a8 0%, #6a9e78 100%)',
  'carpets': 'linear-gradient(135deg, #b8956e 0%, #8a6840 100%)',
  'sofa-covers': 'linear-gradient(135deg, #c9a87c 0%, #a07848 100%)',
};

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();

  // --- Fetch Dynamic Hero Background Settings ---
  const { data: heroBgData } = useQuery({
    queryKey: ['hero-bg'],
    queryFn: async () => {
      const res = await fetch('/api/settings/hero-bg');
      if (!res.ok) return { bgUrl: '' };
      return res.json();
    },
  });

  const heroBgUrl = heroBgData?.bgUrl;

 return (
  <div className="min-h-screen bg-background">

    {/* Top Announcement Bar */}
    <div className="w-full bg-[#245b82] text-white text-center py-2 text-sm font-medium">
      🎁 Big Savings Alert! Up to 70% OFF + free shipping above ₹1499/-
    </div>

    <StorefrontHeader />
      
      {/* Dynamic Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-16 sm:py-24 transition-all duration-300 overflow-hidden"
        style={{
          backgroundImage: heroBgUrl ? `url("${heroBgUrl}")` : undefined,
        }}
      >
        {/* Default gradient fallback if no image URL is set */}
        {!heroBgUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background fabric-texture -z-10" />
        )}

        {/* Soft overlay to ensure readability when an image is set */}
        {heroBgUrl && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] -z-10" />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Quality Home Textiles,
              <br />
              <span className="text-primary">Trusted by families since 1959</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
              A wide range of textiles for your home, guaranteed quality and trust elevating your spaces into comfortable places.
            </p>
            <Button size="lg" asChild data-testid="button-browse-categories">
              <Link href="#categories" className="group">
                Browse Categories
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!featuredLoading && featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            </div>
            {featuredLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="grid-featured-products">
                {featuredProducts?.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section id="categories" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Shop by Category</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-6 space-y-2">
                    <div className="h-6 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-categories">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block bg-card border border-card-border rounded-lg overflow-hidden smooth-hover"
                  data-testid={`card-category-${category.slug}`}
                >
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                        style={{ background: categoryGradients[category.slug] ?? 'linear-gradient(135deg, #c8956c 0%, #8a6040 100%)' }}
                      >
                        <span className="text-white text-2xl font-bold drop-shadow-sm">{category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-category-name-${category.slug}`}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground" data-testid={`text-product-count-${category.slug}`}>
                        {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                      </span>
                      <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      


      {/* Footer */}
      <footer className="border-t bg-card pt-14 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold text-foreground mb-3">Baxi Home Furnishing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Premium home textiles crafted for comfort and durability. Trusted by families across India
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="#categories" className="hover:text-primary transition-colors">Shop by Category</Link></li>
                <li><Link href="/search" className="hover:text-primary transition-colors">Search Products</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['mats', 'bedsheets', 'curtains', 'towels', 'carpets', 'sofa-covers'].map((slug) => (
                  <li key={slug}>
                    <Link href={`/categories/${slug}`} className="hover:text-primary transition-colors capitalize">
                      {slug.replace('-', ' ')}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>+91 300 0000000</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a
                    href="https://wa.me/913000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    WhatsApp Us
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a href="mailto:info@baxibrothers.in" className="hover:text-primary transition-colors">
                    info@baxibrothers.in
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Indore, India</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Baxi Brothers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}