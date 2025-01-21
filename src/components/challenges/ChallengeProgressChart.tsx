import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval } from 'date-fns';
import { Challenge } from '@/lib/hooks/useChallenges';

interface ChallengeProgressChartProps {
  challenge: Challenge;
}

const ChallengeProgressChart = ({ challenge }: ChallengeProgressChartProps) => {
  // Generate data points for each day in the challenge
  const dateRange = eachDayOfInterval({
    start: challenge.startDate,
    end: new Date() > challenge.endDate ? challenge.endDate : new Date()
  });

  // Create chart data
  const chartData = dateRange.map(date => {
    const entry = challenge.entries.find(e => 
      format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return {
      date: format(date, 'MMM d'),
      value: entry?.value ?? null
    };
  });

  const formatYAxisTick = (value: number) => {
    if (challenge.trackingType === 'Checkbox') {
      return value === 1 ? 'Yes' : '';
    }
    return value.toString();
  };

  const formatTooltipValue = (value: boolean | number | null) => {
    if (challenge.trackingType === 'Checkbox') {
      return value === true ? 'Completed' : 'Not Completed';
    }
    return value?.toString() ?? 'No Data';
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            domain={[0, 1]}
            tickFormatter={formatYAxisTick}
            ticks={[0, 1]}
            interval={0}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            formatter={(value: boolean | number | null) => [formatTooltipValue(value), 'Status']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4d90cc"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChallengeProgressChart; 