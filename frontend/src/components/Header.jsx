import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center bg-secondary rounded-md px-3 py-1.5 w-96">
        <Search className="w-5 h-5 text-muted-foreground mr-2" />
        <input 
          type="text" 
          placeholder="Tìm kiếm khóa học, từ vựng..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-secondary relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          U
        </div>
      </div>
    </header>
  );
};

export default Header;
