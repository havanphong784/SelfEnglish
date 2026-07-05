import { Link, useLocation } from 'react-router-dom';
import { BarChart, BookOpen, CheckSquare, Headphones, Home, Mic, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const menuItems = [
  { icon: Home, path: '/dashboard', label: 'Tổng quan' },
  { icon: BookOpen, path: '/dashboard/vocabulary', label: 'Từ vựng' },
  { icon: Headphones, path: '/dashboard/listening', label: 'Nghe' },
  { icon: Mic, path: '/dashboard/speaking', label: 'Nói' },
  { icon: CheckSquare, path: '/dashboard/exams', label: 'Đề thi' },
  { icon: BarChart, path: '/dashboard/statistics', label: 'Tiến độ' },
  { icon: Users, path: '/dashboard/community', label: 'Bạn học' },
  { icon: Settings, path: '/dashboard/settings', label: 'Cài đặt' },
];

const isActivePath = (pathname, path) => (
  path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)
);

const NavItem = ({ item, active, mobile = false }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center justify-center rounded-xl border-2 font-black transition-colors',
        mobile ? 'h-14 w-14 flex-col gap-1 text-[10px]' : 'h-16 w-full flex-col gap-1 text-[10px]',
        active ? 'border-primary text-white' : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId={mobile ? 'mobile-nav-active' : 'sidebar-active'}
          className="absolute inset-0 rounded-xl bg-primary"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className="relative z-10 h-5 w-5" aria-hidden="true" />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const mobileItems = menuItems.slice(0, 5);

  return (
    <>
      <aside className="hidden h-full w-[112px] shrink-0 flex-col items-center border-r-2 border-border bg-background px-4 py-6 md:flex">
        <Link to="/dashboard" className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="se-icon-sticker h-14 w-14 border-primary bg-storybook-green text-primary">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="flex w-full flex-1 flex-col gap-3 overflow-y-auto pb-4">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} active={isActivePath(location.pathname, item.path)} />
          ))}
        </nav>
      </aside>

      <nav aria-label="Điều hướng di động" className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t-2 border-border bg-background px-2 py-3 md:hidden">
        {mobileItems.map((item) => (
          <NavItem key={item.path} item={item} active={isActivePath(location.pathname, item.path)} mobile />
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
