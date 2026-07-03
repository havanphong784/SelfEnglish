import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, Clock, Flame, Layers, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchWithAuth } from '../../utils/api';

const formatSessionDay = (date) => {
  const parsed = new Date(date);
  return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const EmptyPanel = ({ title, copy }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
    <Layers className="mb-3 h-6 w-6 text-primary" />
    <h3 className="text-sm font-bold text-foreground">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{copy}</p>
  </div>
);

const SummaryTile = ({ icon: Icon, title, value, detail, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
    className="rounded-xl surface-flat p-5"
  >
    <div className="mb-6 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="h-2 w-2 animate-soft-pulse rounded-full bg-primary" />
    </div>
    <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    learnedWords: 0,
    totalWords: 0,
    streak: 0,
    todayLearned: 0,
    targetWeekly: null,
    recentSessions: [],
    levelDistribution: {},
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

        const levelDistribution = vocabStats?.levelDistribution || {};
        const learnedWords = Object.values(levelDistribution).reduce((sum, value) => sum + Number(value || 0), 0);
        const recentSessions = dashStats?.stats?.recentSessions || [];

        setStats({
          learnedWords,
          totalWords: dashStats?.stats?.totalWords || learnedWords,
          streak: vocabStats?.streak || dashStats?.user?.streak || 0,
          todayLearned: vocabStats?.todayLearned || 0,
          targetWeekly: vocabStats?.targetWeekly || dashStats?.user?.targetWeekly || null,
          recentSessions: recentSessions.map((session) => ({
            ...session,
            day: formatSessionDay(session.date),
          })),
          levelDistribution,
        });
      } catch (loadError) {
        console.error('Failed to load dashboard data:', loadError);
        setError('Chưa tải được dữ liệu học tập. Bạn có thể thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const levelData = useMemo(() => (
    [1, 2, 3, 4, 5, 6].map((level) => ({
      level: `L${level}`,
      count: Number(stats.levelDistribution?.[level] || 0),
    }))
  ), [stats.levelDistribution]);

  const hasSessions = stats.recentSessions.length > 0;
  const hasLevels = levelData.some((item) => item.count > 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 pt-4">
        <div className="h-44 rounded-xl surface-panel p-6">
          <div className="mb-8 h-4 w-28 rounded-full bg-muted" />
          <div className="h-8 w-72 max-w-full rounded-full bg-muted" />
          <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 rounded-xl surface-flat p-5">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="mt-8 h-8 w-24 rounded-full bg-muted" />
              <div className="mt-4 h-4 w-40 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pt-2 md:space-y-6">
      <section className="rounded-xl surface-panel p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Tổng quan học tập
            </p>
            <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Một phiên nhỏ hôm nay sẽ giữ sổ từ luôn ấm.
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground md:text-base">
              Theo dõi số từ đã đưa vào trí nhớ, chuỗi ngày học và các phiên gần đây. Khi có dữ liệu mới, dashboard sẽ tự phản ánh nhịp học thật của bạn.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Mục tiêu tuần</span>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {stats.targetWeekly ? `${stats.targetWeekly} từ` : 'Chưa đặt'}
            </p>
            <Link
              to="/dashboard/vocabulary"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground pressable"
            >
              Vào thư viện
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          icon={BookOpen}
          title="Từ trong sổ"
          value={stats.totalWords}
          detail={`${stats.learnedWords} từ đã có tiến độ học.`}
          delay={0.05}
        />
        <SummaryTile
          icon={Flame}
          title="Chuỗi ngày"
          value={stats.streak}
          detail="Tăng khi bạn hoàn tất một phiên học trong ngày."
          delay={0.1}
        />
        <SummaryTile
          icon={CalendarDays}
          title="Học hôm nay"
          value={stats.todayLearned}
          detail="Số từ được ghi nhận từ các phiên trong ngày."
          delay={0.15}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_0.85fr]">
        <div className="rounded-xl surface-flat p-5 md:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Phiên gần đây</p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">Từ mới và thời lượng</h3>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              7 phiên mới nhất
            </span>
          </div>

          {hasSessions ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.recentSessions} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="rgba(45,55,48,0.12)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6f786f' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6f786f' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(63,118,97,0.08)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid rgba(45,55,48,0.12)',
                      boxShadow: '0 18px 40px -28px rgba(37,48,40,.42)',
                    }}
                  />
                  <Bar dataKey="wordsLearned" name="Từ đã học" radius={[6, 6, 0, 0]} barSize={22} fill="#3f7661" />
                  <Line
                    type="monotone"
                    dataKey="durationMinutes"
                    name="Phút học"
                    stroke="#252b27"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f6f7f2', stroke: '#252b27', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPanel
              title="Chưa có phiên học"
              copy="Hoàn tất một phiên flashcard để biểu đồ bắt đầu ghi lại nhịp luyện tập của bạn."
            />
          )}
        </div>

        <div className="rounded-xl surface-flat p-5 md:p-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Độ vững từ vựng</p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">Phân bố level</h3>
          </div>

          {hasLevels ? (
            <div className="space-y-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="rgba(45,55,48,0.12)" />
                    <XAxis dataKey="level" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6f786f' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6f786f' }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(63,118,97,0.08)' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid rgba(45,55,48,0.12)' }}
                    />
                    <Bar dataKey="count" name="Số từ" radius={[6, 6, 0, 0]} barSize={26}>
                      {levelData.map((entry, index) => (
                        <Cell key={entry.level} fill={`rgba(63, 118, 97, ${0.32 + index * 0.09})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Level 6 là nhóm đã thuộc. Các level thấp hơn nên quay lại trong phiên ôn tập.
              </p>
            </div>
          ) : (
            <EmptyPanel
              title="Chưa có tiến độ level"
              copy="Bắt đầu học một gói từ để bảng phân bố hiển thị độ vững theo từng cấp."
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
