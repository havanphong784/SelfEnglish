import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, CheckCircle2, Play, RotateCcw, Crown } from 'lucide-react';
import { Badge, Button, Panel } from '../../components/ui/Primitives';

const LEVEL_COLORS = {
  0: 'bg-muted',
  1: 'bg-storybook-green',
  2: 'bg-fresh-leaf',
  3: 'bg-primary',
  4: 'bg-accent',
  5: 'bg-night-ink',
  6: 'bg-primary'
};

const LEVEL_BADGES = {
  0: 'border-border bg-muted text-muted-foreground',
  1: 'border-primary bg-storybook-green text-foreground',
  2: 'border-primary bg-fresh-leaf text-foreground',
  3: 'border-primary bg-primary text-white',
  4: 'border-accent bg-accent text-white',
  5: 'border-night-ink bg-night-ink text-white',
  6: 'border-primary bg-primary text-white',
};

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
      setDetails(prev => {
        const newWords = prev.words.map(w => w.id === wordId ? { ...w, level: 6 } : w);
        const newDist = { ...prev.levelDistribution };
        const oldLevel = prev.words.find(w => w.id === wordId).level;
        newDist[oldLevel]--;
        newDist[6]++;
        const newLearned = prev.totalWords - newDist[0];
        
        return {
          ...prev,
          words: newWords,
          levelDistribution: newDist,
          learnedWords: newLearned
        };
      });
    } catch (error) {
      console.error('Lỗi khi đánh dấu thuộc:', error);
    } finally {
      setMasteringId(null);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-muted-foreground">Đang mở gói từ...</div>;
  if (!details) return <div className="p-8 text-center font-bold text-danger">Không tìm thấy dữ liệu</div>;

  const renderProgressBar = () => {
    const total = details.totalWords;
    if (total === 0) return null;

    return (
      <div className="flex h-4 w-full overflow-hidden rounded-full border-2 border-border bg-muted">
        {[1, 2, 3, 4, 5, 6].map(lvl => {
          const count = details.levelDistribution[lvl] || 0;
          const percent = (count / total) * 100;
          if (percent === 0) return null;
          return (
            <div 
              key={lvl} 
              style={{ width: `${percent}%` }} 
              className={`${LEVEL_COLORS[lvl]} transition-all duration-500 cursor-help`}
              title={`Mức ${lvl}: ${count} từ`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="se-shell space-y-8 pb-12">
      <Button
        onClick={() => navigate('/dashboard/vocabulary')}
        variant="ghost"
      >
        <ChevronLeft className="w-5 h-5" />
        Quay lại kho từ
      </Button>

      <Panel>
        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="se-page-title">{details.title}</h1>
              {details.isPro && (
                <Badge tone="warning"><Crown className="w-3 h-3" /> Pro</Badge>
              )}
            </div>
            <p className="se-body">{details.description}</p>
            
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm font-black uppercase tracking-[0.08em]">
                <span className="text-muted-foreground">Đã học: <span className="text-foreground">{details.learnedWords}</span> / {details.totalWords} từ</span>
                <span className="text-primary">{Math.round((details.learnedWords / details.totalWords) * 100) || 0}%</span>
              </div>
              {renderProgressBar()}
              <div className="flex gap-4 pt-2 text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${LEVEL_COLORS[1]}`}></div> Mức 1</div>
                <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${LEVEL_COLORS[6]}`}></div> Thành thạo</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px] justify-center">
            <Button
              onClick={() => navigate(`/dashboard/vocabulary/study?packageId=${details.id}&mode=learn`)}
              size="lg"
              className="w-full"
            >
              <Play className="w-5 h-5 fill-current" />
              Học từ mới
            </Button>
            <Button
              onClick={() => navigate(`/dashboard/vocabulary/study?packageId=${details.id}&mode=practice`)}
              disabled={details.learnedWords === 0}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <RotateCcw className="w-5 h-5" />
              Ôn lại ({details.learnedWords} từ)
            </Button>
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        <h2 className="se-heading text-[clamp(30px,4vw,44px)]">Từ trong gói</h2>
        <Panel className="overflow-x-auto p-0">
          <table className="se-table min-w-[880px]">
            <thead>
              <tr>
                <th className="w-1/4">Từ tiếng Anh</th>
                <th className="w-1/4">Nghĩa</th>
                <th className="text-center">Mức nhớ</th>
                <th className="text-center">Lần ôn tiếp</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {details.words.map(w => (
                <tr key={w.id} className="hover:bg-muted/60">
                  <td>
                    <div className="font-secondary text-lg font-black text-foreground">{w.word}</div>
                    <div className="text-sm text-muted-foreground">{w.ipa}</div>
                  </td>
                  <td className="font-bold text-foreground">{w.meaning}</td>
                  <td className="text-center">
                    {w.level > 0 ? (
                      <span className={`inline-flex items-center rounded-xl border-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${LEVEL_BADGES[w.level]}`}>
                        {w.level === 6 ? 'Thành thạo' : `Mức ${w.level}`}
                      </span>
                    ) : (
                      <Badge>Chưa học</Badge>
                    )}
                  </td>
                  <td className="text-center text-sm font-bold text-muted-foreground">
                    {w.nextReview ? new Date(w.nextReview).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="text-right">
                    {w.level < 6 && (
                      <Button
                        onClick={() => handleMaster(w.id)}
                        disabled={masteringId === w.id}
                        variant="soft"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mình nhớ rồi
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};

export default PackageDetails;
