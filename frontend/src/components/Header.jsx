import { Bell, Search, Mail, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="pt-8 pb-4 flex items-start justify-between z-50 bg-background px-4 md:px-6">
      {/* Title Section */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-secondary">Chào Học viên!</h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Đo lường sự tiến bộ của bạn mỗi ngày và theo dõi các chỉ số học tập để đạt kết quả tốt nhất.
        </p>
      </div>
      
      {/* Controls Section */}
      <div className="flex items-center gap-6">
        
        {/* Filters & Search */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-sm font-semibold text-muted-foreground soft-shadow-sm hover:text-foreground transition-colors">
            Năm nay <ChevronDown className="w-4 h-4" />
          </button>
          
          <div className="flex items-center bg-white rounded-2xl px-4 py-2.5 w-64 soft-shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground font-medium"
            />
          </div>
        </div>

        {/* Language & Actions */}
        <div className="flex items-center gap-4 border-l border-border pl-6">
          <button className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-80">
            <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 rounded-sm" />
            Tiếng Việt <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3 ml-2">
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center soft-shadow-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center soft-shadow-sm text-muted-foreground hover:text-primary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="w-10 h-10 rounded-full bg-indigo-100 ml-2 overflow-hidden cursor-pointer border-2 border-white soft-shadow-sm">
               <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
