import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Crown, Flame, Plus, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';

import { fetchWithAuth } from '../../utils/api';
import { Badge, Button, IconSticker, PageHeader, Panel, ProgressBar, StatCard } from '../../components/ui/Primitives';

const VocabularyDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [stats, setStats] = useState({ streak: 0, todayNewWords: 0, levelDistribution: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const pkgs = await fetchWithAuth('/vocabularies/packages');
      setPackages(pkgs);

      const reviewSummary = await fetchWithAuth('/vocabularies/review/count');
      setReviewCount(Number(reviewSummary?.count) || 0);

      const userStats = await fetchWithAuth('/vocabularies/stats');
      setStats(userStats);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        void loadData({ showLoading: false });
      }
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);

    return () => {
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, [loadData]);

  const startReview = () => {
    if (reviewCount === 0) {
      alert('Hôm nay chưa có từ nào cần ôn. Nice, bạn đang rất ổn!');
      return;
    }
    navigate('/dashboard/vocabulary/study?mode=review');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-storybook-green border-t-primary" />
      </div>
    );
  }

  return (
    <div className="se-shell pt-4  space-y-8 pb-12">
      <PageHeader
        eyebrow="Từ vựng mỗi ngày"
        icon={Sparkles}
        title="Học"
        highlight="từ vựng"
        description="Học từ mới, ôn đúng lúc và giữ chuỗi học đều đặn. Mỗi phiên ngắn thôi nhưng vẫn lên trình."
        action={(
          <Button onClick={() => navigate('/dashboard/vocabulary/import')} variant="primary">
            <Plus className="h-5 w-5" aria-hidden="true" />
            Thêm gói từ
          </Button>
        )}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Chuỗi học" value={stats.streak || 0} detail="Ngày liên tiếp" icon={Flame} tone="warning" />
        <StatCard label="Từ mới" value={stats.todayNewWords ?? stats.todayLearned ?? 0} detail="Học mới hôm nay" icon={Target} tone="green" />
        <StatCard label="Thành thạo" value={stats.levelDistribution?.[6] || 0} detail="Từ đã nắm chắc" icon={Crown} tone="default" />
        <StatCard label="Cần ôn" value={reviewCount} detail="Đến lịch hôm nay" icon={Clock} tone="blue" />
      </div>

      <Panel className="se-panel-ink">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <IconSticker icon={BookOpen} className="border-white bg-white text-night-ink" />
            <div>
              <div className="text-sm font-black uppercase tracking-[0.12em] text-fresh-leaf">Đến giờ ôn rồi</div>
              <h2 className="mt-2 text-3xl font-black leading-tight text-white md:text-4xl">
                {reviewCount} từ cần ôn hôm nay
              </h2>
              <p className="mt-3 max-w-xl text-sm font-bold leading-relaxed text-white/75">
                Làm một phiên nhanh bây giờ để não giữ từ lâu hơn. Gọn, chill, không áp lực.
              </p>
            </div>
          </div>
          <Button onClick={startReview} variant="secondary" size="lg" className="w-full border-white bg-white md:w-auto">
            Ôn ngay
          </Button>
        </div>
      </Panel>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="se-heading text-[clamp(30px,4vw,44px)]">Kho từ vựng</h2>
            <p className="se-body mt-2 text-sm">Chọn một gói để học từ mới, ôn lại hoặc xem tiến độ của bạn.</p>
          </div>
        </div>

        {packages.length === 0 ? (
          <Panel className="text-center">
            <IconSticker icon={BookOpen} className="mx-auto" />
            <h3 className="mt-4 text-2xl font-black text-foreground">Chưa có gói từ nào</h3>
            <p className="se-body mx-auto mt-2 max-w-md text-sm">Thêm file JSON đầu tiên để bắt đầu học từ vựng theo cách của bạn.</p>
            <Button onClick={() => navigate('/dashboard/vocabulary/import')} className="mt-6">
              <Plus className="h-5 w-5" aria-hidden="true" />
              Thêm gói từ
            </Button>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg, index) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                index={index}
                onClick={() => navigate(`/dashboard/vocabulary/packages/${pkg.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const PackageCard = ({ pkg, index, onClick }) => {
  const startedWords = pkg.startedWords ?? pkg.learnedWords ?? 0;
  const progress = (pkg.totalWords || 0) > 0 ? (startedWords / pkg.totalWords) * 100 : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      type="button"
      onClick={onClick}
      className="se-panel group flex min-h-[260px] flex-col justify-between text-left transition-transform hover:-translate-y-1 hover:border-primary"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-black leading-tight text-foreground group-hover:text-primary">{pkg.title}</h3>
          {pkg.isPro ? (
            <Badge tone="warning">
              <Crown className="h-3.5 w-3.5" aria-hidden="true" />
              Pro
            </Badge>
          ) : (
            <Badge>Miễn phí</Badge>
          )}
        </div>

        <p className="line-clamp-3 text-sm font-bold leading-relaxed text-muted-foreground">
          {pkg.description || 'Gói từ này chưa có mô tả. Thêm mô tả để biết bạn sẽ học gì trong gói.'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {pkg.totalWords || 0} từ
          </Badge>
          {pkg.level && <Badge tone="blue">Trình độ {pkg.level}</Badge>}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
          <span>Đã bắt đầu</span>
          <span className="text-foreground">{startedWords} / {pkg.totalWords || 0}</span>
        </div>
        <ProgressBar value={progress} />
      </div>
    </motion.button>
  );
};

export default VocabularyDashboard;
