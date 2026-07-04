import { Bell, Search, Mail, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="pt-6 md:pt-8 pb-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6 z-50 bg-background px-4 md:px-6">
      {/* Title Section */}
      <div className="flex-1 w-full flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2 font-secondary">Chào Học viên!</h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed hidden sm:block">
            Đo lường sự tiến bộ của bạn mỗi ngày và theo dõi các chỉ số học tập để đạt kết quả tốt nhất.
          </p>
        </div>
        
        {/* Mobile Avatar (Visible only on small screens without space) */}
        <button type="button" aria-label="Mở hồ sơ người dùng" className="lg:hidden w-10 h-10 rounded-full bg-indigo-100 overflow-hidden cursor-pointer border-2 border-white soft-shadow-sm shrink-0">
           <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="" className="w-full h-full object-cover" />
        </button>
      </div>
      
      {/* Controls Section */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 w-full lg:w-auto">
        
        {/* Filters & Search */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 lg:flex-none">
          <button type="button" aria-label="Chọn khoảng thời gian thống kê" className="hidden sm:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-sm font-semibold text-muted-foreground soft-shadow-sm hover:text-foreground transition-colors shrink-0">
            Năm nay <ChevronDown className="w-4 h-4" />
          </button>
          
          <div className="flex items-center bg-white rounded-2xl px-4 py-2.5 w-full md:w-64 soft-shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all flex-1">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input 
              type="text" 
              aria-label="Tìm kiếm"
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground font-medium"
            />
          </div>
        </div>

        {/* Language & Actions (Hidden on very small screens, visible on md+) */}
        <div className="hidden sm:flex items-center gap-4 border-l border-border pl-4 md:pl-6">
          <button type="button" aria-label="Chọn ngôn ngữ" className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-80">
            <img src="https://flagcdn.com/w20/vn.png" alt="" className="w-5 rounded-sm shrink-0" />
            <span className="hidden md:inline">Tiếng Việt</span> <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-2 md:gap-3 ml-1 md:ml-2">
            <button type="button" aria-label="Mở hộp thư" className="w-10 h-10 rounded-full bg-white flex items-center justify-center soft-shadow-sm text-muted-foreground hover:text-primary transition-colors shrink-0">
              <Mail className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button type="button" aria-label="Mở thông báo" className="w-10 h-10 rounded-full bg-white flex items-center justify-center soft-shadow-sm text-muted-foreground hover:text-primary transition-colors relative shrink-0">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <span aria-hidden="true" className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <button type="button" aria-label="Mở hồ sơ người dùng" className="hidden lg:block w-10 h-10 rounded-full bg-indigo-100 ml-1 md:ml-2 overflow-hidden cursor-pointer border-2 border-white soft-shadow-sm shrink-0">
               <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
