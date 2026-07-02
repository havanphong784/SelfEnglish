import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 border-b border-white/10 bg-card/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50 rounded-t-2xl">
      <div className="flex items-center bg-background/50 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-background/80 transition-all duration-300">
        <Search className="w-5 h-5 text-primary/70 mr-3" />
        <input 
          type="text" 
          placeholder="Tìm kiếm khóa học, từ vựng..." 
          className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-full bg-background/50 hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-accent border-2 border-card rounded-full animate-pulse"></span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 ring-2 ring-transparent hover:ring-primary/50">
          U
        </div>
      </div>
    </header>
  );
};

export default Header;
