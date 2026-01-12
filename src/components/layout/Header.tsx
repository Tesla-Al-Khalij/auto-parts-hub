import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Package, 
  FileText, 
  User,
  LogOut,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'البحث والطلب', icon: Search },
  { href: '/orders', label: 'طلباتي', icon: Package },
  { href: '/account', label: 'كشف الحساب', icon: FileText },
  { href: '/profile', label: 'حسابي', icon: User },
];

export function Header() {
  const location = useLocation();
  const { itemCount, total } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">قطع الغيار</h1>
            <p className="text-xs text-muted-foreground">نظام الطلبات</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="lg"
                  className={cn(
                    'gap-2 text-base',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Cart & Balance */}
        <div className="flex items-center gap-2">
          {/* Balance indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
            <Wallet className="h-4 w-4 text-success" />
            <span className="text-sm font-semibold text-success">
              {(11767.75).toLocaleString('ar-SA')} ر.س
            </span>
          </div>

          {/* Cart button */}
          <Link to="/cart">
            <Button variant="outline" size="lg" className="relative gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">السلة</span>
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                {/* Balance in mobile */}
                <div className="flex items-center gap-3 rounded-lg bg-success/10 p-4">
                  <Wallet className="h-6 w-6 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">رصيدك الحالي</p>
                    <p className="text-lg font-bold text-success">
                      {(11767.75).toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link to={item.href}>
                          <Button
                            variant={isActive ? 'default' : 'ghost'}
                            size="lg"
                            className="w-full justify-start gap-3 text-lg h-14"
                          >
                            <Icon className="h-6 w-6" />
                            {item.label}
                          </Button>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="mt-auto pt-4 border-t">
                  <Button variant="ghost" size="lg" className="w-full justify-start gap-3 text-destructive">
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
