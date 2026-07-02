import { motion } from 'framer-motion';
import { Flame, BookOpen, Clock, Target } from 'lucide-react';
import ActivityChart from './ActivityChart';
import StatisticsChart from './StatisticsChart';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-6 rounded-2xl flex items-center gap-5 group hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
  >
    {/* Background highlight on hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colorClass.split(' ')[0]}`} />
    
    <div className={`p-4 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${colorClass}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-foreground font-secondary">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground font-secondary bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Tổng quan
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chuỗi ngày học" 
          value="15 ngày" 
          icon={Flame} 
          colorClass="bg-orange-500/20 text-orange-500"
          delay={0.1}
        />
        <StatCard 
          title="Từ vựng đã học" 
          value="248 từ" 
          icon={BookOpen} 
          colorClass="bg-primary/20 text-primary"
          delay={0.2}
        />
        <StatCard 
          title="Thời gian học" 
          value="34 giờ" 
          icon={Clock} 
          colorClass="bg-emerald-500/20 text-emerald-500"
          delay={0.3}
        />
        <StatCard 
          title="Mục tiêu tuần" 
          value="85%" 
          icon={Target} 
          colorClass="bg-accent/20 text-accent"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-panel p-6 rounded-3xl h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-4 font-secondary">Hoạt động học tập</h3>
          <div className="flex-1 min-h-0">
            <ActivityChart />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass-panel p-6 rounded-3xl h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-4 font-secondary">Thống kê điểm số</h3>
          <div className="flex-1 min-h-0">
            <StatisticsChart />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
