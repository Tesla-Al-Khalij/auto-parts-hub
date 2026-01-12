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
  Shield
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
import { Button } from '@/components/ui/button';

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
      className="border-l border-border"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-primary">لوحة الإدارة</h2>
        )}
        <SidebarTrigger className={isCollapsed ? 'mx-auto' : ''}>
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </SidebarTrigger>
      </div>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Back to store link */}
      <div className="mt-auto p-4 border-t border-border">
        <NavLink 
          to="/" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
          {!isCollapsed && <span>العودة للمتجر</span>}
        </NavLink>
      </div>
    </Sidebar>
  );
}
