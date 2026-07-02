import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Headphones, Mic, CheckSquare, BarChart } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Học từ vựng', path: '/dashboard/vocabulary' },
    { icon: Headphones, label: 'Luyện nghe', path: '/dashboard/listening' },
    { icon: Mic, label: 'Luyện nói', path: '/dashboard/speaking' },
    { icon: CheckSquare, label: 'Luyện đề', path: '/dashboard/exams' },
    { icon: BarChart, label: 'Thống kê', path: '/dashboard/statistics' },
  ];

  return (
    <aside className="w-64 flex flex-col h-full rounded-2xl glass-panel relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient inside sidebar */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 font-secondary">
          <BookOpen className="w-8 h-8 text-primary" />
          SelfEnglish
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 relative z-10">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
          >
            {/* Background highlight on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <item.icon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium relative z-10">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 relative z-10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-white/5 backdrop-blur-md hover:bg-card/60 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
            U
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">User</p>
            <p className="text-xs text-primary font-medium">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
