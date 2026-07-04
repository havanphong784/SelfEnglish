import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { BookOpen, CalendarDays, Flame, GraduationCap, Target, Trophy } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const levelLabels = {
  1: 'L1',
  2: 'L2',
  3: 'L3',
  4: 'L4',
  5: 'L5',
  6: 'Master',
};

const emptyLevelDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

const statTileTones = {
  default: 'bg-card text-foreground',
  primary: 'bg-primary text-primary-foreground border-primary',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
};

const formatSessionLabel = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '--/--';
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const buildRecentSessions = (sessions = []) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return Array.from({ length: 7 }, (_, index) => ({
      label: `Ngày ${index + 1}`,
      words: 0,
      minutes: 0,
    }));
  }

  return sessions.map((session) => ({
    label: formatSessionLabel(session.date),
    words: Number(session.wordsLearned) || 0,
    minutes: Number(session.durationMinutes) || 0,
  }));
};

const getLevelRows = (distribution = emptyLevelDistribution) => (
  [1, 2, 3, 4, 5, 6].map((level) => ({
    level,
    label: levelLabels[level],
    value: Number(distribution[level]) || 0,
  }))
);

const StatTile = ({ label, value, detail, icon: Icon, tone = 'default' }) => (
    <div className={`rounded-2xl border border-border p-5 ${statTileTones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{label}</div>
          <div className="mt-3 font-mono text-4xl font-black tabular-nums">{value}</div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {detail && <div className="mt-2 text-xs font-semibold opacity-70">{detail}</div>}
    </div>
);

const Panel = ({ title, action, children, className = '' }) => (
  <section className={`rounded-[1.5rem] border border-border bg-card p-5 soft-shadow-sm ${className}`}>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-sm font-black uppercase tracking-[0.18em] text-foreground">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 pt-4">
    <div className="h-36 animate-pulse rounded-[2rem] bg-muted" />
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="h-80 animate-pulse rounded-[1.5rem] bg-muted lg:col-span-2" />
      <div className="h-80 animate-pulse rounded-[1.5rem] bg-muted" />
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    userName: '',
    streak: 0,
    targetWeekly: 80,
    todayLearned: 0,
    totalWords: 0,
    levelDistribution: emptyLevelDistribution,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [vocabStats, dashStats] = await Promise.all([
          fetchWithAuth('/vocabularies/stats'),
          fetchWithAuth('/dashboard/stats'),
        ]);

        const levelDistribution = {
          ...emptyLevelDistribution,
          ...(vocabStats?.levelDistribution || {}),
        };
        const learnedWords = Object.values(levelDistribution).reduce((sum, value) => sum + (Number(value) || 0), 0);

        setDashboardData({
          userName: dashStats?.user?.name || '',
          streak: vocabStats?.streak || dashStats?.user?.streak || 0,
          targetWeekly: vocabStats?.targetWeekly || dashStats?.user?.targetWeekly || 80,
          todayLearned: vocabStats?.todayLearned || 0,
          totalWords: dashStats?.stats?.totalWords || learnedWords,
          levelDistribution,
          recentSessions: dashStats?.stats?.recentSessions || [],
        });
      } catch (loadError) {
        console.error('Failed to load dashboard data:', loadError);
        setError('Không tải được dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const recentSessions = useMemo(
    () => buildRecentSessions(dashboardData.recentSessions),
    [dashboardData.recentSessions],
  );
  const levelRows = useMemo(
    () => getLevelRows(dashboardData.levelDistribution),
    [dashboardData.levelDistribution],
  );

  const weeklyLearned = recentSessions.reduce((sum, item) => sum + item.words, 0);
  const weeklyTarget = Math.max(Number(dashboardData.targetWeekly) || 0, 1);
  const weeklyPercent = Math.min(100, Math.round((weeklyLearned / weeklyTarget) * 100));
  const masteredWords = Number(dashboardData.levelDistribution[6]) || 0;
  const activeDays = dashboardData.recentSessions.filter((session) => Number(session.wordsLearned) > 0).length;
  const maxLevelValue = Math.max(...levelRows.map((row) => row.value), 1);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pt-4 pb-12">
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
          {error}
        </div>
      )}

      <section className="rounded-[2rem] border border-border bg-card p-6 soft-shadow">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Hôm nay
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
              {dashboardData.userName ? `Chào ${dashboardData.userName}` : 'Bảng học tập'}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Từ hôm nay</div>
                <div className="mt-1 font-mono text-3xl font-black tabular-nums text-foreground">{dashboardData.todayLearned}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Tuần này</div>
                <div className="mt-1 font-mono text-3xl font-black tabular-nums text-foreground">{weeklyLearned}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Mục tiêu tuần</div>
                <div className="mt-2 font-mono text-4xl font-black tabular-nums text-foreground">{weeklyPercent}%</div>
              </div>
              <Target className="h-9 w-9 text-primary" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${weeklyPercent}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold text-muted-foreground">
              <span>{weeklyLearned} từ</span>
              <span>{weeklyTarget} mục tiêu</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Từ đã học" value={dashboardData.totalWords} detail="Đã ghi vào sổ học" icon={BookOpen} />
        <StatTile label="Chuỗi ngày" value={dashboardData.streak} detail="Ngày liên tiếp" icon={Flame} tone="warning" />
        <StatTile label="Master" value={masteredWords} detail="Level 6" icon={Trophy} tone="success" />
        <StatTile label="Ngày hoạt động" value={activeDays} detail="Trong 7 phiên gần nhất" icon={GraduationCap} tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Phiên gần đây" className="xl:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={recentSessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip cursor={{ fill: 'rgba(90,82,255,0.06)' }} />
                <Bar dataKey="words" name="Từ đã học" radius={[8, 8, 4, 4]} barSize={22}>
                  {recentSessions.map((entry) => (
                    <Cell key={entry.label} fill={entry.words > 0 ? 'var(--color-primary)' : 'var(--color-border)'} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="minutes" name="Phút học" stroke="var(--color-muted-foreground)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Phân bố cấp độ">
          <div className="space-y-4">
            {levelRows.map((row) => {
              const percent = Math.round((row.value / maxLevelValue) * 100);
              return (
                <div key={row.level}>
                  <div className="mb-2 flex items-center justify-between text-sm font-bold">
                    <span className="text-foreground">{row.label}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{row.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;
