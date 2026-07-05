import { Bell, BookOpenCheck, ChevronDown, Mail, Search } from 'lucide-react';
import { Button } from './ui/Primitives';

const Header = () => (
  <header className="bg-background px-4 py-4 md:px-6 md:py-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="se-eyebrow mb-2">
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            SelfEnglish
          </div>
          <h1 className="se-page-title text-[clamp(28px,4vw,38px)]">Chào học viên!</h1>
          <p className="se-body mt-2 hidden max-w-xl text-sm sm:block">
            Theo dõi tiến độ, ôn đúng hạn và giữ nhịp học tiếng Anh mỗi ngày.
          </p>
        </div>

        <button type="button" aria-label="Mở hồ sơ người dùng" className="se-avatar flex h-11 w-11 shrink-0 items-center justify-center text-sm font-black text-foreground lg:hidden">
          SE
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
          Năm nay
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </Button>

        <label className="relative min-w-[220px] flex-1 lg:w-72 lg:flex-none">
          <span className="sr-only">Tìm kiếm</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="text" placeholder="Tìm kiếm..." className="se-input pl-11" />
        </label>

        <div className="hidden items-center gap-3 sm:flex">
          <Button variant="ghost" size="sm">
            Tiếng Việt
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Mở hộp thư">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Mở thông báo" className="relative">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger" />
          </Button>
          <button type="button" aria-label="Mở hồ sơ người dùng" className="se-avatar hidden h-11 w-11 shrink-0 items-center justify-center text-sm font-black text-foreground lg:flex">
            SE
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
