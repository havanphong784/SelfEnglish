import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Crown, Flame, Import, Layers, Target } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { motion } from 'framer-motion';

const StatPill = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <Icon className="mb-4 h-5 w-5 text-primary" />
    <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
  </div>
);

const LoadingState = () => (
  <div className="mx-auto max-w-7xl space-y-5 pt-2">
    <div className="h-56 rounded-xl surface-panel p-6">
      <div className="h-4 w-28 rounded-full bg-muted" />
      <div className="mt-10 h-10 w-80 max-w-full rounded-full bg-muted" />
      <div className="mt-5 h-4 w-[28rem] max-w-full rounded-full bg-muted" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-52 rounded-xl surface-flat p-5">
          <div className="h-6 w-2/3 rounded-full bg-muted" />
          <div className="mt-5 h-4 w-full rounded-full bg-muted" />
          <div className="mt-12 h-2 w-full rounded-full bg-muted" />
        </div>
      ))}
    </div>
  </div>
);

const VocabularyDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [stats, setStats] = useState({ streak: 0, todayLearned: 0, levelDistribution: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [pkgs, reviews, userStats] = await Promise.all([
        fetchWithAuth('/vocabularies/packages'),
        fetchWithAuth('/vocabularies/review'),
        fetchWithAuth('/vocabularies/stats'),
      ]);

      setPackages(pkgs);
      setReviewCount(reviews.length);
      setStats(userStats);
    } catch (loadError) {
      console.error('Lỗi khi tải dữ liệu:', loadError);
      setError('Chưa tải được thư viện từ vựng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const masteredCount = useMemo(() => stats.levelDistribution?.[6] || 0, [stats.levelDistribution]);

  const startReview = () => {
    if (reviewCount === 0) {
      alert('Bạn chưa có từ nào cần ôn hôm nay.');
      return;
    }
    navigate('/dashboard/vocabulary/study?mode=review');
  };

  if (loading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pt-2">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl surface-panel p-6 md:p-8">
          <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Từ vựng
          </p>
          <h1 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Xây sổ từ, ôn đúng lúc, giữ trí nhớ nhẹ hơn.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground md:text-base">
            Mỗi gói từ là một cụm bài riêng. Bạn có thể nhập JSON, học từ mới và để hệ thống đưa từ cần ôn về đúng hàng đợi.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={startReview}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground pressable hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              Ôn {reviewCount} từ hôm nay
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard/vocabulary/import')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground pressable hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <Import className="h-4 w-4" />
              Import gói mới
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatPill icon={Flame} label="Chuỗi ngày" value={stats.streak || 0} />
          <StatPill icon={Target} label="Học hôm nay" value={stats.todayLearned || 0} />
          <StatPill icon={Crown} label="Đã master" value={masteredCount} />
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-xl surface-flat p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Thư viện</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Gói từ vựng</h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{packages.length} gói đang có trong thư viện</p>
        </div>

        {packages.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Layers className="mb-4 h-8 w-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Chưa có gói từ nào</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Import một file JSON có trường word và meaning để tạo gói học đầu tiên.
            </p>
            <button
              onClick={() => navigate('/dashboard/vocabulary/import')}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground pressable"
            >
              <Import className="h-4 w-4" />
              Import gói mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg, index) => {
              const totalWords = pkg.totalWords || 0;
              const learnedWords = pkg.learnedWords || 0;
              const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

              return (
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.36 }}
                  key={pkg.id}
                  type="button"
                  className="group flex min-h-[230px] flex-col rounded-xl border border-border bg-card p-5 text-left pressable hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  onClick={() => navigate(`/dashboard/vocabulary/packages/${pkg.id}`)}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary">
                        {pkg.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {pkg.description || 'Gói từ này chưa có mô tả.'}
                      </p>
                    </div>
                    {pkg.isPro ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-warning">
                        <Crown className="h-3 w-3" />
                        Pro
                      </span>
                    ) : (
                      <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Free
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-primary">
                        <BookOpen className="h-3.5 w-3.5" />
                        {totalWords} từ
                      </span>
                      {pkg.level && (
                        <span className="rounded-md bg-muted px-2.5 py-1.5">
                          Level {pkg.level}
                        </span>
                      )}
                      {pkg.isOwner && (
                        <span className="rounded-md bg-muted px-2.5 py-1.5">Của bạn</span>
                      )}
                    </div>

                    <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      <span>Tiến độ</span>
                      <span className="text-foreground tabular-nums">{learnedWords} / {totalWords}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default VocabularyDashboard;
