import { Bell, CalendarDays, ChevronDown, Mail, Search } from 'lucide-react';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const Header = () => {
  const user = getStoredUser();
  const displayName = user?.name || 'Học viên';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'SE';

  return (
    <header className="sticky top-0 z-10 bg-background/88 px-4 py-4 backdrop-blur-xl md:px-8 md:py-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Studio tự học
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Chào {displayName}
            </h1>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background xl:hidden">
            {initials}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
          <button className="hidden min-h-11 items-center gap-2 rounded-lg border border-border/80 bg-card px-4 text-sm font-semibold text-foreground pressable sm:flex">
            <CalendarDays className="h-4 w-4 text-primary" />
            Tuần này
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex min-h-11 w-full items-center rounded-lg surface-inset px-3 sm:w-72">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              placeholder="Tìm gói từ, phiên học..."
              className="w-full border-none bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground pressable hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              aria-label="Tin nhắn"
            >
              <Mail className="h-4 w-4" />
            </button>
            <button
              className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground pressable hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              aria-label="Thông báo"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="hidden h-11 w-11 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background xl:flex">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
