import { useParams, useLocation } from 'wouter';
import {
  useGetCategory,
  useCreateCategory,
  useUpdateCategory,
  getListCategoriesQueryKey,
  getGetCategoryQueryKey,
} from '@workspace/api-client-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export default function CategoryForm() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isEdit = params.id && params.id !== 'new';
  const categoryId = isEdit ? Number(params.id) : 0;

  const { data: category } = useGetCategory(categoryId, {
    query: {
      enabled: !!isEdit && !!categoryId && !isNaN(categoryId),
      queryKey: getGetCategoryQueryKey(categoryId),
    },
  });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
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
    if (category) {
      setValue('name', category.name);
      setValue('slug', category.slug);
      setValue('description', category.description);
      setValue('imageUrl', category.imageUrl || '');
    }
  }, [category, setValue]);

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl || null,
    };

    if (isEdit) {
      updateCategory.mutate(
        { id: categoryId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCategoryQueryKey(categoryId) });
            toast({
              title: 'Category updated',
              description: `${payload.name} has been updated.`,
            });
            setLocation('/admin/categories');
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to update category.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createCategory.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
            toast({
              title: 'Category created',
              description: `${payload.name} has been added.`,
            });
            setLocation('/admin/categories');
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to create category.',
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
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEdit ? 'Edit Category' : 'Add Category'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update category details' : 'Create a new product category'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Bedsheets"
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
                  placeholder="bedsheets"
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
                  placeholder="Describe this category..."
                  rows={4}
                  data-testid="input-description"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">Description is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  {...register('imageUrl')}
                  placeholder="https://example.com/category-image.jpg"
                  data-testid="input-image-url"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                data-testid="button-submit"
              >
                {createCategory.isPending || updateCategory.isPending
                  ? 'Saving...'
                  : isEdit
                  ? 'Update Category'
                  : 'Create Category'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/admin/categories')}
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
