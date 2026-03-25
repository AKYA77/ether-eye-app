import { Settings, BarChart3, Coins, Radio, Zap } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Settings', url: '/', icon: Settings },
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Whitelist', url: '/whitelist', icon: Coins },
  { title: 'Scanner', url: '/scanner', icon: Radio },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-surface-1">
      <SidebarContent>
        {/* Brand */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-terminal-green shrink-0" />
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight">
                <span className="text-terminal-green glow-text-green">STREAM</span>
                <span className="text-muted-foreground">-TEST</span>
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground uppercase tracking-widest">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-surface-2"
                      activeClassName="bg-surface-3 text-terminal-green font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
