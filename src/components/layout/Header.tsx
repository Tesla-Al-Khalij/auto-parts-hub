import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Package, 
  FileText, 
  User,
  LogOut,
  LogIn,
  Wallet,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'البحث والطلب', icon: Search },
  { href: '/orders', label: 'طلباتي', icon: Package },
  { href: '/account', label: 'كشف الحساب', icon: FileText },
  { href: '/profile', label: 'حسابي', icon: User },
];

const formatBalance = (amount: number, show: boolean) => {
  if (!show) return '••••••';
  const absAmount = Math.abs(amount);
  return absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount, total } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Small delay to show animation before reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const balance = -38232.25; // سالب = مديونية على العميل

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

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

        {/* Actions: Refresh, Cart & Balance */}
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="تحديث الصفحة"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Balance indicator - shows debt amount */}
          <div className={`hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 ${balance < 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className={`p-1 rounded transition-colors ${balance < 0 ? 'hover:bg-destructive/20' : 'hover:bg-success/20'}`}
            >
              {showBalance ? (
                <Eye className={`h-4 w-4 ${balance < 0 ? 'text-destructive' : 'text-success'}`} />
              ) : (
                <EyeOff className={`h-4 w-4 ${balance < 0 ? 'text-destructive' : 'text-success'}`} />
              )}
            </button>
            <Wallet className={`h-4 w-4 ${balance < 0 ? 'text-destructive' : 'text-success'}`} />
            <div className="text-sm min-w-[100px]">
              <span className="text-muted-foreground text-xs block">المستحق عليك</span>
              <span className={`font-semibold ${balance < 0 ? 'text-destructive' : 'text-success'}`}>
                {formatBalance(balance, showBalance)} ر.س
              </span>
            </div>
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

          {/* Auth button - desktop */}
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/login">
                <LogIn className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                {/* Balance in mobile - shows debt amount */}
                <div className={`flex items-center gap-3 rounded-lg p-4 ${balance < 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className={`p-2 rounded-full transition-colors ${balance < 0 ? 'hover:bg-destructive/20' : 'hover:bg-success/20'}`}
                  >
                    {showBalance ? (
                      <Eye className={`h-5 w-5 ${balance < 0 ? 'text-destructive' : 'text-success'}`} />
                    ) : (
                      <EyeOff className={`h-5 w-5 ${balance < 0 ? 'text-destructive' : 'text-success'}`} />
                    )}
                  </button>
                  <Wallet className={`h-6 w-6 ${balance < 0 ? 'text-destructive' : 'text-success'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">المستحق عليك</p>
                    <p className={`text-lg font-bold ${balance < 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatBalance(balance, showBalance)} ر.س
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

                {/* Auth button - mobile */}
                <div className="mt-auto pt-4 border-t">
                  {isAuthenticated ? (
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full justify-start gap-3 text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      تسجيل الخروج
                    </Button>
                  ) : (
                    <SheetClose asChild>
                      <Link to="/login">
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="w-full justify-start gap-3"
                        >
                          <LogIn className="h-5 w-5" />
                          تسجيل الدخول
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}