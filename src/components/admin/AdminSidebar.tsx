import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Warehouse,
  Shield,
  Store,
  PanelRightClose,
  PanelRightOpen
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
import { Separator } from '@/components/ui/separator';
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
      className="border-l-0 bg-sidebar"
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 p-4 bg-gradient-to-l from-primary/5 to-transparent",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">لوحة الإدارة</span>
          </div>
        )}
        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-sidebar-accent transition-colors">
          {isCollapsed ? (
            <PanelRightOpen className="h-4 w-4 text-sidebar-foreground/70" />
          ) : (
            <PanelRightClose className="h-4 w-4 text-sidebar-foreground/70" />
          )}
        </SidebarTrigger>
      </div>

      <Separator className="bg-sidebar-border" />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/50 px-3 mb-2">
              القائمة الرئيسية
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                        "hover:bg-sidebar-accent/50",
                        isCollapsed && "justify-center px-2"
                      )}
                      activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium shadow-sm"
                    >
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                      )} />
                      {!isCollapsed && (
                        <span className="text-sm">{item.title}</span>
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
        <Separator className="bg-sidebar-border" />
        <div className="p-3">
          <NavLink 
            to="/" 
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200",
              "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Store className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="text-sm">العودة للمتجر</span>
                <ChevronLeft className="h-4 w-4 mr-auto" />
              </>
            )}
          </NavLink>
        </div>
      </div>
    </Sidebar>
  );
}
