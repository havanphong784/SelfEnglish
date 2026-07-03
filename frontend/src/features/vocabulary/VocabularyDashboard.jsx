import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Crown, ArrowUpRight } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { motion } from 'framer-motion';

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
      const pkgs = await fetchWithAuth('/vocabularies/packages');
      setPackages(pkgs);

      const reviews = await fetchWithAuth('/vocabularies/review');
      setReviewCount(reviews.length);

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
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 font-secondary">Luyện từ vựng</h1>
        <p className="text-muted-foreground">Chinh phục từ vựng với phương pháp lặp lại ngắt quãng kết hợp đa dạng bài tập.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 flex flex-col items-center justify-center text-center rounded-3xl soft-shadow relative overflow-hidden group">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1 font-secondary">{stats.streak || 0}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày Streak</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 flex flex-col items-center justify-center text-center rounded-3xl soft-shadow relative overflow-hidden group">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
             <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1 font-secondary">{stats.todayLearned || 0}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Từ đã học hôm nay</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 flex flex-col items-center justify-center text-center rounded-3xl soft-shadow relative overflow-hidden group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Crown className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-1 font-secondary">{stats.levelDistribution?.[6] || 0}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Từ Master (Lv 6)</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 flex flex-col items-center justify-center text-center rounded-3xl soft-shadow relative overflow-hidden group border-2 border-primary/10">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1 font-secondary">{reviewCount}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary/70">Chờ ôn tập</div>
        </motion.div>
      </div>

      {/* Banner Ôn Tập */}
      <div className="relative overflow-hidden bg-white border border-border rounded-3xl p-8 flex items-center justify-between group soft-shadow">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-rose-50 opacity-50"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-secondary mb-2">
              {reviewCount} từ cần ôn hôm nay
            </h2>
            <p className="text-muted-foreground text-sm font-medium">Ôn tập đúng hạn để giữ vững tiến độ và đạt mục tiêu.</p>
          </div>
        </div>
        <button 
          onClick={startReview}
          className="relative z-10 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1"
        >
          Ôn tập ngay
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground font-secondary">Thư viện Gói từ vựng</h2>
        <button 
          onClick={() => navigate('/dashboard/vocabulary/import')}
          className="px-6 py-3 bg-white text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors whitespace-nowrap soft-shadow-sm"
        >
          + Import Gói Mới
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={pkg.id} 
            className="group bg-white rounded-[2rem] p-6 relative overflow-hidden hover:border-primary/50 border border-transparent transition-all duration-300 cursor-pointer soft-shadow hover:soft-shadow-primary flex flex-col justify-between"
            onClick={() => navigate(`/dashboard/vocabulary/packages/${pkg.id}`)}
          >
            <div className="relative z-10 space-y-5 flex-1">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-bold text-foreground font-secondary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {pkg.title}
                </h3>
                {pkg.isPro ? (
                  <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-1.5 shrink-0 uppercase tracking-widest">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full shrink-0 uppercase tracking-widest">
                    FREE
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {pkg.description || "Gói từ vựng chưa có mô tả."}
              </p>
              
              <div className="flex items-center gap-3 text-sm text-foreground/70 font-bold pt-2">
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{pkg.totalWords} từ</span>
                </div>
                {pkg.level && (
                  <div className="px-3 py-1.5 bg-muted/50 rounded-xl text-muted-foreground">
                    {pkg.level}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border relative z-10">
              <div className="flex justify-between text-xs text-muted-foreground font-bold mb-2.5 uppercase tracking-wider">
                <span>Tiến độ học</span>
                <span className="text-foreground">{pkg.learnedWords || 0} / {pkg.totalWords || 0}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${(pkg.totalWords || 0) > 0 ? ((pkg.learnedWords || 0) / pkg.totalWords) * 100 : 0}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyDashboard;
