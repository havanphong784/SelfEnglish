import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { BookOpen, CheckCircle2, ChevronLeft, Crown, Play, RotateCcw } from 'lucide-react';

const LEVEL_STYLES = {
  0: { background: '#e9eee7', color: '#6f786f' },
  1: { background: 'rgba(183,91,74,0.14)', color: '#8f4436' },
  2: { background: 'rgba(168,117,45,0.14)', color: '#81591f' },
  3: { background: 'rgba(168,117,45,0.22)', color: '#6f4a18' },
  4: { background: 'rgba(63,118,97,0.14)', color: '#315f4d' },
  5: { background: 'rgba(63,118,97,0.22)', color: '#2a5444' },
  6: { background: '#3f7661', color: '#fbfcf8' },
};

const LoadingState = () => (
  <div className="mx-auto max-w-7xl space-y-5 pt-2">
    <div className="h-60 rounded-xl surface-panel p-6">
      <div className="h-4 w-28 rounded-full bg-muted" />
      <div className="mt-10 h-10 w-80 max-w-full rounded-full bg-muted" />
      <div className="mt-5 h-4 w-[30rem] max-w-full rounded-full bg-muted" />
    </div>
    <div className="h-80 rounded-xl surface-flat p-6">
      <div className="h-5 w-44 rounded-full bg-muted" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-12 rounded-lg bg-muted/70" />
        ))}
      </div>
    </div>
  </div>
);

const PackageDetails = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [masteringId, setMasteringId] = useState(null);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/vocabularies/packages/${packageId}/details`);
      setDetails(data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết gói:', error);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleMaster = async (wordId) => {
    try {
      setMasteringId(wordId);
      await fetchWithAuth(`/vocabularies/${wordId}/master`, { method: 'POST' });
      setDetails((prev) => {
        const oldWord = prev.words.find((word) => word.id === wordId);
        const oldLevel = oldWord?.level || 0;
        const words = prev.words.map((word) => (word.id === wordId ? { ...word, level: 6 } : word));
        const levelDistribution = { ...prev.levelDistribution };

        levelDistribution[oldLevel] = Math.max(0, (levelDistribution[oldLevel] || 0) - 1);
        levelDistribution[6] = (levelDistribution[6] || 0) + 1;

        return {
          ...prev,
          words,
          levelDistribution,
          learnedWords: prev.totalWords - (levelDistribution[0] || 0),
        };
      });
    } catch (error) {
      console.error('Lỗi khi đánh dấu thuộc:', error);
    } finally {
      setMasteringId(null);
    }
  };

  const progressPercent = useMemo(() => {
    if (!details?.totalWords) return 0;
    return Math.round((details.learnedWords / details.totalWords) * 100);
  }, [details]);

  if (loading) return <LoadingState />;

  if (!details) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl surface-panel p-8 text-center">
        <h1 className="text-xl font-bold text-foreground">Không tìm thấy dữ liệu</h1>
        <button
          onClick={() => navigate('/dashboard/vocabulary')}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground pressable"
        >
          Quay lại thư viện
        </button>
      </div>
    );
  }

  const renderProgressBar = () => {
    const total = details.totalWords;
    if (total === 0) return <div className="h-3 rounded-full bg-muted" />;

    return (
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {[1, 2, 3, 4, 5, 6].map((level) => {
          const count = details.levelDistribution[level] || 0;
          const percent = (count / total) * 100;
          if (percent === 0) return null;

          return (
            <div
              key={level}
              style={{ width: `${percent}%`, backgroundColor: LEVEL_STYLES[level].color }}
              title={`Level ${level}: ${count} từ`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pt-2">
      <button
        onClick={() => navigate('/dashboard/vocabulary')}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-muted-foreground pressable hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại thư viện
      </button>

      <section className="rounded-xl surface-panel p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                {details.totalWords} từ
              </span>
              {details.isPro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-warning">
                  <Crown className="h-3.5 w-3.5" />
                  Pro
                </span>
              )}
            </div>
            <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {details.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground md:text-base">
              {details.description || 'Gói này chưa có mô tả. Bạn vẫn có thể bắt đầu học hoặc ôn lại các từ đã có tiến độ.'}
            </p>

            <div className="mt-8 max-w-2xl space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Tiến độ học</span>
                <span className="text-foreground tabular-nums">{details.learnedWords} / {details.totalWords} từ</span>
              </div>
              {renderProgressBar()}
              <p className="text-sm font-medium text-muted-foreground">{progressPercent}% gói này đã có tiến độ.</p>
            </div>
          </div>

          <div className="grid gap-3">
            <button
              onClick={() => navigate(`/dashboard/vocabulary/study?packageId=${details.id}&mode=learn`)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground pressable hover:bg-primary/90"
            >
              <Play className="h-4 w-4 fill-current" />
              Học từ mới
            </button>
            <button
              onClick={() => navigate(`/dashboard/vocabulary/study?packageId=${details.id}&mode=practice`)}
              disabled={details.learnedWords === 0}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground pressable disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Ôn lại ({details.learnedWords} từ)
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl surface-flat p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Ledger</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Danh sách từ vựng</h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Level cao hơn nghĩa là khoảng ôn dài hơn.</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="bg-muted/60">
                <th className="p-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Từ vựng</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Nghĩa</th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Level</th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Ôn tiếp</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {details.words.map((word) => {
                const style = LEVEL_STYLES[word.level] || LEVEL_STYLES[0];

                return (
                  <tr key={word.id} className="border-t border-border bg-card hover:bg-muted/30">
                    <td className="p-4">
                      <div className="text-base font-bold text-foreground">{word.word}</div>
                      <div className="mt-1 font-mono text-sm text-muted-foreground">{word.ipa || 'Chưa có IPA'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium leading-6 text-foreground">{word.meaning}</td>
                    <td className="p-4 text-center">
                      <span
                        className="inline-flex rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                        style={style}
                      >
                        {word.level === 6 ? 'Master' : word.level > 0 ? `Level ${word.level}` : 'Chưa học'}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-muted-foreground">
                      {word.nextReview
                        ? new Date(word.nextReview).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="p-4 text-right">
                      {word.level < 6 && (
                        <button
                          onClick={() => handleMaster(word.id)}
                          disabled={masteringId === word.id}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary/10 px-3 text-sm font-bold text-primary pressable hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Đã thuộc
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PackageDetails;
