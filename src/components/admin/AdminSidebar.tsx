import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart3,
  Settings,
  ChevronLeft,
  Warehouse,
  Shield,
  Store,
  PanelRightClose,
  PanelRightOpen,
  Sparkles
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'لوحة التحكم', url: '/admin', icon: LayoutDashboard },
  { title: 'إدارة القطع', url: '/admin/parts', icon: Package },
  { title: 'إدارة الطلبات', url: '/admin/orders', icon: ShoppingCart },
  { title: 'إدارة العملاء', url: '/admin/customers', icon: Users },
  { title: 'إدارة الموردين', url: '/admin/suppliers', icon: Truck },
  { title: 'مخزون الموردين', url: '/admin/supplier-stocks', icon: Warehouse },
  { title: 'الأدوار والصلاحيات', url: '/admin/roles', icon: Shield },
  { title: 'التقارير', url: '/admin/reports', icon: BarChart3 },
  { title: 'الإعدادات', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar 
      side="right"
      collapsible="icon"
      className="border-l border-sidebar-border/50 bg-gradient-to-b from-sidebar-background via-sidebar-background to-sidebar-background/95"
    >
      {/* Header with Logo */}
      <div className={cn(
        "relative flex items-center gap-3 p-5",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 via-primary/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {!isCollapsed && (
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">لوحة الإدارة</h2>
              <p className="text-[10px] text-sidebar-foreground/50 font-medium">نظام إدارة المخزون</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        
        <SidebarTrigger className={cn(
          "h-8 w-8 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-all duration-200 relative z-10",
          isCollapsed && "absolute -left-3 top-1/2 -translate-y-1/2 shadow-lg"
        )}>
          {isCollapsed ? (
            <PanelRightOpen className="h-4 w-4 text-sidebar-foreground/70" />
          ) : (
            <PanelRightClose className="h-4 w-4 text-sidebar-foreground/70" />
          )}
        </SidebarTrigger>
      </div>

      {/* Divider with gradient */}
      <div className="mx-4 h-px bg-gradient-to-l from-transparent via-sidebar-border to-transparent" />

      <SidebarContent className="px-3 py-5">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-3">
              القائمة الرئيسية
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                        "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                        "hover:bg-sidebar-accent/60",
                        isCollapsed && "justify-center px-3"
                      )}
                      activeClassName="!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground font-medium shadow-lg shadow-primary/30"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 bg-sidebar-accent/40 group-hover:bg-sidebar-accent/60">
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                      </div>
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Back to store */}
      <div className="mt-auto">
        <div className="mx-4 h-px bg-gradient-to-l from-transparent via-sidebar-border to-transparent" />
        <div className="p-4">
          <NavLink 
            to="/" 
            className={cn(
              "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
              "bg-sidebar-accent/30 hover:bg-sidebar-accent/60",
              "text-sidebar-foreground/60 hover:text-sidebar-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent/50 group-hover:bg-sidebar-accent transition-all duration-300">
              <Store className="h-[18px] w-[18px] shrink-0" />
            </div>
            {!isCollapsed && (
              <>
                <span className="text-sm font-medium">العودة للمتجر</span>
                <ChevronLeft className="h-4 w-4 mr-auto opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
              </>
            )}
          </NavLink>
        </div>
        
        {/* Bottom decorative element */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="rounded-xl bg-gradient-to-l from-primary/10 via-primary/5 to-transparent p-4 border border-sidebar-border/30">
              <div className="flex items-center gap-2 text-sidebar-foreground/50">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium">النظام يعمل بشكل طبيعي</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
