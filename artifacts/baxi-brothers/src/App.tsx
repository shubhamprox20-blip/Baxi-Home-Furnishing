import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { CartProvider } from '@/context/cart-context';

import Home from '@/pages/home';
import CategoryPage from '@/pages/category-page';
import ProductDetail from '@/pages/product-detail';
import Search from '@/pages/search';
import CartPage from '@/pages/cart';
import CheckoutPage from '@/pages/checkout';
import OrderSuccessPage from '@/pages/order-success';
import SignInPage from '@/pages/sign-in';
import SignUpPage from '@/pages/sign-up';
import NotFound from '@/pages/not-found';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminProducts from '@/pages/admin/products';
import ProductForm from '@/pages/admin/product-form';
import AdminCategories from '@/pages/admin/categories';
import CategoryForm from '@/pages/admin/category-form';
import AccountPage from '@/pages/account';
import AdminOrders from '@/pages/admin/orders';

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories/:slug" component={CategoryPage} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/search" component={Search} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-success" component={OrderSuccessPage} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={ProductForm} />
      <Route path="/admin/products/:id/edit" component={ProductForm} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/categories/new" component={CategoryForm} />
      <Route path="/admin/categories/:id/edit" component={CategoryForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={{
          theme: shadcn,
          cssLayerName: 'clerk',
          options: {
            logoPlacement: 'inside',
            logoLinkUrl: basePath || '/',
            logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
          },
          variables: {
            colorPrimary: '#d56646',
            colorForeground: '#342e2a',
            colorMutedForeground: '#756d67',
            colorBackground: '#fffdf9',
            colorInput: '#fffdf9',
            colorInputForeground: '#342e2a',
            colorNeutral: '#e4dcd4',
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '0.75rem',
          },
        }}
      >
        <AppProviders />
      </ClerkProvider>
    </WouterRouter>
  );
}

export default App;
