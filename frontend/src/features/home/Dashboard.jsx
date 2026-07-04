import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownRight, Download, ChevronDown
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Bar, ComposedChart
} from 'recharts';

// --- Components ---

const StatGaugeIcon = ({ color, isUp }) => (
  <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
    <div className="absolute inset-0 rounded-full opacity-30 blur-md" style={{ backgroundColor: color }}></div>
    <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-sm" viewBox="0 0 36 36">
      <path
        className="text-muted/40"
        strokeWidth="3.5"
        stroke="currentColor"
        fill="none"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        stroke={color}
        strokeWidth="3.5"
        strokeDasharray="75, 100"
        strokeLinecap="round"
        fill="none"
        className="drop-shadow-md"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
    </svg>
    <div className="bg-white rounded-full p-2 shadow-sm relative z-10" style={{ color: color }}>
      {isUp ? <ArrowUpRight className="w-4 h-4 stroke-[3]" /> : <ArrowDownRight className="w-4 h-4 stroke-[3]" />}
    </div>
  </div>
);

const SoftStatCard = ({ title, value, color, isUp, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-[2rem] p-5 md:p-6 flex flex-col justify-between soft-shadow hover:soft-shadow-primary hover:-translate-y-1 transition-all cursor-pointer border border-border/50 group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: color }}></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5 rounded-tr-full -z-10 group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: color }}></div>
    
    <div className="flex justify-between items-start mb-4">
      <div className="shrink-0 group-hover:drop-shadow-xl transition-all">
        <StatGaugeIcon color={color} isUp={isUp} />
      </div>
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-0.5 shadow-sm ${isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        <span>{isUp ? '+12%' : '-4%'}</span>
      </div>
    </div>
    <div className="text-left mt-auto">
      <h3 className="text-3xl md:text-4xl font-black text-foreground font-secondary tracking-tight mb-1">{value}</h3>
      <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
    </div>
  </motion.div>
);

const ProgressBar = ({ label, percentage, color }) => (
  <div className="mb-5 group">
    <div className="flex justify-between text-sm font-semibold mb-2">
      <span className="text-foreground group-hover:text-primary transition-colors">{label}</span>
      <span className="font-bold" style={{ color }}>{percentage}%</span>
    </div>
    <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner p-[1px]">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, delay: 0.2, type: 'spring' }}
        className="h-full rounded-full relative"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
      </motion.div>
    </div>
  </div>
);

// --- Mock Data ---

const frequencyData = [
  { year: 'T2', blue: 30, orange: 20 },
  { year: 'T3', blue: 45, orange: 30 },
  { year: 'T4', blue: 25, orange: 40 },
  { year: 'T5', blue: 60, orange: 50 },
  { year: 'T6', blue: 40, orange: 70 },
  { year: 'T7', blue: 80, orange: 40 },
  { year: 'CN', blue: 50, orange: 60 },
];

const mockNewWordsData = [
  { day: '2010', count: 40, trend: 50 },
  { day: '2011', count: 60, trend: 60 },
  { day: '2012', count: 30, trend: 40 },
  { day: '2013', count: 70, trend: 55 },
  { day: '2014', count: 90, trend: 65 },
  { day: '2015', count: 50, trend: 50 },
  { day: '2016', count: 30, trend: 40 },
  { day: '2017', count: 80, trend: 70 },
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    learnedWords: 0,
    streak: 0,
    newWordsData: mockNewWordsData
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const vocabStats = await fetchWithAuth('/vocabularies/stats');
        const dashStats = await fetchWithAuth('/dashboard/stats');
        
        let learnedCount = 0;
        if (vocabStats && vocabStats.levelDistribution) {
          learnedCount = Object.values(vocabStats.levelDistribution).reduce((sum, val) => sum + val, 0);
        }

        let newWordsData = mockNewWordsData;
        if (dashStats && dashStats.stats && dashStats.stats.recentSessions && dashStats.stats.recentSessions.length > 0) {
          newWordsData = dashStats.stats.recentSessions.map(session => {
            const d = new Date(session.date);
            return {
              day: `${d.getDate()}/${d.getMonth()+1}`,
              count: session.wordsLearned,
              trend: session.wordsLearned + Math.floor(Math.random() * 10)
            };
          });
        }

        setStats({
          learnedWords: learnedCount,
          streak: vocabStats?.streak || dashStats?.user?.streak || 0,
          newWordsData
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 pt-4 pb-12">
      
      {/* Top Controls & Button */}
      <div className="flex justify-end mb-2">
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold soft-shadow transition-colors">
          + Thêm Mục Tiêu
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        <SoftStatCard title="Từ vựng" value={stats.learnedWords.toString()} color="#FF7C53" isUp={true} delay={0.1} />
        <SoftStatCard title="Bài học" value="128" color="#45B2E8" isUp={false} delay={0.2} />
        <SoftStatCard title="Chuỗi ngày" value={stats.streak.toString()} color="#F7B731" isUp={true} delay={0.3} />
        <SoftStatCard title="Thời gian" value="34h" color="#20BF6B" isUp={false} delay={0.4} />
        <SoftStatCard title="Điểm thi" value="880" color="#8854D0" isUp={true} delay={0.5} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 soft-shadow relative">
          <div className="flex items-center justify-between mb-8">
            <button className="flex items-center gap-2 text-sm font-bold text-foreground hover:bg-muted px-3 py-1.5 rounded-xl transition-colors">
              Tần suất học tập <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">Tuần này</p>
                <p className="text-[10px] text-muted-foreground">Nghe: 24h Đọc: 12h</p>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground">Lọc theo</span>
                <span className="text-xs font-bold text-foreground flex items-center">Tuần <ChevronDown className="w-3 h-3 ml-1" /></span>
              </div>
              <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <filter id="shadowBlue" height="200%">
                    <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#4318FF" floodOpacity="0.2"/>
                  </filter>
                  <filter id="shadowOrange" height="200%">
                    <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#FF7C53" floodOpacity="0.2"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Line type="monotone" dataKey="blue" stroke="#4318FF" strokeWidth={4} dot={false} filter="url(#shadowBlue)" />
                <Line type="monotone" dataKey="orange" stroke="#FF7C53" strokeWidth={4} dot={{ r: 6, strokeWidth: 4, fill: '#fff' }} filter="url(#shadowOrange)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Half Donut Chart */}
        <div className="bg-white rounded-[2rem] p-6 soft-shadow flex flex-col relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-foreground">Hoàn thành mục tiêu</h3>
            <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FF7C53" />
                      <stop offset="100%" stopColor="#FFD3A5" />
                    </linearGradient>
                    <filter id="pieShadow" height="200%">
                      <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#FF7C53" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <Pie
                    data={[{ value: 74 }, { value: 26 }]}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="70%"
                    outerRadius="100%"
                    dataKey="value"
                    stroke="none"
                    cornerRadius={10}
                  >
                    <Cell fill="url(#colorOrange)" filter="url(#pieShadow)" />
                    <Cell fill="var(--color-muted)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="absolute bottom-4 flex flex-col items-center">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <span className="text-4xl font-bold font-secondary text-foreground">74%</span>
            </div>
            
            <div className="w-full flex justify-between px-8 absolute bottom-0 translate-y-6">
              <span className="text-xs font-bold text-muted-foreground">0%</span>
              <span className="text-xs font-bold text-muted-foreground">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Bars */}
        <div className="bg-white rounded-[2rem] p-6 soft-shadow relative">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-foreground">Tiến độ kỹ năng</h3>
            <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-6">
            <ProgressBar label="Kỹ năng Nghe" percentage={65} color="#FF7C53" />
            <ProgressBar label="Kỹ năng Nói" percentage={84} color="#45B2E8" />
            <ProgressBar label="Kỹ năng Đọc" percentage={28} color="#20BF6B" />
            <ProgressBar label="Kỹ năng Viết" percentage={16} color="#8854D0" />
          </div>
        </div>

        {/* Bar + Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 soft-shadow relative">
          <div className="flex items-center justify-between mb-8">
            <button className="flex items-center gap-2 text-sm font-bold text-foreground hover:bg-muted px-3 py-1.5 rounded-xl transition-colors">
              Từ vựng mới <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 px-3 py-1 rounded-xl border border-orange-100 flex flex-col">
                <span className="text-[10px] font-bold text-foreground">Tuần này</span>
                <span className="text-xs text-orange-500 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> 28%
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground">Lọc theo</span>
                <span className="text-xs font-bold text-foreground flex items-center">Ngày <ChevronDown className="w-3 h-3 ml-1" /></span>
              </div>
              <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.newWordsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4318FF" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#4318FF" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7C53" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#FF7C53" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip cursor={{fill: 'transparent'}} />
                {/* We use two bars to alternate colors based on data or just use one for simplicity */}
                <Bar dataKey="count" fill="url(#barBlue)" radius={[10, 10, 10, 10]} barSize={20} />
                <Line type="monotone" dataKey="trend" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 6, fill: '#FF7C53', stroke: '#fff', strokeWidth: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
