import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';
import { Challenge } from './useChallenges';

export const useTodaysChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const challengesQuery = query(
        collection(db, 'challenges'),
        where('userId', '==', user.uid),
        where('endDate', '>=', now),
        orderBy('endDate', 'asc')
      );

      const snapshot = await getDocs(challengesQuery);
      const challengesData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch entries for this challenge
        const entriesSnapshot = await getDocs(
          query(
            collection(db, `challenges/${doc.id}/entries`),
            orderBy('date', 'desc')
          )
        );

        const entries = entriesSnapshot.docs.map(entryDoc => ({
          id: entryDoc.id,
          date: entryDoc.data().date.toDate(),
          value: entryDoc.data().value,
          notes: entryDoc.data().notes
        }));

        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          frequency: data.frequency,
          trackingType: data.trackingType,
          entries
        };
      }));

      // Filter challenges that don't have an entry for today
      const todaysChallenges = challengesData.filter(challenge => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !challenge.entries.some(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
      });

      setChallenges(todaysChallenges);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    } else {
      setChallenges([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    challenges,
    isLoading,
    error,
    refresh: fetchChallenges
  };
} 