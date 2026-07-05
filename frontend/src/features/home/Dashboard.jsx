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
import { Badge, Panel, ProgressBar, StatCard } from '../../components/ui/Primitives';

const levelLabels = {
  1: 'L1',
  2: 'L2',
  3: 'L3',
  4: 'L4',
  5: 'L5',
  6: 'Thành thạo',
};

const emptyLevelDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

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

const ChartPanel = ({ title, action, children, className = '' }) => (
  <Panel className={className}>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="se-label text-foreground">{title}</h2>
      {action}
    </div>
    {children}
  </Panel>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 pt-4">
    <div className="h-36 animate-pulse rounded-xl border-2 border-border bg-muted" />
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-xl border-2 border-border bg-muted" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="h-80 animate-pulse rounded-xl border-2 border-border bg-muted lg:col-span-2" />
      <div className="h-80 animate-pulse rounded-xl border-2 border-border bg-muted" />
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
      setError('Không tải được dữ liệu học tập. Thử lại sau một chút nhé.');
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
    <div className="se-shell space-y-6 pt-4 pb-12">
      {error && (
        <div className="rounded-xl border-2 border-[#f2d15b] bg-[#fff9da] px-5 py-4 text-sm font-bold text-[#8a6200]">
          {error}
        </div>
      )}

      <Panel className="se-panel-strong">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <Badge tone="green" className="mb-3">
              <CalendarDays className="h-3.5 w-3.5" />
              Hôm nay
            </Badge>
            <h1 className="se-page-title">
              {dashboardData.userName ? `Chào ${dashboardData.userName}` : 'Tổng quan học tập'}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-xl border-2 border-primary bg-white px-4 py-3">
                <div className="se-label text-[12px]">Từ mới hôm nay</div>
                <div className="mt-1 font-secondary text-3xl font-black tabular-nums text-foreground">{dashboardData.todayLearned}</div>
              </div>
              <div className="rounded-xl border-2 border-primary bg-white px-4 py-3">
                <div className="se-label text-[12px]">Từ đã học tuần này</div>
                <div className="mt-1 font-secondary text-3xl font-black tabular-nums text-foreground">{weeklyLearned}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-primary bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="se-label text-[12px]">Mục tiêu tuần</div>
                <div className="se-stat-value mt-2">{weeklyPercent}%</div>
              </div>
              <Target className="h-9 w-9 text-primary" />
            </div>
            <ProgressBar value={weeklyPercent} className="mt-4" />
            <div className="mt-3 flex justify-between text-xs font-bold text-muted-foreground">
              <span>{weeklyLearned} từ</span>
              <span>{weeklyTarget} mục tiêu</span>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng từ vựng" value={dashboardData.totalWords} detail="Đã lưu trong kho từ" icon={BookOpen} />
        <StatCard label="Chuỗi học" value={dashboardData.streak} detail="Ngày học liên tiếp" icon={Flame} tone="warning" />
        <StatCard label="Thành thạo" value={masteredWords} detail="Từ đã nắm chắc" icon={Trophy} tone="green" />
        <StatCard label="Ngày có học" value={activeDays} detail="Trong 7 phiên gần nhất" icon={GraduationCap} tone="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartPanel title="Lịch học gần đây" className="xl:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={recentSessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip cursor={{ fill: 'rgba(88, 204, 2, 0.12)' }} contentStyle={{ border: '2px solid var(--color-border)', borderRadius: 12, color: 'var(--color-foreground)' }} />
                <Bar dataKey="words" name="Từ đã học" radius={[8, 8, 4, 4]} barSize={22}>
                  {recentSessions.map((entry) => (
                    <Cell key={entry.label} fill={entry.words > 0 ? 'var(--color-primary)' : 'var(--color-border)'} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="minutes" name="Phút học" stroke="var(--color-accent)" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="Trình độ từ vựng">
          <div className="space-y-4">
            {levelRows.map((row) => {
              const percent = Math.round((row.value / maxLevelValue) * 100);
              return (
                <div key={row.level}>
                  <div className="mb-2 flex items-center justify-between text-sm font-bold">
                    <span className="text-foreground">{row.label}</span>
                    <span className="font-secondary tabular-nums text-muted-foreground">{row.value}</span>
                  </div>
                  <ProgressBar value={percent} />
                </div>
              );
            })}
          </div>
        </ChartPanel>
      </div>
    </div>
  );
};

export default Dashboard;
