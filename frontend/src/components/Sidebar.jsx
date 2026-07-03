import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Headphones, Mic, CheckSquare, BarChart, Settings, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard' },
    { icon: BookOpen, path: '/dashboard/vocabulary' },
    { icon: Headphones, path: '/dashboard/listening' },
    { icon: Mic, path: '/dashboard/speaking' },
    { icon: CheckSquare, path: '/dashboard/exams' },
    { icon: BarChart, path: '/dashboard/statistics' },
    { icon: Users, path: '/dashboard/community' },
    { icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-[100px] bg-white h-full relative z-20 flex flex-col items-center py-8 rounded-r-[2rem] soft-shadow">
      
      {/* Logo */}
      <div className="mb-12 relative group cursor-pointer flex flex-col items-center">
        <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-primary/30 shadow-lg mb-1">
          <BookOpen className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-foreground">SelfEnglish</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-4 w-full px-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex items-center justify-center w-full aspect-square rounded-2xl group transition-all"
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
  );
};

export default Sidebar;
