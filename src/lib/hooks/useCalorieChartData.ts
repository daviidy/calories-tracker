import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { startOfDay, endOfDay, subDays, subMonths, subYears, format } from 'date-fns';

interface ChartDataPoint {
  date: string;
  consumed: number;
  burned: number;
  net: number;
}

interface UseCalorieChartDataReturn {
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
}

export const useCalorieChartData = (timeRange: 'week' | 'month' | 'year'): UseCalorieChartDataReturn => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate date range
        const end = endOfDay(new Date());
        let start;
        let dateFormat: string;

        switch (timeRange) {
          case 'month':
            start = startOfDay(subMonths(end, 1));
            dateFormat = 'MMM d';
            break;
          case 'year':
            start = startOfDay(subYears(end, 1));
            dateFormat = 'MMM yyyy';
            break;
          default: // week
            start = startOfDay(subDays(end, 7));
            dateFormat = 'EEE';
        }

        // Fetch data
        const q = query(
          collection(db, 'calorieEntries'),
          where('userId', '==', user.uid),
          where('timestamp', '>=', start),
          where('timestamp', '<=', end),
          orderBy('timestamp', 'asc')
        );

        const snapshot = await getDocs(q);
        
        // Process data
        const dataByDate = new Map<string, ChartDataPoint>();

        // Initialize all dates in the range
        let currentDate = start;
        while (currentDate <= end) {
          const dateKey = format(currentDate, dateFormat);
          dataByDate.set(dateKey, {
            date: dateKey,
            consumed: 0,
            burned: 0,
            net: 0
          });
          currentDate = timeRange === 'year' 
            ? new Date(currentDate.setMonth(currentDate.getMonth() + 1))
            : new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        // Fill in actual data
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const date = data.timestamp.toDate();
          const dateKey = format(date, dateFormat);

          const existing = dataByDate.get(dateKey) || {
            date: dateKey,
            consumed: 0,
            burned: 0,
            net: 0
          };

          existing.consumed += data.consumed || 0;
          existing.burned += data.expended || 0;
          existing.net = existing.consumed - existing.burned;

          dataByDate.set(dateKey, existing);
        });

        setChartData(Array.from(dataByDate.values()));
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [user, timeRange]);

  return { chartData, isLoading, error };
}; 