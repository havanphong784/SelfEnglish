const ActivityChart = () => {
  // Generate dummy data (7 rows, 20 cols) cho biểu đồ contribution
  const weeks = 20;
  const days = 7;
  
  const getIntensityColor = (level) => {
    switch(level) {
      case 1: return 'bg-green-200 dark:bg-green-900/40';
      case 2: return 'bg-green-400 dark:bg-green-700/60';
      case 3: return 'bg-green-600 dark:bg-green-500/80';
      case 4: return 'bg-green-800 dark:bg-green-400';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Mức độ hoạt động</h3>
      <div className="flex-1 flex items-center justify-center overflow-x-auto py-2">
        <div className="flex gap-1.5">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1.5">
              {Array.from({ length: days }).map((_, d) => {
                // Random intensity 0-4 for demo
                const level = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
                return (
                  <div 
                    key={`${w}-${d}`} 
                    className={`w-4 h-4 rounded-sm ${getIntensityColor(level)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                    title={`Hoạt động mức ${level}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ActivityChart;
