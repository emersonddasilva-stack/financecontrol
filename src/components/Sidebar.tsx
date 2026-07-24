'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Tags, ChevronLeft, ChevronRight, TrendingUp, Settings, Bell, LogOut, User, BarChart2, ShoppingCart, CalendarClock } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Lançamentos',
    href: '/transaction-entry',
    icon: <PlusCircle size={20} />,
  },
  {
    label: 'Lançamentos Futuros',
    href: '/future-transactions',
    icon: <CalendarClock size={20} />,
  },
  {
    label: 'Categorias & Contas',
    href: '/category-account-setup',
    icon: <Tags size={20} />,
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: <TrendingUp size={20} />,
    badge: 0,
  },
  {
    label: 'Mercados e Aplicações',
    href: '/markets',
    icon: <BarChart2 size={20} />,
  },
  {
    label: 'Compras',
    href: '/shopping',
    icon: <ShoppingCart size={20} />,
  },
];

const bottomItems: NavItem[] = [
  { label: 'Notificações', href: '/notifications', icon: <Bell size={20} />, badge: 3 },
  { label: 'Configurações', href: '/settings', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch {
      toast.error('Erro ao sair. Tente novamente.');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const displayEmail = user?.email || '';

  return (
    <aside
      className={`sidebar-transition relative flex flex-col bg-primary border-r border-border/20 h-screen ${
        collapsed ? 'w-16 min-w-[64px]' : 'w-60 min-w-[240px]'
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-white/10 px-3 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <AppLogo size={32} className="flex-shrink-0" />
          {!collapsed && (
            <span className="font-bold text-base text-white tracking-tight whitespace-nowrap">
              FinanceControl
            </span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-primary transition-colors"
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User info */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
              <User size={12} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-600 text-white/90 truncate">{displayName}</p>
              <p className="text-xs text-white/50 truncate">{displayEmail}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav section label */}
      {!collapsed && (
        <p className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Principal
        </p>
      )}

      {/* Main nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                active
                  ? 'bg-white/15 text-white' :'text-white/60 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-xs font-bold">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge && item.badge > 0 ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
              ) : null}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-foreground text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-0.5 px-2 py-3 border-t border-white/10">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`nav-bottom-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                active
                  ? 'bg-white/15 text-white' :'text-white/60 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-negative text-white text-xs font-bold">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge && item.badge > 0 ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-negative" />
              ) : null}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-foreground text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Logout button */}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sair' : undefined}
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-white/60 hover:bg-white/10 hover:text-white w-full text-left ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="flex-shrink-0">
            <LogOut size={20} />
          </span>
          {!collapsed && (
            <span className="text-sm font-medium truncate">Sair</span>
          )}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-foreground text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              Sair
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}