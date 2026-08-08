import { useListProducts, useDeleteProduct, getListProductsQueryKey } from '@workspace/api-client-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminProducts() {
  const { data: productsData, isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, name: string) => {
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({
            title: 'Product deleted',
            description: `${name} has been removed.`,
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete product.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>
          <Button asChild data-testid="button-add-product">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-card border rounded-lg p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : productsData && productsData.products.length > 0 ? (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-products">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Product</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Price</th>
                    <th className="text-left p-4 font-semibold">Stock</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsData.products.map((product) => (
                    <tr key={product.id} className="border-t" data-testid={`row-product-${product.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium" data-testid={`text-product-name-${product.id}`}>
                              {product.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm" data-testid={`text-category-${product.id}`}>
                        {product.categoryName}
                      </td>
                      <td className="p-4">
                        <div className="font-medium" data-testid={`text-price-${product.id}`}>
                          Rs. {product.price.toLocaleString()}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            Rs. {product.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4" data-testid={`text-stock-${product.id}`}>
                        {product.stockCount}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {product.inStock ? (
                            <Badge className="bg-green-600 text-white">In Stock</Badge>
                          ) : (
                            <Badge variant="secondary">Out of Stock</Badge>
                          )}
                          {product.featured && (
                            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild data-testid={`button-edit-${product.id}`}>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`button-delete-${product.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-16 text-center" data-testid="empty-products">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
