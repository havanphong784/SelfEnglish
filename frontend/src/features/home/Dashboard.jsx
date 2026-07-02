import { motion } from 'framer-motion';
import { Flame, BookOpen, Clock, Target } from 'lucide-react';
import ActivityChart from './ActivityChart';
import StatisticsChart from './StatisticsChart';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4"
  >
    <div className={`p-4 rounded-full ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chuỗi ngày học" 
          value="15 ngày" 
          icon={Flame} 
          colorClass="bg-orange-100 text-orange-500 dark:bg-orange-900/20"
          delay={0.1}
        />
        <StatCard 
          title="Từ vựng đã học" 
          value="248 từ" 
          icon={BookOpen} 
          colorClass="bg-blue-100 text-blue-500 dark:bg-blue-900/20"
          delay={0.2}
        />
        <StatCard 
          title="Thời gian học" 
          value="34 giờ" 
          icon={Clock} 
          colorClass="bg-green-100 text-green-500 dark:bg-green-900/20"
          delay={0.3}
        />
        <StatCard 
          title="Mục tiêu tuần" 
          value="85%" 
          icon={Target} 
          colorClass="bg-purple-100 text-purple-500 dark:bg-purple-900/20"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 rounded-xl border shadow-sm h-80"
        >
          <ActivityChart />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card p-6 rounded-xl border shadow-sm h-80"
        >
          <StatisticsChart />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
