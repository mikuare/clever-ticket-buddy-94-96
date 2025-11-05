
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TimeMetricChartProps {
  responseTime: number;
  resolutionTime: number;
  size?: number;
}

const formatTimeFromHours = (hours: number): string => {
  if (hours === 0) return '0s';
  
  const totalSeconds = Math.round(hours * 3600);
  
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  if (totalMinutes < 60) {
    if (remainingSeconds === 0) {
      return `${totalMinutes}m`;
    }
    return `${totalMinutes}m ${remainingSeconds}s`;
  }
  
  const displayHours = Math.floor(totalMinutes / 60);
  const remainingMinutesAfterHours = totalMinutes % 60;
  
  if (remainingMinutesAfterHours === 0 && remainingSeconds === 0) {
    return `${displayHours}h`;
  }
  
  if (remainingSeconds === 0) {
    return `${displayHours}h ${remainingMinutesAfterHours}m`;
  }
  
  if (remainingMinutesAfterHours === 0) {
    return `${displayHours}h ${remainingSeconds}s`;
  }
  
  return `${displayHours}h ${remainingMinutesAfterHours}m ${remainingSeconds}s`;
};

const TimeMetricChart = ({ responseTime, resolutionTime, size = 80 }: TimeMetricChartProps) => {
  if (responseTime === 0 && resolutionTime === 0) {
    return (
      <div className={`w-20 h-20 flex items-center justify-center border rounded-lg bg-gray-50`}>
        <div className="text-xs text-muted-foreground text-center">
          <div>No</div>
          <div>Data</div>
        </div>
      </div>
    );
  }

  const data = [
    { 
      name: 'Response Time', 
      value: responseTime, 
      color: '#3b82f6',
      displayValue: formatTimeFromHours(responseTime)
    },
    { 
      name: 'Resolution Time', 
      value: resolutionTime, 
      color: '#10b981',
      displayValue: formatTimeFromHours(resolutionTime)
    }
  ].filter(item => item.value > 0);

  const totalTime = responseTime + resolutionTime;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`w-20 h-20`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={12}
              outerRadius={32}
              paddingAngle={data.length > 1 ? 3 : 0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                formatTimeFromHours(value),
                name
              ]}
              contentStyle={{
                fontSize: '12px',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="text-xs space-y-1">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate">
              {entry.name.split(' ')[0]}: {entry.displayValue}
            </span>
          </div>
        ))}
        {totalTime > 0 && (
          <div className="pt-1 border-t border-gray-200">
            <span className="font-medium text-xs">
              Total: {formatTimeFromHours(totalTime)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeMetricChart;
