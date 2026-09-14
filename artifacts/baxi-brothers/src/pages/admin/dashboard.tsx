import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetDashboardStats, useGetCategoryCounts } from '@workspace/api-client-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, FolderOpen, CheckCircle, XCircle, Star, Image, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categoryCounts, isLoading: countsLoading } = useGetCategoryCounts();

  // --- Hero Background Settings Logic ---
  const [heroBgUrl, setHeroBgUrl] = useState('');
  const queryClient = useQueryClient();

  // Fetch current background URL
  const { data: bgData } = useQuery({
    queryKey: ['hero-bg'],
    queryFn: async () => {
      const res = await fetch('/api/settings/hero-bg');
      return res.ok ? res.json() : { bgUrl: '' };
    },
  });

  useEffect(() => {
    if (bgData?.bgUrl) setHeroBgUrl(bgData.bgUrl);
  }, [bgData]);

  // Save new background URL
  const updateBgMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch('/api/settings/hero-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bgUrl: url }),
      });
      if (!res.ok) throw new Error('Failed to update background');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-bg'] });
      alert('Hero background image updated successfully!');
    },
  });
  // ------------------------------------

  const chartData = categoryCounts?.map((c) => ({
    name: c.categoryName,
    count: c.count,
  })) || [];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store</p>
        </div>

        {/* Hero Background Control Card */}
        <Card className="mb-8" data-testid="card-hero-settings">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Hero Banner Background Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                type="url"
                placeholder="Paste image URL here (e.g., https://example.com/banner.jpg)"
                value={heroBgUrl}
                onChange={(e) => setHeroBgUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => updateBgMutation.mutate(heroBgUrl)}
                disabled={updateBgMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateBgMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Background
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card data-testid="card-total-products">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-products">
                  {stats?.totalProducts || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-total-categories">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-categories">
                  {stats?.totalCategories || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-instock">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-instock-products">
                  {stats?.inStockProducts || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-outofstock">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-outofstock-products">
                  {stats?.outOfStockProducts || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-featured">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-featured-products">
                  {stats?.featuredProducts || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card data-testid="card-chart">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {countsLoading ? (
              <div className="h-64 bg-muted rounded animate-pulse" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}