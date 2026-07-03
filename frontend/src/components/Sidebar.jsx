import { Link, useLocation } from 'react-router-dom';
import { BarChart, BookOpen, CheckSquare, Headphones, LayoutDashboard, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, path: '/dashboard', label: 'Tổng quan' },
  { icon: BookOpen, path: '/dashboard/vocabulary', label: 'Từ vựng' },
  { icon: Headphones, path: '/dashboard/listening', label: 'Nghe' },
  { icon: Mic, path: '/dashboard/speaking', label: 'Nói' },
  { icon: CheckSquare, path: '/dashboard/exams', label: 'Luyện đề' },
  { icon: BarChart, path: '/dashboard/statistics', label: 'Thống kê' },
];

const isActivePath = (pathname, path) => {
  if (path === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(path);
};

const Sidebar = () => {
  const location = useLocation();
  const mobileItems = menuItems.slice(0, 5);

  return (
    <>
      <aside className="sticky top-0 z-20 hidden min-h-[100dvh] w-[236px] shrink-0 border-r border-border/80 bg-background/85 px-4 py-5 backdrop-blur-xl md:flex md:flex-col">
        <Link to="/dashboard" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-2 pressable">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-sm font-bold tracking-tight text-background">
            SE
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-5 text-foreground">SelfEnglish</p>
            <p className="text-xs font-medium text-muted-foreground">Study ledger</p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = isActivePath(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                  isActive && 'text-foreground'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-card shadow-[0_0_0_1px_rgba(45,55,48,0.1),0_10px_28px_-24px_rgba(37,48,40,0.7)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className={cn('relative z-10 h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-xl border border-border/80 bg-card/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Focus</span>
            <span className="h-2 w-2 animate-soft-pulse rounded-full bg-primary" />
          </div>
          <p className="text-sm font-semibold leading-5 text-foreground">Một phiên ngắn, lặp đều mỗi ngày.</p>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border/80 bg-background/95 px-2 py-2 backdrop-blur-xl md:hidden">
        {mobileItems.map((item) => {
          const isActive = isActivePath(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex h-14 min-w-[60px] flex-col items-center justify-center rounded-lg px-2 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-lg bg-card shadow-[0_0_0_1px_rgba(45,55,48,0.1)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <item.icon className={cn('relative z-10 mb-1 h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('relative z-10', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
