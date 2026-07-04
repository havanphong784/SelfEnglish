import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, CheckCircle2, Play, RotateCcw, Crown } from 'lucide-react';

const LEVEL_COLORS = {
  0: 'bg-muted-foreground/30', // Chưa học
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-emerald-500',
  5: 'bg-blue-500',
  6: 'bg-primary' // Master
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải chi tiết...</div>;
  if (!details) return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu</div>;

  const renderProgressBar = () => {
    const total = details.totalWords;
    if (total === 0) return null;

    return (
      <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex shadow-inner">
        {[1, 2, 3, 4, 5, 6].map(lvl => {
          const count = details.levelDistribution[lvl] || 0;
          const percent = (count / total) * 100;
          if (percent === 0) return null;
          return (
            <div 
              key={lvl} 
              style={{ width: `${percent}%` }} 
              className={`${LEVEL_COLORS[lvl]} transition-all duration-500 cursor-help`}
              title={`Level ${lvl}: ${count} từ`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/dashboard/vocabulary')}
        className="flex items-center gap-2 text-muted-foreground font-bold hover:text-primary transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Quay lại Thư viện
      </button>

      <div className="bg-white rounded-[2rem] p-8 relative overflow-hidden soft-shadow">
        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-foreground tracking-tight font-secondary">{details.title}</h1>
              {details.isPro && (
                <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-1.5 shrink-0 uppercase tracking-widest">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{details.description}</p>
            
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                <span className="text-muted-foreground">Tiến độ học: <span className="text-foreground">{details.learnedWords}</span> / {details.totalWords} từ</span>
                <span className="text-primary">{Math.round((details.learnedWords / details.totalWords) * 100) || 0}%</span>
              </div>
              {renderProgressBar()}
              <div className="flex gap-4 pt-2 text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${LEVEL_COLORS[1]}`}></div> Level 1</div>
                <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${LEVEL_COLORS[6]}`}></div> Master</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px] justify-center">
            <button 
              onClick={() => navigate(`/dashboard/vocabulary/study?packageId=${details.id}&mode=learn`)}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20"
            >
              <Play className="w-5 h-5 fill-current" />
              Học từ mới
            </button>
            <button 
              onClick={() => navigate(`/dashboard/vocabulary/study?packageId=${details.id}&mode=practice`)}
              disabled={details.learnedWords === 0}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-muted text-muted-foreground hover:bg-muted/80 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-5 h-5" />
              Ôn lại ({details.learnedWords} từ)
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-secondary text-foreground">Danh sách từ vựng</h2>
        <div className="bg-white rounded-[2rem] overflow-hidden soft-shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-5 font-bold text-muted-foreground w-1/4 uppercase text-xs tracking-wider">Từ vựng</th>
                <th className="p-5 font-bold text-muted-foreground w-1/4 uppercase text-xs tracking-wider">Nghĩa</th>
                <th className="p-5 font-bold text-muted-foreground text-center uppercase text-xs tracking-wider">Level</th>
                <th className="p-5 font-bold text-muted-foreground text-center uppercase text-xs tracking-wider">Lịch ôn tiếp</th>
                <th className="p-5 font-bold text-muted-foreground text-right uppercase text-xs tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {details.words.map(w => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-lg text-foreground font-secondary">{w.word}</div>
                    <div className="text-sm text-muted-foreground">{w.ipa}</div>
                  </td>
                  <td className="p-5 text-foreground font-medium">{w.meaning}</td>
                  <td className="p-5 text-center">
                    {w.level > 0 ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] uppercase tracking-widest font-bold ${LEVEL_COLORS[w.level]} text-white`}>
                        {w.level === 6 ? 'Master' : `Level ${w.level}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] uppercase tracking-widest font-bold bg-muted text-muted-foreground">
                        Chưa học
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center text-sm text-muted-foreground font-medium">
                    {w.nextReview ? new Date(w.nextReview).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="p-5 text-right">
                    {w.level < 6 && (
                      <button 
                        onClick={() => handleMaster(w.id)}
                        disabled={masteringId === w.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Đã thuộc
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
