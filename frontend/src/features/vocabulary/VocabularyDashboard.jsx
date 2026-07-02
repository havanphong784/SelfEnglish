import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Crown } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const VocabularyDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [stats, setStats] = useState({ streak: 0, todayLearned: 0, levelDistribution: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Lấy danh sách gói
      const pkgs = await fetchWithAuth('/vocabularies/packages');
      setPackages(pkgs);

      // Lấy số từ cần ôn hôm nay
      const reviews = await fetchWithAuth('/vocabularies/review');
      setReviewCount(reviews.length);

      // Lấy thống kê
      const userStats = await fetchWithAuth('/vocabularies/stats');
      setStats(userStats);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };





  const startReview = () => {
    if (reviewCount === 0) {
      alert("Bạn không có từ vựng nào cần ôn hôm nay!");
      return;
    }
    navigate(`/dashboard/vocabulary/study?mode=review`);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Luyện từ vựng</h1>
        <p className="text-muted-foreground">Chinh phục từ vựng với phương pháp lặp lại ngắt quãng kết hợp đa dạng bài tập.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="text-4xl font-black text-orange-500 mb-1 font-secondary drop-shadow-md">{stats.streak || 0}</div>
          <div className="text-sm font-medium text-muted-foreground">Ngày Streak</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="text-4xl font-black text-blue-500 mb-1 font-secondary drop-shadow-md">{stats.todayLearned || 0}</div>
          <div className="text-sm font-medium text-muted-foreground">Từ đã học hôm nay</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="text-4xl font-black text-emerald-500 mb-1 font-secondary drop-shadow-md">{stats.levelDistribution?.[6] || 0}</div>
          <div className="text-sm font-medium text-muted-foreground">Từ đã Master (Lv 6)</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="text-4xl font-black text-accent mb-1 font-secondary drop-shadow-md">{reviewCount}</div>
          <div className="text-sm font-medium text-muted-foreground">Từ chờ ôn tập</div>
        </div>
      </div>

      {/* Banner Ôn Tập */}
      <div className="relative overflow-hidden glass-panel border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 flex items-center justify-between group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-secondary mb-1">
              {reviewCount} từ cần ôn hôm nay
            </h2>
            <p className="text-muted-foreground text-sm font-medium">Ôn ngay để giữ vững trí nhớ và nâng cao Level</p>
          </div>
        </div>
        <button 
          onClick={startReview}
          className="relative z-10 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1"
        >
          Ôn ngay
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-6">
        <h2 className="text-3xl font-bold text-foreground font-secondary">Thư viện Gói từ vựng</h2>
        <button 
          onClick={() => navigate('/dashboard/vocabulary/import')}
          className="px-5 py-2.5 glass-panel text-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-colors font-medium whitespace-nowrap shadow-sm hover:shadow-primary/10"
        >
          Import Gói Từ Vựng
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="group glass-panel rounded-2xl p-6 relative overflow-hidden hover:border-primary/50 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 flex flex-col justify-between"
            onClick={() => navigate(`/dashboard/vocabulary/packages/${pkg.id}`)}
          >
            {/* Abstract Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 space-y-5 flex-1">
              {/* Header: Title & Badge */}
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-2xl font-bold text-foreground font-secondary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {pkg.title}
                </h3>
                {pkg.isPro ? (
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20 flex items-center gap-1.5 shrink-0">
                    <Crown className="w-3.5 h-3.5" /> PRO
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20 shrink-0">
                    FREE
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {pkg.description || "Gói từ vựng chưa có mô tả."}
              </p>
              
              {/* Meta Info */}
              <div className="flex items-center gap-3 text-sm text-foreground/70 font-medium pt-2">
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{pkg.totalWords} từ</span>
                </div>
                {pkg.level && (
                  <div className="px-3 py-1.5 bg-background/50 rounded-lg border border-white/5 shadow-sm">
                    {pkg.level}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-5 border-t border-white/5 relative z-10">
              <div className="flex justify-between text-xs text-muted-foreground font-medium mb-2.5">
                <span className="tracking-wide uppercase text-[10px]">Tiến độ học</span>
                <span className="text-foreground/90">{pkg.learnedWords || 0} / {pkg.totalWords || 0}</span>
              </div>
              <div className="h-2.5 w-full bg-black/20 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-accent to-pink-500 rounded-full transition-all duration-1000 relative" 
                  style={{ width: `${(pkg.totalWords || 0) > 0 ? ((pkg.learnedWords || 0) / pkg.totalWords) * 100 : 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyDashboard;
