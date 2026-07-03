import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Crown, ArrowUpRight, Flame, Sparkles, Target } from 'lucide-react';
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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-sans pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Không giới hạn tiềm năng
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-secondary tracking-tight">
            Luyện <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Từ Vựng</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            Nắm vững mọi từ vựng mới nhờ vào phương pháp Spaced Repetition thông minh. Duy trì chuỗi ngày học để mở khóa nhiều thành tựu.
          </motion.p>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-orange-400 to-orange-600 p-5 md:p-6 flex flex-col justify-center rounded-[2rem] shadow-lg shadow-orange-500/30 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-tr-[100px] -z-10"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/30 group-hover:rotate-12 transition-transform">
            <Flame className="w-5 h-5 md:w-6 md:h-6 drop-shadow-md" />
          </div>
          <div className="text-4xl md:text-5xl font-black text-white mb-1 font-secondary tracking-tight drop-shadow-md">{stats.streak || 0}</div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Ngày Streak</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 md:p-6 flex flex-col justify-center rounded-[2rem] shadow-lg shadow-blue-500/30 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-tr-[100px] -z-10"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/30 group-hover:rotate-12 transition-transform">
             <Target className="w-5 h-5 md:w-6 md:h-6 drop-shadow-md" />
          </div>
          <div className="text-4xl md:text-5xl font-black text-white mb-1 font-secondary tracking-tight drop-shadow-md">{stats.todayLearned || 0}</div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Từ Đã Học</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-5 md:p-6 flex flex-col justify-center rounded-[2rem] shadow-lg shadow-emerald-500/30 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-tr-[100px] -z-10"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/30 group-hover:-rotate-12 transition-transform">
            <Crown className="w-5 h-5 md:w-6 md:h-6 drop-shadow-md" />
          </div>
          <div className="text-4xl md:text-5xl font-black text-white mb-1 font-secondary tracking-tight drop-shadow-md">{stats.levelDistribution?.[6] || 0}</div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Từ Master</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-[#4318FF] to-[#8854D0] p-5 md:p-6 flex flex-col justify-center rounded-[2rem] shadow-lg shadow-primary/30 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default border border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-tr-[100px] -z-10"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/30 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 md:w-6 md:h-6 drop-shadow-md" />
          </div>
          <div className="text-4xl md:text-5xl font-black text-white mb-1 font-secondary tracking-tight drop-shadow-md">{reviewCount}</div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Cần Ôn Tập</div>
        </motion.div>
      </div>

      {/* Review Banner with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#2B1B54] to-[#EE4266] rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between group shadow-[0_20px_40px_-10px_rgba(238,66,102,0.4)]"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-[#FFC300]/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10 text-center md:text-left mb-6 md:mb-0">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="text-white mt-2">
            <h2 className="text-3xl md:text-4xl font-bold font-secondary mb-2 tracking-tight">
              {reviewCount} từ chờ ôn hôm nay
            </h2>
            <p className="text-white/80 text-sm md:text-base font-medium max-w-md">Ôn tập đúng hạn để củng cố trí nhớ và mở khoá nhiều từ vựng ở cấp độ cao hơn!</p>
          </div>
        </div>
        <button 
          onClick={startReview}
          className="relative z-10 px-8 py-4 bg-white text-[#EE4266] font-bold rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 w-full md:w-auto"
        >
          Bắt đầu ôn tập
        </button>
      </motion.div>

      {/* Library Section */}
      <div className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-foreground font-secondary flex items-center gap-2">
            Thư viện Gói từ vựng
          </h2>
          <button 
            onClick={() => navigate('/dashboard/vocabulary/import')}
            className="px-5 py-2.5 bg-foreground text-white font-semibold rounded-xl hover:bg-foreground/90 transition-all text-sm soft-shadow hover:-translate-y-0.5"
          >
            + Import Gói Mới
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              key={pkg.id} 
              className="group bg-white rounded-3xl p-6 relative overflow-hidden border border-border/50 transition-all duration-300 cursor-pointer soft-shadow hover:soft-shadow-primary hover:border-primary/30 flex flex-col justify-between hover:-translate-y-1"
              onClick={() => navigate(`/dashboard/vocabulary/packages/${pkg.id}`)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10 space-y-4 flex-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-bold text-foreground font-secondary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {pkg.title}
                  </h3>
                  {pkg.isPro ? (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-lg flex items-center gap-1 shrink-0 uppercase tracking-widest shadow-md shadow-orange-500/20">
                      <Crown className="w-3 h-3" /> PRO
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[9px] font-bold rounded-lg shrink-0 uppercase tracking-widest">
                      FREE
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {pkg.description || "Gói từ vựng chưa có mô tả. Thêm mô tả để biết nội dung chính của gói này."}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-bold pt-1">
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{pkg.totalWords} từ</span>
                  </div>
                  {pkg.level && (
                    <div className="px-3 py-1.5 bg-muted rounded-xl text-muted-foreground">
                      Level: {pkg.level}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border/60 relative z-10">
                <div className="flex justify-between text-xs text-muted-foreground font-bold mb-2 uppercase tracking-wider">
                  <span>Tiến độ</span>
                  <span className="text-foreground">{pkg.learnedWords || 0} / {pkg.totalWords || 0}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 relative" 
                    style={{ width: `${(pkg.totalWords || 0) > 0 ? ((pkg.learnedWords || 0) / pkg.totalWords) * 100 : 0}%` }}
                  >
                    <div className="absolute top-0 right-0 w-full h-full bg-white/20 blur-[2px] -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VocabularyDashboard;
