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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
      className="border-l border-sidebar-border/30 bg-sidebar-background"
    >
      {/* Header with Logo */}
      <div className={cn(
        "flex items-center p-4 border-b border-sidebar-border/30",
        isCollapsed ? "justify-center py-4" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-bold text-sidebar-foreground">لوحة الإدارة</h2>
              <p className="text-[10px] text-sidebar-foreground/50">نظام إدارة المخزون</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        
        {!isCollapsed && (
          <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-sidebar-accent transition-colors">
            <PanelRightClose className="h-4 w-4 text-sidebar-foreground/60" />
          </SidebarTrigger>
        )}
      </div>

      <SidebarContent className={cn("py-4", isCollapsed ? "px-2" : "px-3")}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
              القائمة الرئيسية
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("space-y-1", isCollapsed && "space-y-2")}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {isCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === '/admin'}
                          className={cn(
                            "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                            "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                            "hover:bg-sidebar-accent"
                          )}
                          activeClassName="!bg-primary !text-primary-foreground"
                        >
                          <item.icon className="h-5 w-5" />
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="font-medium">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === '/admin'}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                          "hover:bg-sidebar-accent"
                        )}
                        activeClassName="!bg-primary !text-primary-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <div className="mt-auto border-t border-sidebar-border/30">
        <div className={cn("p-3", isCollapsed && "p-2")}>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink 
                  to="/" 
                  className="flex items-center justify-center p-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <Store className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-medium">
                العودة للمتجر
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink 
              to="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Store className="h-5 w-5 shrink-0" />
              <span className="text-sm">العودة للمتجر</span>
              <ChevronLeft className="h-4 w-4 mr-auto opacity-50" />
            </NavLink>
          )}
        </div>
        
        {/* Expand trigger when collapsed */}
        {isCollapsed && (
          <div className="p-2 border-t border-sidebar-border/30">
            <SidebarTrigger className="w-full flex items-center justify-center p-2.5 rounded-lg hover:bg-sidebar-accent transition-colors">
              <PanelRightOpen className="h-5 w-5 text-sidebar-foreground/60" />
            </SidebarTrigger>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
