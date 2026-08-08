import {
  useListCategories,
  useDeleteCategory,
  getListCategoriesQueryKey,
} from '@workspace/api-client-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

export default function AdminCategories() {
  const { data: categories, isLoading } = useListCategories();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, name: string) => {
    deleteCategory.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({
            title: 'Category deleted',
            description: `${name} has been removed.`,
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete category.',
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
            <p className="text-muted-foreground">
              Organize your products into categories
            </p>
          </div>
          <Button asChild data-testid="button-add-category">
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border rounded-lg p-6 space-y-3 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-categories">
            {categories.map((category) => (
              <div key={category.id} className="bg-card border rounded-lg p-6" data-testid={`card-category-${category.id}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-name-${category.id}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Slug: <span className="font-mono" data-testid={`text-slug-${category.id}`}>{category.slug}</span>
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-count-${category.id}`}>
                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild data-testid={`button-edit-${category.id}`}>
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid={`button-delete-${category.id}`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category.id, category.name)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-16 text-center" data-testid="empty-categories">
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <Button asChild>
              <Link href="/admin/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Category
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
