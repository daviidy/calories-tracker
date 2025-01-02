import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';

export interface CalorieLogEntry {
  id: string;
  date: Date;
  consumed: number;
  burned: number;
  net: number;
}

interface UseCalorieLogReturn {
  entries: CalorieLogEntry[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ENTRIES_PER_PAGE = 7;

export const useCalorieLog = (timeRange: 'week' | 'month' | 'year' = 'week'): UseCalorieLogReturn => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CalorieLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  // Get date range based on selected time range
  const getDateRange = () => {
    const end = endOfDay(new Date());
    let start;

    switch (timeRange) {
      case 'month':
        start = startOfDay(subMonths(end, 1));
        break;
      case 'year':
        start = startOfDay(subYears(end, 1));
        break;
      default: // week
        start = startOfDay(subDays(end, 7));
    }

    return { start, end };
  };

  const loadInitialEntries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const { start } = getDateRange();

      const q = query(
        collection(db, 'calorieEntries'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', start),
        orderBy('timestamp', 'desc'),
        limit(ENTRIES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;
      
      if (docs.length < ENTRIES_PER_PAGE) {
        setHasMore(false);
      }

      if (docs.length > 0) {
        setLastDoc(docs[docs.length - 1]);
      }

      const processedEntries = processEntries(docs);
      setEntries(processedEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
      if (err instanceof Error && err.message.includes('indexes?create_composite=')) {
        const message = 'This query requires an index. Please check the console for the index creation link.';
        setError(message);
      } else {
        setError('Failed to load entries');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Reset state when time range changes
    setEntries([]);
    setHasMore(true);
    setLastDoc(null);
    loadInitialEntries();
  }, [user, timeRange]);

  const loadMore = async () => {
    if (!user || !lastDoc || !hasMore) return;

    try {
      setIsLoading(true);
      const { start } = getDateRange();

      const q = query(
        collection(db, 'calorieEntries'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', start),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(ENTRIES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      if (docs.length < ENTRIES_PER_PAGE) {
        setHasMore(false);
      }

      if (docs.length > 0) {
        setLastDoc(docs[docs.length - 1]);
        const processedEntries = processEntries(docs);
        setEntries(prev => [...prev, ...processedEntries]);
      }
    } catch (err) {
      console.error('Error loading more entries:', err);
      setError('Failed to load more entries');
    } finally {
      setIsLoading(false);
    }
  };

  const processEntries = (docs: QueryDocumentSnapshot[]): CalorieLogEntry[] => {
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.timestamp.toDate(),
        consumed: data.consumed || 0,
        burned: data.expended || 0,
        net: (data.consumed || 0) - (data.expended || 0)
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  return {
    entries,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh: loadInitialEntries
  };
}; 