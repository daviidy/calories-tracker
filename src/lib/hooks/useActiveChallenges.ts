import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';

interface ChallengeEntry {
  date: Date;
  value: boolean | number;
  notes?: string;
}

type TrackingType = 'Checkbox' | 'Numeric';
type ChallengeFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface Challenge {
  id: string;
  name: string;
  type: 'Fitness' | 'Intellectual' | 'Spiritual' | 'Custom';
  startDate: Date;
  endDate: Date;
  frequency: ChallengeFrequency;
  trackingType: TrackingType;
  progress: number;
  daysLeft: number;
  entries: ChallengeEntry[];
}

export const useActiveChallenges = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const now = new Date();

    const challengesQuery = query(
      collection(db, 'challenges'),
      where('userId', '==', user.uid),
      where('endDate', '>=', now),
      orderBy('endDate', 'asc'),
      orderBy('__name__', 'asc')
    );

    const unsubscribe = onSnapshot(challengesQuery, async (snapshot) => {
      try {
        const activeChallenges = await Promise.all(snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const startDate = data.startDate.toDate();
          const endDate = data.endDate.toDate();
          
          // Calculate days left
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Fetch entries for this challenge
          const entriesSnapshot = await getDocs(
            query(
              collection(db, `challenges/${doc.id}/entries`),
              orderBy('date', 'asc')
            )
          );

          const entries = entriesSnapshot.docs.map(entryDoc => ({
            date: entryDoc.data().date.toDate(),
            value: entryDoc.data().value,
            notes: entryDoc.data().notes
          }));

          // Calculate progress based on tracking type and frequency
          let progress = 0;
          if (data.frequency === 'Daily' && data.trackingType === 'Checkbox') {
            const totalDays = Math.ceil((Math.min(endDate.getTime(), now.getTime()) - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const completedDays = entries.filter(entry => entry.value === true).length;
            progress = Math.min(Math.round((completedDays / totalDays) * 100), 100);
          } else {
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);
          }

          return {
            id: doc.id,
            name: data.name,
            type: data.type,
            startDate,
            endDate,
            frequency: data.frequency,
            trackingType: data.trackingType,
            progress,
            daysLeft: Math.max(daysLeft, 0),
            entries
          };
        }));

        setChallenges(activeChallenges);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching challenge entries:', error);
        setError('Failed to fetch challenge entries');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Error fetching challenges:', error);
      setError('Failed to fetch active challenges');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { challenges, isLoading, error };
}; 