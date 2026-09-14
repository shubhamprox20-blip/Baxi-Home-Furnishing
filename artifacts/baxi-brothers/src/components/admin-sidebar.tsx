import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Home,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
];

export function AdminSidebar() {
  const [location] = useLocation();

  const handleBackgroundChange = () => {
    const url = window.prompt('Enter background image URL:');

    if (!url) return;

    localStorage.setItem('siteBackgroundImage', url);

    // Apply immediately
    document.body.style.backgroundImage = `url("${url}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  };

  return (
    <aside className="w-64 border-r bg-sidebar min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link
          href="/"
          className="flex items-center gap-2"
          data-testid="link-storefront"
        >
          <Home className="h-5 w-5 text-sidebar-foreground" />
          <span className="font-semibold text-sidebar-foreground">
            Back to Store
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-sidebar-foreground mt-4">
          Admin Panel
        </h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}