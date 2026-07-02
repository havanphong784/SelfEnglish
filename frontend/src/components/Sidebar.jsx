import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Headphones, Mic, CheckSquare, BarChart } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Học từ vựng', path: '/vocabulary' },
    { icon: Headphones, label: 'Luyện nghe', path: '/listening' },
    { icon: Mic, label: 'Luyện nói', path: '/speaking' },
    { icon: CheckSquare, label: 'Luyện đề', path: '/exams' },
    { icon: BarChart, label: 'Thống kê', path: '/statistics' },
  ];

  return (
    <aside className="w-64 bg-card border-r h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          SelfEnglish
        </h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
