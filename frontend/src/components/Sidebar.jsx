import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Headphones, Mic, CheckSquare, BarChart, Settings, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Home' },
    { icon: BookOpen, path: '/dashboard/vocabulary', label: 'Vocab' },
    { icon: Headphones, path: '/dashboard/listening', label: 'Listen' },
    { icon: Mic, path: '/dashboard/speaking', label: 'Speak' },
    { icon: CheckSquare, path: '/dashboard/exams', label: 'Exams' },
    { icon: BarChart, path: '/dashboard/statistics', label: 'Stats' },
    { icon: Users, path: '/dashboard/community', label: 'Community' },
    { icon: Settings, path: '/dashboard/settings', label: 'Settings' },
  ];

  const mobileItems = menuItems.slice(0, 5);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[100px] bg-white h-full relative z-20 flex-col items-center py-8 rounded-r-[2rem] soft-shadow shrink-0">
        
        {/* Logo */}
        <div className="mb-12 relative group cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-primary/30 shadow-lg mb-1">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-foreground">SelfEnglish</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-4 w-full px-4 overflow-y-auto no-scrollbar pb-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className="relative flex items-center justify-center w-full aspect-square rounded-2xl group transition-all shrink-0"
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary rounded-2xl soft-shadow-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon 
                  className={cn(
                    "w-6 h-6 relative z-10 transition-colors duration-300", 
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                  )} 
                />
              </Link>
            );
          })}
        </nav>
        
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 flex items-center justify-around px-2 py-3 rounded-t-3xl soft-shadow border-t border-border/50">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon 
                className={cn(
                  "w-6 h-6 relative z-10 mb-0.5 transition-colors duration-300", 
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span className={cn(
                "text-[10px] font-semibold relative z-10 transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
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
