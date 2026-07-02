import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'T2', words: 20, time: 30 },
  { name: 'T3', words: 35, time: 45 },
  { name: 'T4', words: 15, time: 20 },
  { name: 'T5', words: 50, time: 60 },
  { name: 'T6', words: 42, time: 50 },
  { name: 'T7', words: 10, time: 15 },
  { name: 'CN', words: 60, time: 90 },
];

const StatisticsChart = () => {
  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Thống kê học tập tuần này</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.2} />
            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            <Line type="monotone" dataKey="words" stroke="hsl(var(--primary))" strokeWidth={3} name="Từ vựng" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={3} name="Thời gian (phút)" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsChart;
