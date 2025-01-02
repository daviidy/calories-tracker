import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { format } from 'date-fns';
import { useStreakData } from './useStreakData';

export interface CalorieSummary {
  totalCalories: number;
  totalBurned: number;
  netCalories: number;
  goalProgress: number;
  calorieGoal: number;
  weeklyData: {
    [date: string]: {
      consumed: number;
      burned: number;
      net: number;
    };
  };
  calorieStreak: number;
  challengeStreak: number;
}

interface ChallengeEntry {
  date: { toDate: () => Date };
}

export const useCalorieData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ date: Date }>>([]);
  const [challengeEntries, setChallengeEntries] = useState<Array<{ date: Date }>>([]);
  const [summary, setSummary] = useState<CalorieSummary>({
    totalCalories: 0,
    totalBurned: 0,
    netCalories: 0,
    goalProgress: 0,
    calorieGoal: 2000,
    weeklyData: {},
    calorieStreak: 0,
    challengeStreak: 0,
  });

  // Calculate streaks
  const { calorieStreak, challengeStreak } = useStreakData(entries, challengeEntries);

  useEffect(() => {
    let unsubscribeGoals: (() => void) | undefined;

    if (!user) {
      setIsLoading(false);
      setEntries([]);
      setChallengeEntries([]);
      setSummary({
        totalCalories: 0,
        totalBurned: 0,
        netCalories: 0,
        goalProgress: 0,
        calorieGoal: 2000,
        weeklyData: {},
        calorieStreak: 0,
        challengeStreak: 0,
      });
      return;
    }

    // Get today's start and end timestamps
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    // Query for the past week's entries
    const entriesQuery = query(
      collection(db, 'calorieEntries'),
      where('userId', '==', user.uid),
      where('timestamp', '>=', weekAgo),
      where('timestamp', '<', tomorrow),
      orderBy('timestamp', 'asc'),
      orderBy('__name__', 'asc')
    );

    // Query for challenge entries
    const challengeEntriesQuery = query(
      collection(db, 'challenges'),
      where('userId', '==', user.uid)
    );

    // Query for the latest calorie goal
    const goalsQuery = query(
      collection(db, 'calorieGoals'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      orderBy('__name__', 'desc'),
      limit(1)
    );

    const unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
      let totalCalories = 0;
      let totalBurned = 0;
      const weeklyData: { [key: string]: { consumed: number; burned: number; net: number } } = {};
      const allEntries: Array<{ date: Date }> = [];

      // Initialize weeklyData with zeros for the past 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const formattedDate = format(date, 'MMM d');
        weeklyData[formattedDate] = { consumed: 0, burned: 0, net: 0 };
      }

      // Process entries
      snapshot.forEach((doc) => {
        const data = doc.data();
        const entryDate = data.timestamp.toDate();
        const formattedDate = format(entryDate, 'MMM d');
        allEntries.push({ date: entryDate });

        // Only count today's entries in the totals
        if (format(entryDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
          totalCalories += data.consumed || 0;
          totalBurned += data.expended || 0;
        }

        // Add to weekly data
        if (weeklyData[formattedDate]) {
          weeklyData[formattedDate].consumed += data.consumed || 0;
          weeklyData[formattedDate].burned += data.expended || 0;
          weeklyData[formattedDate].net = weeklyData[formattedDate].consumed - weeklyData[formattedDate].burned;
        }
      });

      setEntries(allEntries);
      const netCalories = totalCalories - totalBurned;

      // Get the latest goal and calculate progress
      unsubscribeGoals = onSnapshot(goalsQuery, (goalsSnapshot) => {
        const latestGoal = goalsSnapshot.docs[0]?.data()?.target || 2000; // Default to 2000 if no goal is set
        const goalProgress = Math.min(Math.round((totalCalories / latestGoal) * 100), 100);

        setSummary({
          totalCalories,
          totalBurned,
          netCalories,
          goalProgress,
          calorieGoal: latestGoal,
          weeklyData,
          calorieStreak,
          challengeStreak,
        });
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching goals:', error);
        setError('Failed to fetch calorie goals');
        setIsLoading(false);
      });

    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Error fetching entries:', error);
        setError('Failed to fetch calorie entries');
      }
      setIsLoading(false);
    });

    // Subscribe to challenge entries
    const unsubscribeChallenges = onSnapshot(challengeEntriesQuery, (snapshot) => {
      const allChallengeEntries: Array<{ date: Date }> = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.entries) {
          data.entries.forEach((entry: ChallengeEntry) => {
            allChallengeEntries.push({ date: entry.date.toDate() });
          });
        }
      });
      setChallengeEntries(allChallengeEntries);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Error fetching challenges:', error);
        setError('Failed to fetch challenges');
      }
    });

    return () => {
      if (unsubscribeEntries) unsubscribeEntries();
      if (unsubscribeGoals) unsubscribeGoals();
      if (unsubscribeChallenges) unsubscribeChallenges();
    };
  }, [user]);

  // Update summary when streaks change
  useEffect(() => {
    if (!user) return;
    
    setSummary(prev => ({
      ...prev,
      calorieStreak,
      challengeStreak,
    }));
  }, [calorieStreak, challengeStreak, user]);

  return { summary, isLoading, error };
}; 