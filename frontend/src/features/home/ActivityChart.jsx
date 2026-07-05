const ActivityChart = () => {
  // Generate dummy data (7 rows, 20 cols) cho biểu đồ contribution
  const weeks = 20;
  const days = 7;
  
  const getIntensityColor = (level) => {
    switch(level) {
      case 1: return 'bg-storybook-green';
      case 2: return 'bg-fresh-leaf';
      case 3: return 'bg-primary';
      case 4: return 'bg-night-ink';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="se-label mb-4 text-foreground">Nhịp học của bạn</h3>
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
                    className={`h-4 w-4 rounded-sm border border-border ${getIntensityColor(level)} transition-transform hover:scale-110`}
                    title={`Mức học ${level}`}
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
