import { useParams, useLocation } from 'wouter';
import {
  useGetProduct,
  useCreateProduct,
  useUpdateProduct,
  useListCategories,
  getListProductsQueryKey,
  getGetProductQueryKey,
} from '@workspace/api-client-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  categoryId: number;
  imageUrl: string;
  images: string;
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  material: string;
  dimensions: string;
  careInstructions: string;
  tags: string;
}

export default function ProductForm() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isEdit = params.id && params.id !== 'new';
  const productId = isEdit ? Number(params.id) : 0;

  const { data: product } = useGetProduct(productId, {
    query: {
      enabled: !!isEdit && !!productId && !isNaN(productId),
      queryKey: getGetProductQueryKey(productId),
    },
  });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      originalPrice: null,
      categoryId: 0,
      imageUrl: '',
      images: '',
      inStock: true,
      stockCount: 0,
      featured: false,
      material: '',
      dimensions: '',
      careInstructions: '',
      tags: '',
    },
  });

  // Auto-populate slug from name
  const name = watch('name');
  useEffect(() => {
    if (name && !isEdit) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [name, isEdit, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('slug', product.slug);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('originalPrice', product.originalPrice);
      setValue('categoryId', product.categoryId);
      setValue('imageUrl', product.imageUrl || '');
      setValue('images', product.images.join(', '));
      setValue('inStock', product.inStock);
      setValue('stockCount', product.stockCount);
      setValue('featured', product.featured);
      setValue('material', product.material || '');
      setValue('dimensions', product.dimensions || '');
      setValue('careInstructions', product.careInstructions || '');
      setValue('tags', product.tags.join(', '));
    }
  }, [product, setValue]);

  const onSubmit = (data: ProductFormData) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      categoryId: Number(data.categoryId),
      imageUrl: data.imageUrl || null,
      images: data.images
        ? data.images.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
        : [],
      inStock: data.inStock,
      stockCount: Number(data.stockCount),
      featured: data.featured,
      material: data.material || null,
      dimensions: data.dimensions || null,
      careInstructions: data.careInstructions || null,
      tags: data.tags
        ? data.tags.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    if (isEdit) {
      updateProduct.mutate(
        { id: productId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
            toast({
              title: 'Product updated',
              description: `${payload.name} has been updated.`,
            });
            setLocation('/admin/products');
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to update product.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            toast({
              title: 'Product created',
              description: `${payload.name} has been added.`,
            });
            setLocation('/admin/products');
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to create product.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update product details' : 'Add a new product to your catalog'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Premium Cotton Bedsheet"
                  data-testid="input-name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">Name is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug', { required: true })}
                  placeholder="premium-cotton-bedsheet"
                  data-testid="input-slug"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive mt-1">Slug is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: true })}
                  placeholder="Describe the product..."
                  rows={4}
                  data-testid="input-description"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">Description is required</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (Rs.) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { required: true, min: 0 })}
                    placeholder="2500"
                    data-testid="input-price"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">Valid price required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="originalPrice">Original Price (Rs.)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    {...register('originalPrice', { min: 0 })}
                    placeholder="3000"
                    data-testid="input-original-price"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  onValueChange={(value) => setValue('categoryId', Number(value))}
                  defaultValue={watch('categoryId')?.toString() || ''}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">Category is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="imageUrl">Main Image URL</Label>
                <Input
                  id="imageUrl"
                  {...register('imageUrl')}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-image-url"
                />
              </div>

              <div>
                <Label htmlFor="images">Additional Images</Label>
                <Textarea
                  id="images"
                  {...register('images')}
                  placeholder={'Paste one image URL per line\nhttps://example.com/image-2.jpg\nhttps://example.com/image-3.jpg'}
                  rows={5}
                  data-testid="input-images"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Add as many images as you need. Use one URL per line (commas also work).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={watch('inStock')}
                    onCheckedChange={(checked) => setValue('inStock', checked)}
                    data-testid="switch-instock"
                  />
                  <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                </div>

                <div>
                  <Label htmlFor="stockCount">Stock Count</Label>
                  <Input
                    id="stockCount"
                    type="number"
                    {...register('stockCount', { min: 0 })}
                    placeholder="50"
                    data-testid="input-stock-count"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={watch('featured')}
                  onCheckedChange={(checked) => setValue('featured', checked)}
                  data-testid="switch-featured"
                />
                <Label htmlFor="featured" className="cursor-pointer">Featured Product</Label>
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  {...register('material')}
                  placeholder="100% Cotton"
                  data-testid="input-material"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  {...register('dimensions')}
                  placeholder="90 x 108 inches"
                  data-testid="input-dimensions"
                />
              </div>

              <div>
                <Label htmlFor="careInstructions">Care Instructions</Label>
                <Textarea
                  id="careInstructions"
                  {...register('careInstructions')}
                  placeholder="Machine wash cold, tumble dry low"
                  rows={3}
                  data-testid="input-care"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="cotton, premium, soft"
                  data-testid="input-tags"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                data-testid="button-submit"
              >
                {createProduct.isPending || updateProduct.isPending
                  ? 'Saving...'
                  : isEdit
                  ? 'Update Product'
                  : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/admin/products')}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
